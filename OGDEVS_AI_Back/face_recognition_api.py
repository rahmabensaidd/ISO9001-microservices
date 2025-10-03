import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import cv2
import numpy as np
from deepface import DeepFace
import base64
import requests
from termcolor import colored
import logging
import mediapipe as mp

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialisation du routeur pour la reconnaissance faciale
router = APIRouter()

# URL de l'API de profil
PROFILE_API_URL = "http://localhost:8089/api/users"

# Initialisation de MediaPipe pour la détection de landmarks
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5)

class ImageData(BaseModel):
    images: list[str]  # Liste d'images encodées en base64
    userId: str

def decode_base64_image(base64_string: str) -> np.ndarray:
    try:
        if base64_string.startswith("data:image"):
            base64_string = base64_string.split(",")[1]
        img_data = base64.b64decode(base64_string)
        if len(img_data) > 5 * 1024 * 1024:
            raise ValueError("L'image dépasse la taille maximale de 5MB")
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Impossible de décoder l'image")
        return img
    except Exception as e:
        logger.error(colored(f"Erreur lors du décodage de l'image: {str(e)}", "red"))
        raise HTTPException(status_code=400, detail=f"Erreur lors du décodage de l'image: {str(e)}")

def preprocess_image(image: np.ndarray, target_size: tuple = (224, 224)) -> np.ndarray:
    try:
        if len(image.shape) == 3 and image.shape[2] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        resized_image = cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)
        logger.info(colored(f"Dimensions après pré-traitement: {resized_image.shape}", "blue"))
        return resized_image
    except Exception as e:
        logger.error(colored(f"Erreur lors du prétraitement de l'image: {str(e)}", "red"))
        raise HTTPException(status_code=400, detail=f"Erreur lors du prétraitement de l'image: {str(e)}")

def fetch_profilePhoto(userId: str, token: str) -> np.ndarray:
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{PROFILE_API_URL}/{userId}/profile-photo", headers=headers)
        if response.status_code == 200:
            img_data = np.frombuffer(response.content, np.uint8)
            img = cv2.imdecode(img_data, cv2.IMREAD_COLOR)
            if img is None:
                raise ValueError("Impossible de décoder la photo de profil")
            return img
        elif response.status_code == 404:
            logger.error(colored(f"Photo de profil non trouvée pour userId {userId}: {response.status_code}", "red"))
            raise HTTPException(status_code=404, detail="Photo de profil non trouvée")
        else:
            logger.error(colored(f"Erreur serveur pour userId {userId}: {response.status_code}", "red"))
            raise HTTPException(status_code=response.status_code, detail="Erreur serveur")
    except Exception as e:
        logger.error(colored(f"Erreur lors de la récupération de la photo de profil: {str(e)}", "red"))
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de la photo de profil: {str(e)}")

# Route pour la reconnaissance faciale
@router.post("/face-recognition/verify")
async def verify_face(data: ImageData, authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        if not token:
            logger.error(colored("Token d'autorisation manquant", "red"))
            raise HTTPException(status_code=401, detail="Token d'autorisation manquant")

        if len(data.images) < 1:
            raise HTTPException(status_code=400, detail="Au moins une image est requise pour la vérification")

        webcam_images = []
        webcam_image_paths = []
        for idx, img in enumerate(data.images):
            try:
                decoded_img = decode_base64_image(img)
                decoded_img = preprocess_image(decoded_img, target_size=(224, 224))
                logger.info(colored(f"Dimensions de l'image webcam {idx+1} après prétraitement: {decoded_img.shape}", "blue"))
                temp_path = f"temp_webcam_{idx}.jpg"
                cv2.imwrite(temp_path, cv2.cvtColor(decoded_img, cv2.COLOR_RGB2BGR))
                webcam_images.append(decoded_img)
                webcam_image_paths.append(temp_path)
            except Exception as e:
                logger.error(colored(f"Erreur lors du décodage de l'image {idx}: {str(e)}", "red"))
                raise HTTPException(status_code=400, detail=f"Erreur lors du décodage de l'image {idx}: {str(e)}")

        profile_image = fetch_profilePhoto(data.userId, token)
        profile_image = preprocess_image(profile_image, target_size=(224, 224))
        logger.info(colored(f"Dimensions de la photo de profil après prétraitement: {profile_image.shape}", "blue"))
        profile_image_path = "temp_profile.jpg"
        cv2.imwrite(profile_image_path, cv2.cvtColor(profile_image, cv2.COLOR_RGB2BGR))

        verification_results = []
        for i, webcam_image_path in enumerate(webcam_image_paths):
            try:
                result = DeepFace.verify(
                    img1_path=webcam_image_path,
                    img2_path=profile_image_path,
                    model_name="Facenet",
                    detector_backend="mtcnn",
                    enforce_detection=False,
                    distance_metric="cosine",
                    threshold=0.8
                )
                verification_results.append({
                    "verified": result["verified"],
                    "distance": result["distance"],
                    "threshold": result["threshold"]
                })
                logger.info(colored(f"Image {i+1} vérifiée: {result['verified']}", "green" if result["verified"] else "yellow"))
            except Exception as e:
                logger.error(colored(f"Erreur lors de la vérification de l'image {i+1}: {str(e)}", "red"))
                raise HTTPException(status_code=500, detail=f"Erreur lors de la vérification de l'image {i+1}: {str(e)}")
            finally:
                if os.path.exists(webcam_image_path):
                    os.remove(webcam_image_path)

        if os.path.exists(profile_image_path):
            os.remove(profile_image_path)

        overall_verified = any(result["verified"] for result in verification_results)
        distances = [result["distance"] for result in verification_results]
        thresholds = [result["threshold"] for result in verification_results]

        if overall_verified:
            logger.info(colored(f"Visage vérifié avec succès pour userId {data.userId}", "green"))
        else:
            logger.warning(colored(f"Échec de la vérification faciale pour userId {data.userId}", "yellow"))

        return JSONResponse(content={
            "verified": overall_verified,
            "distance": min(distances) if distances else None,
            "threshold": thresholds[0] if thresholds else None,
            "details": verification_results
        })

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(colored(f"Erreur lors de la vérification faciale pour userId {data.userId}: {str(e)}", "red"))
        raise HTTPException(status_code=500, detail=f"Erreur lors de la vérification faciale pour userId {data.userId}: {str(e)}")
    finally:
        face_mesh.close()

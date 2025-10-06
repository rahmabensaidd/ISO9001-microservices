import sys
import joblib
import numpy as np
import os
# Utilisation de chemins relatifs
# Récupérer le répertoire actuel du script Python
current_directory = os.path.dirname(os.path.abspath(__file__))

# Construire les chemins relatifs pour les fichiers .pkl
model_path = os.path.join(current_directory, "random_forest_model.pkl")
label_encoder_path = os.path.join(current_directory, "label_encoder.pkl")
def main():
    if len(sys.argv) < 6:
        print("Erreur: 5 arguments requis - nb_ressources nb_equipes nb_technologies nb_tasks projectType")
        sys.exit(1)

    try:
        nb_ressources = int(sys.argv[1])
        nb_equipes = int(sys.argv[2])
        nb_technologies = int(sys.argv[3])
        nb_tasks = int(sys.argv[4])
        projectType = sys.argv[5]
    except ValueError:
        print("Erreur: Les 4 premiers arguments doivent être des entiers")
        sys.exit(1)

    # Chargement du modèle
    # ✅ Chemins corrigés avec string brute
    model = joblib.load(model_path)
    label_encoder = joblib.load(label_encoder_path)
    try:
        project_type_encoded = label_encoder.transform([projectType])[0]
    except:
        print("Erreur: Type de projet non reconnu")
        sys.exit(1)

    input_array = np.array([[nb_ressources, nb_equipes, nb_technologies, nb_tasks, project_type_encoded]])

    # Prédiction
    prediction = model.predict(input_array)

    print(f"{prediction[0]:.2f}")

if __name__ == "__main__":
    main()

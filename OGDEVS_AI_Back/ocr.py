from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
from datetime import datetime
import tempfile

os.environ['TYPHOON_OCR_API_KEY'] = 'sk-Z5cAViWIv4Pu47YjKVbkIzFUkQEmoWK6AsfhVTGsxqlirjQI'

app = Flask(__name__)
CORS(app, resources={r"/ocr": {"origins": "http://localhost:4200"}})

# Mapping for OCR-extracted axe descriptions to valid Axe enum values
AXE_MAPPING = {
    "Optimiser l'utilisation des ressources pour la réalisation technique": "OPTIMISATION_RENOVATION",
    "Optimiser la fabrication des ressources pour la rénovation technique": "OPTIMISATION_RENOVATION",
    "Respecter les déliés de réalisation technique des travaux": "OPERATIONAL",
    "Développer les compétences des ressources": "OPERATIONAL",
    "Operational": "OPERATIONAL",
    "Strategic": "STRATEGIC",
    "Quality": "QUALITY",
    "Financial": "FINANCIAL",
    "Gestion": "GESTION",
    "Technique": "TECHNIQUE",
    "Axe non défini": "OPERATIONAL"
}

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        print("Requête reçue")
        if 'file' not in request.files:
            print("Erreur: Aucun fichier uploadé")
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        if file.filename == '':
            print("Erreur: Fichier sans nom")
            return jsonify({'error': 'No file selected'}), 400

        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
            filepath = temp_file.name
            file.save(filepath)
            print(f"Fichier sauvegardé: {filepath}, Existe: {os.path.exists(filepath)}")

        try:
            from typhoon_ocr import ocr_document
            print("Appel OCR en cours...")
            markdown = ocr_document(filepath)
            print("OCR réussi, texte:", markdown)  # Log full markdown for debugging
        except Exception as e:
            os.unlink(filepath)
            print(f"Erreur OCR: {str(e)}")
            return jsonify({'error': f'OCR processing failed: {str(e)}'}), 500

        try:
            os.unlink(filepath)
            print("Fichier temporaire supprimé")
        except Exception as e:
            print(f"Erreur suppression fichier: {str(e)}")

        process = {"description": "Processus Réalisation technique", "creationDate": "2024-12-23"}
        objectives = []
        operations = []
        major_sections = []

        for line in markdown.split('\n'):
            line = line.strip()
            if "Code :" in line and "Version :" in line:
                parts = line.split()
                for part in parts:
                    if "-" in part and part.startswith("PCS-"):
                        process["procName"] = part
                    if len(part) == 10 and part[2] == '/' and part[5] == '/':
                        process["creationDate"] = part.replace('/', '-')
            elif any(title in line for title in ["## Objectifs:", "## Pilote:", "## Opérations:"]):
                major_sections.append(line)
            elif "## Objectifs:" in major_sections and any(code in line for code in ["OJU-RET", "OBJ-RET"]):
                parts = line.split("|")
                if len(parts) >= 3:
                    raw_axe = parts[2].strip() if len(parts) > 2 else "Axe non défini"
                    axe_value = AXE_MAPPING.get(raw_axe, "OPERATIONAL")  # Fallback to OPERATIONAL
                    objectives.append({
                        "title": parts[1].strip() if len(parts) > 1 else "Titre non défini",
                        "axe": axe_value,
                        "description": raw_axe  # Store raw description
                    })
                    if raw_axe not in AXE_MAPPING:
                        print(f"Warning: Unmapped axe value '{raw_axe}' replaced with 'OPERATIONAL'")
            elif "## Opérations:" in major_sections and any(code in line for code in ["OP-RET"]):
                parts = line.split("|")
                if len(parts) >= 3:
                    operations.append({
                        "operationName": parts[0].strip() if len(parts) > 0 else "Nom non défini",
                        "operationDescription": parts[1].strip() if len(parts) > 1 else "Description non définie",
                        "creationDate": process.get("creationDate", "2024-12-23")
                    })
            elif "## Listes de modifications:" in major_sections and "|" in line and "- Ajuster" in line:
                parts = line.split("|")
                if len(parts) >= 3 and "OJU-RET" in line:
                    raw_axe = parts[2].strip() if len(parts) > 2 else "Axe non défini"
                    axe_value = AXE_MAPPING.get(raw_axe, "OPERATIONAL")  # Fallback to OPERATIONAL
                    objectives.append({
                        "title": parts[2].strip().replace("- Ajuster l'objectif ", "").split("<br>")[0] or "Ajuster OJU-RET-03",
                        "axe": axe_value,
                        "description": raw_axe
                    })
                    if raw_axe not in AXE_MAPPING:
                        print(f"Warning: Unmapped axe value '{raw_axe}' replaced with 'OPERATIONAL'")
                if len(parts) >= 3 and "Changer l'op" in line:
                    operations.append({
                        "operationName": "Opération modifiée",
                        "operationDescription": parts[2].strip().replace("- Changer l'op", "").split("<br>")[0] or "Changement op",
                        "creationDate": process.get("creationDate", "2024-12-23")
                    })

        if not process.get("procName"):
            process["procName"] = "PCS-RET-01"

        data_to_save = {
            "process": process,
            "objectives": objectives,
            "operations": operations,
            "majorSections": major_sections
        }
        print("Envoi des données à Spring Boot:", data_to_save)
        spring_url = "http://localhost:8089/api/ocr/save"
        headers = {"Content-Type": "application/json"}
        response = requests.post(spring_url, json=data_to_save, headers=headers)

        if response.status_code == 200:
            print("Sauvegarde réussie")
            return jsonify({
                'text': markdown,
                'process': process,
                'objectives': objectives,
                'operations': operations,
                'majorSections': major_sections
            }), 200
        else:
            print(f"Échec sauvegarde: {response.status_code}, {response.text}")
            return jsonify({'error': f'Failed to save to database: {response.text}'}), response.status_code

    except Exception as e:
        print(f"Erreur générale: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# app.py (Corrected)

from flask import Flask, request, jsonify
from flask_cors import CORS
import docx2txt
import PyPDF2
import os

# UPDATED: Removed the import for 'parse_gemini_response'
from gemini_service import (
    analyze_with_gemini,
    get_learning_resources_from_gemini
)

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://jobmorph-app.vercel.app"], supports_credentials=True)

# --- Text Extraction Functions (No changes needed here) ---
def extract_text_from_pdf(file):
    try:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def extract_text_from_docx(file):
    try:
        return docx2txt.process(file)
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""

@app.route('/analyze', methods=['POST'])
def analyze_endpoint():
    if 'resume' not in request.files:
        return jsonify({"error": "Resume file is required."}), 400
    if 'jd_file' not in request.files and ('jd_text' not in request.form or not request.form['jd_text'].strip()):
        return jsonify({"error": "Job description file or text is required."}), 400

    resume_file = request.files['resume']
    jd_text = ''
    resume_text = ''

    # Extract resume text
    if resume_file.filename.endswith('.pdf'):
        resume_text = extract_text_from_pdf(resume_file)
    elif resume_file.filename.endswith('.docx'):
        resume_text = extract_text_from_docx(resume_file)
    
    if not resume_text.strip():
        return jsonify({"error": "Could not extract text from resume file."}), 500

    # Extract JD text from either file or form
    if 'jd_file' in request.files:
        jd_file = request.files['jd_file']
        if jd_file.filename.endswith('.pdf'):
            jd_text = extract_text_from_pdf(jd_file)
        elif jd_file.filename.endswith('.docx'):
            jd_text = extract_text_from_docx(jd_file)
    else:
        jd_text = request.form['jd_text']

    if not jd_text.strip():
        return jsonify({"error": "Could not get text from job description."}), 500

    try:
        # UPDATED: Call the single, powerful analysis function
        print("✅ Analyzing with Gemini...")
        parsed_data = analyze_with_gemini(resume_text, jd_text)
        
        # Check if the analysis returned an error from the service
        if not parsed_data or parsed_data.get("error"):
            raise ValueError(parsed_data.get("error", "Failed to get analysis from Gemini."))

        print("✅ Fetching learning resources...")
        learning_resources = get_learning_resources_from_gemini(parsed_data.get("missing_keywords", []))

        final_response = {
            "score": parsed_data.get("score"),
            "missing_keywords": parsed_data.get("missing_keywords"),
            "suggestions": parsed_data.get("suggestions"),
            "learning_resources": learning_resources,
            "resume": resume_text,
            "job_description": jd_text
        }
        
        print("✅ Analysis complete. Sending response to frontend.")
        return jsonify(final_response), 200

    except Exception as e:
        print(f"❌ An error occurred during analysis: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
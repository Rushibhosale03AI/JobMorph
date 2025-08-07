from flask import Flask, request, jsonify
from flask_cors import CORS
import docx2txt
import PyPDF2

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS for frontend requests

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file):
    return docx2txt.process(file)

@app.route('/upload', methods=['POST'])
def upload():
    resume_text = ''
    jd_text = ''

    if 'resume' in request.files:
        resume_file = request.files['resume']
        if resume_file.filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(resume_file)
        elif resume_file.filename.endswith('.docx'):
            resume_text = extract_text_from_docx(resume_file)

    if 'jd_file' in request.files:
        jd_file = request.files['jd_file']
        if jd_file.filename.endswith('.pdf'):
            jd_text = extract_text_from_pdf(jd_file)
        elif jd_file.filename.endswith('.docx'):
            jd_text = extract_text_from_docx(jd_file)
    elif 'jd_text' in request.form:
        jd_text = request.form['jd_text']

    print("✅ Resume Extracted Text:\n", resume_text[:300])
    print("✅ JD Extracted Text:\n", jd_text[:300])

    return jsonify({
        'resume': resume_text or 'No text found in resume.',
        'job_description': jd_text or 'No job description provided.'
    })

if __name__ == '__main__':
    app.run(debug=True)

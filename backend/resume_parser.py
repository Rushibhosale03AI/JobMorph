import re
import spacy
from pdfminer.high_level import extract_text

nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+', text)
    return match.group(0) if match else "Not found"

def extract_phone(text):
    match = re.search(r'\+?\d[\d -]{8,12}\d', text)
    return match.group(0) if match else "Not found"

def extract_skills(text):
    # Simple keyword skill matching (customize this)
    skills_list = ["Python", "Java", "Machine Learning", "NLP", "SQL", "JavaScript", "React"]
    skills_found = []
    for skill in skills_list:
        if re.search(rf'\b{skill}\b', text, re.IGNORECASE):
            skills_found.append(skill)
    return skills_found

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path)
    doc = nlp(text)
    return {
        "name": doc.ents[0].text if doc.ents else "Not detected",
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text)
    }

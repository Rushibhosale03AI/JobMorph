from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- Add this
from werkzeug.utils import secure_filename
import os
from resume_parser import parse_resume
from job_matcher import match_jobs  
from live_jobs_jsearch import fetch_jobs_from_jsearch


app = Flask(__name__)
CORS(app)  # <-- Add this line

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
@app.route("/jobs", methods=["GET"])
def get_live_jobs():
    keyword = request.args.get("keyword", "python developer")
    jobs = fetch_jobs_from_jsearch(keyword)
    return jsonify(jobs)
@app.route("/upload", methods=["POST"])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({"message": "No file part"}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    analysis = parse_resume(file_path)
 
    with open(file_path, 'rb') as f:
        resume_text = f.read().decode(errors='ignore')

    matched_jobs = match_jobs(resume_text)
    return jsonify({
        "message": "Resume uploaded and analyzed successfully",
        "analysis": analysis,
         "job_matches": matched_jobs
    })

if __name__ == "__main__":
    app.run(debug=True)

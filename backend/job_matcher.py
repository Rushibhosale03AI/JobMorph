from sentence_transformers import SentenceTransformer, util
import json

model = SentenceTransformer('all-MiniLM-L6-v2')  # Pretrained transformer

def load_jobs(file_path='jd_dataset.json'):
    with open(file_path, 'r') as f:
        return json.load(f)

def match_jobs(resume_text, top_k=3):
    jobs = load_jobs()
    resume_embedding = model.encode(resume_text, convert_to_tensor=True)

    results = []
    for job in jobs:
        job_embedding = model.encode(job['description'], convert_to_tensor=True)
        score = util.cos_sim(resume_embedding, job_embedding).item()
        results.append({ "title": job['title'], "score": round(score, 3), "description": job['description'] })

    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:top_k]

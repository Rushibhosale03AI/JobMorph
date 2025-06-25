import requests

API_HOST = "jsearch.p.rapidapi.com"
API_KEY = "772602137cmsh6dc8d39e3bfadadp16a5bajsn518a009f4e18"  # 🔁 Replace with your real key

headers = {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": API_HOST
}

def fetch_jobs_from_jsearch(keyword="python developer", limit=5):
    url = f"https://{API_HOST}/search"
    params = {
        "query": keyword,
        "page": "1",
        "num_pages": "1"
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    results = []
    for item in data.get("data", [])[:limit]:
        results.append({
            "title": item.get("job_title"),
            "description": item.get("job_description", "")[:300],
            "company": item.get("employer_name"),
            "location": item.get("job_city"),
        })

    return results

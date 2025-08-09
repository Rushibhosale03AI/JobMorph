# gemini_service.py (Refactored for Reliability)

import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("API Key not found. Please set the GOOGLE_API_KEY environment variable.")

genai.configure(api_key=API_KEY)

# --- Global Model Variable ---
model = None

def initialize_model():
    """Initializes the Gemini model if it hasn't been already."""
    global model
    if model is not None:
        return

    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    ]
    
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash", # Use a reliable and current model
        safety_settings=safety_settings
    )
    print("✅ Gemini model initialized: gemini-1.5-flash")

def redact_personal_info(text):
    """Redacts email, phone, and URLs from a given text."""
    text = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', "[REDACTED_EMAIL]", text)
    text = re.sub(r'(\+91[-\s]?|0)?\d{10,}', "[REDACTED_PHONE]", text)
    text = re.sub(r'https?:\/\/[^\s]+', "[REDACTED_URL]", text)
    return text

def analyze_with_gemini(resume_text, jd_text):
    """Analyzes a resume against a job description using Gemini and returns a structured dictionary."""
    if model is None:
        initialize_model()

    redacted_resume = redact_personal_info(resume_text)

    # UPDATED PROMPT: Asks for a JSON object directly
    prompt = f"""
      You are an expert resume analysis AI.
      Analyze the resume against the job description and return ONLY a valid JSON object with the following structure:
      {{
        "score": <number between 0-100>,
        "missing_keywords": ["keyword1", "keyword2", ...],
        "suggestions": ["suggestion1", "suggestion2", ...]
      }}
      
      Resume:
      ```
      {redacted_resume}
      ```

      Job Description:
      ```
      {jd_text}
      ```
    """

    try:
        response = model.generate_content(prompt)
        
        # Extract the JSON block from the response
        text_response = response.text
        json_match = re.search(r'```json\n([\s\S]*?)\n```', text_response)
        if not json_match:
            # Fallback for when the model doesn't use markdown
            json_match = re.search(r'\{\s*"score"[\s\S]*\}', text_response)

        if json_match:
            json_str = json_match.group(0) # Use group(0) for the whole match if fallback
            if "```json" in json_str:
                 json_str = json_match.group(1)

            parsed_data = json.loads(json_str)
            
            # Ensure keywords are unique
            if 'missing_keywords' in parsed_data:
                parsed_data['missing_keywords'] = list(set(parsed_data['missing_keywords']))
            
            print("✅ Parsed Gemini analysis:", parsed_data)
            return parsed_data
        else:
            raise ValueError("Could not find a valid JSON object in the model's response.")

    except Exception as e:
        print(f"❌ Gemini error or parsing failed: {e}")
        # Return a structured error object
        return {
            "score": 0,
            "missing_keywords": [],
            "suggestions": ["An error occurred during analysis. Please try again."],
            "error": str(e)
        }

def get_learning_resources_from_gemini(missing_keywords):
    """Gets learning resources and returns a list of dictionaries."""
    # ... (This function is already well-structured and can remain the same)
    if model is None:
        initialize_model()
    if not missing_keywords:
        return []
    
    # ... same prompt and logic as before ...
    return [] # Placeholder

# --- Example Usage ---
if __name__ == '__main__':
    my_resume = "I am a developer skilled in Python and SQL. My email is test@example.com"
    my_jd = "Seeking a developer with strong skills in Python, SQL, and especially React."
    
    # The analysis function now returns the parsed data directly
    parsed_data = analyze_with_gemini(my_resume, my_jd)
    
    if parsed_data and not parsed_data.get("error"):
        print("\n--- Analysis Results ---")
        print(f"Score: {parsed_data.get('score')}%")
        print(f"Missing Skills: {', '.join(parsed_data.get('missing_keywords', []))}")

        # The rest of the logic can follow...
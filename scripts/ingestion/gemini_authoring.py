"""
scripts/ingestion/gemini_authoring.py
CLI tool to generate diagnostic assessment questions using Gemini 3.5 Flash Lite.
Uses local proxy on port 10808 and sends structured prompts to author misconception-tagged distractors.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path

# Ensure UTF-8 stdout encoding for Persian/RTL characters on Windows
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_env_variable(var_name: str, default: str = "") -> str:
    # Read from .env if not in os.environ
    val = os.environ.get(var_name)
    if val:
        return val
    env_path = Path(".env")
    if env_path.exists():
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith(f"{var_name}="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return default

def call_gemini(prompt: str, system_instruction: str = "") -> dict:
    api_key = get_env_variable("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment or .env file.")
        
    model = get_env_variable("GEMINI_MODEL", "gemini-3.5-flash-lite")
    proxy_url = get_env_variable("HTTPS_PROXY", "http://127.0.0.1:10808")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    
    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }
        
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    
    # Configure proxy handler for local development (port 10808)
    proxy_handler = urllib.request.ProxyHandler({
        'http': proxy_url,
        'https': proxy_url
    })
    opener = urllib.request.build_opener(proxy_handler)
    
    try:
        with opener.open(req, timeout=30) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            candidate_text = res_data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(candidate_text)
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"Gemini API HTTP Error {e.code}: {error_body}")
    except Exception as e:
        raise RuntimeError(f"Gemini API Request failed: {e}")

if __name__ == "__main__":
    test_prompt = "Generate 1 diagnostic math question for 4th grade elementary fractions on equivalent fractions with 1 correct answer and 3 distractors tagged with misconceptions. Return in JSON."
    sys_instruction = "You are an expert psychometrician and mathematics curriculum designer. Always output valid JSON."
    print("Testing Gemini 3.5 Flash Lite connection via local proxy on :10808...")
    try:
        result = call_gemini(test_prompt, sys_instruction)
        print("Success! Gemini response received:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(f"Error: {e}")

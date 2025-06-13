import requests
import json

def setup_ollama():
    """
    Setup Ollama with Mistral model - a good balance of performance and quality
    """
    print("Setting up Ollama with Mistral model...")
    
    # Check if Ollama is running
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code != 200:
            print("Error: Ollama server is not running. Please start Ollama first.")
            return None
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to Ollama server. Please make sure Ollama is installed and running.")
        return None

    # Pull the Mistral model if not already present
    try:
        response = requests.post("http://localhost:11434/api/pull", 
                               json={"name": "mistral"})
        if response.status_code == 200:
            print("Mistral model is ready!")
            return True
    except Exception as e:
        print(f"Error pulling model: {str(e)}")
        return None

def generate_response(prompt, system_prompt=None):
    """
    Generate a response using Ollama's Mistral model
    """
    if system_prompt is None:
        system_prompt = """You are a helpful AI assistant specialized in explaining algorithms and data structures. 
        Provide clear, step-by-step explanations with examples when appropriate. 
        Focus on accuracy and educational value."""
    
    try:
        response = requests.post("http://localhost:11434/api/generate",
                               json={
                                   "model": "mistral",
                                   "prompt": prompt,
                                   "system": system_prompt,
                                   "stream": False,
                                   "options": {
                                       "temperature": 0.7,
                                       "top_p": 0.9,
                                       "top_k": 40,
                                       "num_ctx": 4096,
                                   }
                               })
        
        if response.status_code == 200:
            return response.json()["response"]
        else:
            return f"Error: {response.status_code} - {response.text}"
            
    except Exception as e:
        return f"Error generating response: {str(e)}"

if __name__ == "__main__":
    print("Starting Ollama setup for DSA explanations...")
    
    if setup_ollama():
        test_prompt = "Explain binary search algorithm step by step with a clear example"
        print(f"\nPrompt: {test_prompt}")
        response = generate_response(test_prompt)
        print(f"\nResponse: {response}") 
# from flask import Flask, request, jsonify, send_from_directory
# from flask_cors import CORS
# import os

# app = Flask(__name__)
# CORS(app)

# # Route for favicon.ico
# @app.route('/favicon.ico')
# def favicon():
#     return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

# # Route for the base URL (to prevent the 404 error when visiting http://127.0.0.1:5000)
# @app.route('/')
# def home():
#     return "Welcome to the Chatbot API!"

# # Route for chat API
# @app.route('/api/chat', methods=['POST'])
# def chat():
#     data = request.get_json()
#     user_message = data.get('message')
    
#     if not user_message:
#         return jsonify({'error': 'No message provided'}), 400

#     # Your logic to handle the message and generate a response
#     bot_response = f"You said: {user_message}"
#     return jsonify({'response': bot_response})

# if __name__ == '__main__':
#     app.run(debug=True)



from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import csv
from datetime import datetime
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)

# Load data
with open('src/data/data.json', 'r', encoding='utf-8') as file:
    qa_data = json.load(file)

# Prepare documents
documents = [{"question": q, "answer": a, "content": f"{q}\n{a}"} for q, a in qa_data.items()]
texts = [doc["content"] for doc in documents]

# Embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(texts, convert_to_numpy=True)

# FAISS index
dimension = embeddings[0].shape[0]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

# Chat log file
log_file = "chat_log.csv"
if not os.path.isfile(log_file):
    with open(log_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Timestamp", "Username", "User Message", "Bot Response"])

def log_chat(username, user_message, bot_response):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([timestamp, username, user_message, bot_response])

def retrieve_top_k(query, k=1):
    query_embedding = model.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)
    return [documents[i] for i in indices[0]]

def generate_answer_rag(query):
    top_docs = retrieve_top_k(query)
    context = top_docs[0]['content'] if top_docs else "No relevant information found."

    prompt = f"""You are a helpful assistant for Study in India.
Use the following context to answer the question.

Context:
{context}

Question: {query}
Answer:"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error generating response: {str(e)}"

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message')
    user_name = data.get('username', 'User')

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # 🔁 First check for exact match in data.json
    if user_message in qa_data:
        response = qa_data[user_message]
    else:
        # 🔍 Otherwise generate with RAG
        response = generate_answer_rag(user_message)

    personalized_response = f"Hello {user_name}! {response}"
    log_chat(user_name, user_message, response)

    return jsonify({'response': personalized_response})

if __name__ == '__main__':
    app.run(debug=True)
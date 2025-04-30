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

app = Flask(__name__)
CORS(app)

# Load data from data.json
with open('src/data/data.json', 'r', encoding='utf-8') as file:
    qa_data = json.load(file)
    
log_file = "chat_log.csv"

# Create log file if it doesn't exist
if not os.path.isfile(log_file):
    with open(log_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Timestamp", "Username", "User Message", "Bot Response"])

# Function to log chat to CSV
def log_chat(username, user_message, bot_response):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(log_file, mode='a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([timestamp, username, user_message, bot_response])
    
    
    

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

@app.route('/api/chat', methods=['POST'])
def chat():
    data_from_request = request.get_json()
    user_message = data_from_request.get('message')
    user_name = data_from_request.get('username')  # Get the username

    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # Check if user message exists in data.json
    response = qa_data.get(user_message, "I’m sorry, I didn’t understand that 😓. Could you please rephrase your question?")
    
    # Send personalized message
    personalized_response = f"Hello {user_name}! {response}"
    
    # Log the chat to the CSV
    log_chat(user_name, user_message, response)
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)

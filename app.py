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

app = Flask(__name__)
CORS(app)

# Load data from data.json
with open('src/data/data.json', 'r', encoding='utf-8') as file:
    qa_data = json.load(file)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')

@app.route('/api/chat', methods=['POST'])
def chat():
    data_from_request = request.get_json()
    user_message = data_from_request.get('message')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # Check if user message exists in data.json
    response = qa_data.get(user_message, "Sorry, I didn’t get that. Could you please ask something else?")
    
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)

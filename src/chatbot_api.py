# from flask import Flask, request, jsonify
# from chatbot import StudyIndiaChatbot  # your chatbot logic

# app = Flask(__name__)
# bot = StudyIndiaChatbot()

# @app.route('/api/chat', methods=['POST'])
# def chat():
#     data = request.get_json()
#     user_input = data.get('message', '')

#     response = bot.get_response(user_input)
#     return jsonify({'response': response})

# if __name__ == '__main__':
#     app.run(debug=True)



from flask import Flask, request, jsonify
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load FAQ data from the JSON file
with open('data.json', 'r') as file:
    faq_data = json.load(file)

def get_best_match(user_input):
    best_match = None
    best_score = 0

    # Convert user input to lowercase for better matching
    user_input = user_input.lower()

    for category, qa_pairs in faq_data.items():
        for question, answer in qa_pairs.items():
            # Simple word matching score
            score = sum(word in question.lower() for word in user_input.split())
            if score > best_score:
                best_score = score
                best_match = answer

    if best_score == 0:
        return "I apologize, but I couldn't find a specific answer to your question. Please try rephrasing."

    return best_match

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data["message"]

    # Get the response based on the user input
    bot_response = get_best_match(user_message)

    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)

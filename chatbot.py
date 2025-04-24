import json
import re
from typing import Dict, List, Tuple

# FAQ Database
FAQ_DATA = {
    "admissions": {
        "How can I apply to study in India?": """
To apply for studies in India:
1. Visit the Study in India portal (www.studyinindia.gov.in)
2. Register and create your profile
3. Choose your preferred institutions and courses
4. Submit required documents
5. Wait for institution response
        """,
        "What documents do I need for admission?": """
Required documents typically include:
- Valid passport
- Academic transcripts
- English proficiency test scores
- Statement of purpose
- Letters of recommendation
- Passport size photographs
        """,
        "What are the eligibility criteria?": """
General eligibility criteria include:
- Completed higher secondary education (12th grade)
- Meet minimum academic scores required by the institution
- English language proficiency
- Valid passport
- Meet specific course prerequisites
        """
    },
    "visa": {
        "How do I get a student visa for India?": """
Steps to obtain a student visa:
1. Receive admission letter from Indian institution
2. Apply online at e-FRRO portal
3. Schedule visa appointment at Indian embassy
4. Submit required documents
5. Pay visa fees
6. Attend visa interview if required
        """,
        "What is the visa fee?": """
Visa fees vary by country and duration of stay. 
Please check the Indian embassy website in your country 
for current fee structure.
        """
    },
    "costs": {
        "What are the living costs in India?": """
Monthly living expenses in India (approximate):
- Accommodation: $100-300
- Food: $100-200
- Transportation: $30-50
- Utilities: $30-50
- Miscellaneous: $100
Total: $360-700 per month
        """,
        "Are scholarships available?": """
Yes, several scholarships are available:
1. Study in India scholarships
2. ICCR scholarships
3. Institution-specific scholarships
4. Government exchange programs
Visit www.studyinindia.gov.in for more details
        """
    }
}

class StudyIndiaChatbot:
    def __init__(self):
        self.faq_data = FAQ_DATA
        self.conversation_history: List[Tuple[str, str]] = []

    def get_best_match(self, user_input: str) -> Tuple[str, str]:
        best_match = None
        best_score = 0

        # Convert user input to lowercase for better matching
        user_input = user_input.lower()

        for category, qa_pairs in self.faq_data.items():
            for question, answer in qa_pairs.items():
                # Simple word matching score
                score = sum(word in question.lower() for word in user_input.split())
                if score > best_score:
                    best_score = score
                    best_match = (question, answer)

        if best_score == 0:
            return ("", "I apologize, but I couldn't find a specific answer to your question."
                   "Please try rephrasing your question or ask about admissions, visa, or costs.")

        return best_match

    def get_response(self, user_input: str) -> str:
        if not user_input.strip():
            return "Please ask a question about studying in India."

        # Check for greetings
        if re.match(r'\b(hi|hello|hey)\b', user_input.lower()):
            return ("Hello! I'm the Study in India assistant. I can help you with information about: \n"
                   "- Admissions process\n"
                   "- Visa requirements\n"
                   "- Costs and scholarships\n"
                   "What would you like to know?")

        # Check for farewell
        if re.match(r'\b(bye|goodbye|thank you|thanks)\b', user_input.lower()):
            return "Thank you for your interest in studying in India! Feel free to come back if you have more questions."

        # Get the best matching response
        question, answer = self.get_best_match(user_input)
        
        # Store in conversation history
        self.conversation_history.append((user_input, answer))
        
        return answer.strip()

def main():
    chatbot = StudyIndiaChatbot()
    print("\n=== Study in India Assistant ===")
    print("Hello! I'm here to help you with information about studying in India.")
    print("You can ask me about admissions, visa requirements, costs, and scholarships.")
    print("Type 'quit' or 'exit' to end the conversation.\n")

    while True:
        user_input = input("\nYou: ").strip()
        
        if user_input.lower() in ['quit', 'exit']:
            print("\nThank you for your interest in studying in India! Goodbye!")
            break
            
        response = chatbot.get_response(user_input)
        print("\nAssistant:", response)

if __name__ == "__main__":
    main()
import React, { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap, MessageSquare, X } from 'lucide-react';
import { faqData } from './data/faqData';
import Draggable from 'react-draggable';
import { Copy } from 'lucide-react';


interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  similarQuestions?: string[];
}

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  country: string;
  query: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Hello User!😊
I'm the Study in India assistant.🎓
I can help you with information about:
1. Study in India programme
2. Registration and Choice Filling
3. Fee Structure
4. Courses
5. Globally Accepted Degrees
6. English Language Skills
7. Visa Regulation
8. Admissions
What would you like to know?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    country: '',
    query: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findSimilarQuestions = (input: string): string[] => {
    const inputLower = input.toLowerCase();
    const similarQuestions: Array<{ question: string; score: number }> = [];

    Object.values(faqData).forEach(category => {
      Object.keys(category).forEach(question => {
        const questionLower = question.toLowerCase();
        const words = inputLower.split(' ');
        let score = 0;

        words.forEach(word => {
          if (questionLower.includes(word)) score += 1;
        });

        if (score > 0) {
          similarQuestions.push({ question, score });
        }
      });
    });

    return similarQuestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(q => q.question);
  };

  const findBestMatch = (input: string): { text: string; similarQuestions: string[] } => {
    const inputLower = input.toLowerCase();
    let bestMatch = {
      text: "I apologize, but I couldn't find a specific answer to your question. You can try asking about SII Programme, admissions, visa, costs, or course. Or, you can contact our helpdesk for personalized assistance.",
      score: 0
    };

    Object.entries(faqData).forEach(([category, questions]) => {
      Object.entries(questions).forEach(([question, answer]) => {
        const questionLower = question.toLowerCase();
        const words = inputLower.split(' ');
        let score = 0;

        words.forEach(word => {
          if (questionLower.includes(word)) score += 1;
          if (category.toLowerCase().includes(word)) score += 0.5;
        });

        if (score > bestMatch.score) {
          bestMatch = {
            text: answer,
            score: score
          };
        }
      });
    });

    const similarQuestions = findSimilarQuestions(input);
    return { text: bestMatch.text, similarQuestions };
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text).then(() => {
    });
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // If there's no input value, prevent submitting
    if (!inputValue.trim()) return;
  
    // Create user message object
    const userMessage = {
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
  
    // Update state with user message
    setMessages((prev) => [...prev, userMessage]);
  
    // Clear input field
    setInputValue('');
  
    // Indicate that the bot is typing
    setIsTyping(true);
  
    try {
     
      // Send POST request to Flask server
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST', // Ensure POST is used
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
       
      });
      
      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };
  
        // Update messages with bot response
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error('Failed to fetch response');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Stop the typing indication
      setIsTyping(false);
    }
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Thank you for reaching out to us! Our helpdesk team will contact you soon at ${contactForm.phone} or ${contactForm.email}.`;
    
    setMessages(prev => [...prev, {
      text: message,
      isUser: false,
      timestamp: new Date()
    }]);
    
    setShowContactForm(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      country: '',
      query: ''
    });
  };

  return (
    <Draggable>
  <div
    className="fixed bottom-4 right-4 z-50 w-[500px] max-h-[100vh]  rounded-2xl shadow-xl"
    style={{ resize: 'both' }}
  >
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
  <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
    {/* Header */}
    <div style={{backgroundColor: '#073a7d'}} className="p-6">
    <div className="flex items-center space-x-4">
        <GraduationCap className="text-white w-8 h-8" />
        <div>
          <h1 style={{ fontFamily: "'Play', sans-serif" }} className="text-2xl font-bold text-white">Study in India Assistant</h1>
          
          <p className="text-indigo-200">Your guide to studying in India</p>
        </div>
      </div>
    </div>

    {/* Chat Messages */}
    <div className="h-[500px] overflow-y-auto p-6 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[80%] rounded-2xl p-4 relative ${message.isUser ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
  <div className="flex items-center space-x-2 mb-1">
    {!message.isUser && <MessageSquare className="w-4 h-4" />}
    <span className="text-xs opacity-75">{message.timestamp.toLocaleTimeString()}</span>
  </div>

  <p style={{ fontFamily: "'Play', sans-serif" }} className="whitespace-pre-wrap">{message.text}</p>

  {/* Copy Icon */}
  {!message.isUser && (
    <button
      onClick={() => copyToClipboard(message.text)}
      className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800"
      title="Copy message"
    >
      <Copy className="w-4 h-4" />
    </button>
  )}

  {/* Similar Questions */}
  {!message.isUser && message.similarQuestions && message.similarQuestions.length > 0 && (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium">Similar questions you might be interested in:</p>
      <ul className="space-y-1">
        {message.similarQuestions.map((question, idx) => (
          <li key={idx} className="text-sm">• {question}</li>
        ))}
      </ul>
    </div>
  )}
</div>

        </div>
      ))}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl p-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </div>
        </div>
      )}

{/* {Response && Response !== "Hi! What do you wanna ask?" && (
  <div className="feedback">
    <p>Was this Information helpful?</p>
    <button>👍</button>
    <button>👎</button>
  </div>
)} */}


    <div ref={messagesEndRef} />


  </div>

    {/* Input Form */}
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <div className="flex space-x-4">
        <input style={{ fontFamily: "'Play', sans-serif" }}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about admissions, visa, costs, or course..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="text-white rounded-lg px-6 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57f18] focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
          style={{ backgroundColor: '#f57f18' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#c95f00')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f57f18')}
                      >
          <span style={{ fontFamily: "'Play', sans-serif" }}>Send</span>

          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  </div>

  {/* Contact Form Modal */}
  {showContactForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Contact Helpdesk</h2>
          <button
            onClick={() => setShowContactForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={contactForm.name}
              onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={contactForm.email}
              onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={contactForm.phone}
              onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              required
              value={contactForm.country}
              onChange={(e) => setContactForm(prev => ({ ...prev, country: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Query</label>
            <textarea
              required
              value={contactForm.query}
              onChange={(e) => setContactForm(prev => ({ ...prev, query: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )}
</div>
</div>
 </Draggable>
  );
}

export default App;
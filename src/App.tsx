import React, { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap, Clock, MessageSquare, Search, Phone, HelpCircle, X } from 'lucide-react';
import { faqData } from './data/faqData';

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
      text: `Hello! I'm the Study in India assistant. I can help you with information about:
- SII programme
- Registration and Choice Filling
- Costs and Fees
- Courses
- Globally Accepted Degrees
- English Language Skills
- Visa Regulation
- Admissions
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const { text, similarQuestions } = findBestMatch(inputValue);
      
      const botMessage: Message = {
        text,
        isUser: false,
        timestamp: new Date(),
        similarQuestions: similarQuestions.length > 0 ? similarQuestions : undefined
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6">
          <div className="flex items-center space-x-4">
            <GraduationCap className="text-white w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold text-white">Study in India Assistant</h1>
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
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {!message.isUser && <MessageSquare className="w-4 h-4" />}
                  <span className="text-xs opacity-75">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {!message.isUser && message.similarQuestions && message.similarQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium">Similar questions you might be interested in:</p>
                    <ul className="space-y-1">
                      {message.similarQuestions.map((question, idx) => (
                        <li key={idx} className="text-sm">
                          • {question}
                        </li>
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about admissions, visa, costs, or course..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-indigo-600 text-white rounded-lg px-6 py-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Features Section */}
      <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <GraduationCap className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Comprehensive Guide</h3>
          <p className="text-gray-600">Detailed information about admissions, courses, and institutions in India.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <Search className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Smart Answers</h3>
          <p className="text-gray-600">Intelligent matching to provide the most relevant information for your queries.</p>
        </div>
        <div 
          className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors duration-200"
          onClick={() => setShowContactForm(true)}
        >
          <Phone className="w-8 h-8 text-indigo-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Need More Help?</h3>
          <p className="text-gray-600">Contact our helpdesk for personalized assistance with your queries.</p>
        </div>
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
  );
}

export default App;
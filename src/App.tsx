import React, { useState, useRef, useEffect } from "react";
import { Send, GraduationCap, MessageSquare, X } from "lucide-react";
import { faqData } from "./data/faqData";
import Draggable from "react-draggable";
import { Copy } from "lucide-react";
import "bootstrap-icons/font/bootstrap-icons.css";

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
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Hi! 😊 I'm the Study in India Assistant. 🎓
I'm here to help you with queries about the SII program, Courses, Visa Regulations, and more. How can I assist you today?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [suggestionValue, setSuggestionValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    country: "",
    query: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); //copy state

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findSimilarQuestions = (input: string): string[] => {
    const inputLower = input.toLowerCase();
    const similarQuestions: Array<{ question: string; score: number }> = [];

    Object.values(faqData).forEach((category) => {
      Object.keys(category).forEach((question) => {
        const questionLower = question.toLowerCase();
        const words = inputLower.split(" ");
        let score = 0;

        words.forEach((word) => {
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
      .map((q) => q.question);
  };

  const findBestMatch = (
    input: string
  ): { text: string; similarQuestions: string[] } => {
    const inputLower = input.toLowerCase();
    let bestMatch = {
      text: "I apologize, but I couldn't find a specific answer to your question. You can try asking about SII Programme, admissions, visa, costs, or course. Or, you can contact our helpdesk for personalized assistance.",
      score: 0,
    };

    Object.entries(faqData).forEach(([category, questions]) => {
      Object.entries(questions).forEach(([question, answer]) => {
        const questionLower = question.toLowerCase();
        const words = inputLower.split(" ");
        let score = 0;

        words.forEach((word) => {
          if (questionLower.includes(word)) score += 1;
          if (category.toLowerCase().includes(word)) score += 0.5;
        });

        if (score > bestMatch.score) {
          bestMatch = {
            text: answer,
            score: score,
          };
        }
      });
    });

    const similarQuestions = findSimilarQuestions(input);
    return { text: bestMatch.text, similarQuestions };
  };

  const copyToClipboard = (text: string, index: number): void => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1000);
    });
  };

  let isHelpfulActive = false;
  let isNotHelpfulActive = false;

  const handleHelpfulBtn = () => {
    const btnColor = document.querySelector(".helpful-btn") as HTMLElement;
    if (!btnColor) return;

    // Toggle the Helpful button
    if (isHelpfulActive) {
      btnColor.style.backgroundColor = "transparent";
      btnColor.style.color = "#f57f18"; // orange text
    } else {
      btnColor.style.backgroundColor = "#f57f18"; // orange background
      btnColor.style.color = "#ffffff"; // White text
    }

    // Ensure the Not Helpful button is reset when Helpful is toggled
    isHelpfulActive = !isHelpfulActive;

    // If Helpful is active, reset Not Helpful
    if (isHelpfulActive) {
      const notHelpfulBtn = document.querySelector(
        ".nothelpful-btn"
      ) as HTMLElement;
      if (notHelpfulBtn) {
        notHelpfulBtn.style.backgroundColor = "transparent";
        notHelpfulBtn.style.color = "#f57f18"; // orange text
        isNotHelpfulActive = false;
      }
    }
    isHelpfulActive = false;
  };

  const handleNotHelpfulBtn = () => {
    const btnColor = document.querySelector(".nothelpful-btn") as HTMLElement;
    if (!btnColor) return;

    // Toggle the Not Helpful button
    if (isNotHelpfulActive) {
      btnColor.style.backgroundColor = "transparent";
      btnColor.style.color = "#f57f18"; // orange text
    } else {
      btnColor.style.backgroundColor = "#f57f18"; // orange background
      btnColor.style.color = "#ffffff"; // White text
    }

    // Ensure the Helpful button is reset when Not Helpful is toggled
    isNotHelpfulActive = !isNotHelpfulActive;

    // If Not Helpful is active, reset Helpful
    if (isNotHelpfulActive) {
      const helpfulBtn = document.querySelector(".helpful-btn") as HTMLElement;
      if (helpfulBtn) {
        helpfulBtn.style.backgroundColor = "transparent";
        helpfulBtn.style.color = "#f57f18"; // orange text
        isHelpfulActive = false;
      }
    }

    // Send the "Not Helpful" response message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: "Do you want some assistance from our 24*7 helpdesk call centre?\n\nContact Details:-\n📧 help.studyinindia@gov.in\n📞+91 120-6565065",
        isUser: false, // This is from the bot
        timestamp: new Date(), // Pass a Date object
      },
    ]);
  };

  const handleSubmit = async (
    
    e: React.FormEvent,
    customInput?: string
  ) => {
    e.preventDefault();
    const messageText = customInput ?? inputValue;
  
    if (!messageText.trim()) return;
  
    const userMessage = {
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
  
    setMessages((prev) => [...prev, userMessage]);
    setInputValue(""); // clear only the input box
    setIsTyping(true);
  
    try {
      const username = "Student";
  
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          username: username,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const botMessage = {
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        console.error("Failed to fetch response");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsTyping(false);
    }
  };
  

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Thank you for reaching out to us! Our helpdesk team will contact you soon at ${contactForm.phone} or ${contactForm.email}.`;

    setMessages((prev) => [
      ...prev,
      {
        text: message,
        isUser: false,
        timestamp: new Date(),
      },
    ]);

    setShowContactForm(false);
    setContactForm({
      name: "",
      email: "",
      phone: "",
      country: "",
      query: "",
    });
  };

  return (
    <Draggable cancel=".no-drag">
      <div
        className="fixed bottom-4 right-4 z-50 w-[50vh] max-h-[100vh]  rounded-2xl shadow-xl"
        style={{ resize: "both" }}
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div style={{ backgroundColor: "#073a7d" }} className="p-[10px]">
            <div className="flex items-center space-x-4">
              <GraduationCap className="text-white w-8 h-8" />
              <div>
                <h1
                  style={{ fontFamily: "'Play', sans-serif" }}
                  className="text-2xl font-bold text-white"
                >
                  Study in India Assistant
                </h1>

                <p className="text-indigo-200">
                  Your guide to studying in India
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 relative ${
                    message.isUser
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {!message.isUser && <MessageSquare className="w-4 h-4" />}
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>

                  <p
                    style={{ fontFamily: "'Play', sans-serif" }}
                    className="whitespace-pre-wrap break-words overflow-hidden select-text cursor-text no-drag"
                    onMouseDown={(e) => e.stopPropagation()}
                    onMouseUp={(e) => e.stopPropagation()}
                  >
                    {message.text}
                  </p>

                  {/*Copy Icon} */}
                  {!message.isUser && (
                    <div>
                      <button
                        onClick={() => copyToClipboard(message.text, index)}
                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-gray-800"
                        title="Copy message"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {copiedIndex === index && (
                        <span className="absolute top-0 right-10 text-sm text-green-500">
                          Copied!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Similar Questions */}
                  {!message.isUser &&
                    message.similarQuestions &&
                    message.similarQuestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">
                          Similar questions you might be interested in:
                        </p>
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
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "200ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "400ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "About SII Programme")}
              className="border-2 mr-2 border-sky-600 text-sky-600 p-1 rounded-lg"
            >
              About SII Programme
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "How to Apply")}
              className="border-2 border-sky-600 text-sky-600 p-1 rounded-lg"
            >
              How to Apply
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "Documents Required")}
              className="border-2 mr-2 border-sky-600 text-sky-600 p-1 rounded-lg"
            >
              Documents Required
            </button>
            
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "Visa")}
              className="border-2 border-sky-600 text-sky-600 p-1 rounded-lg"
            >
              Visa
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "Popular Courses")}
              className="border-2 mr-2 border-sky-600 text-sky-600 p-1 rounded-lg"
            >
              Popular Courses
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any, "Scholarship")}
              className="border-2 border-sky-600 text-sky-600 p-1 rounded-lg"
            >
              Scholarship
            </button>

            {/* <button
              onClick={handleHelpfulBtn}
              className="helpful-btn mr-4 border-2 border-orange-500 text-orange-500 p-1 rounded-lg"
            >
              Helpful
              <i className="bi bi-hand-thumbs-up "></i>
            </button>
            <button
              onClick={handleNotHelpfulBtn}
              className="nothelpful-btn border-2 border-orange-500 text-orange-500 p-1 rounded-lg"
            >
              Not Helpful
              <i className="bi bi-hand-thumbs-down"></i>
            </button> */}

            {<div ref={messagesEndRef} />}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200"
          >
            <div className="flex space-x-4">
              <input
                style={{ fontFamily: "'Play', sans-serif" }}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about admissions, visa, costs, or course..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="text-white rounded-lg px-6 py-2 focus:outline-none focus:ring-2 focus:ring-[#f57f18] focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
                style={{ backgroundColor: "#f57f18" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#c95f00")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f57f18")
                }
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.country}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Query
                  </label>
                  <textarea
                    required
                    value={contactForm.query}
                    onChange={(e) =>
                      setContactForm((prev) => ({
                        ...prev,
                        query: e.target.value,
                      }))
                    }
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
    </Draggable>
  );
}

export default App;

// I can help you with information about:
// ➡️ Study in India programme
// ➡️ Registration
// ➡️ Fee Structure
// ➡️ Courses
// ➡️ Globally Accepted Degrees
// ➡️ English Language Skills
// ➡️ Visa Regulation
// ➡️ Admissions
// What would you like to know?

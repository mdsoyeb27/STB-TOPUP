import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Bot, Package, User, ShoppingCart } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface AIChatbotProps {
  isAdmin: boolean;
  orders: any[];
  packages: any[];
  user: any;
  onAddPackage?: (pkg: any) => void;
}

export default function AIChatbot({ isAdmin, orders, packages, user, onAddPackage }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: isAdmin 
        ? 'Hello Admin! I can help you manage inventory, add packages, or analyze orders. Just tell me what to do.' 
        : 'Hi! I am your AI assistant. How can I help you with top-ups today?', 
      sender: 'ai', 
      timestamp: Date.now() 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: inputText,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = 'gemini-2.5-flash-lite-latest'; // Using a faster model for chat
      
      let systemInstruction = '';
      
      if (isAdmin) {
        systemInstruction = `You are an intelligent Admin Assistant for "STB TOPUP".
        You have access to the current product list (packages).
        
        Capabilities:
        1. Add new packages: If the admin says "Add a package [Name] for [Price]", extract the details.
        2. Check stock: Analyze the provided package list.
        3. Order Analysis: Provide insights on orders.

        Current Packages Context: ${JSON.stringify(packages.map(p => ({ name: p.name, price: p.price, stock: p.stock || 'Unlimited' })))}

        IMPORTANT: If the user wants to ADD a package, you MUST return a JSON object ONLY in this format:
        {"action": "ADD_PACKAGE", "data": {"name": "Package Name", "price": 100, "amount": "100 Diamonds", "gameId": "free-fire", "stock": 50}}
        Infer the 'amount', 'gameId' (default to 'free-fire'), and 'stock' (default to 999) from the text.
        
        If it's a general question, answer normally in plain text.
        `;
      } else {
        const userOrders = orders.filter(o => o.userEmail === user?.email).slice(0, 5);
        systemInstruction = `You are a helpful customer support AI for "STB TOPUP".
        User Context: ${user ? `Logged in as ${user.email}` : 'Guest User'}
        
        User's Recent Orders: ${JSON.stringify(userOrders.map(o => ({ id: o.id, item: o.packageName, status: o.status, price: o.price })))}
        
        Available Packages (Sample): ${JSON.stringify(packages.slice(0, 10).map(p => ({ name: p.name, price: p.price })))}

        Help with:
        1. Order Status: Check the provided order list.
        2. Pricing: Use the package list.
        3. General Support.

        Tone: Friendly, Professional, Banglish allowed.
        If asked about an order not in the list, ask for the Order ID.
        `;
      }

      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: model,
        contents: [...history, { role: 'user', parts: [{ text: userMsg.text }] }],
        config: { systemInstruction }
      });

      const responseText = response.text || "I'm sorry, I couldn't process that.";

      // Check for JSON action (Admin only)
      if (isAdmin && responseText.includes('ADD_PACKAGE')) {
        try {
          // Attempt to extract JSON if mixed with text
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const actionData = JSON.parse(jsonMatch[0]);
            if (actionData.action === 'ADD_PACKAGE' && onAddPackage) {
              onAddPackage(actionData.data);
              setMessages(prev => [...prev, {
                id: `ai-${Date.now()}`,
                text: `✅ I've added the package: ${actionData.data.name} for ৳${actionData.data.price}.`,
                sender: 'ai',
                timestamp: Date.now()
              }]);
              setIsTyping(false);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to parse AI action", e);
        }
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text: responseText,
        sender: 'ai',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        text: "Sorry, I'm having trouble connecting right now.",
        sender: 'ai',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'} text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center ${isOpen ? 'hidden' : 'flex'}`}
      >
        {isAdmin ? <Bot className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 w-[90vw] md:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`${isAdmin ? 'bg-slate-900' : 'bg-indigo-950'} p-4 flex items-center justify-between text-white`}>
              <div className="flex items-center gap-2">
                <div className={`${isAdmin ? 'bg-slate-800' : 'bg-indigo-800'} p-2 rounded-lg`}>
                  {isAdmin ? <Sparkles className="w-5 h-5 text-yellow-400" /> : <Bot className="w-5 h-5 text-indigo-200" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{isAdmin ? 'Admin Copilot' : 'STB AI Assistant'}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-indigo-300">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? (isAdmin ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-indigo-600 text-white rounded-tr-none')
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAdmin ? "Command me (e.g., 'Add 100 diamonds for 80tk')" : "Ask anything..."}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className={`${isAdmin ? 'bg-slate-900 hover:bg-slate-800' : 'bg-indigo-600 hover:bg-indigo-700'} text-white p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

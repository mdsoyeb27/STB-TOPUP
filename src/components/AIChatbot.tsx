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
      const model = 'gemini-3-flash-preview'; // Using the latest stable flash preview model
      
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

        **Language & Tone:**
        - You MUST support both **Bengali (Bangla)** and **English**.
        - If the user asks in Bengali, **reply in Bengali**.
        - If the user asks in English, reply in English.
        - You can use "Banglish" if the user does.
        - Be friendly, professional, and helpful.

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
        className={`fixed bottom-28 right-4 md:bottom-8 md:right-8 z-[60] ${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'} text-white p-4 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center ${isOpen ? 'hidden' : 'flex'}`}
      >
        {isAdmin ? <Bot className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
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
            <div className={`${isAdmin ? 'bg-slate-900' : 'bg-indigo-600'} p-6 flex items-center justify-between text-white`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  {isAdmin ? <Sparkles className="w-6 h-6 text-yellow-400" /> : <Bot className="w-6 h-6 text-indigo-100" />}
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">{isAdmin ? 'Admin Copilot' : 'STB Assistant'}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    Online Now
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-100 text-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-3xl rounded-tl-none flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              
              {!isAdmin && messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {[
                    'Check Order Status',
                    'How to Topup?',
                    'Payment Methods',
                    'Contact Support'
                  ].map((action) => (
                    <button
                      key={action}
                      onClick={() => {
                        setInputText(action);
                        handleSendMessage();
                      }}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white/50 backdrop-blur-md border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isAdmin ? "Command me..." : "How can I help?"}
                className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="btn-primary !p-3 !rounded-2xl disabled:opacity-50"
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

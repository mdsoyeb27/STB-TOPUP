import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BotMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface BotContextType {
  messages: BotMessage[];
  addMessage: (text: string, type?: BotMessage['type']) => void;
  clearMessages: () => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export const BotProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<BotMessage[]>([]);

  const addMessage = (text: string, type: BotMessage['type'] = 'info') => {
    const newMessage: BotMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: Date.now(),
    };
    setMessages((prev) => [newMessage, ...prev]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  // Simulate bot activity
  useEffect(() => {
    const interval = setInterval(() => {
      const activities = [
        "User 'PlayerOne' just viewed the Diamond Top-up page.",
        "New order #1234 received for 100 Diamonds.",
        "Payment gateway checked: Status OK.",
        "System health check: All systems operational.",
        "User 'GamerX' added an item to cart.",
        "Admin login attempt detected.",
        "Topup Request: 500 Diamonds for UID 123456789.",
        "Bot Status: Processing order queue...",
        "Alert: Low stock on 'Weekly Membership' package.",
        "Payment Received: ৳500 via bKash.",
        "User 'ProGamer' just registered.",
        "Bot Action: Auto-completed Order #9988."
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      // Only add occasionally to not spam too much
      if (Math.random() > 0.7) {
        addMessage(randomActivity, 'info');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BotContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </BotContext.Provider>
  );
};

export const useBot = () => {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
};

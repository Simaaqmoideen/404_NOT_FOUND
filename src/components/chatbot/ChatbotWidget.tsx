import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { getChatbotResponse } from './chatbotLogic';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{text: string, isBot: boolean}[]>([
    { text: "Hi! I'm the BinWise Assistant. Ask me how to dispose of an item!", isBot: true }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');
    
    setTimeout(() => {
      const botResponse = getChatbotResponse(userMsg);
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 400);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-2xl shadow-2xl shadow-black/20 overflow-hidden flex flex-col glass"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-eco-500 to-sky-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="font-bold text-white text-sm">BinWise Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
              {messages.map((m, i) => <ChatMessage key={i} text={m.text} isBot={m.isBot} />)}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about waste..."
                className="flex-1 bg-[var(--color-bg-base)] border border-[var(--color-border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-eco-500/50 outline-none"
              />
              <button type="submit" disabled={!input.trim()} className="bg-eco-500 hover:bg-eco-400 disabled:opacity-50 text-white rounded-xl px-3 py-2 transition-colors flex items-center justify-center">
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-eco-500 to-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-eco-500/30 text-white"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
}

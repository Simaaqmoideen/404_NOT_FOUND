import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, Bot } from 'lucide-react';
import Navbar from '../components/shared/Navbar';
import { getChatbotResponse } from '../components/chatbot/chatbotLogic';

interface Message {
  text: string;
  isBot: boolean;
}

const SUGGESTIONS = [
  "What bin does plastic go in?",
  "How do I dispose of batteries?",
  "What is organic waste?",
  "How do I earn points?",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your BinWise Assistant 🌿 Ask me anything about waste segregation and recycling.", isBot: true },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput('');

    setTimeout(() => {
      const response = getChatbotResponse(userMsg);
      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] grid-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-12 flex flex-col" style={{ height: '100vh' }}>

        {/* Breadcrumb & Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/dashboard" className="text-[var(--color-text-secondary)] hover:text-eco-400 text-sm transition-colors">Dashboard</Link>
            <span className="text-[var(--color-text-secondary)]">/</span>
            <span className="text-eco-400 text-sm font-semibold">Learn</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--color-text-primary)] font-[Space_Grotesk,sans-serif]">Waste Assistant</h1>
              <p className="text-xs text-[var(--color-text-secondary)]">Ask anything about waste segregation</p>
            </div>
          </div>
        </motion.div>

        {/* Chat Window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-[var(--color-border-subtle)] flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {msg.isBot && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-eco-500 to-sky-500 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.isBot
                      ? 'bg-[var(--color-bg-surface-hover)] text-[var(--color-text-primary)] rounded-tl-sm'
                      : 'bg-eco-500 text-white rounded-tr-sm shadow-md shadow-eco-500/20'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-eco-500/50 hover:text-eco-400 hover:bg-eco-500/10 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[var(--color-border-subtle)] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about plastic, organic, batteries..."
              className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-slate-500 focus:border-eco-500/50 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-eco-500 hover:bg-eco-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2.5 transition-colors flex items-center gap-1.5 font-semibold text-sm"
            >
              <Send size={15} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

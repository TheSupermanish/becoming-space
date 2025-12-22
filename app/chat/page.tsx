'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, MoreHorizontal, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { MarkdownView } from '@/components/features/MarkdownView';
import type { ChatMessage, SessionUser } from '@/lib/types';

const CHAT_SUMMARY_KEY = 'athena_chat_summary';
const CHAT_MESSAGES_KEY = 'athena_chat_messages';

// Helper to get/set summary from localStorage
const getSummary = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CHAT_SUMMARY_KEY) || '';
};

const saveSummary = (summary: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_SUMMARY_KEY, summary);
};

const clearSummary = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAT_SUMMARY_KEY);
};

// Helper to get/set messages from localStorage (for UI display)
const getStoredMessages = (): ChatMessage[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHAT_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMessages = (messages: ChatMessage[]) => {
  if (typeof window === 'undefined') return;
  // Keep last 50 messages for display
  const toStore = messages.slice(-50);
  localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(toStore));
};

const clearMessages = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CHAT_MESSAGES_KEY);
};

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [conversationSummary, setConversationSummary] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user, messages, and summary on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          router.replace('/login');
        } else {
          setUser(data.data);
          
          // Load stored messages and summary
          const storedMessages = getStoredMessages();
          const storedSummary = getSummary();
          
          if (storedMessages.length > 0) {
            setMessages(storedMessages);
            setConversationSummary(storedSummary);
          } else {
            // First visit - show welcome message
            setMessages([{
              id: 'welcome',
              role: 'model',
              text: "Hello. I'm Athena, and I'm here to listen without judgment. How are you feeling today?",
              timestamp: Date.now(),
            }]);
          }
          setIsInitialized(true);
        }
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, isInitialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text,
          summary: conversationSummary, // Send current summary for context
        }),
      });

      const data = await res.json();
      
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.success ? data.data.response : "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, modelMessage]);

      // Update and save the new summary
      if (data.success && data.data.summary) {
        setConversationSummary(data.data.summary);
        saveSummary(data.data.summary);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm experiencing some difficulties. Please try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    await fetch('/api/chat', { method: 'DELETE' });
    // Clear localStorage - both messages and summary
    clearMessages();
    clearSummary();
    setConversationSummary('');
    setMessages([
      {
        id: 'welcome-new',
        role: 'model',
        text: "Hello again. I'm here whenever you need to talk. How can I help you today?",
        timestamp: Date.now(),
      },
    ]);
    setShowMenu(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-stone">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Container */}
      <div className="max-w-2xl mx-auto flex flex-col h-screen relative">
        {/* Floating Header */}
        <header className="fixed top-0 left-0 right-0 z-20 px-4 pt-3">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/95 backdrop-blur-xl shadow-soft border border-sand/30 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/feed')}
                  className="p-2 hover:bg-sand/50 rounded-xl transition-colors text-stone"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center">
                      <Sparkles className="text-sage" size={18} />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-sage border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-bark text-sm">Athena</h3>
                    <p className="text-xs text-stone">AI Companion • Always here</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-sand/50 rounded-xl transition-colors text-stone"
                >
                  <MoreHorizontal size={20} />
                </button>
                
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-12 bg-white rounded-xl shadow-warm border border-sand/50 py-1 z-50 animate-scale-in min-w-[180px]">
                      <button
                        onClick={handleClearChat}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                      >
                        <Trash2 size={16} />
                        Clear conversation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Messages - with top padding for floating header and bottom for input */}
        <div className="flex-1 overflow-y-auto px-4 pt-24 pb-40 space-y-4 scrollbar-hide">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                {!isUser && (
                  <div className="w-8 h-8 bg-sage/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end">
                    <Sparkles className="text-sage" size={14} />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-4 ${
                    isUser
                      ? 'bg-earth text-white rounded-2xl rounded-br-md'
                      : 'bg-white text-bark border border-sand/50 rounded-2xl rounded-bl-md shadow-soft'
                  }`}
                >
                  {isUser ? (
                    <p className="leading-relaxed text-[15px]">{msg.text}</p>
                  ) : (
                    <MarkdownView content={msg.text} />
                  )}
                  <p
                    className={`text-[10px] mt-2 ${
                      isUser ? 'text-white/60' : 'text-stone/50'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                {isUser && (
                  <Avatar name={user.fullTag} size="sm" className="ml-2 self-end flex-shrink-0" />
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 bg-sage/20 rounded-full flex items-center justify-center mr-2 flex-shrink-0 self-end">
                <Sparkles className="text-sage" size={14} />
              </div>
              <div className="bg-white border border-sand/50 px-4 py-3 rounded-2xl rounded-bl-md shadow-soft flex items-center gap-1.5">
                <div className="w-2 h-2 bg-sage/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-sage/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-sage/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom, above nav with proper spacing */}
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 py-3 z-10">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share how you're feeling..."
                className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-bark focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage/50 placeholder-stone/40 text-[15px] shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 bg-sage text-white rounded-xl hover:bg-sage-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

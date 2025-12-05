'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRecord {
    id: string;
    role: string;
    chat: string;
    jsonValue: string;
    createdAt: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export const LiveFeedChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch recent agent chat history - this is the live feed data
    const { data: records } = useQuery({
        queryKey: ['chat-history'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/history/chats?limit=100');
            const json = await res.json();
            return (json.data || []) as ChatRecord[];
        },
        refetchInterval: 2000,
        staleTime: 1000,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/chat/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userMessage.content,
                }),
            });

            const data = await response.json();
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.answer || 'I could not process your question.',
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your question.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-black border border-gray-800 overflow-hidden relative font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-bold tracking-wider uppercase bg-blue-900/20 px-2 py-0.5">LIVE FEED CHAT</span>
                </div>
                <span className="text-xs text-gray-500 px-2 border border-gray-700 rounded">
                    {records?.length || 0} messages
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                        <MessageSquare className="w-8 h-8 opacity-50" />
                        <p className="text-xs">Ask questions about the agent workflow</p>
                        <p className="text-[10px] opacity-75">Example: "What are the 5 strategies the agent executed?"</p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                        >
                            <div
                                className={`
                                    max-w-[80%] rounded-lg px-3 py-2 text-xs
                                    ${message.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-green-400 border border-gray-700'
                                    }
                                `}
                            >
                                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                <span className="text-[10px] opacity-50 mt-1 block">
                                    {message.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-green-400 border border-gray-700 rounded-lg px-3 py-2 text-xs">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-800 bg-gray-900/50 p-2">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about agent strategies, decisions, or workflow..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2 text-xs transition-colors"
                    >
                        <Send className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
};


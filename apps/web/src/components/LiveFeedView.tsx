'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, AlertCircle, CheckCircle, XCircle, Activity, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

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

export const LiveFeedView = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<ChatRecord | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const feedScrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch recent agent chat history - this is the LIVE FEED
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

    // Agent styles matching ChatsList
    const AGENT_STYLES: Record<string, { bg: string, text: string, barColor: string }> = {
        'Technical Research Agent': { bg: 'bg-purple-900/20', text: 'text-purple-400', barColor: 'bg-purple-500' },
        'Risk Manager': { bg: 'bg-red-900/20', text: 'text-red-400', barColor: 'bg-red-500' },
        'Portfolio Manager': { bg: 'bg-blue-900/20', text: 'text-blue-400', barColor: 'bg-blue-500' },
        'Trader Agent': { bg: 'bg-emerald-900/20', text: 'text-emerald-400', barColor: 'bg-emerald-500' },
        'Summarizer Agent': { bg: 'bg-amber-900/20', text: 'text-amber-400', barColor: 'bg-amber-500' },
        'System': { bg: 'bg-yellow-900/20', text: 'text-yellow-400', barColor: 'bg-yellow-500' }
    };

    const DEFAULT_STYLE = { bg: 'bg-gray-800/30', text: 'text-gray-400', barColor: 'bg-gray-500' };

    // Detect issues
    const issues = records?.filter(r => 
        r.chat.toLowerCase().includes('error') || 
        r.chat.toLowerCase().includes('failed') ||
        r.chat.includes('❌')
    ) || [];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-scroll feed to top when new records arrive
    useEffect(() => {
        if (feedScrollRef.current && records && records.length > 0) {
            feedScrollRef.current.scrollTop = 0;
        }
    }, [records]);

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
                body: JSON.stringify({ question: userMessage.content }),
            });

            const data = await response.json();
            
            // Handle both success and error responses - always show answer if available
            const answer = data.answer || data.error || 'I could not process your question. Please try rephrasing.';
            
            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `Network Error: ${error.message || 'Failed to connect to server. Please check your connection and try again.'}`,
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
        <div className="flex flex-col h-full bg-black border-l border-gray-800 overflow-hidden relative font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/50 shrink-0">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-blue-400 font-bold tracking-wider uppercase bg-blue-900/20 px-2 py-0.5">LIVE FEED</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-500">{records?.length || 0} messages</span>
                    {issues.length > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {issues.length} issues
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 min-h-0 flex overflow-hidden">
                {/* LEFT: Live Feed (Agent Messages) - Hidden, only show chat */}
                <div className="hidden w-0 border-r border-gray-800 flex flex-col overflow-hidden min-w-0">
                    <div className="p-2 border-b border-gray-800 bg-gray-900/30 shrink-0">
                        <span className="text-xs font-bold text-gray-400 uppercase">Agent Feed</span>
                    </div>
                    <div ref={feedScrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-0">
                        <AnimatePresence initial={false}>
                            {records?.map((record) => {
                                const style = AGENT_STYLES[record.role] || DEFAULT_STYLE;
                                const date = new Date(record.createdAt);
                                const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                const isIssue = issues.some(i => i.id === record.id);
                                const isSelected = selectedRecord?.id === record.id;

                                return (
                                    <motion.div
                                        key={record.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        onClick={() => setSelectedRecord(record)}
                                        className={clsx(
                                            "mb-2 border-b border-gray-800/50 pb-2 cursor-pointer transition-all",
                                            isSelected && "bg-gray-800/50",
                                            isIssue && "border-l-2 border-l-red-500"
                                        )}
                                    >
                                        {/* Model Header Bar */}
                                        <div className={clsx("flex justify-between items-center px-2 py-1 mb-1 text-xs font-bold uppercase tracking-wider text-black", style.barColor)}>
                                            <span>{record.role.toUpperCase().replace(' ', '_')}</span>
                                            <span className="opacity-75">{dateString}, {timeString}</span>
                                        </div>

                                        {/* Message Content */}
                                        <div className="px-3 py-1">
                                            <p className={clsx(
                                                "leading-relaxed whitespace-pre-wrap text-xs",
                                                isIssue ? "text-red-400" : "text-green-500/90"
                                            )}>
                                                {record.chat.substring(0, 150)}
                                                {record.chat.length > 150 && '...'}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {(!records || records.length === 0) && (
                            <div className="flex items-center justify-center h-full text-gray-600">
                                <span className="animate-pulse">LOADING_FEED...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Interface - Full Width */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-2 border-b border-gray-800 bg-gray-900/30 shrink-0">
                        <span className="text-xs font-bold text-gray-400 uppercase">Live Feed Chat</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
                                <Activity className="w-12 h-12 opacity-50" />
                                <div className="text-center space-y-1">
                                    <p className="text-xs font-bold">Ask Questions About Live Feed</p>
                                    <p className="text-[10px] opacity-75">Query the agent workflow using the live feed data</p>
                                    <p className="text-[10px] opacity-50 mt-2">Examples:</p>
                                    <ul className="text-[10px] opacity-50 space-y-1 mt-1">
                                        <li>• "What are the last 5 strategies executed?"</li>
                                        <li>• "Show me the latest risk assessment"</li>
                                        <li>• "What issues need attention?"</li>
                                        <li>• "Summarize the recent trading activity"</li>
                                    </ul>
                                </div>
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
                                        className={clsx(
                                            "max-w-[80%] rounded-lg px-3 py-2 text-xs",
                                            message.role === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-800 text-green-400 border border-gray-700'
                                        )}
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
                                    <span className="animate-pulse">Analyzing workflow...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-800 bg-gray-900/50 p-2 shrink-0">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Query agent workflow, strategies, or issues..."
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
            </div>
        </div>
    );
};

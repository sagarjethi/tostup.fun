'use client';
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Brain, Wallet, Terminal, Zap, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';

interface ChatRecord {
    id: string;
    role: string;
    chat: string;
    jsonValue: string;
    createdAt: string;
}

// Map roles to specific terminal colors/styles matching the reference
const AGENT_STYLES: Record<string, { bg: string, text: string, barColor: string }> = {
    // Multi-Agent System
    'Technical Research Agent': { bg: 'bg-purple-900/20', text: 'text-purple-400', barColor: 'bg-purple-500' },
    'Risk Manager': { bg: 'bg-red-900/20', text: 'text-red-400', barColor: 'bg-red-500' },
    'Portfolio Manager': { bg: 'bg-blue-900/20', text: 'text-blue-400', barColor: 'bg-blue-500' },
    'Trader Agent': { bg: 'bg-emerald-900/20', text: 'text-emerald-400', barColor: 'bg-emerald-500' },
    'Summarizer Agent': { bg: 'bg-amber-900/20', text: 'text-amber-400', barColor: 'bg-amber-500' },
    // Legacy/Other
    'Strategy Node': { bg: 'bg-purple-900/20', text: 'text-purple-400', barColor: 'bg-purple-500' },
    'Execution Agent': { bg: 'bg-emerald-900/20', text: 'text-emerald-400', barColor: 'bg-emerald-500' },
    'Market Data': { bg: 'bg-cyan-900/20', text: 'text-cyan-400', barColor: 'bg-cyan-500' },
    'System': { bg: 'bg-yellow-900/20', text: 'text-yellow-400', barColor: 'bg-yellow-500' }
};

const DEFAULT_STYLE = { bg: 'bg-gray-800/30', text: 'text-gray-400', barColor: 'bg-gray-500' };

export const ChatsList = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const previousRecordIdsRef = useRef<Set<string>>(new Set());
    const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Poll for new chats every 1 second for real-time updates
    const { data: records, isLoading } = useQuery({
        queryKey: ['chat-history'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/history/chats?limit=50');
            const json = await res.json();
            return (json.data || []) as ChatRecord[];
        },
        refetchInterval: 1000,
        staleTime: 500,
    });

    // Detect new messages and trigger flash effect
    useEffect(() => {
        if (!records || records.length === 0) return;

        const currentIds = new Set(records.map(r => r.id));
        const newIds = new Set<string>();
        const previousIds = previousRecordIdsRef.current;

        // Find new messages
        records.forEach(record => {
            if (!previousIds.has(record.id) && previousIds.size > 0) {
                newIds.add(record.id);
            }
        });

        if (newIds.size > 0) {
            setNewMessageIds(newIds);
            // Remove flash effect after 2 seconds
            setTimeout(() => {
                setNewMessageIds(new Set());
            }, 2000);

            // Auto-scroll to top if user is not manually scrolling
            if (!isUserScrolling && scrollRef.current) {
                scrollRef.current.scrollTop = 0;
            }
        }

        previousRecordIdsRef.current = currentIds;
    }, [records, isUserScrolling]);

    // Handle scroll detection
    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const handleScroll = () => {
            setIsUserScrolling(true);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                setIsUserScrolling(false);
            }, 1500);
        };

        scrollElement.addEventListener('scroll', handleScroll);
        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col h-full max-h-full bg-black border border-gray-800 overflow-hidden relative font-mono text-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-900/50">
                <span className="text-blue-400 font-bold tracking-wider uppercase bg-blue-900/20 px-2 py-0.5">MODEL CHATS</span>
                <span className="text-xs text-gray-500 px-2 border border-gray-700 rounded">ALL</span>
            </div>

            {/* Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-0">
                <AnimatePresence initial={false}>
                    {records?.map((record) => {
                        const style = AGENT_STYLES[record.role] || DEFAULT_STYLE;
                        const date = new Date(record.createdAt);
                        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        const isNewMessage = newMessageIds.has(record.id);

                        return (
                            <motion.div
                                key={record.id}
                                initial={{ opacity: 0, x: -10, scale: 0.98 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    scale: 1,
                                }}
                                transition={{ duration: 0.3 }}
                                className={clsx(
                                    "mb-4 border-b border-gray-800/50 pb-2 last:border-0 transition-all duration-300 relative",
                                    isNewMessage && [
                                        style.barColor === 'bg-purple-500' && 'bg-purple-500/20',
                                        style.barColor === 'bg-red-500' && 'bg-red-500/20',
                                        style.barColor === 'bg-blue-500' && 'bg-blue-500/20',
                                        style.barColor === 'bg-emerald-500' && 'bg-emerald-500/20',
                                        style.barColor === 'bg-amber-500' && 'bg-amber-500/20',
                                        style.barColor === 'bg-yellow-500' && 'bg-yellow-500/20',
                                        style.barColor === 'bg-cyan-500' && 'bg-cyan-500/20',
                                    ].find(Boolean)
                                )}
                            >
                                {isNewMessage && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: [0, 0.3, 0], scale: [0.95, 1.05, 1] }}
                                        transition={{ duration: 0.8, repeat: 1 }}
                                        className={clsx("absolute inset-0 rounded-lg -z-10", style.barColor)}
                                        style={{ opacity: 0.2 }}
                                    />
                                )}
                                {/* Model Header Bar */}
                                <motion.div
                                    className={clsx("flex justify-between items-center px-2 py-1 mb-1 text-xs font-bold uppercase tracking-wider text-black", style.barColor)}
                                    animate={isNewMessage ? { scale: [1, 1.02, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <span>{record.role.toUpperCase().replace(' ', '_')}</span>
                                    <span className="opacity-75">{dateString}, {timeString}</span>
                                </motion.div>

                                {/* Message Content */}
                                <div className="px-3 py-1 space-y-1">
                                    <p className="text-green-500/90 leading-relaxed whitespace-pre-wrap">
                                        {record.chat}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {isLoading && (
                    <div className="flex items-center justify-center p-8 text-gray-600">
                        <span className="animate-pulse">LOADING_DATASTREAM...</span>
                    </div>
                )}
            </div>

            {/* Live Indicator */}
            <div className="absolute top-2 right-12 flex items-center gap-2 pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>
        </div>
    );
};

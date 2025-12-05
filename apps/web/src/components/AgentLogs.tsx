'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useState, useEffect, useRef } from 'react';

// Types
type LogType = 'STRATEGY' | 'RISK' | 'PORTFOLIO' | 'EXECUTION' | 'INFO';

export interface AgentLog {
    id: string;
    timestamp: string;
    agent: LogType;
    message: string;
    details?: string; // Collapsible JSON or text
}

export const AgentLogs = ({ logs }: { logs: AgentLog[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden border border-white/5 bg-[#080808]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/40">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider">MODEL CHATS / AGENT BRAIN</h3>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-500 font-mono">LIVE</span>
                </div>
            </div>

            {/* Log Feed */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm custom-scrollbar">
                <AnimatePresence initial={false}>
                    {logs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col gap-1 border-l-2 border-transparent hover:border-white/10 pl-3 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className={clsx("text-xs font-bold uppercase", getAgentColor(log.agent))}>
                                    {log.agent}_AGENT
                                </span>
                                <span className="text-[10px] text-gray-600">{log.timestamp}</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed text-xs md:text-sm">
                                {log.message}
                            </p>
                            {log.details && (
                                <div className="mt-1 p-2 bg-white/5 rounded text-[10px] text-gray-500 overflow-x-auto">
                                    <code>{log.details}</code>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {logs.length === 0 && (
                    <div className="text-center text-gray-600 mt-10 italic">
                        Waiting for agent activity...
                    </div>
                )}
            </div>
        </div>
    );
};

function getAgentColor(type: LogType) {
    switch (type) {
        case 'STRATEGY': return 'text-purple-400';
        case 'RISK': return 'text-orange-400';
        case 'PORTFOLIO': return 'text-blue-400';
        case 'EXECUTION': return 'text-green-400';
        default: return 'text-gray-400';
    }
}

'use client';

import { Trophy, TrendingUp, Users, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

const AGENTS = [
    { rank: 1, name: 'Strategy Node Alpha', winRate: '87%', pnl: '+$12,450', volatility: 'Low', status: 'ACTIVE' },
    { rank: 2, name: 'Execution Agent Beta', winRate: '82%', pnl: '+$8,320', volatility: 'Medium', status: 'ACTIVE' },
    { rank: 3, name: 'Sentiment Scanner', winRate: '76%', pnl: '+$5,100', volatility: 'High', status: 'IDLE' },
    { rank: 4, name: 'Risk Guardian', winRate: '95%', pnl: '+$2,200', volatility: 'Low', status: 'ACTIVE' },
];

export const CompetitionView = () => {
    return (
        <div className="flex flex-col gap-6 h-full p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">AGENT LEADERBOARD</h2>
                    <p className="text-xs text-gray-500 font-mono">LIVE PERFORMANCE TRACKING</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {AGENTS.map((agent) => (
                    <motion.div
                        key={agent.name}
                        whileHover={{ y: -5 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-50 font-black text-4xl text-white/5">{agent.rank}</div>

                        <div className="flex items-center gap-3 z-10">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-700/30 text-gray-400'}`}>
                                <Medal className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-300">{agent.name}</div>
                                <div className="text-[10px] text-green-400 font-mono">{agent.status}</div>
                            </div>
                        </div>

                        <div className="space-y-2 z-10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Win Rate</span>
                                <span className="font-bold text-white">{agent.winRate}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">30d PnL</span>
                                <span className="font-bold text-green-400">{agent.pnl}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Risk Profile</span>
                                <span className="font-bold text-gray-300">{agent.volatility}</span>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>Global Competition Metric: <span className="text-white font-bold">SHARP RATIO 2.4</span></span>
                </div>
            </div>
        </div>
    );
};

'use client';

import { useState } from 'react';
import { Copy, Power, ShieldCheck, Zap, ArrowRight, Wallet, Users, Activity, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// Mock Data for Leaderboard
const TOP_TRADERS = [
    { address: '0x7a...4e21', pnl: '+4,231%', winRate: '78%', volume: '$12.4M' },
    { address: '0x3b...9f82', pnl: '+2,105%', winRate: '65%', volume: '$8.1M' },
    { address: '0x1c...3d44', pnl: '+1,890%', winRate: '72%', volume: '$5.5M' },
    { address: '0x9d...2a11', pnl: '+1,450%', winRate: '61%', volume: '$9.2M' },
    { address: '0x5e...8b33', pnl: '+980%', winRate: '58%', volume: '$3.8M' },
];

export const MimicView = () => {
    const [mimicActive, setMimicActive] = useState(false);
    const [riskMultiplier, setRiskMultiplier] = useState(1.0);
    const [hlAddress, setHlAddress] = useState('');

    return (
        <div className="flex flex-col gap-6 h-full p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2 shrink-0">
                <Copy className="w-6 h-6 text-cyan-500" />
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">MIMIC PROTOCOL</h2>
                    <p className="text-xs text-gray-500 font-mono">HYPERLIQUID STRATEGY REPLICATION</p>
                </div>
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* COL 1: CONFIGURATION (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                    {/* Main Toggle */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-4 shrink-0">
                        <div className={clsx(
                            "w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-[0_0_40px_rgba(0,0,0,0.5)]",
                            mimicActive ? "border-green-500 bg-green-500/10 shadow-green-500/20" : "border-gray-700 bg-gray-800/10"
                        )}>
                            <Power className={clsx("w-8 h-8 transition-colors", mimicActive ? "text-green-500" : "text-gray-500")} />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-white mb-1">
                                {mimicActive ? 'ASTER MODE ACTIVE' : 'SYSTEM OFFLINE'}
                            </div>
                            <button
                                onClick={() => setMimicActive(!mimicActive)}
                                disabled={!hlAddress}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full font-bold text-xs transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed",
                                    mimicActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500 text-black hover:bg-green-400"
                                )}
                            >
                                {mimicActive ? 'DEACTIVATE' : 'ENABLE'}
                            </button>
                        </div>
                    </div>

                    {/* Source Input */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0">
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-2 mb-3">
                            <Wallet className="w-3 h-3 text-blue-400" /> SOURCE ADDRESS
                        </span>
                        <input
                            type="text"
                            placeholder="0x..."
                            value={hlAddress}
                            onChange={(e) => setHlAddress(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <p className="text-[10px] text-gray-500 mt-2 leading-tight">
                            Trades are copied to <span className="text-cyan-400">Aster Automated Mode</span>.
                        </p>
                    </div>

                    {/* Risk Settings */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 shrink-0">
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-2 mb-3">
                            <Zap className="w-3 h-3 text-yellow-500" /> RISK FACTOR
                        </span>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-500">Multiplier</span>
                            <span className="text-white font-mono">{(riskMultiplier * 100).toFixed(0)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.1" max="2.0" step="0.1"
                            value={riskMultiplier}
                            onChange={(e) => setRiskMultiplier(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>
                </div>

                {/* COL 2: LEADERBOARD (5 cols) */}
                <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/2">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-white tracking-widest">HL TOP TRADERS</span>
                        </div>
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">24H VOL</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {TOP_TRADERS.map((trader, i) => (
                            <div key={i} className="bg-black/20 hover:bg-white/5 border border-white/5 rounded-lg p-3 transition-colors flex items-center justify-between group">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`text-[10px] font-bold w-5 h-5 rounded flex items-center justify-center ${i < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-400'}`}>
                                            #{i + 1}
                                        </div>
                                        <span className="text-xs font-mono text-gray-300">{trader.address}</span>
                                    </div>
                                    <div className="flex gap-3 text-[10px] text-gray-500">
                                        <span className="text-green-400 font-bold">{trader.pnl}</span>
                                        <span>Win: {trader.winRate}</span>
                                        <span>Vol: {trader.volume}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setHlAddress(trader.address)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-cyan-500/30"
                                >
                                    Copy
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COL 3: EXECUTION MONITOR (4 cols) */}
                <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/2">
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-white tracking-widest">ASTER EXECUTION</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-gray-500 font-mono">LIVE</span>
                        </div>
                    </div>

                    {/* Placeholder Chart Area */}
                    <div className="flex-1 min-h-0 relative p-4 flex flex-col items-center justify-center text-center">
                        {mimicActive ? (
                            <div className="w-full h-full flex flex-col gap-4">
                                <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                                    <span className="text-gray-500">TARGET:</span>
                                    <span className="font-mono text-cyan-400">{hlAddress || 'waiting...'}</span>
                                </div>
                                <div className="flex-1 border border-dashed border-white/10 rounded-lg flex items-center justify-center bg-black/20">
                                    <div className="text-center space-y-2">
                                        <TrendingUp className="w-8 h-8 text-gray-700 mx-auto" />
                                        <p className="text-xs text-gray-500">Waiting for setup...</p>
                                    </div>
                                </div>
                                <div className="h-32 bg-black/40 rounded border border-white/5 p-2 font-mono text-[10px] text-green-500/80 overflow-y-auto">
                                    <div>[SYSTEM] Mimic Protocol initialized...</div>
                                    <div>[ASTER] Listening to HyperLiquid socket...</div>
                                    <div>[RISK] Max drawdown limit set to 5%...</div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 opacity-50">
                                <Power className="w-12 h-12 text-gray-600 mx-auto" />
                                <p className="text-sm font-bold text-gray-400">EXECUTION OFFLINE</p>
                                <p className="text-xs text-gray-600">Enable Aster Mode to view live execution</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};


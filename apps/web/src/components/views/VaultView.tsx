'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Users, Wallet, ArrowUpRight, Copy, ExternalLink, ChevronRight, Activity, Zap } from 'lucide-react';
import { clsx } from 'clsx';

// Mock Data for Models/Vaults
const MODELS = [
    { id: 'deepseek', name: 'DeepSeek V3.1', type: 'Qwen Max', roi: '+12.5%', volatility: 'High', tvl: '$1.2M', active: true },
    { id: 'gpt4', name: 'GPT-4o', type: 'OpenAI', roi: '+8.2%', volatility: 'Medium', tvl: '$4.5M', active: false },
    { id: 'claude', name: 'Claude 3.5', type: 'Anthropic', roi: '+10.1%', volatility: 'Medium', tvl: '$2.8M', active: false },
];

const DEPOSITORS = Array.from({ length: 15 }).map((_, i) => ({
    id: `addr-${i}`,
    address: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
    equity: (Math.random() * 10000).toFixed(2),
    pnl: (Math.random() * 20 - 5).toFixed(2),
    roi: (Math.random() * 5).toFixed(2),
    share: (Math.random() * 2).toFixed(2),
}));

export const VaultView = () => {
    const [selectedModel, setSelectedModel] = useState(MODELS[0]);

    return (
        <div className="h-full flex flex-col gap-4 p-1">
            {/* Header / Model Selector */}
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">MODELS</h2>
                    <div className="h-6 w-px bg-white/10" />
                    <div className="flex gap-2">
                        {MODELS.map(model => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedModel(model)}
                                className={clsx(
                                    "px-3 py-1.5 rounded textxs font-mono transition-all border",
                                    selectedModel.id === model.id
                                        ? "bg-white text-black border-white font-bold"
                                        : "bg-transparent text-gray-500 border-transparent hover:text-white hover:bg-white/5"
                                )}
                            >
                                {model.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>SELECT A MODEL TO VIEW VAULT DETAILS</span>
                    <ChevronRight className="w-3 h-3" />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

                {/* Left Column: Vault Details & Depositors (8 cols) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">

                    {/* Vault Stats Header */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Vault Name</div>
                                <h1 className="text-3xl font-bold font-mono text-white flex items-center gap-3">
                                    {selectedModel.type.toUpperCase()}
                                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30">
                                        LIVE
                                    </span>
                                </h1>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">TOTAL VAULT EQUITY</div>
                                <div className="text-2xl font-mono text-white">{selectedModel.tvl}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-2 border-t border-white/5 pt-4">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Vault Equity</div>
                                <div className="text-sm font-mono text-white">$0.00</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Leader Equity</div>
                                <div className="text-sm font-mono text-white">$501.24</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase">Leader PNL %</div>
                                <div className="text-sm font-mono text-emerald-400">+12.5%</div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button className="bg-white text-black px-4 py-1.5 rounded text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                                    <ArrowUpRight className="w-3 h-3" />
                                    DEPOSIT
                                </button>
                                <button className="border border-white/20 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-white/5 transition-colors">
                                    LOGS
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Depositors Table */}
                    <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden flex flex-col min-h-0">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                DEPOSITORS - {selectedModel.type} VAULT
                            </h3>
                            <div className="text-[10px] text-gray-600">Simulated executors' equity, PnL, ROI and time following the vault.</div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            <table className="w-full text-left text-xs font-mono">
                                <thead className="bg-white/5 text-gray-500 sticky top-0 z-10 backdrop-blur-md">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Address</th>
                                        <th className="px-4 py-3 font-medium text-right">Equity (USD)</th>
                                        <th className="px-4 py-3 font-medium text-right">PnL (USD)</th>
                                        <th className="px-4 py-3 font-medium text-right">ROI</th>
                                        <th className="px-4 py-3 font-medium text-right">Share</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {DEPOSITORS.map((row) => (
                                        <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-4 py-3 text-gray-400 flex items-center gap-2">
                                                {row.address}
                                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 cursor-pointer text-gray-600 hover:text-white transition-opacity" />
                                            </td>
                                            <td className="px-4 py-3 text-right text-white">${row.equity}</td>
                                            <td className={clsx("px-4 py-3 text-right font-bold", parseFloat(row.pnl) >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                {parseFloat(row.pnl) >= 0 ? '+' : ''}{row.pnl}
                                            </td>
                                            <td className={clsx("px-4 py-3 text-right", parseFloat(row.roi) >= 0 ? "text-emerald-400" : "text-red-400")}>
                                                {parseFloat(row.roi) >= 0 ? '+' : ''}{row.roi}%
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500">{row.share}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Risk & Alignment (4 cols) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

                    {/* Position Alignment */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-[200px] flex flex-col">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            POSITION ALIGNMENT
                        </h3>
                        <div className="flex-1 flex items-center justify-center border border-dashed border-white/10 rounded bg-black/20">
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest">No positions found</span>
                        </div>
                    </div>

                    {/* Risk Snapshot */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            RISK SNAPSHOT
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Inception', value: '195%' },
                                { label: 'Sharpe Ratio', value: '2.45' },
                                { label: 'Max Drawdown', value: '12.4%' },
                                { label: 'Win Rate', value: '68%' },
                                { label: 'Leverage Cap', value: '10x' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded">
                                    <span className="text-[10px] uppercase text-gray-500">{item.label}</span>
                                    <span className="text-xs font-mono font-bold text-white">{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6">
                            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-[10px] text-blue-300 leading-relaxed">
                                <Zap className="w-3 h-3 mb-1 text-blue-400" />
                                Applied guardrails ensure risk controls are active for all copy-traders.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

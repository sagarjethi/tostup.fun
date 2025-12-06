'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { ChatsList } from './ChatsList';
import { LiveFeedView } from './LiveFeedView';
import { AssetsPanel } from './dashboard/AssetsPanel';
import { OrdersPanel } from './dashboard/OrdersPanel';
import { AgentControlPanel } from './dashboard/AgentControlPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

// Dynamic import for Chart
const AccountValueChart = dynamic(
    () => import('./dashboard/AccountValueChart').then((mod) => mod.AccountValueChart),
    { ssr: false }
);

const ASSETS = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'BNBUSDT', label: 'BNB/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' },
    { value: 'ADAUSDT', label: 'ADA/USDT' },
];

// Dynamic imports for Layout
import { CompetitionView } from './views/CompetitionView';
import { MimicView } from './views/MimicView';
import { VaultView } from './views/VaultView';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'ASSETS' | 'ORDERS'>('ASSETS');
    const [chartMode, setChartMode] = useState<'VALUE' | 'PRICE'>('PRICE');
    const [selectedAsset, setSelectedAsset] = useState<string>('BTCUSDT');

    // Global Navigation State
    const [currentView, setCurrentView] = useState<'DASHBOARD' | 'COMPETITION' | 'MIMIC' | 'VAULT'>('DASHBOARD');
    const [chatTab, setChatTab] = useState<'FEED' | 'CHAT'>('FEED');

    // Fetch live account data
    const { data: accountData } = useQuery({
        queryKey: ['account'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/account');
            const json = await res.json();
            return json.data;
        },
        refetchInterval: 5000,
        staleTime: 2000,
    });

    // Fetch live positions
    const { data: positionsData } = useQuery({
        queryKey: ['positions'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/positions');
            const json = await res.json();
            return json.data || [];
        },
        refetchInterval: 5000,
        staleTime: 2000,
    });

    const equity = accountData?.equity || 0;
    const positions = positionsData || [];
    // Use API wallet address
    const walletAddress = accountData?.walletAddress || null;

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col relative">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

            {/* Top Bar: Clean Navigation */}
            <header className="flex items-center justify-between mb-6 px-2 shrink-0 z-10">
                <div className="flex items-center gap-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg shadow-lg shadow-blue-500/20">
                            <TrendingUp className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">TostUp</span>
                            <span className="text-white">.fun</span>
                        </span>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
                        {[
                            { id: 'DASHBOARD', label: 'COMMAND DECK' },
                            { id: 'COMPETITION', label: 'COMPETITION' },
                            { id: 'MIMIC', label: 'MIMIC' },
                            { id: 'VAULT', label: 'VAULT' },
                        ].map((nav) => (
                            <button
                                key={nav.id}
                                onClick={() => setCurrentView(nav.id as any)}
                                className={clsx(
                                    "px-4 py-2 rounded-full text-[10px] font-bold tracking-widest transition-all",
                                    currentView === nav.id
                                        ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {nav.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Interface Content */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 z-10 pb-2">

                {/* LEFT COLUMN: Main Content based on View */}
                <div className={clsx(
                    "flex flex-col gap-3 h-full min-h-0 transition-all duration-300",
                    currentView === 'DASHBOARD' ? "col-span-12 lg:col-span-9" : "col-span-12"
                )}>

                    <AnimatePresence mode="wait">
                        {currentView === 'DASHBOARD' && (
                    <motion.div
                                key="dashboard"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col gap-3 h-full"
                    >
                                {/* Upper: Visualization (Fixed Smaller Height) */}
                                <div className="h-[35vh] min-h-[280px] max-h-[350px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
                        {/* Chart Controls / Header */}
                                    <div className="absolute top-4 left-4 z-20 flex gap-2 items-center">
                                        <select
                                            value={selectedAsset}
                                            onChange={(e) => setSelectedAsset(e.target.value)}
                                            className="text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors cursor-pointer"
                                        >
                                            {ASSETS.map((asset) => (
                                                <option key={asset.value} value={asset.value} className="bg-[#050505]">
                                                    {asset.label}
                                                </option>
                                            ))}
                                        </select>
                            <button
                                onClick={() => setChartMode('VALUE')}
                                className={clsx(
                                    "text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md transition-colors border",
                                    chartMode === 'VALUE'
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                        : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                                )}
                            >
                                            BALANCE
                            </button>
                            <button
                                onClick={() => setChartMode('PRICE')}
                                className={clsx(
                                    "text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md transition-colors border",
                                    chartMode === 'PRICE'
                                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                                        : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                                )}
                            >
                                            PERPETUAL
                            </button>
                        </div>
                        <div className="flex-1 w-full h-full">
                                        <AccountValueChart mode={chartMode} symbol={selectedAsset} />
                                    </div>
                        </div>

                                {/* Lower: Assets & Orders Tabbed Panel (Fixed Height) */}
                                <div className="flex-1 min-h-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center border-b border-white/5 px-4 pt-4 gap-6">
                            <button
                                onClick={() => setActiveTab('ASSETS')}
                                className={`pb-3 text-xs font-bold tracking-widest transition-colors relative ${activeTab === 'ASSETS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                HOLDINGS
                                {activeTab === 'ASSETS' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('ORDERS')}
                                className={`pb-3 text-xs font-bold tracking-widest transition-colors relative ${activeTab === 'ORDERS' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                ACTIVE ORDERS
                                {activeTab === 'ORDERS' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
                            </button>
                        </div>
                                    <div className="flex-1 min-h-0 overflow-hidden flex">
                            {activeTab === 'ASSETS' ? (
                                            <>
                                                <div className="flex-1 min-w-0">
                                                    <AssetsPanel positions={positions} equity={equity} walletAddress={walletAddress} />
                                                </div>
                                                <div className="w-1/2 min-w-[350px] max-w-[500px] border-l border-white/10">
                                                    <LiveFeedView />
                                                </div>
                                            </>
                            ) : (
                                <OrdersPanel />
                            )}
                        </div>
                                </div>
                            </motion.div>
                        )}

                        {currentView === 'COMPETITION' && (
                            <motion.div key="competition" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <CompetitionView />
                            </motion.div>
                        )}

                        {currentView === 'MIMIC' && (
                            <motion.div key="mimic" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <MimicView />
                            </motion.div>
                        )}

                        {currentView === 'VAULT' && (
                            <motion.div key="vault" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full">
                                <VaultView />
                    </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT COLUMN: Persistent Neural Feed & Control (35%) - ONLY VISIBLE ON DASHBOARD */}
                {currentView === 'DASHBOARD' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full min-h-0"
                    >
                    {/* Strategy Control Panel */}
                        <div className="shrink-0 z-20">
                            <AgentControlPanel />
                    </div>

                        {/* Neural Feed - Only Model Chats */}
                        <div className="flex-1 min-h-0 max-h-full flex flex-col overflow-hidden">
                        <ChatsList />
                    </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export const AgentControlPanel = () => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            await fetch('http://localhost:3001/api/agent/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: 'BTCUSDT' })
            });
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setIsAnalyzing(false), 2000);
        }
    };

    return (
        <div className="bg-[#0A0A0F]/80 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden flex flex-col w-full h-auto p-4 gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs text-cyan-400 font-bold tracking-widest">MANUAL OVERRIDE</span>
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isAnalyzing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    {isAnalyzing ? 'BUSY' : 'READY'}
                </span>
            </div>

            <button
                onClick={handleAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Play className="w-4 h-4 fill-current" />
                {isAnalyzing ? 'ANALYZING...' : 'RUN STRATEGY'}
            </button>
        </div>
    );
};

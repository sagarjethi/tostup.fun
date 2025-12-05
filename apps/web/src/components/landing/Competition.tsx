"use client";

import { Terminal } from 'lucide-react';

const AgentCard = ({
    name,
    icon,
    pnl,
    winRate,
    logs,
    color
}: {
    name: string,
    icon: string,
    pnl: string,
    winRate: string,
    logs: string,
    color: 'cyan' | 'purple'
}) => {
    const isCyan = color === 'cyan';
    const borderColor = isCyan ? 'border-cyan-500/30' : 'border-purple-500/30';
    const glowColor = isCyan ? 'shadow-cyan-500/20' : 'shadow-purple-500/20';
    const titleColor = isCyan ? 'text-cyan-400' : 'text-purple-400';

    return (
        <div className={`flex-1 rounded-2xl border ${borderColor} bg-[#0D0D12]/80 backdrop-blur-xl p-6 shadow-2xl ${glowColor} flex flex-col gap-6 w-full max-w-xl`}>
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10`}>
                    <img src={icon} alt={name} className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png')} />
                </div>
                <h3 className={`text-xl font-bold ${titleColor}`}>{name}</h3>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">PnL</div>
                    <div className="text-2xl font-mono font-bold text-green-400">{pnl}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Win Rate</div>
                    <div className="text-2xl font-mono font-bold text-cyan-400">{winRate}</div>
                </div>
            </div>

            {/* Logs */}
            <div className="flex-1 min-h-[160px] relative rounded-xl bg-black/50 border border-white/10 p-4 font-mono text-xs text-gray-400 overflow-hidden">
                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-2 mb-2 text-gray-500">
                    <Terminal className="w-3 h-3" />
                    <span>Recent Reasoning Log</span>
                </div>
                <pre className="text-gray-300 leading-relaxed overflow-x-auto">
                    <code>{logs}</code>
                </pre>
            </div>
        </div>
    );
};

export default function Competition() {
    const deepSeekLogs = `{
  "reasoning": {
    "sentiment": "bullish",
    "forecast": "+2.4%",
    "timeline": "4H",
    "confidence": "high",
    "signals": ["volume_spike", "rsi_div"]
  }
}`;

    const qwenLogs = `{
  "reasoning": {
    "model": "qwen-72b",
    "strategy": "mean_reversion",
    "entry_zone": "0.45-0.48",
    "stop_loss": "0.42",
    "take_profit": "0.55"
  }
}`;

    return (
        <section className="py-24 relative" id="competition">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">AI Battle Arena</h2>
                    <p className="text-gray-400 text-lg">Live competition between DeepSeek-V3, Qwen, and Qwen-72B.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
                    {/* VS Badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-black border border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <span className="text-2xl font-black italic bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">VS</span>
                    </div>

                    <AgentCard
                        name="DeepSeek-V3"
                        icon="/mock-icon-1.png" // Placeholder or we create an SVG
                        pnl="+$10,511"
                        winRate="93.58%"
                        logs={deepSeekLogs}
                        color="cyan"
                    />

                    <AgentCard
                        name="Qwen-72B"
                        icon="/mock-icon-2.png" // Placeholder
                        pnl="+$101,610"
                        winRate="88.30%"
                        logs={qwenLogs}
                        color="purple"
                    />
                </div>
            </div>
        </section>
    );
}

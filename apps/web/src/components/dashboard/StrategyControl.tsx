import { useState } from 'react';
import { Play, Pause, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const StrategyControl = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleRunAnalysis = async () => {
        setIsRunning(true);
        setLastAction(null);
        try {
            const res = await fetch('http://localhost:3001/api/agent/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: 'BTCUSDT' })
            });
            const data = await res.json();
            if (data.portfolioPlan?.action) {
                setLastAction(data.portfolioPlan.action);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4 p-4 bg-black/40 backdrop-blur-md border border-white/5 rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold tracking-wider text-gray-200">STRATEGY CONTROL</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                    <span className="text-[10px] text-gray-500 font-mono">{isRunning ? 'ANALYZING' : 'IDLE'}</span>
                </div>
            </div>

            {/* Main Action Display */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 border border-dashed border-white/10 rounded-lg bg-white/2">
                <span className="text-xs text-gray-500 font-mono mb-2">SUGGESTED ACTION</span>
                {lastAction ? (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`text-4xl font-black tracking-tighter ${lastAction === 'BUY' ? 'text-green-400' :
                                lastAction === 'SELL' ? 'text-red-400' : 'text-gray-400'
                            }`}
                    >
                        {lastAction}
                    </motion.div>
                ) : (
                    <span className="text-2xl font-bold text-gray-700 animate-pulse">Running Scan...</span>
                )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleRunAnalysis}
                    disabled={isRunning}
                    className="col-span-2 group flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-3 rounded-lg font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98]"
                >
                    {isRunning ? <Activity className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                    <span>{isRunning ? 'PROCESSING MATRIX' : 'EXECUTE ANALYSIS'}</span>
                </button>

                <button className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 py-2 rounded-lg text-xs font-bold transition-colors">
                    <CheckCircle className="w-3 h-3" /> APPROVE
                </button>
                <button className="flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-xs font-bold transition-colors">
                    <XCircle className="w-3 h-3" /> REJECT
                </button>
            </div>
        </div>
    );
};

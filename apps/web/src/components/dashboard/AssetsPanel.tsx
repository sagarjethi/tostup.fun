import clsx from 'clsx';
import { Radio } from 'lucide-react';
import { useAccount } from 'wagmi';

interface Position {
    symbol: string;
    qty: number;
    entryPrice: number;
    side: string;
    leverage: number;
    pnl?: number;
}

export const AssetsPanel = ({ positions, equity, walletAddress }: { positions: Position[], equity: number, walletAddress?: string }) => {
    const { address: connectedAddress } = useAccount();
    const displayAddress = walletAddress || connectedAddress || 'Not Connected';
    return (
        <div className="h-full flex flex-col bg-[#0A0A0F] border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold tracking-widest text-[#06b6d4]">GEMINI</span>
                    <span className="text-[9px] text-gray-500 font-mono">
                        {displayAddress === 'Not Connected' 
                            ? 'No wallet connected' 
                            : `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`}
                    </span>
                </div>
                <div className="flex gap-2">
                    <div className="w-5 h-5 flex items-center justify-center bg-black/40 rounded border border-white/10 text-xs text-gray-500 hover:text-white cursor-pointer">&lt;</div>
                    <div className="text-xs text-gray-400 font-mono">1 / 1</div>
                    <div className="w-5 h-5 flex items-center justify-center bg-black/40 rounded border border-white/10 text-xs text-gray-500 hover:text-white cursor-pointer">&gt;</div>
                </div>
            </div>

            {/* Total Assets */}
            <div className="p-6 border-b border-white/5">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold tracking-widest text-gray-500">TOTAL ASSETS</span>
                    <div className="flex items-center gap-1.5 text-green-500">
                        <Radio className="w-3 h-3 animate-pulse" />
                        <span className="text-[10px] font-bold">LIVE</span>
                    </div>
                </div>
                <div className="text-4xl font-mono font-medium text-white mb-1">
                    ${equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Positions Table Header */}
            <div className="grid grid-cols-5 px-4 py-2 bg-black/20 text-[10px] font-bold text-gray-500 tracking-wider">
                <div className="col-span-2">SYM</div>
                <div className="text-right">QTY</div>
                <div className="text-right">ENTRY</div>
                <div className="text-right">SIDE</div>
                {/* <div className="text-right">LEV</div> */}
            </div>

            {/* Positions List */}
            <div className="flex-1 overflow-y-auto">
                {positions.map((pos, idx) => (
                    <div key={idx} className="grid grid-cols-5 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-xs font-mono">
                        <div className="col-span-2 font-bold text-white">{pos.symbol}</div>
                        <div className="text-right text-gray-300">{pos.qty.toFixed(4)}</div>
                        <div className="text-right text-gray-300">${pos.entryPrice.toLocaleString()}</div>
                        <div className={clsx(
                            "text-right font-bold",
                            pos.side === 'LONG' ? "text-green-400" : "text-red-400"
                        )}>
                            {pos.side}
                        </div>
                        {/* <div className="text-right text-purple-400">{pos.leverage}x</div> */}
                    </div>
                ))}
                {positions.length === 0 && (
                    <div className="p-4 text-center text-xs text-gray-600 font-mono">NO ACTIVE POSITIONS</div>
                )}
            </div>
        </div>
    );
}

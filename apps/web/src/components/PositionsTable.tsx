'use client';

import { clsx } from "clsx";

export const PositionsTable = ({ positions }: { positions: any[] }) => {
    return (
        <div className="glass-card rounded-2xl overflow-hidden border border-white/5 bg-[#080808]">
            <div className="px-4 py-3 border-b border-white/5 bg-black/40 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider">ACTIVE POSITIONS</h3>
                <span className="text-xs text-gray-500">{positions.length} ACTIVE</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono">
                    <thead className="bg-white/5 text-gray-400">
                        <tr>
                            <th className="px-4 py-3 font-medium">SYMBOL</th>
                            <th className="px-4 py-3 font-medium">SIDE</th>
                            <th className="px-4 py-3 font-medium">SIZE</th>
                            <th className="px-4 py-3 font-medium">ENTRY</th>
                            <th className="px-4 py-3 font-medium text-right">PNL (u)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {positions.length > 0 ? (
                            positions.map((pos, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-bold text-white">{pos.symbol}</td>
                                    <td className="px-4 py-3">
                                        <span className={clsx(
                                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                            pos.side === 'LONG' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                        )}>
                                            {pos.side} {pos.leverage}x
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{pos.size}</td>
                                    <td className="px-4 py-3 text-gray-500">${pos.entryPrice}</td>
                                    <td className={clsx("px-4 py-3 text-right font-bold", pos.pnl >= 0 ? "text-green-400" : "text-red-400")}>
                                        {pos.pnl >= 0 ? '+' : ''}{pos.pnl}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-600 italic">
                                    Scanning market for opportunities...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

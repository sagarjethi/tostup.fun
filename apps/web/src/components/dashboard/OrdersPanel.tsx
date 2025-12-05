import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';

interface Order {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: string;
    status: string;
    price: string;
    origQty: string;
}

export const OrdersPanel = () => {
    const { data: orders } = useQuery({
        queryKey: ['orders-history'],
        queryFn: async () => {
            const res = await fetch('http://localhost:3001/api/history/orders?limit=20');
            const json = await res.json();
            return (json.data || []) as Order[];
        },
        refetchInterval: 3000
    });

    return (
        <div className="h-full flex flex-col bg-[#0A0A0F] border border-white/10 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center p-3 border-b border-white/10 bg-white/5">
                <span className="text-[10px] font-bold tracking-widest text-gray-400">ORDERS</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {(!orders || orders.length === 0) ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                        <span className="text-xs">NO OPEN ORDERS</span>
                    </div>
                ) : (
                    orders.map((order, idx) => (
                        <div key={idx} className="border-b border-white/5 p-3 hover:bg-white/5 transition-colors">
                            {/* Row 1: Asset + Side Tag */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#06b6d4] px-1.5 py-0.5 rounded text-[10px] font-bold text-black">BINANCE</div>
                                    <span className="text-xs font-bold text-white">{order.symbol}</span>
                                </div>
                                <span className={clsx(
                                    "text-[10px] font-bold uppercase",
                                    order.side === 'BUY' ? "text-green-500" : "text-red-500"
                                )}>
                                    {order.side}
                                </span>
                            </div>

                            {/* Row 2: Type + Status tag */}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] text-gray-400">{order.type}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-600">STATUS</span>
                                    <span className={clsx(
                                        "px-1.5 py-0.5 rounded text-[10px] font-bold border",
                                        order.status === 'FILLED' ? "bg-green-500/20 text-green-500 border-green-500/30" : "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30"
                                    )}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Row 3: Price + Qty */}
                            <div className="flex items-center justify-between font-mono text-xs">
                                <div className="flex gap-4">
                                    <span className="text-gray-600">PRICE</span>
                                    <span className="text-gray-300">{order.price}</span>
                                </div>
                                <div className="flex gap-4">
                                    <span className="text-gray-600">QTY</span>
                                    <span className="text-gray-300">{order.origQty}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

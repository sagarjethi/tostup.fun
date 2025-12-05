'use client';

import { createChart, ColorType, CrosshairMode, IChartApi, AreaSeries, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

interface AccountValueChartProps {
    mode?: 'VALUE' | 'PRICE';
    symbol?: string;
}

const ASSET_PRICES: Record<string, number> = {
    'BTCUSDT': 89700,
    'BNBUSDT': 620,
    'ETHUSDT': 3200,
    'SOLUSDT': 180,
    'ADAUSDT': 0.65,
};

export const AccountValueChart = ({ mode = 'PRICE', symbol = 'BTCUSDT' }: AccountValueChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Cleanup previous chart instance
        if (chartRef.current) {
            try {
                chartRef.current.remove();
            } catch (error) {
                // Chart may already be disposed, ignore error
            }
            chartRef.current = null;
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#6B7280',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight, // Use initial container height
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
        });

        chartRef.current = chart;

        if (mode === 'VALUE') {
            // V5: Add Area Series
            const areaSeries = chart.addSeries(AreaSeries, {
                lineColor: '#10b981', // Emerald-500
                topColor: 'rgba(16, 185, 129, 0.2)',
                bottomColor: 'rgba(16, 185, 129, 0.0)',
                lineWidth: 2,
            });

            // Mock Data: Account Value
            const initialValue = 9500;
            const data = [];
            let currentValue = initialValue;
            const now = new Date();

            for (let i = 0; i < 100; i++) {
                const time = new Date(now.getTime() - (100 - i) * 15 * 60 * 1000);
                const change = (Math.random() - 0.45) * 50;
                currentValue += change;
                data.push({
                    time: Math.floor(time.getTime() / 1000) as any,
                    value: currentValue
                });
            }
            areaSeries.setData(data);
        } else {
            // V5: Add Candlestick Series
            const candleSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350'
            });

            // Mock Data: Market Price based on selected symbol
            const basePrice = ASSET_PRICES[symbol] || 89700;
            const data = [];
            let open = basePrice;
            const now = new Date();
            const volatility = basePrice * 0.01; // 1% volatility

            for (let i = 0; i < 100; i++) {
                const time = new Date(now.getTime() - (100 - i) * 15 * 60 * 1000);
                const change = (Math.random() - 0.5) * volatility;
                const close = open + change;
                const high = Math.max(open, close) + Math.random() * volatility * 0.5;
                const low = Math.min(open, close) - Math.random() * volatility * 0.5;

                data.push({
                    time: Math.floor(time.getTime() / 1000) as any,
                    open,
                    high,
                    low,
                    close
                });
                open = close;
            }
            candleSeries.setData(data);
        }

        // Responsive Resize using ResizeObserver
        const resizeObserver = new ResizeObserver(entries => {
            if (!chartRef.current || entries.length === 0 || !entries[0].target) return;
            const newRect = entries[0].contentRect;
            chartRef.current.applyOptions({
                width: newRect.width,
                height: newRect.height
            });
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            if (chartRef.current) {
                try {
                    chartRef.current.remove();
                } catch (error) {
                    // Chart may already be disposed, ignore error
                }
                chartRef.current = null;
            }
        };
    }, [mode, symbol]); // Re-run when mode or symbol changes

    const displaySymbol = symbol.replace('USDT', '/USDT');

    return (
        <div className="relative w-full h-full flex flex-col pt-12">
            <div className="absolute top-4 right-4 z-20">
                <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">ASSET</div>
                    <div className="text-lg font-bold text-white font-mono">{displaySymbol}</div>
                </div>
            </div>
            <div ref={chartContainerRef} className="flex-1 w-full min-h-[300px]" />
        </div>
    );
};

'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewChartComponent({
    symbol = 'BTCUSDT',
    theme = 'dark',
    autosize = true,
}: {
    symbol?: string;
    theme?: 'dark' | 'light';
    autosize?: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
            autosize,
            symbol: `BINANCE:${symbol}.P`,
            interval: '15',
            timezone: 'Etc/UTC',
            theme,
            style: '1',
            locale: 'en',
            enable_publishing: false,
            backgroundColor: '#050505',
            gridColor: 'rgba(255, 255, 255, 0.05)',
            hide_top_toolbar: false,
            hide_legend: false,
            save_image: false,
            calendar: false,
            hide_volume: false,
            support_host: 'https://www.tradingview.com',
        });

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [symbol, theme, autosize]);

    return (
        <div className="tradingview-widget-container h-full w-full" ref={containerRef}>
            <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
        </div>
    );
}

export const MarketChart = memo(TradingViewChartComponent);

import { EMA, RSI, MACD } from 'technicalindicators';
import { asterClient } from './aster-client';

export interface Candle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface MarketAnalysis {
    symbol: string;
    price: number;
    indicators: {
        rsi: number;
        ema20: number;
        ema50: number;
        macd: {
            MACD: number;
            signal: number;
            histogram: number;
        };
    };
    context: {
        trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        volatility: number;
    };
}

export class MarketDataService {
    async fetchCandles(symbol: string, interval: string = '5m', limit: number = 100): Promise<Candle[]> {
        try {
            const klines = await asterClient.getKlines(symbol, interval, limit);
            return klines.map((kline: any) => ({
                timestamp: kline.openTime,
                open: kline.open,
                high: kline.high,
                low: kline.low,
                close: kline.close,
                volume: kline.volume,
            }));
        } catch (error) {
            console.error(`Error fetching candles for ${symbol}:`, error);
            throw error;
        }
    }

    calculateIndicators(candles: Candle[]) {
        const closes = candles.map((c) => c.close);

        // RSI
        const rsiValues = RSI.calculate({
            values: closes,
            period: 14,
        });
        const lastRsi = rsiValues[rsiValues.length - 1] || 0;

        // EMA
        const ema20Values = EMA.calculate({
            period: 20,
            values: closes,
        });
        const lastEma20 = ema20Values[ema20Values.length - 1] || 0;

        const ema50Values = EMA.calculate({
            period: 50,
            values: closes,
        });
        const lastEma50 = ema50Values[ema50Values.length - 1] || 0;

        // MACD
        const macdValues = MACD.calculate({
            values: closes,
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            SimpleMAOscillator: false,
            SimpleMASignal: false,
        });
        const lastMacd = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };

        return {
            rsi: lastRsi,
            ema20: lastEma20,
            ema50: lastEma50,
            macd: {
                MACD: lastMacd.MACD || 0,
                signal: lastMacd.signal || 0,
                histogram: lastMacd.histogram || 0,
            },
        };
    }

    async getMarketAnalysis(symbol: string): Promise<MarketAnalysis> {
        const candles = await this.fetchCandles(symbol, '5m', 200);
        const lastCandle = candles[candles.length - 1];
        const indicators = this.calculateIndicators(candles);

        // Basic trend determination
        let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
        if (indicators.ema20 > indicators.ema50) trend = 'BULLISH';
        if (indicators.ema20 < indicators.ema50) trend = 'BEARISH';

        return {
            symbol,
            price: lastCandle.close,
            indicators,
            context: {
                trend,
                volatility: 0,
            },
        };
    }
}

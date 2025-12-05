import { AgentState } from './state';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config';
import { createLLM } from './llm';
import { DbService } from '../services/db.service';
import { MarketDataService } from '../market/market.service';
import { asterClient } from '../market/aster-client';
import { coinMarketCapService } from '../market/coinmarketcap.service';

export const researchNode = async (state: AgentState) => {
    console.log('📊 Technical Research Agent analyzing market...');

    const symbol = state.symbol.replace('/', '');

    // Check if we have OpenAI API key
    const hasKey = !!config.llm.openaiKey;

    if (!hasKey) {
        console.warn('⚠️ No API Key found. Using Basic Market Data.');
        const marketService = new MarketDataService();
        try {
            const analysis = await marketService.getMarketAnalysis(symbol);
            return {
                technicalResearchReport: `Market Analysis for ${symbol}:
- Current Price: $${analysis.price.toFixed(2)}
- Trend: ${analysis.context.trend}
- RSI: ${analysis.indicators.rsi.toFixed(2)}
- EMA20: $${analysis.indicators.ema20.toFixed(2)}
- EMA50: $${analysis.indicators.ema50.toFixed(2)}`,
                technicalResearchSummary: `Basic market analysis: ${analysis.context.trend} trend detected.`,
            };
        } catch (error: any) {
            return {
                technicalResearchReport: 'Market Analysis: Unable to fetch data.',
                technicalResearchSummary: 'Market data unavailable.',
            };
        }
    }

    // Log research start
    await DbService.ensureTrader('Technical Research Agent', 'Market data analysis and technical indicators.')
        .then(async (trader) => {
            if (trader) {
                await DbService.saveAnalysisRecord({
                    traderId: trader.id,
                    role: 'Technical Research Agent',
                    chat: `📊 [STEP 1/5] Technical Research Agent: Analyzing market data for ${symbol}\n\nFetching candlesticks, indicators, funding rates, and order book data...`,
                    jsonValue: JSON.stringify({ status: 'fetching_data', symbol, step: '1/5' }),
                });
            }
        })
        .catch(() => {});

    const llm = createLLM({ temperature: 0 });

    // Fetch comprehensive live market data
    let marketData = '';
    let currentPrice = 0;
    let fundingRate = 0;
    let openInterest = 0;

    try {
        const marketService = new MarketDataService();
        const analysis = await marketService.getMarketAnalysis(symbol);
        currentPrice = analysis.price;

        const marketPrice = await asterClient.getMarketPrice(symbol);
        fundingRate = marketPrice.fundingRate;

        const klines = await asterClient.getKlines(symbol, '1h', 200);
        const closes = klines.map((k: any) => k.close);
        const highs = klines.map((k: any) => k.high);
        const lows = klines.map((k: any) => k.low);
        const volumes = klines.map((k: any) => k.volume);

        const price24hAgo = closes[closes.length - 25] || closes[0];
        const priceChange24h = ((currentPrice - price24hAgo) / price24hAgo) * 100;
        const avgVolume = volumes.slice(-24).reduce((a: number, b: number) => a + b, 0) / 24;
        const currentVolume = volumes[volumes.length - 1];
        const volumeTrend = currentVolume > avgVolume * 1.2 ? 'INCREASING' : currentVolume < avgVolume * 0.8 ? 'DECREASING' : 'STABLE';

        const recentHigh = Math.max(...highs.slice(-20));
        const recentLow = Math.min(...lows.slice(-20));
        const resistance = recentHigh;
        const support = recentLow;

        // Fetch CoinMarketCap data for additional market context
        let cmcData = '';
        try {
            const baseSymbol = symbol.replace('USDT', '').replace('USDC', '');
            const cmcMarketData = await coinMarketCapService.getMarketData(baseSymbol);
            if (cmcMarketData) {
                cmcData = `
CoinMarketCap Data:
- Market Cap: $${(cmcMarketData.marketCap / 1e9).toFixed(2)}B
- 24h Volume: $${(cmcMarketData.volume24h / 1e9).toFixed(2)}B
- 1h Change: ${cmcMarketData.change1h.toFixed(2)}%
- 7d Change: ${cmcMarketData.change7d.toFixed(2)}%
`;
            }
        } catch (error: any) {
            console.warn('CoinMarketCap data unavailable:', error.message);
        }

        marketData = `
COMPREHENSIVE MARKET ANALYSIS FOR ${symbol}:

Price Data:
- Current Price: $${currentPrice.toFixed(2)}
- 24h Change: ${priceChange24h.toFixed(2)}%
- Recent High: $${recentHigh.toFixed(2)}
- Recent Low: $${recentLow.toFixed(2)}
- Support Level: $${support.toFixed(2)}
- Resistance Level: $${resistance.toFixed(2)}
${cmcData}

Technical Indicators:
- RSI (14): ${analysis.indicators.rsi.toFixed(2)}
- EMA20: $${analysis.indicators.ema20.toFixed(2)}
- EMA50: $${analysis.indicators.ema50.toFixed(2)}
- MACD: ${analysis.indicators.macd.MACD.toFixed(4)}
- MACD Signal: ${analysis.indicators.macd.signal.toFixed(4)}
- MACD Histogram: ${analysis.indicators.macd.histogram.toFixed(4)}

Market Context:
- Trend: ${analysis.context.trend}
- Volatility: ${analysis.context.volatility.toFixed(2)}%
- Volume Trend: ${volumeTrend}
- Current Volume: ${currentVolume.toFixed(2)}
- Average Volume (24h): ${avgVolume.toFixed(2)}

Futures Data:
- Funding Rate: ${(fundingRate * 100).toFixed(4)}%
- Mark Price: $${marketPrice.markPrice.toFixed(2)}
- Index Price: $${marketPrice.indexPrice.toFixed(2)}
`;

        console.log('📊 Comprehensive market data fetched');
    } catch (error: any) {
        console.warn('⚠️ Failed to fetch comprehensive market data:', error.message);
        marketData = `Market Analysis: Partial data available. Error: ${error.message}`;
    }

    const systemMessage = `You are the Technical Research Agent.
    Your task is to analyze market data and provide a comprehensive technical research report.
    
    Analyze the provided market data and output a JSON object:
    {
        "trend": "BULLISH" | "BEARISH" | "NEUTRAL",
        "strength": "STRONG" | "MODERATE" | "WEAK",
        "keyLevels": {
            "support": number,
            "resistance": number
        },
        "indicators": {
            "rsiSignal": "OVERSOLD" | "NEUTRAL" | "OVERBOUGHT",
            "macdSignal": "BULLISH" | "BEARISH" | "NEUTRAL",
            "trendSignal": "BULLISH" | "BEARISH" | "NEUTRAL"
        },
        "riskFactors": string[],
        "opportunities": string[],
        "summary": string (2-3 sentences plain language summary)
    }`;

    const userMessage = `
    Market Data:
    ${marketData}
    
    Symbol: ${symbol}
    `;

    try {
        const response = await llm.invoke([
            new SystemMessage(systemMessage),
            new HumanMessage(userMessage),
        ] as any);

        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        let analysis: any;

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                analysis = JSON.parse(content);
            }
        } catch (e) {
            analysis = {
                trend: 'NEUTRAL',
                strength: 'MODERATE',
                summary: 'Technical analysis completed. Market conditions appear neutral.',
            };
        }

        const researchReport = `TECHNICAL RESEARCH REPORT FOR ${symbol}:

Trend Analysis: ${analysis.trend} (${analysis.strength})
Support: $${analysis.keyLevels?.support?.toFixed(2) || 'N/A'}
Resistance: $${analysis.keyLevels?.resistance?.toFixed(2) || 'N/A'}

Indicator Signals:
- RSI: ${analysis.indicators?.rsiSignal || 'NEUTRAL'}
- MACD: ${analysis.indicators?.macdSignal || 'NEUTRAL'}
- Trend: ${analysis.indicators?.trendSignal || 'NEUTRAL'}

Risk Factors: ${analysis.riskFactors?.join(', ') || 'None identified'}
Opportunities: ${analysis.opportunities?.join(', ') || 'None identified'}

${marketData}`;

        // Log research completion
        await DbService.ensureTrader('Technical Research Agent', 'Market data analysis and technical indicators.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Technical Research Agent',
                        chat: `✅ [STEP 1/5] Technical Research Complete\n\nTrend: ${analysis.trend} (${analysis.strength})\nSupport: $${analysis.keyLevels?.support?.toFixed(2) || 'N/A'}\nResistance: $${analysis.keyLevels?.resistance?.toFixed(2) || 'N/A'}\n\n${analysis.summary || 'Market analysis completed. Proceeding to Risk Manager...'}`,
                        jsonValue: JSON.stringify(analysis),
                    });
                }
            })
            .catch(() => {});

        return {
            technicalResearchReport: researchReport,
            technicalResearchSummary: analysis.summary || 'Technical analysis completed.',
        };

    } catch (error) {
        console.error('Research LLM Error:', error);
        return {
            technicalResearchReport: marketData || 'Market Analysis: Unable to complete analysis.',
            technicalResearchSummary: 'Technical analysis failed due to system error.',
        };
    }
};


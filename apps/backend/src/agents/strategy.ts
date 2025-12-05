import { AgentState } from './state';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { config } from '../config';

const decisionSchema = z.object({
    action: z.enum(['open_long', 'open_short', 'close', 'hold']),
    leverage: z.number().min(1).max(20),
    reasoning: z.string(),
});

export const strategyNode = async (state: AgentState) => {
    console.log('🧠 Strategy Agent thinking...');

    if (!state.marketData) {
        throw new Error('No market data provided to Strategy Node');
    }

    if (!config.llm.openaiKey) {
        console.warn('⚠️ No OPENAI_API_KEY found in config. Using MOCK decision.');
        return {
            portfolioPlan: {
                action: 'BUY',
                size: 100,
                leverage: 2,
            },
            messages: [new HumanMessage('MOCK DECISION: BUY BTC')],
        };
    }

    const llm = (new ChatOpenAI({
        modelName: 'gpt-4o',
        temperature: 0,
        openAIApiKey: config.llm.openaiKey,
    }) as any).withStructuredOutput(decisionSchema);

    const marketContext = `
    Symbol: ${state.marketData.symbol}
    Price: ${state.marketData.price}
    RSI: ${state.marketData.indicators.rsi.toFixed(2)}
    EMA20: ${state.marketData.indicators.ema20.toFixed(2)}
    EMA50: ${state.marketData.indicators.ema50.toFixed(2)}
    Trend: ${state.marketData.context.trend}
  `;

    const messages = [
        new SystemMessage(`You are an expert crypto futures trader. Analyze the market data and make a decision.
    Your goal is to profit from trends.
    
    Rules:
    - Open Long if Trend is BULLISH and RSI < 70
    - Open Short if Trend is BEARISH and RSI > 30
    - Hold if unsure.
    `),
        new HumanMessage(`Market Data:\n${marketContext}\n\nWhat is your decision?`),
    ];

    try {
        const decision = await llm.invoke(messages);
        console.log('🧠 Decision:', decision);

        // Map to portfolio plan
        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        if (decision.action === 'open_long') action = 'BUY';
        if (decision.action === 'open_short') action = 'SELL';

        // If Logic says HOLD, we don't need a size
        const size = action === 'HOLD' ? 0 : 100; // Default size for now

        return {
            portfolioPlan: {
                action,
                size,
                leverage: decision.leverage,
            },
            messages: [new HumanMessage({ content: JSON.stringify(decision) })], // Log decision
        };
    } catch (error) {
        console.error('LLM Error:', error);
        return {
            portfolioPlan: { action: 'HOLD', size: 0, leverage: 1 },
        };
    }
};

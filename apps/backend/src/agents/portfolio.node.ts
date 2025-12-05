import { AgentState } from './state';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config';
import { createLLM } from './llm';
import { DbService } from '../services/db.service';
import { asterClient } from '../market/aster-client';
import { MarketDataService } from '../market/market.service';

export const portfolioManagerNode = async (state: AgentState) => {
    console.log('💼 Portfolio Manager generating plan...');

    const technicalReport = state.technicalResearchReport || "Market is trending upwards. RSI is neutral. Volume is increasing.";
    const riskAssessment = state.riskAssessment?.originalReport || "Risk Check Passed. Account Healthy. Max Size: 1000 USD.";
    const riskMaxSize = state.riskAssessment?.maxSize || 0;
    const riskApproved = state.riskAssessment?.approved ?? true;

    // Fetch LIVE Account Data
    let accountContext = '';
    let availableBalance = 0;
    let currentPrice = 0;
    
    try {
        const accountData = await asterClient.getAccount();
        availableBalance = parseFloat(accountData.availableBalance || '0');
        const equity = parseFloat(accountData.totalWalletBalance || accountData.totalEquity || '0');
        
        accountContext = `
    Equity: ${equity.toFixed(2)} USD
    Available Balance: ${availableBalance.toFixed(2)} USD
    `;
        
        // Fetch LIVE Market Price
        const symbol = state.symbol.replace('/', '');
        const marketPrice = await asterClient.getMarketPrice(symbol);
        currentPrice = marketPrice.markPrice;
        
        console.log(`📊 Live Price for ${symbol}: $${currentPrice.toFixed(2)}`);
        console.log(`💰 Available Balance: $${availableBalance.toFixed(2)}`);
    } catch (error: any) {
        console.warn('⚠️ Failed to fetch live data:', error.message);
        accountContext = 'Equity: 10000 USD\nAvailable Balance: 9500 USD';
    }

    // Check if we have OpenAI API key
    const hasKey = !!config.llm.openaiKey;

    if (!hasKey) {
        console.warn('⚠️ No API Key found. Using Mock Portfolio Plan.');
        return {
            portfolioPlan: {
                action: 'BUY',
                size: Math.min(100, availableBalance || 100),
                leverage: 2,
                reasoning: 'Mock Decision: Trend is Up (No API Key).',
                originalPlan: 'Mock Portfolio Plan: BUY 100 USD worth of BTC',
            },
            portfolioSummary: 'I have decided to BUY $100 of BTC with 2x leverage (MOCK).',
            messages: [new HumanMessage('Portfolio Manager: Decided to BUY (MOCK).')],
        };
    }

    const llm = createLLM({ temperature: 0 });

    // Log thinking process
    await DbService.ensureTrader('Portfolio Manager', 'Strategic allocation and planning.')
        .then(async (trader) => {
            if (trader) {
                await DbService.saveAnalysisRecord({
                    traderId: trader.id,
                    role: 'Portfolio Manager',
                    chat: `💼 [STEP 3/5] Portfolio Manager: Generating trading plan\n\nCurrent Price: $${currentPrice.toFixed(2)}\nAvailable Balance: $${availableBalance.toFixed(2)}\nMax Allowed: $${Math.min(riskMaxSize || availableBalance * 0.5, availableBalance * 0.5).toFixed(2)}\n\nSynthesizing research and risk assessment...`,
                    jsonValue: JSON.stringify({ status: 'thinking', step: '3/5' }),
                });
            }
        })
        .catch(() => {});

    // Calculate realistic max size based on available balance and risk assessment
    const effectiveMaxSize = Math.min(
        riskMaxSize || availableBalance * 0.5, // Use risk maxSize or 50% of available
        availableBalance * 0.5, // Never exceed 50% of available balance
        availableBalance // Never exceed available balance
    );

    const systemMessage = `You are the Portfolio Manager AI.
    Your task is to synthesize the Technical Research Report and Risk Assessment to create a PORTFOLIO PLAN.
    
    You must output a JSON object with the following structure:
    {
        "action": "BUY" | "SELL" | "HOLD" | "EXIT" | "REDUCE",
        "size": number (in USD),
        "leverage": number,
        "reasoning": string,
        "stopLoss": number (optional, in USD price),
        "takeProfit": number (optional, in USD price),
        "plainLanguageSummary": string (2-3 sentences explaining the decision for a non-technical user)
    }

    CRITICAL CONSTRAINTS:
    - size MUST NOT exceed ${effectiveMaxSize.toFixed(2)} USD (this is the maximum allowed)
    - size MUST NOT exceed available balance: ${availableBalance.toFixed(2)} USD
    - If Risk Assessment approved is false, you MUST HOLD or REDUCE
    - If Risk Assessment says "Risk Level: CRITICAL", you MUST reduce or exit
    - stopLoss and takeProfit should be realistic price levels (not USD amounts)
    - Current market price: $${currentPrice.toFixed(2)}
    - For conservative risk, use 10-30% of available balance
    - For moderate risk, use 30-50% of available balance
    `;

    const userMessage = `
    Account Status:
    ${accountContext}

    Technical Report:
    ${technicalReport}

    Risk Assessment:
    ${riskAssessment}
    
    Risk Manager Constraints:
    - Approved: ${riskApproved}
    - Max Size Allowed: ${effectiveMaxSize.toFixed(2)} USD
    - Available Balance: ${availableBalance.toFixed(2)} USD

    Current Symbol: ${state.symbol}
    Current Market Price: $${currentPrice.toFixed(2)}
    `;

    try {
        const response = await llm.invoke([
            new SystemMessage(systemMessage),
            new HumanMessage(userMessage),
        ] as any);

        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

        let decision: any;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                decision = JSON.parse(jsonMatch[0]);
            } else {
                decision = JSON.parse(content);
            }
        } catch (e) {
            console.warn("Failed to parse LLM JSON, falling back to text", content);
            decision = {
                action: 'HOLD',
                size: 0,
                leverage: 1,
                reasoning: 'Failed to parse decision',
                plainLanguageSummary: 'I am holding my position because I could not generate a clear plan.'
            };
        }

        // Enforce hard constraints on size
        if (decision.size > effectiveMaxSize) {
            console.warn(`⚠️ LLM generated size ${decision.size} exceeds max ${effectiveMaxSize}. Capping to max.`);
            decision.size = effectiveMaxSize;
        }
        if (decision.size > availableBalance) {
            console.warn(`⚠️ LLM generated size ${decision.size} exceeds available ${availableBalance}. Capping to available.`);
            decision.size = availableBalance;
        }
        if (decision.size < 0) {
            decision.size = 0;
        }

        // Validate stopLoss and takeProfit are price levels (not USD amounts)
        if (decision.stopLoss && decision.stopLoss < currentPrice * 0.1) {
            // If stopLoss seems like a USD amount instead of price, recalculate
            if (decision.stopLoss < 1000) {
                decision.stopLoss = currentPrice * 0.95; // 5% stop loss
            }
        }
        if (decision.takeProfit && decision.takeProfit < currentPrice * 0.1) {
            // If takeProfit seems like a USD amount instead of price, recalculate
            if (decision.takeProfit < 1000) {
                decision.takeProfit = currentPrice * 1.1; // 10% take profit
            }
        }

        console.log('💼 Portfolio Plan:', decision);
        console.log(`💰 Final Size: $${decision.size.toFixed(2)} (Max allowed: $${effectiveMaxSize.toFixed(2)})`);

        // Log portfolio plan in real-time
        const planSummary = `✅ [STEP 3/5] Portfolio Plan Generated\n\nAction: ${decision.action}\nPosition Size: $${decision.size.toFixed(2)}\nLeverage: ${decision.leverage}x\n${decision.stopLoss ? `Stop Loss: $${decision.stopLoss.toFixed(2)}` : ''}\n${decision.takeProfit ? `Take Profit: $${decision.takeProfit.toFixed(2)}` : ''}\n\n${decision.plainLanguageSummary || decision.reasoning}\n\nProceeding to Trader Agent for execution...`;
        
        await DbService.ensureTrader('Portfolio Manager', 'Strategic allocation and planning.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Portfolio Manager',
                        chat: planSummary,
                        jsonValue: JSON.stringify(decision),
                    });
                }
            })
            .catch(err => console.error("Failed to save portfolio log:", err));

        return {
            portfolioPlan: {
                action: decision.action,
                size: Math.round(decision.size * 100) / 100, // Round to 2 decimals
                leverage: decision.leverage,
                reasoning: decision.reasoning,
                stopLoss: decision.stopLoss ? Math.round(decision.stopLoss * 100) / 100 : undefined,
                takeProfit: decision.takeProfit ? Math.round(decision.takeProfit * 100) / 100 : undefined,
                originalPlan: content,
            },
            portfolioSummary: decision.plainLanguageSummary || decision.reasoning,
            messages: [new HumanMessage(`Portfolio Decision: ${decision.action}`)],
        };

    } catch (error) {
        console.error('Portfolio LLM Error:', error);
        return {
            portfolioPlan: {
                action: 'HOLD',
                size: 0,
                leverage: 1,
                reasoning: 'Error in processing',
            },
            portfolioSummary: 'Taking no action due to an internal error.',
        };
    }
};

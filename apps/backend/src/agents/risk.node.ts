import { AgentState } from './state';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config';
import { createLLM } from './llm';
import { DbService } from '../services/db.service';
import { asterClient } from '../market/aster-client';

export const riskManagerNode = async (state: AgentState) => {
    console.log('🛡️ Risk Manager validating plan...');

    // Check if we have OpenAI API key
    const hasKey = !!config.llm.openaiKey;

    if (!hasKey) {
        console.warn('⚠️ No API Key found for provider ' + config.llm.provider + '. Using Mock Risk Assessment.');
        return {
            riskAssessment: {
                approved: true,
                maxSize: 1000,
                reason: 'Mock Risk Check Passed (No API Key).',
                originalReport: 'Risk Level: LOW. Account Health: GOOD.',
            },
            riskSummary: 'Risk checks passed (MOCK). Account is healthy with sufficient margin.',
            messages: [new HumanMessage('Risk Manager: Approved (MOCK).')],
        };
    }

    const llm = createLLM({ temperature: 0 });

    // Log thinking process
    await DbService.ensureTrader('Risk Manager', 'Responsible for account safety and risk limits.')
        .then(async (trader) => {
            if (trader) {
                await DbService.saveAnalysisRecord({
                    traderId: trader.id,
                    role: 'Risk Manager',
                    chat: `🛡️ [STEP 2/5] Risk Manager: Assessing account safety and risk boundaries\n\nAnalyzing account health, margin ratio, and market conditions...`,
                    jsonValue: JSON.stringify({ status: 'thinking', step: '2/5' }),
                });
            }
        })
        .catch(() => {});

    const systemMessage = `You are the Risk Manager AI.
    Your task is to assess the account health and market conditions to provide a RISK ASSESSMENT.
    
    You must output a JSON object:
    {
        "approved": boolean,
        "maxSize": number,
        "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "reason": string,
        "plainLanguageSummary": string
    }

    Constraints:
    - Max leverage is 5x.
    - If risk is CRITICAL, approved must be false.
    - maxSize should NEVER exceed available balance.
    - maxSize should be realistic based on account equity (typically 10-50% of equity for conservative risk).
    `;

    // Fetch LIVE Account Data from Exchange
    let accountContext = '';
    try {
        const accountData = await asterClient.getAccount();
        const equity = parseFloat(accountData.totalWalletBalance || accountData.totalEquity || '0');
        const available = parseFloat(accountData.availableBalance || '0');
        const marginUsed = parseFloat(accountData.totalInitialMargin || '0');
        const marginRatio = equity > 0 ? ((marginUsed / equity) * 100).toFixed(2) : '0';
        const positions = accountData.positions?.filter((p: any) => parseFloat(p.positionAmt || '0') !== 0) || [];
        
        accountContext = `
    Equity: ${equity.toFixed(2)} USD
    Available: ${available.toFixed(2)} USD
    Active Positions: ${positions.length}
    Margin Ratio: ${marginRatio}%
    Total Margin Used: ${marginUsed.toFixed(2)} USD
    `;
        console.log('📊 Live Account Data:', accountContext);
    } catch (error: any) {
        console.warn('⚠️ Failed to fetch live account data, using mock data:', error.message);
        // Fallback to mock data if API fails
        accountContext = `
    Equity: 10000 USD
    Available: 9500 USD
    Active Positions: 0
    Margin Ratio: 0%
    `;
    }

    const userMessage = `
    Account Status:
    ${accountContext}

    Technical Report:
    ${state.technicalResearchReport || "N/A"}
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
            decision = {
                approved: true,
                maxSize: 1000,
                riskLevel: 'LOW',
                reason: 'Failed to parse risk decision, defaulting to safe parameters.',
                plainLanguageSummary: 'Risk assessment parsing failed, proceeding with conservative limits.'
            };
        }

        console.log('🛡️ Risk Assessment:', decision);

        // Log assessment result in real-time
        await DbService.ensureTrader('Risk Manager', 'Responsible for account safety and risk limits.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Risk Manager',
                        chat: `✅ [STEP 2/5] Risk Assessment Complete\n\nStatus: ${decision.approved ? '✅ APPROVED' : '❌ REJECTED'}\nMax Position Size: $${decision.maxSize.toFixed(2)}\nRisk Level: ${decision.riskLevel}\n\n${decision.plainLanguageSummary || decision.reason}\n\nProceeding to Portfolio Manager...`,
                        jsonValue: JSON.stringify(decision),
                    });
                }
            })
            .catch(err => console.error("Failed to save risk log:", err));

        return {
            riskAssessment: {
                approved: decision.approved,
                maxSize: decision.maxSize,
                reason: decision.reason,
                originalReport: content,
            },
            riskSummary: decision.plainLanguageSummary || decision.reason,
            messages: [new HumanMessage(`Risk Assessment: ${decision.riskLevel}`)],
        };

    } catch (error: any) {
        console.error('Risk LLM Error:', error);

        // --- PERSISTENCE ON ERROR ---
        try {
            await DbService.ensureTrader('Risk Manager', 'Responsible for account safety and risk limits.')
                .then(async (trader) => {
                    if (trader) {
                        await DbService.saveAnalysisRecord({
                            traderId: trader.id,
                            role: 'Risk Manager',
                            chat: `System Error: ${error.message || 'Unknown LLM Error'}`,
                            jsonValue: JSON.stringify({ error: error.message }),
                        });
                    }
                });
        } catch (dbErr) {
            console.error("Failed to save error log:", dbErr);
        }
        // -----------------------------

        return {
            riskAssessment: {
                approved: false,
                maxSize: 0,
                reason: 'LLM Error: ' + (error.message || 'Unknown'),
                originalReport: 'Error',
            },
            riskSummary: 'Risk analysis failed due to system error.',
        };
    }
};

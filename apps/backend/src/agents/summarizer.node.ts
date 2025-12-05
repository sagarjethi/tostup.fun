import { AgentState } from './state';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config';
import { createLLM } from './llm';
import { DbService } from '../services/db.service';

export const summarizerNode = async (state: AgentState) => {
    console.log('📝 Summarizer Agent generating performance report...');

    const hasKey = !!config.llm.openaiKey;

    if (!hasKey) {
        return {
            performanceReport: 'Performance summary: Trading workflow completed.',
        };
    }

    const llm = createLLM({ temperature: 0 });

    const technicalReport = state.technicalResearchSummary || state.technicalResearchReport || 'N/A';
    const riskSummary = state.riskSummary || 'N/A';
    const portfolioSummary = state.portfolioSummary || 'N/A';
    const tradeSummary = state.tradeReportSummary || state.executionSummary || 'N/A';

    const systemMessage = `You are the Summarizer Agent.
    Your task is to create a concise performance report summarizing the entire trading workflow.
    
    Output a JSON object:
    {
        "workflowStatus": "COMPLETED" | "PARTIAL" | "FAILED",
        "keyDecisions": string[],
        "executedActions": string[],
        "performanceMetrics": {
            "riskLevel": string,
            "positionSize": number,
            "leverage": number
        },
        "summary": string (3-4 sentences summarizing the entire workflow)
    }`;

    const userMessage = `
    Technical Research: ${technicalReport}
    Risk Assessment: ${riskSummary}
    Portfolio Plan: ${portfolioSummary}
    Trade Execution: ${tradeSummary}
    
    Symbol: ${state.symbol}
    `;

    try {
        const response = await llm.invoke([
            new SystemMessage(systemMessage),
            new HumanMessage(userMessage),
        ] as any);

        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        let report: any;

        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                report = JSON.parse(jsonMatch[0]);
            } else {
                report = JSON.parse(content);
            }
        } catch (e) {
            report = {
                workflowStatus: 'COMPLETED',
                summary: 'Trading workflow completed successfully.',
            };
        }

        const performanceReport = `PERFORMANCE REPORT - ${state.symbol}

Workflow Status: ${report.workflowStatus}
Key Decisions: ${report.keyDecisions?.join(', ') || 'N/A'}
Executed Actions: ${report.executedActions?.join(', ') || 'N/A'}

Performance Metrics:
- Risk Level: ${report.performanceMetrics?.riskLevel || 'N/A'}
- Position Size: $${report.performanceMetrics?.positionSize?.toFixed(2) || '0.00'}
- Leverage: ${report.performanceMetrics?.leverage || 'N/A'}x

Summary:
${report.summary || 'Workflow completed.'}`;

        // Log performance report
        await DbService.ensureTrader('Summarizer Agent', 'Performance reporting and workflow summary.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Summarizer Agent',
                        chat: `📝 [STEP 5/5] Summarizer Agent: Performance Report Generated\n\nWorkflow Status: ${report.workflowStatus}\nKey Decisions: ${report.keyDecisions?.join(', ') || 'N/A'}\nExecuted Actions: ${report.executedActions?.join(', ') || 'N/A'}\n\n${report.summary || 'Trading workflow completed successfully.'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n✅ Multi-Agent Workflow Complete`,
                        jsonValue: JSON.stringify(report),
                    });
                }
            })
            .catch(() => {});

        return {
            performanceReport,
        };

    } catch (error) {
        console.error('Summarizer LLM Error:', error);
        return {
            performanceReport: 'Performance summary: Trading workflow completed.',
        };
    }
};


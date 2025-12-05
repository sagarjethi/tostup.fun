import { BaseMessage } from '@langchain/core/messages';
import { MarketAnalysis } from '../market/market.service';
import { Annotation } from '@langchain/langgraph';

export interface RiskAssessment {
    approved: boolean;
    maxSize: number;
    reason: string;
    originalReport?: string; // Full text report from LLM
}

export interface PortfolioPlan {
    action: 'BUY' | 'SELL' | 'HOLD' | 'EXIT' | 'REDUCE';
    size: number;
    leverage: number;
    reasoning: string;
    stopLoss?: number;
    takeProfit?: number;
    originalPlan?: string; // Full text plan from LLM
}

export const AgentStateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
        default: () => [],
    }),
    symbol: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => 'BTCUSDT',
    }),
    marketData: Annotation<MarketAnalysis | undefined>({
        reducer: (x: MarketAnalysis | undefined, y: MarketAnalysis | undefined) => y ?? x,
        default: () => undefined,
    }),
    // Agent Reports (Text-based as per reference)
    technicalResearchReport: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
    technicalResearchSummary: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
    riskAssessment: Annotation<RiskAssessment | undefined>({
        reducer: (x: RiskAssessment | undefined, y: RiskAssessment | undefined) => y ?? x,
        default: () => undefined,
    }),
    portfolioPlan: Annotation<PortfolioPlan | undefined>({
        reducer: (x: PortfolioPlan | undefined, y: PortfolioPlan | undefined) => y ?? x,
        default: () => undefined,
    }),
    tradeDecision: Annotation<any>({
        reducer: (x: any, y: any) => y ?? x,
        default: () => undefined,
    }),
    // Human-friendly summaries
    riskSummary: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
    portfolioSummary: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
    executionSummary: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
    tradeReportSummary: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
    performanceReport: Annotation<string>({
        reducer: (x: string, y: string) => y ?? x,
        default: () => '',
    }),
});

export type AgentState = typeof AgentStateAnnotation.State;

export interface AgentConfig {
    id: string;
    name: string;
    model: string;
    type: 'SINGLE' | 'COMPETITION';
}

export interface TradeDecision {
    action: 'BUY' | 'SELL' | 'HOLD';
    symbol: string;
    quantity: number;
    confidence: number;
    reasoning: string;
}

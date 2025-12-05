import { createTradingGraph } from '../agents/graph';
import { HumanMessage } from '@langchain/core/messages';
import { MarketDataService } from '../market/market.service';

export interface AgentInstance {
    id: string;
    symbol: string;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    startedAt: Date;
    completedAt?: Date;
    result?: any;
    error?: string;
}

class AgentService {
    private agents: Map<string, AgentInstance> = new Map();
    private runningAgents: Map<string, Promise<any>> = new Map();

    async startAgent(symbol: string): Promise<AgentInstance> {
        const agentId = `agent-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        
        const agent: AgentInstance = {
            id: agentId,
            symbol: symbol || 'BTCUSDT',
            status: 'running',
            startedAt: new Date(),
        };

        this.agents.set(agentId, agent);

        const graph = createTradingGraph();
        const tradingSymbol = symbol || 'BTCUSDT';
        
        const initialState = {
            messages: [new HumanMessage(`Starting Multi-Agent Trading Workflow for ${tradingSymbol}...`)],
            symbol: tradingSymbol,
        };

        const executionPromise = graph.invoke(initialState)
            .then((result) => {
                agent.status = 'completed';
                agent.completedAt = new Date();
                agent.result = result;
                this.runningAgents.delete(agentId);
                this.agents.set(agentId, agent);
                return result;
            })
            .catch((error) => {
                agent.status = 'failed';
                agent.completedAt = new Date();
                agent.error = error.message;
                this.runningAgents.delete(agentId);
                this.agents.set(agentId, agent);
                throw error;
            });

        this.runningAgents.set(agentId, executionPromise);

        return agent;
    }

    stopAgent(agentId: string): boolean {
        if (this.runningAgents.has(agentId)) {
            const agent = this.agents.get(agentId);
            if (agent && agent.status === 'running') {
                agent.status = 'stopped';
                agent.completedAt = new Date();
                this.runningAgents.delete(agentId);
                this.agents.set(agentId, agent);
                return true;
            }
        }
        return false;
    }

    getAgent(agentId: string): AgentInstance | undefined {
        return this.agents.get(agentId);
    }

    getAllAgents(): AgentInstance[] {
        return Array.from(this.agents.values());
    }

    getRunningAgents(): AgentInstance[] {
        return Array.from(this.agents.values()).filter(a => a.status === 'running');
    }
}

export const agentService = new AgentService();


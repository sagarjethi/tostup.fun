import { StateGraph, END, START } from '@langchain/langgraph';
import { AgentStateAnnotation, AgentState } from './state';
import { researchNode } from './research.node';
import { riskManagerNode } from './risk.node';
import { portfolioManagerNode } from './portfolio.node';
import { traderNode } from './trader.node';
import { summarizerNode } from './summarizer.node';

export const createTradingGraph = () => {
    const workflow = new StateGraph(AgentStateAnnotation);

    // Add Nodes - Complete Multi-Agent System
    workflow.addNode('research', researchNode);        // Technical Research Agent
    workflow.addNode('risk', riskManagerNode);         // Risk Manager Agent
    workflow.addNode('portfolio', portfolioManagerNode); // Portfolio Manager Agent
    workflow.addNode('trader', traderNode);            // Trader Agent
    workflow.addNode('summarizer', summarizerNode);    // Summarizer Agent

    // Define Workflow: Research → Risk → Portfolio → Trader → Summarizer → END
    workflow.addEdge(START, 'research' as any);
    workflow.addEdge('research' as any, 'risk' as any);
    workflow.addEdge('risk' as any, 'portfolio' as any);
    workflow.addEdge('portfolio' as any, 'trader' as any);
    workflow.addEdge('trader' as any, 'summarizer' as any);
    workflow.addEdge('summarizer' as any, END);

    return workflow.compile();
};

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { createTradingGraph } from './agents/graph';
import { HumanMessage } from '@langchain/core/messages';
import { DbService } from './services/db.service';
import { agentService } from './services/agent.service';
import { MarketDataService } from './market/market.service';
import { asterClient } from './market/aster-client';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * @swagger
 * /api/agent/run:
 *   post:
 *     summary: Run a trading agent workflow (legacy endpoint)
 *     tags: [Agents]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: BTCUSDT
 *     responses:
 *       200:
 *         description: Agent execution result
 *       500:
 *         description: Agent execution failed
 */
app.post('/api/agent/run', async (req, res) => {
    try {
        const { symbol } = req.body;
        const tradingSymbol = symbol || 'BTCUSDT';
        console.log(`🚀 Starting Multi-Agent Trading Workflow for ${tradingSymbol}...`);

        // Log workflow start
        await DbService.ensureTrader('System', 'Trading system orchestrator.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'System',
                        chat: `🚀 Starting Multi-Agent Trading Workflow for ${tradingSymbol}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nWORKFLOW PIPELINE:\n1️⃣ Technical Research Agent → Market Analysis\n2️⃣ Risk Manager → Safety Assessment\n3️⃣ Portfolio Manager → Capital Allocation\n4️⃣ Trader Agent → Order Execution\n5️⃣ Summarizer Agent → Performance Report\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nInitiating workflow...`,
                        jsonValue: JSON.stringify({ symbol: tradingSymbol, status: 'workflow_started' }),
                    });
                }
            })
            .catch(() => {});

        const graph = createTradingGraph();
        const initialState = {
            messages: [new HumanMessage(`Starting trading workflow for ${tradingSymbol}...`)],
            symbol: tradingSymbol,
        };

        const result = await graph.invoke(initialState);

        // Transform LangChain messages to Agent Logs
        const logs = (result.messages || []).map((msg: any, index: number) => {
            let agent: 'RESEARCH' | 'RISK' | 'PORTFOLIO' | 'TRADER' | 'SUMMARIZER' | 'INFO' = 'INFO';
            let content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);

            if (content.includes('Technical Research') || content.includes('Research Agent')) agent = 'RESEARCH';
            if (content.includes('Risk Manager') || content.includes('Risk')) agent = 'RISK';
            if (content.includes('Portfolio Manager') || content.includes('Portfolio')) agent = 'PORTFOLIO';
            if (content.includes('Trader Agent') || content.includes('Trader')) agent = 'TRADER';
            if (content.includes('Summarizer') || content.includes('Performance')) agent = 'SUMMARIZER';

            return {
                id: `log-${index}-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agent,
                message: content,
                details: index === 0 ? 'Workflow Started' : undefined
            };
        });

        // Add final summaries as logs if they exist
        if (result.riskSummary) {
            logs.push({
                id: `risk-sum-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agent: 'RISK',
                message: `Summary: ${result.riskSummary}`,
                details: undefined
            });
        }
        if (result.portfolioSummary) {
            logs.push({
                id: `port-sum-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agent: 'PORTFOLIO',
                message: `Summary: ${result.portfolioSummary}`,
                details: undefined
            });
        }
        if (result.tradeReportSummary) {
            logs.push({
                id: `trader-sum-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agent: 'TRADER',
                message: `Summary: ${result.tradeReportSummary}`,
                details: undefined
            });
        }
        if (result.performanceReport) {
            logs.push({
                id: `summarizer-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agent: 'SUMMARIZER',
                message: result.performanceReport,
                details: undefined
            });
        }
        if (result.technicalResearchSummary) {
            logs.push({
                id: `research-sum-${Date.now()}`,
                timestamp: new Date().toLocaleTimeString(),
                agent: 'RESEARCH',
                message: `Summary: ${result.technicalResearchSummary}`,
                details: undefined
            });
        }

        res.json({
            ...result,
            logs
        });
    } catch (error: any) {
        console.error('Agent execution failed:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/agents/start:
 *   post:
 *     summary: Start a new trading agent
 *     tags: [Agents]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: BTCUSDT
 *     responses:
 *       200:
 *         description: Agent started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 symbol:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [running, completed, failed, stopped]
 *                 startedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Failed to start agent
 */
app.post('/api/agents/start', async (req, res) => {
    try {
        const { symbol } = req.body;
        const agent = await agentService.startAgent(symbol);
        res.json(agent);
    } catch (error: any) {
        console.error('Failed to start agent:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: List of all agents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   symbol:
 *                     type: string
 *                   status:
 *                     type: string
 *                   startedAt:
 *                     type: string
 *                     format: date-time
 *                   completedAt:
 *                     type: string
 *                     format: date-time
 */
app.get('/api/agents', (req, res) => {
    try {
        const agents = agentService.getAllAgents();
        res.json({ success: true, data: agents });
    } catch (error: any) {
        console.error('Failed to get agents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/agents/running:
 *   get:
 *     summary: Get all running agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: List of running agents
 */
app.get('/api/agents/running', (req, res) => {
    try {
        const agents = agentService.getRunningAgents();
        res.json({ success: true, data: agents });
    } catch (error: any) {
        console.error('Failed to get running agents:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/agents/{agentId}:
 *   get:
 *     summary: Get agent by ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent details
 *       404:
 *         description: Agent not found
 */
app.get('/api/agents/:agentId', (req, res) => {
    try {
        const { agentId } = req.params;
        const agent = agentService.getAgent(agentId);
        if (!agent) {
            return res.status(404).json({ success: false, error: 'Agent not found' });
        }
        res.json({ success: true, data: agent });
    } catch (error: any) {
        console.error('Failed to get agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/agents/{agentId}/stop:
 *   post:
 *     summary: Stop a running agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent stopped successfully
 *       404:
 *         description: Agent not found or not running
 */
app.post('/api/agents/:agentId/stop', (req, res) => {
    try {
        const { agentId } = req.params;
        const stopped = agentService.stopAgent(agentId);
        if (!stopped) {
            return res.status(404).json({ success: false, error: 'Agent not found or not running' });
        }
        res.json({ success: true, message: 'Agent stopped successfully' });
    } catch (error: any) {
        console.error('Failed to stop agent:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- History Endpoints ---

/**
 * @swagger
 * /api/history/chats:
 *   get:
 *     summary: Get chat history
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: traderId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat history records
 */
app.get('/api/history/chats', async (req, res) => {
    try {
        const { limit, traderId } = req.query;
        let records;
        if (traderId && typeof traderId === 'string') {
            records = await DbService.getAnalysisRecordsByTrader(traderId, Number(limit) || 50);
        } else {
            records = await DbService.getAnalysisRecords(Number(limit) || 50);
        }
        res.json({ success: true, data: records });
    } catch (error: any) {
        console.error('Failed to fetch chat history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/history/orders:
 *   get:
 *     summary: Get order history
 *     tags: [History]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Order history records
 */
app.get('/api/history/orders', async (req, res) => {
    try {
        const { limit } = req.query;
        const records = await DbService.getOrders(Number(limit) || 100);
        res.json({ success: true, data: records });
    } catch (error: any) {
        console.error('Failed to fetch order history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/chat/query:
 *   post:
 *     summary: Query agent chat history with natural language
 *     tags: [History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               context:
 *                 type: array
 *     responses:
 *       200:
 *         description: Answer to the question
 */
app.post('/api/chat/query', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ success: false, error: 'Question is required' });
        }

        // Fetch recent chat history from database
        const chatRecords = await DbService.getAnalysisRecords(50);
        
        // Build context from chat history
        const contextSummary = chatRecords.map((record: any) => {
            return `[${record.role}] ${record.chat}`;
        }).join('\n\n');

        // Use LLM to answer the question
        const { createLLM } = require('./agents/llm');
        const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
        const llm = createLLM({ temperature: 0.3 });

        const systemPrompt = `You are a helpful assistant that answers questions about the trading agent workflow.
        Use the provided agent chat history to answer questions accurately.
        If the information is not in the history, say so clearly.`;

        const userPrompt = `Question: ${question}\n\nAgent Chat History:\n${contextSummary}`;

        try {
            const response = await llm.invoke([
                new SystemMessage(systemPrompt),
                new HumanMessage(userPrompt),
            ]);

            let answer = '';
            if (typeof response.content === 'string') {
                answer = response.content;
            } else if (response.content && typeof response.content === 'object') {
                answer = JSON.stringify(response.content);
            } else {
                answer = 'I received a response but could not parse it.';
            }

            return res.json({ success: true, answer });
        } catch (llmError: any) {
            console.warn('LLM query failed, using fallback:', llmError.message);
            
            // Fallback to simple pattern matching
            const lowerQuestion = question.toLowerCase();
            let answer = '';

            if (lowerQuestion.includes('strateg') || lowerQuestion.includes('execut') || lowerQuestion.includes('trade')) {
                const strategies = chatRecords
                    .filter((r: any) => r.role === 'Portfolio Manager' || r.role === 'Trader Agent')
                    .slice(0, 5)
                    .map((r: any, i: number) => `${i + 1}. ${r.chat.substring(0, 150)}`)
                    .join('\n\n');
                answer = `Here are the recent strategies/executions:\n\n${strategies || 'No strategies found in recent history.'}`;
            } else if (lowerQuestion.includes('risk') || lowerQuestion.includes('assessment')) {
                const riskData = chatRecords
                    .filter((r: any) => r.role === 'Risk Manager')
                    .slice(-1)[0];
                answer = riskData ? `Latest Risk Assessment:\n\n${riskData.chat}` : 'No recent risk assessments found.';
            } else if (lowerQuestion.includes('research') || lowerQuestion.includes('market')) {
                const researchData = chatRecords
                    .filter((r: any) => r.role === 'Technical Research Agent')
                    .slice(-1)[0];
                answer = researchData ? `Latest Market Research:\n\n${researchData.chat}` : 'No recent research data found.';
            } else if (lowerQuestion.includes('portfolio') || lowerQuestion.includes('plan')) {
                const portfolioData = chatRecords
                    .filter((r: any) => r.role === 'Portfolio Manager')
                    .slice(-1)[0];
                answer = portfolioData ? `Latest Portfolio Plan:\n\n${portfolioData.chat}` : 'No recent portfolio plans found.';
            } else {
                answer = `Based on the agent workflow history:\n\n${contextSummary.substring(0, 500)}...\n\nFor more specific information, try asking about strategies, risk assessments, research, or portfolio plans.`;
            }

            return res.json({ success: true, answer });
        }
    } catch (error: any) {
        console.error('Failed to process chat query:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Internal server error',
            answer: 'Sorry, I encountered an error processing your question. Please try again.'
        });
    }
});

/**
 * @swagger
 * /api/account:
 *   get:
 *     summary: Get account balance and equity
 *     tags: [History]
 *     responses:
 *       200:
 *         description: Account information
 */
app.get('/api/account', async (req, res) => {
    try {
        const accountData = await asterClient.getAccount();
        const equity = parseFloat(accountData.totalWalletBalance || accountData.totalEquity || '0');
        const available = parseFloat(accountData.availableBalance || '0');
        
        // Extract wallet address if available (Aster API might return it)
        const walletAddress = accountData.accountId || accountData.userId || accountData.address || null;
        
        res.json({ 
            success: true, 
            data: {
                equity,
                availableBalance: available,
                totalWalletBalance: equity,
                totalEquity: equity,
                walletAddress: walletAddress,
            }
        });
    } catch (error: any) {
        console.error('Failed to fetch account:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Get open positions
 *     tags: [History]
 *     responses:
 *       200:
 *         description: Open positions
 */
app.get('/api/positions', async (req, res) => {
    try {
        const positions = await asterClient.getPositions();
        const activePositions = positions
            .filter((p: any) => parseFloat(p.positionAmt || '0') !== 0)
            .map((p: any) => ({
                symbol: p.symbol,
                qty: Math.abs(parseFloat(p.positionAmt || '0')),
                entryPrice: parseFloat(p.entryPrice || '0'),
                side: parseFloat(p.positionAmt || '0') > 0 ? 'LONG' : 'SHORT',
                leverage: parseFloat(p.leverage || '1'),
                pnl: parseFloat(p.unrealizedProfit || '0'),
            }));
        
        res.json({ success: true, data: activePositions });
    } catch (error: any) {
        console.error('Failed to fetch positions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 TostAI Backend running on port ${PORT}`);
    console.log(`📚 Swagger UI available at http://localhost:${PORT}/api-docs`);
});

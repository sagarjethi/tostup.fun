import { MarketDataService } from './market/market.service';
import { createTradingGraph } from './agents/graph';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    const symbol = 'BTC/USDT'; // Use standard format

    // 1. Fetch Data
    const marketService = new MarketDataService();
    console.log(`Fetching data for ${symbol}...`);
    const marketData = await marketService.getMarketAnalysis(symbol);

    // 2. Initialize Graph
    const graph = createTradingGraph();

    // 3. Run
    console.log('Starting Agent Loop...');
    const result = await graph.invoke({
        symbol,
        messages: [],
        marketData,
    });

    console.log('Final Result:', result.tradeDecision);
}

run().catch(console.error);

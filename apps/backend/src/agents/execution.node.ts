import { AgentState } from './state';
import { asterClient } from '../market/aster-client';
import { config } from '../config';
import { DbService } from '../services/db.service';

export const executionNode = async (state: AgentState) => {
    console.log('🚀 Trader Executing Plan...');

    const plan = state.portfolioPlan;

    // Log execution start
    await DbService.ensureTrader('Execution Agent', 'Trade execution and order management.')
        .then(async (trader) => {
            if (trader) {
                await DbService.saveAnalysisRecord({
                    traderId: trader.id,
                    role: 'Execution Agent',
                    chat: `🚀 Preparing to execute ${plan?.action || 'UNKNOWN'} order...`,
                    jsonValue: JSON.stringify({ status: 'preparing', plan: plan }),
                });
            }
        })
        .catch(() => {});

    if (!plan) {
        return {
            executionSummary: 'No portfolio plan to execute.',
        };
    }

    if (plan.action === 'HOLD' || plan.action === 'EXIT') {
        console.log(`🛑 Action is ${plan.action}. No execution needed.`);
        return {
            executionSummary: `${plan.action === 'HOLD' ? 'Holding' : 'Exiting'} position as per plan. Monitoring market conditions.`,
            tradeDecision: { executed: false, reason: plan.action }
        };
    }

    if (!config.aster.apiKey || !config.aster.apiSecret) {
        console.warn('⚠️ Aster API credentials not configured. Skipping live execution.');
        return {
            executionSummary: 'Aster API credentials not configured. Cannot execute live trades.',
            tradeDecision: { executed: false, error: 'API credentials missing' }
        };
    }

    console.log(`Executing ${plan.action} ${plan.size} USD on ${state.symbol}`);

    try {
        const symbol = state.symbol.replace('/', ''); // Convert BTC/USDT to BTCUSDT
        
        // Fetch live market price
        const marketPrice = await asterClient.getMarketPrice(symbol);
        const currentPrice = marketPrice.markPrice;
        
        // Calculate quantity from USD size
        const quantity = plan.size / currentPrice;
        
        // Validate quantity is reasonable
        if (quantity <= 0) {
            throw new Error(`Invalid quantity calculated: ${quantity} for size ${plan.size} USD at price ${currentPrice}`);
        }
        
        console.log(`💰 Order Details: ${plan.size} USD = ${quantity.toFixed(6)} contracts at $${currentPrice.toFixed(2)}`);
        
        // Log order details before execution
        await DbService.ensureTrader('Execution Agent', 'Trade execution and order management.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Execution Agent',
                        chat: `📊 Order Details:\nAction: ${plan.action}\nSize: $${plan.size.toFixed(2)} USD\nQuantity: ${quantity.toFixed(6)} contracts\nPrice: $${currentPrice.toFixed(2)}\n\nPlacing order...`,
                        jsonValue: JSON.stringify({ status: 'placing_order', details: { size: plan.size, quantity, price: currentPrice } }),
                    });
                }
            })
            .catch(() => {});
        
        // Place order with live data
        const orderResult = await asterClient.placeOrder({
            symbol,
            side: plan.action === 'BUY' ? 'BUY' : 'SELL',
            type: 'MARKET',
            quantity: quantity,
        });

        const summary = `Successfully executed ${plan.action} order for ${state.symbol}. Size: ${plan.size} USD (${quantity.toFixed(6)} contracts). Entry Price: $${currentPrice.toFixed(2)}. Order ID: ${orderResult.orderId || orderResult.clientOrderId || 'N/A'}`;

        // Log successful execution
        await DbService.ensureTrader('Execution Agent', 'Trade execution and order management.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Execution Agent',
                        chat: `✅ Order Executed Successfully!\n${summary}`,
                        jsonValue: JSON.stringify({ status: 'executed', orderResult }),
                    });
                }
            })
            .catch(() => {});

        return {
            executionSummary: summary,
            tradeDecision: {
                executed: true,
                orderId: orderResult.orderId || orderResult.clientOrderId,
                price: currentPrice,
                quantity: quantity,
                side: plan.action,
            }
        };

    } catch (error: any) {
        console.error("Execution failed:", error);
        
        // Log execution error
        await DbService.ensureTrader('Execution Agent', 'Trade execution and order management.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Execution Agent',
                        chat: `❌ Execution Failed: ${error.message || 'Unknown error'}`,
                        jsonValue: JSON.stringify({ status: 'error', error: error.message }),
                    });
                }
            })
            .catch(() => {});
        
        return {
            executionSummary: `Trade execution failed: ${error.message || 'Unknown error'}`,
            tradeDecision: { executed: false, error: error.message || 'Unknown error' }
        };
    }
};

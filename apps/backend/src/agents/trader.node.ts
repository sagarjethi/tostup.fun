import { AgentState } from './state';
import { asterClient } from '../market/aster-client';
import { config } from '../config';
import { DbService } from '../services/db.service';

export const traderNode = async (state: AgentState) => {
    console.log('🎯 Trader Agent executing plan...');

    const plan = state.portfolioPlan;

    if (!plan) {
        return {
            tradeReportSummary: 'No portfolio plan to execute.',
        };
    }

    if (plan.action === 'HOLD' || plan.action === 'EXIT') {
        console.log(`🛑 Action is ${plan.action}. No execution needed.`);
        return {
            tradeReportSummary: `${plan.action === 'HOLD' ? 'Holding' : 'Exiting'} position as per plan. Monitoring market conditions.`,
            tradeDecision: { executed: false, reason: plan.action }
        };
    }

    if (!config.aster.apiKey || !config.aster.apiSecret) {
        console.warn('⚠️ Aster API credentials not configured. Skipping live execution.');
        return {
            tradeReportSummary: 'Aster API credentials not configured. Cannot execute live trades.',
            tradeDecision: { executed: false, error: 'API credentials missing' }
        };
    }

    console.log(`Executing ${plan.action} ${plan.size} USD on ${state.symbol}`);

    // Log execution start
    await DbService.ensureTrader('Trader Agent', 'Trading decisions and execution planning.')
        .then(async (trader) => {
            if (trader) {
                await DbService.saveAnalysisRecord({
                    traderId: trader.id,
                    role: 'Trader Agent',
                    chat: `🎯 [STEP 4/5] Trader Agent: Executing trading plan\n\nAction: ${plan.action}\nSize: $${plan.size.toFixed(2)}\nSymbol: ${state.symbol}\n\nPreparing order execution...`,
                    jsonValue: JSON.stringify({ status: 'preparing', plan: plan, step: '4/5' }),
                });
            }
        })
        .catch(() => {});

    try {
        const symbol = state.symbol.replace('/', '');
        
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
        await DbService.ensureTrader('Trader Agent', 'Trading decisions and execution planning.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Trader Agent',
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
        await DbService.ensureTrader('Trader Agent', 'Trading decisions and execution planning.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Trader Agent',
                        chat: `✅ [STEP 4/5] Order Executed Successfully!\n\n${summary}\n\nProceeding to Summarizer Agent for performance report...`,
                        jsonValue: JSON.stringify({ status: 'executed', orderResult }),
                    });
                }
            })
            .catch(() => {});

        return {
            tradeReportSummary: summary,
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
        await DbService.ensureTrader('Trader Agent', 'Trading decisions and execution planning.')
            .then(async (trader) => {
                if (trader) {
                    await DbService.saveAnalysisRecord({
                        traderId: trader.id,
                        role: 'Trader Agent',
                        chat: `❌ Execution Failed: ${error.message || 'Unknown error'}`,
                        jsonValue: JSON.stringify({ status: 'error', error: error.message }),
                    });
                }
            })
            .catch(() => {});
        
        return {
            tradeReportSummary: `Trade execution failed: ${error.message || 'Unknown error'}`,
            tradeDecision: { executed: false, error: error.message || 'Unknown error' }
        };
    }
};


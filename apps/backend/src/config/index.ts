import dotenv from 'dotenv';
import path from 'path';

// Load .env - try multiple locations
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Local backend .env
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') }); // Root .env

interface Config {
    env: string;
    port: number;
    llm: {
        provider: string;
        model: string;
        openaiKey?: string;
        xaiKey?: string;
        anthropicKey?: string;
    };
    exchange: {
        id: string;
        apiKey?: string;
        secret?: string;
        subaccount?: string;
        sandbox: boolean;
    };
    aster: {
        apiKey?: string;
        apiSecret?: string;
        baseUrl: string;
    };
    coinmarketcap: {
        apiKey?: string;
    };
    trading: {
        symbol: string;
        timeframe: string;
        leverage: number;
        maxPositionSizeUsd: number;
    };
    logLevel: string;
}

export const config: Config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001'),

    // LLM Config
    llm: {
        provider: process.env.LLM_PROVIDER || 'openai', // 'openai', 'xai', 'anthropic'
        model: process.env.LLM_MODEL || 'gpt-4',
        openaiKey: process.env.OPENAI_API_KEY,
        xaiKey: process.env.XAI_API_KEY,
        anthropicKey: process.env.ANTHROPIC_API_KEY,
    },

    // Exchange Config
    exchange: {
        id: process.env.EXCHANGE_ID || 'aster',
        apiKey: process.env.EXCHANGE_API_KEY,
        secret: process.env.EXCHANGE_SECRET,
        subaccount: process.env.EXCHANGE_SUBACCOUNT,
        sandbox: process.env.EXCHANGE_SANDBOX === 'true',
    },

    // Aster DEX Specific
    aster: {
        apiKey: process.env.ASTER_API_KEY,
        apiSecret: process.env.ASTER_API_SECRET,
        baseUrl: process.env.ASTER_BASE_URL || 'https://fapi.asterdex.com'
    },

    // CoinMarketCap API
    coinmarketcap: {
        apiKey: process.env.COINMARKETCAP_API_KEY,
    },

    // Trading Params
    trading: {
        symbol: process.env.TRADING_SYMBOL || 'BTC/USDT',
        timeframe: process.env.TRADING_TIMEFRAME || '5m',
        leverage: parseInt(process.env.TRADING_LEVERAGE || '1'),
        maxPositionSizeUsd: parseInt(process.env.MAX_POS_SIZE || '100'),
    },

    // System
    logLevel: process.env.LOG_LEVEL || 'info',
};

// Validation
if (config.env === 'production') {
    if (config.llm.provider === 'openai' && !config.llm.openaiKey) console.warn('⚠️ PROD: Missing OPENAI_API_KEY');
    if (config.llm.provider === 'xai' && !config.llm.xaiKey) console.warn('⚠️ PROD: Missing XAI_API_KEY');
}

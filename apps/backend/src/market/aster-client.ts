import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import crypto from 'crypto';
import { config } from '../config';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export class AsterFuturesClient {
    private apiKey: string;
    private apiSecret: string;
    private baseUrl: string;
    private axiosInstance: AxiosInstance;
    private priceCache: Map<string, CacheEntry<any>> = new Map();
    private cacheTTL = 2000; // 2 seconds cache for prices

    constructor(apiKey: string, apiSecret: string, baseUrl: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = baseUrl;

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'X-MBX-APIKEY': this.apiKey,
            },
            timeout: 5000,
        });
    }

    private getCached<T>(key: string): T | null {
        const entry = this.priceCache.get(key);
        if (entry && Date.now() - entry.timestamp < this.cacheTTL) {
            return entry.data as T;
        }
        return null;
    }

    private setCache<T>(key: string, data: T): void {
        this.priceCache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    private generateSignature(params: Record<string, any>): string {
        // CRITICAL: Aster DEX requires insertion order, NOT sorted order.
        // We manually construct the query string to ensure order is preserved.
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }

    private async request(method: 'GET' | 'POST' | 'DELETE', endpoint: string, params: Record<string, any> = {}, signed: boolean = false) {
        let requestParams = { ...params };

        if (signed) {
            requestParams['timestamp'] = Date.now();
            requestParams['recvWindow'] = 5000;

            // Generate signature
            const signature = this.generateSignature(requestParams);
            requestParams['signature'] = signature;
        }

        try {
            const config: AxiosRequestConfig = {
                method,
                url: endpoint,
                params: method === 'GET' ? requestParams : undefined,
                data: method !== 'GET' ? undefined : undefined, // Aster GET uses params in URL
            };

            // For POST/DELETE, axios puts 'params' in URL query string if we set `params` property.
            // Aster usually expects query string parameters even for POST, similar to Binance Futures.
            if (method !== 'GET') {
                // Manually append query string for POST/DELETE to ensure signature matches URL
                // Or use axios `params` which does serialization.
                // However, verification is sensitive to order and encoding.
                // Best practice for Binance-like APIs: put everything in query string for signed endpoints
                config.params = requestParams;
            }

            const response = await this.axiosInstance.request(config);
            return response.data;
        } catch (error: any) {
            console.error(`Aster API Error [${method} ${endpoint}]:`, error.response?.data || error.message);
            throw error;
        }
    }

    // Public Methods

    public async getAccount() {
        return this.request('GET', '/fapi/v2/account', {}, true);
    }

    public async getPositions(symbol?: string) {
        const params: any = {};
        if (symbol) params.symbol = symbol;
        return this.request('GET', '/fapi/v2/positionRisk', params, true);
    }

    public async placeOrder(order: {
        symbol: string;
        side: 'BUY' | 'SELL';
        type: 'LIMIT' | 'MARKET' | 'STOP' | 'TAKE_PROFIT';
        quantity?: number;
        price?: number;
        timeInForce?: 'GTC' | 'IOC' | 'FOK';
        reduceOnly?: boolean;
    }) {
        const params: any = {
            symbol: order.symbol,
            side: order.side,
            type: order.type,
        };

        if (order.quantity) params.quantity = order.quantity;
        if (order.price) params.price = order.price;
        if (order.timeInForce) params.timeInForce = order.timeInForce;
        if (order.reduceOnly) params.reduceOnly = 'true';

        return this.request('POST', '/fapi/v1/order', params, true);
    }

    public async cancelOrder(symbol: string, orderId: number) {
        return this.request('DELETE', '/fapi/v1/order', { symbol, orderId }, true);
    }

    public async getMarketPrice(symbol: string) {
        // Check cache first
        const cacheKey = `price_${symbol}`;
        const cached = this.getCached<any>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from API
        const res = await this.request('GET', '/fapi/v1/premiumIndex', { symbol }, false);
        const result = {
            symbol: res.symbol,
            markPrice: parseFloat(res.markPrice),
            indexPrice: parseFloat(res.indexPrice),
            fundingRate: parseFloat(res.lastFundingRate)
        };
        
        // Cache the result
        this.setCache(cacheKey, result);
        return result;
    }

    public async getKlines(symbol: string, interval: string = '5m', limit: number = 200) {
        const params = {
            symbol,
            interval,
            limit: limit.toString()
        };
        const data = await this.request('GET', '/fapi/v1/klines', params, false);
        
        return data.map((k: any[]) => ({
            openTime: k[0],
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
            closeTime: k[6],
            quoteVolume: parseFloat(k[7]),
            trades: parseInt(k[8]),
        }));
    }
}

// Export Singleton
export const asterClient = new AsterFuturesClient(
    config.aster.apiKey || '',
    config.aster.apiSecret || '',
    config.aster.baseUrl || 'https://fapi.asterdex.com'
);

interface CoinMarketCapQuote {
    price: number;
    volume_24h: number;
    percent_change_1h: number;
    percent_change_24h: number;
    percent_change_7d: number;
    market_cap: number;
    last_updated: string;
}

interface CoinMarketCapData {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    quote: {
        USD: CoinMarketCapQuote;
    };
}

interface CoinMarketCapResponse {
    status: {
        timestamp: string;
        error_code: number;
        error_message: string | null;
    };
    data: Record<string, CoinMarketCapData[]>;
}

export class CoinMarketCapService {
    private apiKey: string;
    private baseUrl = 'https://pro-api.coinmarketcap.com/v1';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.COINMARKETCAP_API_KEY || '8a6d98099f2b4df08cef51a890eb53a1';
    }

    private async request(endpoint: string, params: Record<string, string> = {}): Promise<any> {
        if (!this.apiKey) {
            throw new Error('CoinMarketCap API key not configured');
        }

        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        const response = await fetch(url.toString(), {
            headers: {
                'X-CMC_PRO_API_KEY': this.apiKey,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`CoinMarketCap API error: ${response.statusText}`);
        }

        return await response.json();
    }

    private symbolToId(symbol: string): string {
        const symbolMap: Record<string, string> = {
            'BTC': '1',
            'ETH': '1027',
            'BNB': '1839',
            'SOL': '4128',
            'XRP': '52',
            'DOGE': '5',
            'ADA': '2010',
            'USDT': '825',
        };
        return symbolMap[symbol.toUpperCase()] || symbol.toUpperCase();
    }

    async getLatestQuotes(symbol: string): Promise<CoinMarketCapQuote | null> {
        try {
            const symbolId = this.symbolToId(symbol);
            const response: CoinMarketCapResponse = await this.request('/cryptocurrency/quotes/latest', {
                id: symbolId,
                convert: 'USD',
            });

            if (response.status.error_code !== 0) {
                console.warn(`CoinMarketCap API error: ${response.status.error_message}`);
                return null;
            }

            const data = response.data[symbolId];
            if (!data || data.length === 0) {
                return null;
            }

            return data[0].quote.USD;
        } catch (error: any) {
            console.warn(`Failed to fetch CoinMarketCap data for ${symbol}:`, error.message);
            return null;
        }
    }

    async getMarketData(symbol: string): Promise<{
        price: number;
        volume24h: number;
        change1h: number;
        change24h: number;
        change7d: number;
        marketCap: number;
    } | null> {
        const quote = await this.getLatestQuotes(symbol);
        if (!quote) {
            return null;
        }

        return {
            price: quote.price,
            volume24h: quote.volume_24h,
            change1h: quote.percent_change_1h,
            change24h: quote.percent_change_24h,
            change7d: quote.percent_change_7d,
            marketCap: quote.market_cap,
        };
    }
}

export const coinMarketCapService = new CoinMarketCapService();


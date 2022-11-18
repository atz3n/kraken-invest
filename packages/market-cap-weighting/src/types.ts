
export interface Ratio {
    coinGeckoId: string;
    baseSymbol: string;
    cap: number;
    ratio: number;
}


export interface QuoteOrderRequest {
    baseSymbol: string;
    quoteSymbol: string;
    quoteAmount: number;
}


export interface Order {
    pair: string;
    volume: string;
    orderId: string;
}
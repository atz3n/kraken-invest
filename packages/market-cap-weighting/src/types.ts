
export interface Ratio {
    coinGeckoId: string;
    baseSymbol: string;
    cap: number;
    ratio: number;
}


export interface OrderRequest {
    baseSymbol: string;
    quoteSymbol: string;
    quoteAmount: number;
}


export interface Order {
    baseSymbol: string;
    quoteSymbol: string;
    volume: number;
    orderId: string;
}


export interface CumVolume {
    symbol: string;
    volume: number;
}


export interface BaseAsset {
    symbol: string;
    withdrawAddress: string;
    weight: number;
}


export interface Withdraw {
    symbol: string;
    volume: number;
    withdrawId: string;
}
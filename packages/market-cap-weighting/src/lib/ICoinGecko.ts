export interface MarketCaps {
    id: string;
    cap: number;
}


export interface ICoinGecko {
    getMarketCaps(assetIds: string[]): Promise<MarketCaps[]>;
}
import { ICoinGecko, MarketCaps } from "../../src/lib/ICoinGecko";


export interface Options {
    getMarketCapsCb?: (assetIds: string[]) => Promise<MarketCaps[]>;
}

export class CoinGeckoMock implements ICoinGecko {
    constructor(readonly options: Options) {}


    public async getMarketCaps(assetIds: string[]): Promise<MarketCaps[]> {
        if (this.options.getMarketCapsCb) {
            return this.options.getMarketCapsCb(assetIds);
        }
        return [];
    }

}
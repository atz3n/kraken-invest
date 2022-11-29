import axios from "axios";
import { ICoinGecko, MarketCaps } from "./ICoinGecko";


export class CoinGecko implements ICoinGecko {
    private readonly BASE_URL = "https://api.coingecko.com/api/v3";


    public async getMarketCaps(assetIds: string[]): Promise<MarketCaps[]> {
        const ids = assetIds.join(",");
        const url = `${this.BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&sparkline=false`;
        const response = await axios.get<{id: string, market_cap: number}[]>(url);
        const assetList = response.data;

        return assetIds.map((id) => {
            const cap = assetList.find(asset => asset.id === id)?.market_cap || 0;
            return {
                id,
                cap
            };
        });
    }
}
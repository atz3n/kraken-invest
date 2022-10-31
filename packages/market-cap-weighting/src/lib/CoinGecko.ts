import axios from "axios";


export interface Coin {
    id: string;
    symbol: string;
    cap: number;
}


export interface Options {
    coins: string[];
}

export class CoinGecko {
    private readonly BASE_URL = "https://api.coingecko.com/api/v3";
    private coins = <Coin[]> []


    public async init(options: Options): Promise<void> {
        const url = this.BASE_URL + "/coins/list";
        const response = await axios.get<{id: string, symbol: string, name: string}[]>(url);
        const coinList = response.data;

        this.coins = options.coins.map((coin) => {
            const symbol = coin.toLowerCase();
            const id = coinList.find(_coin => _coin.symbol === symbol)?.id;
            if (!id) {
                throw new Error(`Cannot get market cap info for coin: ${coin}`);
            }

            return {
                symbol,
                id,
                cap: 0
            };
        });
    }


    public async getMarketCaps(): Promise<Coin[]> {
        const ids = this.coins.map(coin => coin.id).join(",");
        const url = `${this.BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&sparkline=false`;
        const response = await axios.get<{symbol: string, market_cap: number}[]>(url);
        const coinList = response.data;

        this.coins = this.coins.map((coin) => {
            coin.cap = coinList.find(_coin => _coin.symbol === coin.symbol)?.market_cap || 0;
            return coin;
        });

        return this.coins;
    }
}
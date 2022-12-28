import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";
import { Order, QuoteOrderRequest } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    kraken: IKraken;
    quoteOrderRequests: QuoteOrderRequest[];
    volumeDecimals: number;
    minVolumeCb: (baseSymbol: string, volume: number, minVolume: number) => void;
    buyCb: (
        orderId: string,
        volume: number,
        baseSymbol: string,
        quoteAmount: number,
        quoteSymbol: string
    ) => void;
    boughtCb: (orders: Order[]) => Promise<void> | void;
}

export class QuoteBuyService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const orders: Order[] = [];
        for (let i = 0 ; i < this.options.quoteOrderRequests.length ; i++) {
            const { baseSymbol, quoteSymbol, quoteAmount } = this.options.quoteOrderRequests[i];

            const volume = await this.getVolume(
                this.options.kraken,
                baseSymbol,
                quoteSymbol,
                quoteAmount,
                this.options.volumeDecimals
            );
            const minVolume = await this.getMinimumVolume(this.options.kraken, baseSymbol, quoteSymbol);
            if (volume < minVolume) {
                this.options.minVolumeCb(baseSymbol, volume, minVolume);
                continue;
            }

            const orderId = await this.setOrder(this.options.kraken, baseSymbol, quoteSymbol, volume);
            orders.push({ baseSymbol, quoteSymbol, volume, orderId });
            await this.options.buyCb(orderId, volume, baseSymbol, quoteAmount, quoteSymbol);
        }
        await this.options.boughtCb(orders);
    }

    private async getVolume(
        kraken: IKraken,
        baseSymbol: string,
        quoteSymbol: string,
        investingAmount: number,
        volumeDecimals: number
    ): Promise<number> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        const resultPair = `${baseSymbol}/${quoteSymbol}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const price = await kraken.request<{ result: any }>(KRAKEN_PUBLIC_METHOD.Ticker, {
            pair,
            assetVersion: "1"
        });

        const askPrice = price.result[resultPair].a[0];
        return +(investingAmount / askPrice).toFixed(volumeDecimals);
    }

    private async getMinimumVolume(kraken: IKraken, baseSymbol: string, quoteSymbol: string): Promise<number> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        const resultPair = `${baseSymbol}/${quoteSymbol}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const assetPair = await kraken.request<{ result: any }>(KRAKEN_PUBLIC_METHOD.AssetPairs, {
            pair,
            assetVersion: "1"
        });

        return +assetPair.result[resultPair].ordermin;
    }

    private async setOrder(kraken: IKraken, baseSymbol: string, quoteSymbol: string, volume: number): Promise<string> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        const order = await kraken.request<{ result: { txid: string[] }}>(KRAKEN_PRIVATE_METHOD.AddOrder, {
            ordertype: "market",
            type: "buy",
            pair,
            volume: "" + volume
        });

        return order.result.txid[0];
    }
}

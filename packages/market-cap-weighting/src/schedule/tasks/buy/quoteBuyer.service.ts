import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-lib";
import { Order, QuoteOrderRequest } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    kraken: IKraken;
    quoteOrderRequests: QuoteOrderRequest[];
    volumeDecimals: number;
    buyCb: (orderId: string, volume: string, baseSymbol: string, quoteSymbol: string) => void;
    boughtCb: (orders: Order[]) => void;
}


export class QuoteBuyerService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const orders: Order[] = [];
        for (let i = 0 ; i < this.options.quoteOrderRequests.length ; i++) {
            const { baseSymbol, quoteSymbol, quoteAmount } = this.options.quoteOrderRequests[i];
            const pair = `${baseSymbol}${quoteSymbol}`;

            const volume = await this.getVolume(this.options.kraken, pair, quoteAmount, this.options.volumeDecimals);
            const orderId = await this.setOrder(this.options.kraken, pair, volume);
            // logger.info(`Set order ${orderId} to buy ${volume} ${baseSymbol} with ${quoteSymbol}`);
            orders.push({
                pair,
                volume,
                orderId
            });
            this.options.buyCb(orderId, volume, baseSymbol, quoteSymbol);
        }
        this.options.boughtCb(orders);
    }

    private async getVolume(
        kraken: IKraken,
        pair: string,
        investingAmount: number,
        volumeDecimals: number
    ): Promise<string> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const price = await kraken.request<{ result: any }>(KRAKEN_PUBLIC_METHOD.Ticker, { pair });
        const askPrice = price.result[pair].a[0];
        return (investingAmount / askPrice).toFixed(volumeDecimals);
    }

    private async setOrder(kraken: IKraken, pair: string, volume: string): Promise<string> {
        const order = await kraken.request<{ result: { txid: string[] }}>(KRAKEN_PRIVATE_METHOD.AddOrder, {
            ordertype: "market",
            type: "buy",
            pair,
            volume
        });
        return order.result.txid[0];
    }
}

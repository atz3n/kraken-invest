import { EnvVars } from "../lib/EnvVars";
import { Kraken, PRIVATE_METHOD, PUBLIC_METHOD } from "../lib/Kraken";
import { logger } from "./logging";


export async function buy(kraken: Kraken): Promise<void> {
    try {
        const balances = await kraken.request<{ result: never }>(PRIVATE_METHOD.Balance);
        if (balances.result[EnvVars.QUOTE_TICKER] <= EnvVars.QUOTE_INVESTING_AMOUNT) {
            throw new Error("Not enough funds");
        }

        const pair = `${EnvVars.BASE_TICKER}${EnvVars.QUOTE_TICKER}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const price = await kraken.request<{ result: any }>(PUBLIC_METHOD.Ticker, { pair });
        const askPrice = price.result[pair].a[0];
        const volume = (EnvVars.QUOTE_INVESTING_AMOUNT / askPrice).toFixed(EnvVars.VOLUME_DECIMAL);

        const order = await kraken.request<{ result: { txid: string[] }}>(PRIVATE_METHOD.AddOrder, {
            ordertype: "market",
            type: "buy",
            pair,
            volume
        });

        // eslint-disable-next-line max-len
        logger.info(`Set order ${order.result.txid[0]} to buy ${volume} ${EnvVars.BASE_TICKER} with ${EnvVars.QUOTE_TICKER}`);
    } catch (error) {
        logger.error((<Error> error).message);
    }
}
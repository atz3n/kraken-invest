import { EnvVars } from "./lib/EnvVars";
import { Kraken, PRIVATE_METHOD, PUBLIC_METHOD } from "./lib/Kraken";
import { schedule } from "node-cron";


async function main() {
    schedule(EnvVars.CRON_SCHEDULE, () => {
        buy();
    });
}

async function buy() {
    try {
        const kraken = new Kraken({
            apiPrivateKey: EnvVars.KRAKEN_API_PRIVATE_KEY,
            apiPublicKey: EnvVars.KRAKEN_API_PUBLIC_KEY
        });

        const balances = await kraken.request<{ result: any }>(PRIVATE_METHOD.Balance);
        if (balances.result[EnvVars.QUOTE_TICKER] <= EnvVars.QUOTE_INVESTING_AMOUNT) {
            throw new Error("Not enough funds");
        }

        const pair = `${EnvVars.BASE_TICKER}${EnvVars.QUOTE_TICKER}`;
        const price = await kraken.request<{ result: any }>(PUBLIC_METHOD.Ticker, { pair });
        const askPrice = price.result[pair].a[0];
        const volume = (EnvVars.QUOTE_INVESTING_AMOUNT / askPrice).toFixed(EnvVars.VOLUME_DECIMAL);

        const order = await kraken.request<{ result: any }>(PRIVATE_METHOD.AddOrder, {
            ordertype: "market",
            type: "buy",
            pair,
            volume
        });
        console.log(order);
    } catch (error) {
        console.log((<Error> error).message);
    }
}


main();
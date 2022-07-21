import { EnvVars } from "./lib/EnvVars";
import { Kraken, PRIVATE_METHOD, PUBLIC_METHOD } from "./lib/Kraken";
import { schedule } from "node-cron";


async function main() {
    const kraken = new Kraken({
        apiPrivateKey: EnvVars.KRAKEN_API_PRIVATE_KEY,
        apiPublicKey: EnvVars.KRAKEN_API_PUBLIC_KEY
    });

    schedule(EnvVars.TRADE_CRON_SCHEDULE, () => {
        buy(kraken);
    });

    schedule(EnvVars.WITHDRAW_CRON_SCHEDULE, () => {
        withdraw(kraken);
    });
}

async function buy(kraken: Kraken): Promise<void> {
    try {
        const balances = await kraken.request<{ result: any }>(PRIVATE_METHOD.Balance);
        if (balances.result[EnvVars.QUOTE_TICKER] <= EnvVars.QUOTE_INVESTING_AMOUNT) {
            throw new Error("Not enough funds");
        }

        const pair = `${EnvVars.BASE_TICKER}${EnvVars.QUOTE_TICKER}`;
        const price = await kraken.request<{ result: any }>(PUBLIC_METHOD.Ticker, { pair });
        const askPrice = price.result[pair].a[0];
        const volume = (EnvVars.QUOTE_INVESTING_AMOUNT / askPrice).toFixed(EnvVars.VOLUME_DECIMAL);

        const order = await kraken.request<{ result: { txid: string[] }}>(PRIVATE_METHOD.AddOrder, {
            ordertype: "market",
            type: "buy",
            pair,
            volume
        });
        console.log(order.result.txid[0]);
    } catch (error) {
        console.log((<Error> error).message);
    }
}

async function withdraw(kraken: Kraken): Promise<void> {
    try {
        const balances = await kraken.request<{ result: any }>(PRIVATE_METHOD.Balance);
        const baseBalance = balances.result[EnvVars.BASE_TICKER];

        const withdraw = await kraken.request<{ result: { refid: string }}>(PRIVATE_METHOD.Withdraw, {
            asset: EnvVars.BASE_TICKER,
            key: EnvVars.WITHDRAWAL_ADDRESS,
            amount: baseBalance
        });
        console.log(withdraw.result.refid);
    } catch (error) {
        console.log((<Error> error).message);
    }
}


main();
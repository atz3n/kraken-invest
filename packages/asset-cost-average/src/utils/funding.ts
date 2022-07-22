import { EnvVars } from "../lib/EnvVars";
import { Kraken, PRIVATE_METHOD } from "../lib/Kraken";
import { logger } from "./logging";


export async function withdraw(kraken: Kraken): Promise<void> {
    try {
        const balances = await kraken.request<{ result: never }>(PRIVATE_METHOD.Balance);
        const baseBalance = balances.result[EnvVars.BASE_TICKER];

        const withdraw = await kraken.request<{ result: { refid: string }}>(PRIVATE_METHOD.Withdraw, {
            asset: EnvVars.BASE_TICKER,
            key: EnvVars.WITHDRAWAL_ADDRESS,
            amount: baseBalance
        });

        logger.info(`Set withdrawal ${withdraw.result.refid} to withdraw ${baseBalance} ${EnvVars.BASE_TICKER}`);
    } catch (error) {
        logger.error((<Error> error).message);
    }
}
import { EnvVars } from "../lib/EnvVars";
import { IKraken, PRIVATE_METHOD } from "../lib/Kraken";
import { logger } from "./logging";


export async function withdraw(kraken: IKraken): Promise<void> {
    const balances = await kraken.request<{ result: never }>(PRIVATE_METHOD.Balance);
    const baseBalance = balances.result[EnvVars.BASE_SYMBOL];

    const withdraw = await kraken.request<{ result: { refid: string }}>(PRIVATE_METHOD.Withdraw, {
        asset: EnvVars.BASE_SYMBOL,
        key: EnvVars.WITHDRAWAL_ADDRESS,
        amount: baseBalance
    });

    logger.info(`Set withdrawal ${withdraw.result.refid} to withdraw ${baseBalance} ${EnvVars.BASE_SYMBOL}`);
}
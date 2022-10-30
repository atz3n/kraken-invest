import { IKraken, PRIVATE_METHOD } from "lib";
import { logger } from "./logging";


interface WithdrawParams {
    kraken: IKraken;
    volume: number;
    baseSymbol: string;
    withdrawalAddress: string
}

export async function withdraw(params: WithdrawParams): Promise<void> {
    const { kraken, volume, baseSymbol, withdrawalAddress } = params;
    const balances = await kraken.request<{ result: never }>(PRIVATE_METHOD.Balance);
    const baseBalance = balances.result[baseSymbol];
    const withdrawAmount = Math.min(baseBalance, volume);

    const withdraw = await kraken.request<{ result: { refid: string }}>(PRIVATE_METHOD.Withdraw, {
        asset: baseSymbol,
        key: withdrawalAddress,
        amount: "" + withdrawAmount
    });

    logger.info(`Set withdrawal ${withdraw.result.refid} to withdraw ${baseBalance} ${baseSymbol}`);
}
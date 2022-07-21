import { EnvVars } from "../lib/EnvVars";
import { Kraken, PRIVATE_METHOD } from "../lib/Kraken";


export async function withdraw(kraken: Kraken): Promise<void> {
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
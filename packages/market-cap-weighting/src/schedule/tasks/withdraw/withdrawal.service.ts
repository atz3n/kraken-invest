import { IKraken, KRAKEN_PRIVATE_METHOD } from "@atz3n/kraken-invest-common";
import { CumVolume, Withdraw } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    kraken: IKraken;
    baseAssets: {symbol: string, withdrawAddress: string}[];
    getCumVolumes: () => Promise<CumVolume[]> | CumVolume[];
    withdrawCb: (withdrawId: string, volume: number, symbol: string) => Promise<void> | void;
    withdrewCb: (withdraws: Withdraw[]) => Promise<void> | void;
}

export class WithdrawalService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const cumVolumes = await this.options.getCumVolumes();

        const withdraws: Withdraw[] = [];
        for (let i = 0 ; i < cumVolumes.length ; i++) {
            const cumVolume = cumVolumes[i];

            const baseAsset = this.options.baseAssets.find(asset => asset.symbol === cumVolume.symbol);
            if (!baseAsset || !baseAsset.withdrawAddress) {
                continue;
            }

            const volume = await this.calcWithdrawVolume(this.options.kraken, cumVolume.symbol, cumVolume.volume);
            if (volume > 0) {
                const withdrawId = await this.withdraw(
                    this.options.kraken,
                    cumVolume.symbol,
                    baseAsset.withdrawAddress,
                    volume
                );

                withdraws.push({
                    symbol: cumVolume.symbol,
                    volume,
                    withdrawId
                });
                this.options.withdrawCb(withdrawId, volume, cumVolume.symbol);
            }
        }
        this.options.withdrewCb(withdraws);
    }

    private async calcWithdrawVolume(kraken: IKraken, baseSymbol: string, volume: number): Promise<number> {
        const balances = await kraken.request<{ result: never }>(KRAKEN_PRIVATE_METHOD.Balance);
        const baseBalance = balances.result[baseSymbol];
        return Math.min(baseBalance, volume);
    }

    private async withdraw(kraken: IKraken, baseSymbol: string, address: string, volume: number): Promise<string> {
        const withdrawResult = await kraken.request<{ result: { refid: string }}>(KRAKEN_PRIVATE_METHOD.Withdraw, {
            asset: baseSymbol,
            key: address,
            amount: "" + volume
        });
        return withdrawResult.result.refid;
    }
}
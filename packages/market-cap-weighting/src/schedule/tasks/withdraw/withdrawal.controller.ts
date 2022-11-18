import { IKraken, logger } from "@atz3n/kraken-invest-lib";
import { IAssetMapper } from "../../../lib/AssetMapper";
import { ICoinGecko } from "../../../lib/CoinGecko";
import { EnvVars } from "../../../lib/EnvVars";
import { IStateStore } from "../../../storage/state/IStateStore";
import { Withdraw } from "../../../types";
import { createTask, Task } from "../../taskFactory";
import { WithdrawalService } from "./withdrawal.service";


interface Params {
    stateStore: IStateStore;
    kraken: IKraken;
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
}

export function createWithdrawalTask(params: Params): Task {
    return createTask({
        cronSchedule: EnvVars.CRON_BUY_SCHEDULE,
        services: [
            new WithdrawalService({
                kraken: params.kraken,
                baseAssets: EnvVars.BASE_ASSETS,
                getCumVolumes: async () => {
                    const state = await params.stateStore.get();
                    return state.cumVolumes;
                },
                withdrawCb: (withdrawId, volume, symbol) => {
                    logger.info(`Set withdrawal ${withdrawId} to withdraw ${volume} ${symbol}`);
                },
                withdrewCb: async (withdraws) => {
                    await updateVolumes(params.stateStore, withdraws);
                }
            })
        ]
    });
}

async function updateVolumes(stateStore: IStateStore, withdraws: Withdraw[]): Promise<void> {
    const state = await stateStore.get();
    withdraws.forEach((withdraw) => {
        for (let i = 0 ; i < state.cumVolumes.length ; i++) {
            if (withdraw.symbol === state.cumVolumes[i].symbol) {
                state.cumVolumes[i].volume = 0;
            }
        }
    });
    await stateStore.upsert(state);
}
import { IKraken } from "@atz3n/kraken-invest-lib";
import { IAssetMapper } from "../lib/AssetMapper";
import { ICoinGecko } from "../lib/CoinGecko";
import { IStateStore } from "../storage/state/IStateStore";
import { Scheduler } from "./Scheduler";
import { createBuyTask } from "./tasks/buy/buy.controller";
import { createMappingUpdateTask } from "./tasks/mappingUpdate/mappingUpdate.controller";


interface Params {
    assetMapper: IAssetMapper;
    kraken: IKraken;
    coinGecko: ICoinGecko;
    stateStore: IStateStore;
}

export function initTasks(params : Params) {
    const tasks = [
        createBuyTask({
            assetMapper: params.assetMapper,
            coinGecko: params.coinGecko,
            kraken: params.kraken,
            stateStore: params.stateStore
        }),
        createMappingUpdateTask({
            assetMapper: params.assetMapper
        })
    ];

    tasks.forEach((task)  => {
        new Scheduler({ task }).start();
    });
}
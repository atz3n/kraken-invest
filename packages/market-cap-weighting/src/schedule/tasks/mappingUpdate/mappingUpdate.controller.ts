import { IAssetMapper } from "../../../lib/AssetMapper";
import { EnvVars } from "../../../lib/EnvVars";
import { createTask, Task } from "../../taskFactory";
import { MappingUpdateService } from "./mappingUpdate.service";


interface Params {
    assetMapper: IAssetMapper;
}

export function createMappingUpdateTask(params: Params): Task {
    return createTask({
        cronSchedule: EnvVars.CRON_UPDATE_MAPPING_SCHEDULE,
        services: [
            new MappingUpdateService({
                assetMapper: params.assetMapper
            })
        ]
    });
}
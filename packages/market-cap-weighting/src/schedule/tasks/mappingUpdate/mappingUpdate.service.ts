import { IAssetMapper } from "../../../lib/AssetMapper";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    assetMapper: IAssetMapper;
}

export class MappingUpdateService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        await this.options.assetMapper.updateMapping();
    }
}
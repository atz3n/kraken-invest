import { AssetMapping, IAssetMapper } from "../../src/lib/IAssetMapper";


export interface Options {
    updateMappingCb?: () => Promise<AssetMapping[]>;
    getMappingCb?: (id: string) => AssetMapping;
}

export class AssetMapperMock implements IAssetMapper {
    constructor(readonly options: Options) {}


    public async updateMapping(): Promise<AssetMapping[]> {
        if (this.options.updateMappingCb) {
            return this.options.updateMappingCb();
        }
        return [];
    }


    public getMapping(id: string): AssetMapping {
        if (this.options.getMappingCb) {
            return this.options.getMappingCb(id);
        }
        return <AssetMapping> {};
    }
}
export interface AssetMapping {
    krakenId: string;
    coinGeckoId: string;
}


export interface IAssetMapper {
    updateMapping(): Promise<AssetMapping[]>;
    getMapping(id: string): AssetMapping
}
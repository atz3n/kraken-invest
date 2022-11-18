import axios from "axios";
import { readFileSync } from "fs";


interface AssetMapperOptions {
    resourceType: "file" | "http";
    location: string;
}

export interface AssetMapping {
    krakenId: string;
    coinGeckoId: string;
}


export interface IAssetMapper {
    updateMapping(): Promise<AssetMapping[]>;
    getMapping(id: string): AssetMapping
}


export class AssetMapper {
    private mappings: AssetMapping[] = [];


    constructor(private readonly options: AssetMapperOptions) {}


    public async updateMapping(): Promise<AssetMapping[]> {
        switch (this.options.resourceType) {
            case "file": {
                try {
                    const data = readFileSync(this.options.location).toString();
                    this.mappings = JSON.parse(data);
                    this.checkMapping(this.mappings);
                    return this.mappings;
                } catch (error) {
                    throw new Error("Couldn't read asset mapping file");
                }
            }
            case "http": {
                try {
                    const response = await axios.get(this.options.location);
                    const { data } = response;
                    this.mappings = JSON.parse(data);
                    this.checkMapping(this.mappings);
                    return this.mappings;
                } catch (error) {
                    throw new Error("Couldn't fetch asset mapping");
                }
            }
            default: {
                throw new Error("Invalid asset mapping configuration");
            }
        }
    }

    private checkMapping(mappings: AssetMapping[]): void {
        if (!Array.isArray(mappings)) {
            throw new Error();
        }
        for (let i = 0 ; i < mappings.length ; i++) {
            if (!mappings[i].coinGeckoId || !mappings[i].krakenId) {
                throw new Error();
            }
        }
    }


    public getMapping(id: string): AssetMapping {
        const mapping = this.mappings.find(mapping => mapping.coinGeckoId === id || mapping.krakenId === id);
        if (!mapping) {
            throw new Error("Mapping not found");
        }
        return mapping;
    }
}
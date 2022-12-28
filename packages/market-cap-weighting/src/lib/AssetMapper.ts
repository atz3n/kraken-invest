import axios from "axios";
import { readFileSync } from "fs";
import { AssetMapping, IAssetMapper } from "./IAssetMapper";


interface AssetMapperOptions {
    uri: string;
}


export class AssetMapper implements IAssetMapper {
    private mappings: AssetMapping[] = [];


    constructor(private readonly options: AssetMapperOptions) {}


    public async updateMapping(): Promise<AssetMapping[]> {
        const { type, path } = this.splitUri(this.options.uri);

        if (type === "file") {
            try {
                const data = readFileSync(path).toString();
                this.mappings = JSON.parse(data);
                this.checkMapping(this.mappings);

                return this.mappings;
            } catch (error) {
                throw new Error("Couldn't read asset mapping file");
            }
        }

        if (type === "http" || type === "https") {
            try {
                const response = await axios.get(this.options.uri);
                this.mappings = response.data;
                this.checkMapping(this.mappings);

                return this.mappings;
            } catch (error) {
                throw new Error("Couldn't fetch asset mapping");
            }
        }

        throw new Error("Invalid asset mapping configuration");
    }

    private splitUri(uri: string): {type: string, path: string} {
        const type = uri.startsWith("file:/") ? "file"
                   : uri.startsWith("http://") ? "http"
                   : uri.startsWith("https://") ? "https"
                   : undefined;

        if (!type) {
            throw new Error("Invalid asset mapping configuration");
        }

        let path = uri.substring(type.length + 1);
        while (path.startsWith("/")) {
            path = path.substring(1);
        }

        return { type, path };
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
        console.log({ id });
        const mapping = this.mappings.find(mapping => mapping.coinGeckoId === id || mapping.krakenId === id);
        if (!mapping) {
            throw new Error("Mapping not found");
        }
        return mapping;
    }
}
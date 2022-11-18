import { IAssetMapper } from "../../../lib/AssetMapper";
import { ICoinGecko } from "../../../lib/CoinGecko";
import { Ratio } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    baseSymbols: string[];
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
    ratiosCb: (ratios: Ratio[]) => Promise<void> | void;
}

export class RatiosCalculatorService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const mappings = this.options.baseSymbols.map((baseSymbol) => {
            return this.options.assetMapper.getMapping(baseSymbol);
        });
        const coinGeckoIds = mappings.map(mapping => mapping.coinGeckoId);
        const marketCaps = await this.options.coinGecko.getMarketCaps(coinGeckoIds);
        const assetCaps = marketCaps.map((marketCap) => {
            const [mapping] = mappings.filter(mapping => mapping.coinGeckoId === marketCap.id);
            return {
                coinGeckoId: mapping.coinGeckoId,
                baseSymbol: mapping.krakenId,
                cap: marketCap.cap
            };
        });

        let sum = 0;
        assetCaps.forEach(coin => sum += coin.cap);

        const ratios: Ratio[] = [];
        assetCaps.forEach((coin) => {
            const ratio = coin.cap / sum;
            ratios.push({ ...coin, ...{ ratio } });
        });

        await this.options.ratiosCb(ratios);
    }
}

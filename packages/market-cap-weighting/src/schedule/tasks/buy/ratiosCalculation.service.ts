import { IAssetMapper } from "../../../lib/IAssetMapper";
import { ICoinGecko } from "../../../lib/ICoinGecko";
import { Ratio } from "../../../types";
import { TaskService, TaskServiceParams } from "../../taskFactory";


interface Options {
    baseAssets: {symbol: string, weight: number}[];
    assetMapper: IAssetMapper;
    coinGecko: ICoinGecko;
    ratiosCb: (ratios: Ratio[]) => Promise<void> | void;
}

export class RatiosCalculationService implements TaskService {
    constructor(private readonly options: Options) {}


    public async run(params: TaskServiceParams): Promise<void> {
        const mappings = this.options.baseAssets.map((baseAsset) => {
            return this.options.assetMapper.getMapping(baseAsset.symbol);
        });
        const coinGeckoIds = mappings.map(mapping => mapping.coinGeckoId);
        const marketCaps = await this.options.coinGecko.getMarketCaps(coinGeckoIds);
        const assetCaps = marketCaps.map((marketCap) => {
            const [ mapping ] = mappings.filter(mapping => mapping.coinGeckoId === marketCap.id);
            const [ baseAsset ] = this.options.baseAssets.filter(asset => asset.symbol === mapping.krakenId);
            return {
                coinGeckoId: mapping.coinGeckoId,
                baseSymbol: mapping.krakenId,
                cap: marketCap.cap,
                weight: baseAsset.weight
            };
        });

        let sum = 0;
        assetCaps.forEach(coin => sum += coin.weight * coin.cap);

        const ratios: Ratio[] = [];
        assetCaps.forEach((coin) => {
            const ratio = (coin.weight * coin.cap) / sum;
            ratios.push({ ...coin, ...{ ratio } });
        });

        await this.options.ratiosCb(ratios);
    }
}

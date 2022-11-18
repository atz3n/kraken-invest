import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD, logger } from "@atz3n/kraken-invest-lib";
import { IAssetMapper } from "../lib/AssetMapper";
import { ICoinGecko } from "../lib/CoinGecko";


interface BuyParams {
    kraken: IKraken;
    coinGecko: ICoinGecko;
    assetMapper: IAssetMapper;
    quoteSymbol: string;
    quoteInvestingAmount: number;
    baseSymbols: string[];
    volumeDecimals: number;
}

interface Trade {
    pair: string;
    volume: string;
}

export async function buy(params: BuyParams): Promise<Trade[]> {
    const { kraken, coinGecko, assetMapper, quoteSymbol, quoteInvestingAmount, baseSymbols, volumeDecimals } = params;

    await checkFunds(kraken, quoteSymbol, quoteInvestingAmount);
    const ratios = await getRatios(baseSymbols, assetMapper, coinGecko);

    const trades: Trade[] = [];
    for (let i = 0 ; i < ratios.length ; i++) {
        const baseSymbol = baseSymbols[i];
        const pair = `${baseSymbol}${quoteSymbol}`;

        const investingAmount = ratios[i].ratio * quoteInvestingAmount;
        const volume = await getVolume(kraken, pair, investingAmount, volumeDecimals);
        const orderId = await setOrder(kraken, pair, volume);

        logger.info(`Set order ${orderId} to buy ${volume} ${baseSymbol} with ${quoteSymbol}`);
        trades.push({
            pair,
            volume
        });
    }
    return trades;
}

async function checkFunds(kraken: IKraken, quoteSymbol: string, quoteInvestingAmount: number): Promise<void> {
    const balances = await kraken.request<{ result: never }>(KRAKEN_PRIVATE_METHOD.Balance);
    if (balances.result[quoteSymbol] <= quoteInvestingAmount) {
        throw new Error("Not enough funds");
    }
}

async function getRatios(
    baseSymbols: string[],
    assetMapper: IAssetMapper,
    coinGecko: ICoinGecko
): Promise<{id: string, cap: number, ratio: number}[]> {
    const ids = baseSymbols.map(baseSymbol => assetMapper.getMapping(baseSymbol).coinGeckoId);
    const coins = await coinGecko.getMarketCaps(ids);

    let sum = 0;
    coins.forEach(coin => sum += coin.cap);

    const ratios: {id: string, cap: number, ratio: number}[] = [];
    coins.forEach((coin) => {
        const ratio = coin.cap / sum;
        ratios.push({ ...coin, ...{ ratio } });
    });

    return ratios;
}

async function getVolume(
    kraken: IKraken,
    pair: string,
    investingAmount: number,
    volumeDecimals: number
): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const price = await kraken.request<{ result: any }>(KRAKEN_PUBLIC_METHOD.Ticker, { pair });
    const askPrice = price.result[pair].a[0];
    return (investingAmount / askPrice).toFixed(volumeDecimals);
}

async function setOrder(kraken: IKraken, pair: string, volume: string): Promise<string> {
    const order = await kraken.request<{ result: { txid: string[] }}>(KRAKEN_PRIVATE_METHOD.AddOrder, {
        ordertype: "market",
        type: "buy",
        pair,
        volume
    });
    return order.result.txid[0];
}
import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD, logger } from "@atz3n/kraken-invest-lib";


interface BuyParams {
    kraken: IKraken;
    quoteSymbol: string;
    quoteInvestingAmount: number;
    baseSymbol: string;
    volumeDecimals: number;
}

export async function buy(params: BuyParams): Promise<number> {
    const { kraken, quoteSymbol, quoteInvestingAmount, baseSymbol, volumeDecimals } = params;

    const balances = await kraken.request<{ result: never }>(KRAKEN_PRIVATE_METHOD.Balance);
    if (balances.result[quoteSymbol] <= quoteInvestingAmount) {
        throw new Error("Not enough funds");
    }

    const pair = `${baseSymbol}${quoteSymbol}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const price = await kraken.request<{ result: any }>(KRAKEN_PUBLIC_METHOD.Ticker, { pair });
    const askPrice = price.result[pair].a[0];
    const volume = (quoteInvestingAmount / askPrice).toFixed(volumeDecimals);

    const order = await kraken.request<{ result: { txid: string[] }}>(KRAKEN_PRIVATE_METHOD.AddOrder, {
        ordertype: "market",
        type: "buy",
        pair,
        volume
    });

    // eslint-disable-next-line max-len
    logger.info(`Set order ${order.result.txid[0]} to buy ${volume} ${baseSymbol} with ${quoteSymbol}`);

    return Number(volume);
}
import { config } from "../../../../../test/config";
import { fail } from "../../../../../test/helpers";
import { AssetMapperMock } from "../../../../../test/mocks/AssetMapperMock";
import { CoinGeckoMock } from "../../../../../test/mocks/CoinGeckoMock";
import { AssetMapping } from "../../../../lib/IAssetMapper";
import { MarketCaps } from "../../../../lib/ICoinGecko";
import { TaskServiceParams } from "../../../taskFactory";
import { RatiosCalculationService } from "../ratiosCalculation.service";


if (!config.skipTests.includes("ratiosCalculation")) {
    it("should calculate the ratios", async () => {
        let callTracker = "";
        const service = new RatiosCalculationService({
            baseAssets: [
                { symbol: "BTC",weight: 0.5 },
                { symbol: "ETH",weight: 1 },
                { symbol: "LTC",weight: 2 },
            ],
            assetMapper: new AssetMapperMock({
                getMappingCb: (id) => {
                    callTracker += "getMappingCb ";

                    if (id === "BTC") {
                        return {
                            krakenId: id,
                            coinGeckoId: "Bitcoin"
                        };
                    }
                    if (id === "ETH") {
                        return {
                            krakenId: id,
                            coinGeckoId: "Ethereum"
                        };
                    }
                    if (id === "LTC") {
                        return {
                            krakenId: id,
                            coinGeckoId: "Litecoin"
                        };
                    }

                    fail("should not reach here");
                    return <AssetMapping> {};
                }
            }),
            coinGecko: new CoinGeckoMock({
                getMarketCapsCb: async (assetIds) => {
                    callTracker += "getMarketCapsCb ";
                    expect(assetIds.length).toEqual(3);

                    const marketCaps: MarketCaps[] = [];
                    assetIds.forEach((assetId) => {
                        if (assetId === "Bitcoin") {
                            marketCaps.push({
                                id: assetId,
                                cap: 140
                            });
                        }
                        if (assetId === "Ethereum") {
                            marketCaps.push({
                                id: assetId,
                                cap: 20
                            });
                        }
                        if (assetId === "Litecoin") {
                            marketCaps.push({
                                id: assetId,
                                cap: 5
                            });
                        }
                    });

                    expect(marketCaps.length).toEqual(3);
                    return marketCaps;
                }
            }),
            ratiosCb: (ratios) => {
                callTracker += "ratiosCb ";
                expect(ratios.length).toEqual(3);

                for (let i = 0 ; i < ratios.length ; i++) {
                    const ratio = ratios[i];
                    if (ratio.coinGeckoId === "Bitcoin") {
                        expect(ratio.baseSymbol).toEqual("BTC");
                        expect(ratio.cap).toEqual(140);
                        expect(ratio.ratio).toEqual(0.7);
                        continue;
                    }
                    if (ratio.coinGeckoId === "Ethereum") {
                        expect(ratio.baseSymbol).toEqual("ETH");
                        expect(ratio.cap).toEqual(20);
                        expect(ratio.ratio).toEqual(0.2);
                        continue;
                    }
                    if (ratio.coinGeckoId === "Litecoin") {
                        expect(ratio.baseSymbol).toEqual("LTC");
                        expect(ratio.cap).toEqual(5);
                        expect(ratio.ratio).toEqual(0.1);
                        continue;
                    }

                    fail("should not reach here");
                }
            }
        });

        await service.run(<TaskServiceParams> {});
        expect(callTracker.trim()).toEqual("getMappingCb getMappingCb getMappingCb getMarketCapsCb ratiosCb");
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
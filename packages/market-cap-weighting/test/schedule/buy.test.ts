import { KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";
import { ScheduledTask } from "node-cron";
import { EnvVars } from "../../src/lib/EnvVars";
import { AssetMapping } from "../../src/lib/IAssetMapper";
import { MarketCaps } from "../../src/lib/ICoinGecko";
import { createBuyTask } from "../../src/schedule/tasks/buy/buy.controller";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { config } from "../config";
import { fail, notCalled } from "../helpers";
import { AssetMapperMock } from "../mocks/AssetMapperMock";
import { CoinGeckoMock } from "../mocks/CoinGeckoMock";
import { KrakenMock } from "../mocks/KrakenMock";
import { SchedulerMock } from "../mocks/SchedulerMock";


let callTracker = "";
if (!config.skipTests.includes("buy")) {
    it("should buy assets", async () => {
        const stateStore = new StateStoreInMemory();
        stateStore.store.push({
            counter: 0,
            cumVolumes: [
                {
                    symbol: "BTC",
                    volume: 7,
                },
                {
                    symbol: "ETH",
                    volume: 2,
                },
                {
                    symbol: "LTC",
                    volume: 1,
                }
            ]
        });

        const buyTask = createBuyTask({
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    if (method === KRAKEN_PRIVATE_METHOD.Balance) {
                        callTracker += "requestCbBalance ";
                        return getBalance();
                    }
                    if (method === KRAKEN_PUBLIC_METHOD.Ticker) {
                        callTracker += "requestCbTicker ";
                        return getTicker(params);
                    }
                    if (method === KRAKEN_PUBLIC_METHOD.AssetPairs) {
                        callTracker += "requestCbAssetPairs ";
                        return getMinimumVolume(params);
                    }
                    if (method === KRAKEN_PRIVATE_METHOD.AddOrder) {
                        callTracker += "requestCbAddOrder ";
                        expect(params?.ordertype).toEqual("market");
                        expect(params?.type).toEqual("buy");
                        expect(params?.volume).toEqual("1");
                        return addOrder(params);
                    }
                    fail("should not reach here");
                }
            }),
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
                getMarketCapsCb: async (assetIds: string[]) => {
                    callTracker += "getMarketCapsCb ";
                    expect(assetIds.length).toEqual(3);

                    const marketCaps: MarketCaps[] = [];
                    assetIds.forEach((assetId) => {
                        if (assetId === "Bitcoin") {
                            marketCaps.push({
                                id: assetId,
                                cap: 70
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
                                cap: 10
                            });
                        }
                    });

                    expect(marketCaps.length).toEqual(3);
                    return marketCaps;
                }
            }),
            stateStore,
            withdrawalScheduler: new SchedulerMock({
                startCb: notCalled,
                stopCb: notCalled,
                getTaskCb: () => {
                    return {
                        start: async () => {
                            callTracker += "schedulerTaskStart ";
                        },
                        cronSchedule: "dummy"
                    };
                }
            })
        });

        await buyTask.start(<ScheduledTask> {});
        expect(buyTask.cronSchedule).toEqual(EnvVars.CRON_BUY_SCHEDULE);

        let calls = "";
        calls += "requestCbBalance ";
        calls += "getMappingCb getMappingCb getMappingCb ";
        calls += "getMarketCapsCb ";
        calls += "requestCbTicker requestCbAssetPairs requestCbAddOrder ";
        calls += "requestCbTicker requestCbAssetPairs requestCbAddOrder ";
        calls += "requestCbTicker requestCbAssetPairs ";
        expect(callTracker.trim()).toEqual(calls.trim());

        expect(stateStore.store[0].counter).toEqual(0);
        expect(stateStore.store[0].cumVolumes.length).toEqual(3);
        expect(stateStore.store[0].cumVolumes[0].symbol).toEqual("BTC");
        expect(stateStore.store[0].cumVolumes[0].volume).toEqual(8);
        expect(stateStore.store[0].cumVolumes[1].symbol).toEqual("ETH");
        expect(stateStore.store[0].cumVolumes[1].volume).toEqual(3);
        expect(stateStore.store[0].cumVolumes[2].symbol).toEqual("LTC");
        expect(stateStore.store[0].cumVolumes[2].volume).toEqual(1);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}

function getBalance() {
    return {
        result: {
            EUR: 101
        }
    };
}

function getTicker(params?: Record<string, string>) {
    if (params?.pair === "BTCEUR") {
        return {
            result: {
                "BTC/EUR": {
                    a: [
                        70
                    ]
                }
            }
        };
    }
    if (params?.pair === "ETHEUR") {
        return {
            result: {
                "ETH/EUR": {
                    a: [
                        20
                    ]
                }
            }
        };
    }
    if (params?.pair === "LTCEUR") {
        return {
            result: {
                "LTC/EUR": {
                    a: [
                        10
                    ]
                }
            }
        };
    }
    fail("should not reach here");
}

function getMinimumVolume(params?: Record<string, string>) {
    if (params?.pair === "BTCEUR") {
        return <never> {
            result: {
                "BTC/EUR": {
                    ordermin: "0.0001"
                }
            }
        };
    }
    if (params?.pair === "ETHEUR") {
        return <never> {
            result: {
                "ETH/EUR": {
                    ordermin: "0.0001"
                }
            }
        };
    }
    if (params?.pair === "LTCEUR") {
        return <never> {
            result: {
                "LTC/EUR": {
                    ordermin: "10"
                }
            }
        };
    }
}

function addOrder(params?: Record<string, string>) {
    if (params?.pair === "BTCEUR") {
        return <never> {
            result: {
                txid: [
                    "BTCEUR"
                ]
            }
        };
    }
    if (params?.pair === "ETHEUR") {
        return <never> {
            result: {
                txid: [
                    "ETHEUR"
                ]
            }
        };
    }
}
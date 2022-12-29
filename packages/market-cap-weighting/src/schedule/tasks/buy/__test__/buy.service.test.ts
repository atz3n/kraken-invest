import { KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";
import { config } from "../../../../../test/config";
import { fail, notCalled } from "../../../../../test/helpers";
import { KrakenMock } from "../../../../../test/mocks/KrakenMock";
import { TaskServiceParams } from "../../../taskFactory";
import { BuyService } from "../buy.service";


if (!config.skipTests.includes("baseBuy")) {
    it("should buy the assets", async () => {
        let callTracker = "";
        const service = new BuyService({
            volumeDecimals: 2,
            orderRequests: [
                {
                    baseSymbol: "BTC",
                    quoteAmount: 70,
                    quoteSymbol: "EUR"

                },
                {
                    baseSymbol: "ETH",
                    quoteAmount: 20,
                    quoteSymbol: "EUR"

                },
                {
                    baseSymbol: "LTC",
                    quoteAmount: 10,
                    quoteSymbol: "EUR"

                }
            ],
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    if (method === KRAKEN_PUBLIC_METHOD.Ticker) {
                        callTracker += "requestCbTicker ";
                        if (params?.pair === "BTCEUR") {
                            return <never> {
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
                            return <never> {
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
                            return <never> {
                                result: {
                                    "LTC/EUR": {
                                        a: [
                                            10
                                        ]
                                    }
                                }
                            };
                        }
                    }
                    if (method === KRAKEN_PUBLIC_METHOD.AssetPairs) {
                        callTracker += "requestCbAssetPairs ";
                        expect(params?.assetVersion === "1");

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
                                        ordermin: "0.0001"
                                    }
                                }
                            };
                        }
                    }
                    if (method === KRAKEN_PRIVATE_METHOD.AddOrder) {
                        callTracker += "requestCbAddOrder ";
                        expect(params?.assetVersion === "1");

                        if (params?.pair === "BTCEUR") {
                            expect(params?.ordertype).toEqual("market");
                            expect(params?.type).toEqual("buy");
                            expect(params?.volume).toEqual("1");
                            return <never> {
                                result: {
                                    txid: [
                                        "BTCEUR"
                                    ]
                                }
                            };
                        }
                        if (params?.pair === "ETHEUR") {
                            expect(params?.ordertype).toEqual("market");
                            expect(params?.type).toEqual("buy");
                            expect(params?.volume).toEqual("1");
                            return <never> {
                                result: {
                                    txid: [
                                        "ETHEUR"
                                    ]
                                }
                            };
                        }
                        if (params?.pair === "LTCEUR") {
                            expect(params?.ordertype).toEqual("market");
                            expect(params?.type).toEqual("buy");
                            expect(params?.volume).toEqual("1");
                            return <never> {
                                result: {
                                    txid: [
                                        "LTCEUR"
                                    ]
                                }
                            };
                        }
                    }
                    fail("should not reach here");
                }
            }),
            minVolumeCb: notCalled,
            buyCb: (orderId, volume, baseSymbol, quoteAmount, quoteSymbol) => {
                callTracker += "buyCb ";
                if (baseSymbol === "BTC") {
                    expect(orderId).toEqual("BTCEUR");
                    expect(volume).toEqual(1);
                    expect(quoteAmount).toEqual(70);
                    expect(quoteSymbol).toEqual("EUR");
                    return;
                }
                if (baseSymbol === "ETH") {
                    expect(orderId).toEqual("ETHEUR");
                    expect(volume).toEqual(1);
                    expect(quoteAmount).toEqual(20);
                    expect(quoteSymbol).toEqual("EUR");
                    return;
                }
                if (baseSymbol === "LTC") {
                    expect(orderId).toEqual("LTCEUR");
                    expect(volume).toEqual(1);
                    expect(quoteAmount).toEqual(10);
                    expect(quoteSymbol).toEqual("EUR");
                    return;
                }
                fail("should not reach here");
            },
            boughtCb: (orders) => {
                callTracker += "boughtCb";
                for (let i = 0 ; i < orders.length ; i++) {
                    const order = orders[i];
                    if (order.baseSymbol === "BTC") {
                        expect(order.orderId).toEqual("BTCEUR");
                        expect(order.volume).toEqual(1);
                        expect(order.quoteSymbol).toEqual("EUR");
                        continue;
                    }
                    if (order.baseSymbol === "ETH") {
                        expect(order.orderId).toEqual("ETHEUR");
                        expect(order.volume).toEqual(1);
                        expect(order.quoteSymbol).toEqual("EUR");
                        continue;
                    }
                    if (order.baseSymbol === "LTC") {
                        expect(order.orderId).toEqual("LTCEUR");
                        expect(order.volume).toEqual(1);
                        expect(order.quoteSymbol).toEqual("EUR");
                        continue;
                    }
                    fail("should not reach here");
                }
            }
        });

        await service.run(<TaskServiceParams> {});

        let calls = "";
        calls += "requestCbTicker requestCbAssetPairs requestCbAddOrder buyCb ";
        calls += "requestCbTicker requestCbAssetPairs requestCbAddOrder buyCb ";
        calls += "requestCbTicker requestCbAssetPairs requestCbAddOrder buyCb ";
        calls += "boughtCb";
        expect(callTracker.trim()).toEqual(calls);
    });


    it("should not buy because of too low volume", async () => {
        let callTracker = "";
        const service = new BuyService({
            volumeDecimals: 2,
            orderRequests: [
                {
                    baseSymbol: "BTC",
                    quoteAmount: 70,
                    quoteSymbol: "EUR"

                },
                {
                    baseSymbol: "ETH",
                    quoteAmount: 20,
                    quoteSymbol: "EUR"

                },
                {
                    baseSymbol: "LTC",
                    quoteAmount: 10,
                    quoteSymbol: "EUR"

                }
            ],
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    if (method === KRAKEN_PUBLIC_METHOD.Ticker) {
                        callTracker += "requestCbTicker ";
                        if (params?.pair === "BTCEUR") {
                            return <never> {
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
                            return <never> {
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
                            return <never> {
                                result: {
                                    "LTC/EUR": {
                                        a: [
                                            10
                                        ]
                                    }
                                }
                            };
                        }
                    }
                    if (method === KRAKEN_PUBLIC_METHOD.AssetPairs) {
                        callTracker += "requestCbAssetPairs ";
                        expect(params?.assetVersion === "1");

                        if (params?.pair === "BTCEUR") {
                            return <never> {
                                result: {
                                    "BTC/EUR": {
                                        ordermin: "10"
                                    }
                                }
                            };
                        }
                        if (params?.pair === "ETHEUR") {
                            return <never> {
                                result: {
                                    "ETH/EUR": {
                                        ordermin: "10"
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

                    fail("should not reach here");
                }
            }),
            minVolumeCb: (baseSymbol, volume, minVolume) => {
                callTracker += "minVolumeCb ";
                if (baseSymbol === "BTC" || baseSymbol === "ETH" || baseSymbol === "LTC") {
                    expect(volume).toEqual(1);
                    expect(minVolume).toEqual(10);
                    return;
                }
                fail("should not reach here");
            },
            buyCb: notCalled,
            boughtCb: (orders) => {
                callTracker += "boughtCb";
                expect(orders.length).toEqual(0);
            }
        });

        await service.run(<TaskServiceParams> {});

        let calls = "";
        calls += "requestCbTicker requestCbAssetPairs minVolumeCb ";
        calls += "requestCbTicker requestCbAssetPairs minVolumeCb ";
        calls += "requestCbTicker requestCbAssetPairs minVolumeCb ";
        calls += "boughtCb";
        expect(callTracker.trim()).toEqual(calls);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
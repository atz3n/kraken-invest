import { KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-lib";
import { config } from "../../../../../test/config";
import { fail } from "../../../../../test/helpers";
import { KrakenMock } from "../../../../../test/mocks/KrakenMock";
import { TaskServiceParams } from "../../../taskFactory";
import { QuoteBuyService } from "../quoteBuy.service";


if (!config.skipTests.includes("quoteBuy")) {
    it("should buy the quote assets", async () => {
        let callTracker = "";
        const service = new QuoteBuyService({
            volumeDecimals: 2,
            quoteOrderRequests: [
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
                                    BTCEUR: {
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
                                    ETHEUR: {
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
                                    LTCEUR: {
                                        a: [
                                            10
                                        ]
                                    }
                                }
                            };
                        }
                    }
                    if (method === KRAKEN_PRIVATE_METHOD.AddOrder) {
                        callTracker += "requestCbAddOrder ";
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
            buyCb: (orderId, volume, baseSymbol, quoteSymbol) => {
                callTracker += "buyCb ";
                if (baseSymbol === "BTC") {
                    expect(orderId).toEqual("BTCEUR");
                    expect(volume).toEqual(1);
                    expect(quoteSymbol).toEqual("EUR");
                    return;
                }
                if (baseSymbol === "ETH") {
                    expect(orderId).toEqual("ETHEUR");
                    expect(volume).toEqual(1);
                    expect(quoteSymbol).toEqual("EUR");
                    return;
                }
                if (baseSymbol === "LTC") {
                    expect(orderId).toEqual("LTCEUR");
                    expect(volume).toEqual(1);
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
        calls += "requestCbTicker requestCbAddOrder buyCb ";
        calls += "requestCbTicker requestCbAddOrder buyCb ";
        calls += "requestCbTicker requestCbAddOrder buyCb ";
        calls += "boughtCb";
        expect(callTracker.trim()).toEqual(calls);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
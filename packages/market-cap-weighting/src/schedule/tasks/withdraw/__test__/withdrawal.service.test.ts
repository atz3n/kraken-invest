import { KRAKEN_PRIVATE_METHOD } from "@atz3n/kraken-invest-common";
import { config } from "../../../../../test/config";
import { KrakenMock } from "../../../../../test/mocks/KrakenMock";
import { TaskServiceParams } from "../../../taskFactory";
import { WithdrawalService } from "../withdrawal.service";
import { fail } from "../../../../../test/helpers";


if (!config.skipTests.includes("withdrawal")) {
    it("should withdraw the assets", async () => {
        const BTC_ADDRESS = "My BTC withdraw address";
        const ETH_ADDRESS = "My ETH withdraw address";
        const LTC_ADDRESS = "My LTC withdraw address";

        let callTracker = "";
        const service = new WithdrawalService({
            baseAssets: [
                {
                    symbol: "BTC",
                    withdrawAddress: BTC_ADDRESS
                },
                {
                    symbol: "ETH",
                    withdrawAddress: ETH_ADDRESS
                },
                {
                    symbol: "LTC",
                    withdrawAddress: LTC_ADDRESS
                }
            ],
            getCumVolumes: () => {
                callTracker += "getCumVolumes ";
                return [
                    {
                        symbol: "BTC",
                        volume: 70
                    },
                    {
                        symbol: "ETH",
                        volume: 20
                    },
                    {
                        symbol: "LTC",
                        volume: 10
                    },
                ];
            },
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    if (method === KRAKEN_PRIVATE_METHOD.Balance) {
                        callTracker += "requestCbBalance ";
                        return {
                            result: {
                                BTC: 100,
                                ETH: 20,
                                LTC: 5
                            }
                        };
                    }

                    if (method === KRAKEN_PRIVATE_METHOD.Withdraw) {
                        callTracker += "requestCbWithdraw ";

                        if (params?.asset === "BTC") {
                            expect(params?.key).toEqual(BTC_ADDRESS);
                            expect(params?.amount).toEqual("70");
                            return {
                                result: {
                                    refid: "ref_BTC"
                                }
                            };
                        }
                        if (params?.asset === "ETH") {
                            expect(params?.key).toEqual(ETH_ADDRESS);
                            expect(params?.amount).toEqual("20");
                            return {
                                result: {
                                    refid: "ref_ETH"
                                }
                            };
                        }
                        if (params?.asset === "LTC") {
                            expect(params?.key).toEqual(LTC_ADDRESS);
                            expect(params?.amount).toEqual("5");
                            return {
                                result: {
                                    refid: "ref_LTC"
                                }
                            };
                        }
                    }

                    fail("should not reach here");
                }
            }),
            withdrawCb: (withdrawId, volume, symbol) => {
                callTracker += "withdrawCb ";

                if (symbol === "BTC") {
                    expect(withdrawId).toEqual("ref_BTC");
                    expect(volume).toEqual(70);
                    return;
                }
                if (symbol === "ETH") {
                    expect(withdrawId).toEqual("ref_ETH");
                    expect(volume).toEqual(20);
                    return;
                }
                if (symbol === "LTC") {
                    expect(withdrawId).toEqual("ref_LTC");
                    expect(volume).toEqual(5);
                    return;
                }

                fail("should not reach here");
            },
            withdrewCb: (withdraws) => {
                callTracker += "withdrewCb ";
                expect(withdraws.length).toEqual(3);

                for (let i = 0 ; i < withdraws.length ; i++) {
                    const withdraw = withdraws[i];

                    if (withdraw.symbol === "BTC") {
                        expect(withdraw.withdrawId).toEqual("ref_BTC");
                        expect(withdraw.volume).toEqual(70);
                        continue;
                    }
                    if (withdraw.symbol === "ETH") {
                        expect(withdraw.withdrawId).toEqual("ref_ETH");
                        expect(withdraw.volume).toEqual(20);
                        continue;
                    }
                    if (withdraw.symbol === "LTC") {
                        expect(withdraw.withdrawId).toEqual("ref_LTC");
                        expect(withdraw.volume).toEqual(5);
                        continue;
                    }

                    fail("should not reach here");
                }
            }
        });

        await service.run(<TaskServiceParams> {});

        let calls = "";
        calls += "getCumVolumes ";
        calls += "requestCbBalance requestCbWithdraw withdrawCb ";
        calls += "requestCbBalance requestCbWithdraw withdrawCb ";
        calls += "requestCbBalance requestCbWithdraw withdrawCb ";
        calls += "withdrewCb";
        expect(callTracker.trim()).toEqual(calls);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
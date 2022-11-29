import { KRAKEN_PRIVATE_METHOD } from "@atz3n/kraken-invest-lib";
import { config } from "../../../../../test/config";
import { KrakenMock } from "../../../../../test/mocks/KrakenMock";
import { TaskServiceParams } from "../../../taskFactory";
import { FundsCheckService } from "../fundsCheck.service";


if (!config.skipTests.includes("fundsCheck")) {
    it("should pass if balance is greater than investing amount", async () => {
        let callTracker = "";
        const service = new FundsCheckService({
            quoteInvestingAmount: 100,
            quoteSymbol: "BTC",
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    callTracker += "requestCb";
                    expect(method).toEqual(KRAKEN_PRIVATE_METHOD.Balance);
                    return <never> {
                        result: {
                            BTC: 101
                        }
                    };
                }
            })
        });

        await service.run(<TaskServiceParams> {});
        expect(callTracker).toEqual("requestCb");
    });


    it("should throw if balance is less than investing amount", async () => {
        const service = new FundsCheckService({
            quoteInvestingAmount: 100,
            quoteSymbol: "BTC",
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    expect(method).toEqual(KRAKEN_PRIVATE_METHOD.Balance);
                    return <never> {
                        result: {
                            BTC: 99
                        }
                    };
                }
            })
        });

        try {
            await service.run(<TaskServiceParams> {});
            fail("should not reach here");
        } catch (error) {
            expect((<Error> error).message).toEqual("Not enough funds");
        }
    });


    it("should throw if balance is equal to investing amount", async () => {
        const service = new FundsCheckService({
            quoteInvestingAmount: 100,
            quoteSymbol: "BTC",
            kraken: new KrakenMock({
                requestCb: async (method, params) => {
                    expect(method).toEqual(KRAKEN_PRIVATE_METHOD.Balance);
                    return <never> {
                        result: {
                            BTC: 100
                        }
                    };
                }
            })
        });

        try {
            await service.run(<TaskServiceParams> {});
            fail("should not reach here");
        } catch (error) {
            expect((<Error> error).message).toEqual("Not enough funds");
        }
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
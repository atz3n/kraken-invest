import { IKraken, PRIVATE_METHOD, PUBLIC_METHOD } from "../../src/lib/Kraken";
import { buy } from "../../src/utils/trading";
import { config } from "../config";


// mock kraken lib
let stepCounter = 1;
class KrakenMock implements IKraken {
    request<T>(method: PRIVATE_METHOD | PUBLIC_METHOD, params?: Record<string, string> | undefined): Promise<T> {
        try {
            // 1. check balance of quote asset
            if (stepCounter === 1 && method === PRIVATE_METHOD.Balance) {
                stepCounter++;

                return <Promise<T>> <unknown> {
                    result: {
                        ZEUR: 100
                    }
                };
            // 2. get price
            } else if (stepCounter === 2 && method === PUBLIC_METHOD.Ticker) {
                stepCounter++;
                expect(params?.pair).toEqual("XXBTZEUR");

                return <Promise<T>> <unknown> {
                    result: {
                        XXBTZEUR: {
                            a: [ 5 ]
                        }
                    }
                };
            // 3. set order
            } else if (stepCounter === 3 && method === PRIVATE_METHOD.AddOrder) {
                expect(params?.ordertype).toEqual("market");
                expect(params?.type).toEqual("buy");
                expect(params?.pair).toEqual("XXBTZEUR");
                expect(params?.volume).toEqual("2.00000");

                return <Promise<T>> <unknown> {
                    result: {
                        txid: [ "someId" ]
                    }
                };
            } else {
                fail("Wrong step order");
            }
        } catch (error) {
            console.error((<Error> error).message);
            throw error;
        }
    }
}


if (!config.skipTests.includes("buy")) {
    beforeEach(async () => {
        stepCounter = 1;
    });

    it("should successfully perform a buy workflow", async () => {
        await buy(new KrakenMock());
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
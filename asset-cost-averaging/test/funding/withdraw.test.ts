import { IKraken, PRIVATE_METHOD, PUBLIC_METHOD } from "../../src/lib/Kraken";
import { withdraw } from "../../src/utils/funding";
import { config } from "../config";


// mock kraken lib
let stepCounter = 1;
let volumeAmountTest = false;
class KrakenMock implements IKraken {
    request<T>(method: PRIVATE_METHOD | PUBLIC_METHOD, params?: Record<string, string> | undefined): Promise<T> {
        try {
            // 1. check balance of base asset
            if (stepCounter === 1 && method === PRIVATE_METHOD.Balance) {
                stepCounter++;

                return <Promise<T>> <unknown> {
                    result: {
                        XXBT: 20
                    }
                };
            // 2. withdraw base asset
            } else if (stepCounter === 2 && method === PRIVATE_METHOD.Withdraw) {
                expect(params?.asset).toEqual("XXBT");
                expect(params?.key).toEqual("My awesome Wallet");
                expect(params?.amount).toEqual(volumeAmountTest ? "10" : "20");

                return <Promise<T>> <unknown> {
                    result: {
                        refid: "someId"
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


if (!config.skipTests.includes("withdraw")) {
    beforeEach(async () => {
        stepCounter = 1;
        volumeAmountTest = false;
    });

    it("should successfully withdraw the volume amount", async () => {
        volumeAmountTest = true;
        await withdraw(new KrakenMock(), 10);
    });


    it("should successfully withdraw the balance amount", async () => {
        await withdraw(new KrakenMock(), 30);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
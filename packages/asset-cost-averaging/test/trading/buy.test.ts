import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";
import { buyConditionally, initStateStore } from "../../src/helpers";
import { EnvVars } from "../../src/lib/EnvVars";
import { createStateStore } from "../../src/storage/state/stateStoreFactory";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { StorageType } from "../../src/storage/StorageType";
import { config } from "../config";


// mock kraken lib
let stepCounter = 1;
class KrakenMock implements IKraken {
    request<T>(
        method: KRAKEN_PRIVATE_METHOD | KRAKEN_PUBLIC_METHOD,
        params?: Record<string, string> | undefined
    ): Promise<T> {
        try {
            // 1. check balance of quote asset
            if (stepCounter === 1 && method === KRAKEN_PRIVATE_METHOD.Balance) {
                stepCounter++;

                return <Promise<T>> <unknown> {
                    result: {
                        ZEUR: 100
                    }
                };
            // 2. get price
            } else if (stepCounter === 2 && method === KRAKEN_PUBLIC_METHOD.Ticker) {
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
            } else if (stepCounter === 3 && method === KRAKEN_PRIVATE_METHOD.AddOrder) {
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
    let stateStore: StateStoreInMemory;

    beforeEach(async () => {
        stateStore = <StateStoreInMemory> createStateStore(StorageType.IN_MEMORY);
        await initStateStore(stateStore);
        stepCounter = 1;
        EnvVars.NUMBER_OF_BUYS = 0;
    });


    it("should successfully buy", async () => {
        await buyConditionally(new KrakenMock(), stateStore);

        expect(stateStore.store[0].volume).toEqual(2);
        expect(stateStore.store[0].counter).toEqual(1);
    });


    it("should not buy in case the counter exceeded the number of buys", async () => {
        EnvVars.NUMBER_OF_BUYS = 2;
        stateStore.store[0].counter = 3;
        await buyConditionally(new KrakenMock(), stateStore);

        expect(stepCounter).toEqual(1);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
import { initStateStore, withdrawConditionally } from "../../src/helpers";
import { IKraken, PRIVATE_METHOD, PUBLIC_METHOD } from "../../src/lib/Kraken";
import { createStateStore } from "../../src/storage/state/stateStoreFactory";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { StorageType } from "../../src/storage/StorageType";
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
    let stateStore: StateStoreInMemory;

    beforeEach(async () => {
        stateStore = <StateStoreInMemory> createStateStore(StorageType.IN_MEMORY);
        await initStateStore(stateStore);
        stepCounter = 1;
        volumeAmountTest = false;
    });


    it("should successfully withdraw the volume amount", async () => {
        volumeAmountTest = true;
        stateStore.store[0].volume = 10;
        await withdrawConditionally(new KrakenMock(), stateStore);

        expect(stateStore.store[0].volume).toEqual(0);
    });


    it("should successfully withdraw the balance amount", async () => {
        stateStore.store[0].volume = 30;
        await withdrawConditionally(new KrakenMock(), stateStore);

        expect(stateStore.store[0].volume).toEqual(0);
    });


    it("should not withdraw the balance amount in case the volume is 0", async () => {
        stateStore.store[0].volume = 0;
        await withdrawConditionally(new KrakenMock(), stateStore);

        expect(stepCounter).toEqual(1);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
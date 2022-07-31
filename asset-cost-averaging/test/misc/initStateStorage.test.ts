import { initStateStore } from "../../src/helpers";
import { EnvVars } from "../../src/lib/EnvVars";
import { createStateStore } from "../../src/storage/state/stateStoreFactory";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { StorageType } from "../../src/storage/StorageType";
import { config } from "../config";


if (!config.skipTests.includes("initStateStorage")) {
    it("should successfully initialize the state storage", async () => {
        const emptyStateStore = <StateStoreInMemory> createStateStore(StorageType.IN_MEMORY);
        const filledStateStore = <StateStoreInMemory> createStateStore(StorageType.IN_MEMORY);

        const pair = `${EnvVars.BASE_SYMBOL}${EnvVars.QUOTE_SYMBOL}`;
        const defaultState = {
            counter: 0,
            pair,
            schedule: EnvVars.CRON_BUY_SCHEDULE,
            volume: 0,
            id: StateStoreInMemory.ID
        };
        const dummyState = {
            counter: 1,
            pair,
            schedule: EnvVars.CRON_BUY_SCHEDULE,
            volume: 3,
            id: StateStoreInMemory.ID
        };
        (<StateStoreInMemory> filledStateStore).store.push(dummyState);

        await initStateStore(emptyStateStore);
        await initStateStore(filledStateStore);

        expect(emptyStateStore.store[0]).toEqual(defaultState);
        expect(filledStateStore.store[0]).toEqual(dummyState);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}
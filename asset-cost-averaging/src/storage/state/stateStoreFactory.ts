import { EnvVars } from "../../lib/EnvVars";
import { StorageType } from "../StorageType";
import { StateStoreInMemory } from "./StateStoreInMemory";
import { StateStoreMongoDB } from "./StateStoreMongoDB";
import { IStateStore } from "./IStateStore";


export function createStateStore(type: StorageType): IStateStore {
    switch (type) {
        case StorageType.IN_MEMORY: {
            return createInMemoryStore();
        }
        case StorageType.MONGO_DB: {
            return createMongoDbStore();
        }
        default: {
            return createInMemoryStore();
        }
    }
}

function createInMemoryStore(): IStateStore {
    return new StateStoreInMemory();
}

function createMongoDbStore(): IStateStore {
    return new StateStoreMongoDB({ mongoUrl: EnvVars.MONGO_DB_URL });
}
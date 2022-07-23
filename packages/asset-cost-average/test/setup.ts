import { DummyTransport, initLogger } from "../src/utils/logging";


initLogger({
    level: "all",
    transports: [
        new DummyTransport(),
        // new ConsoleTransport()
    ]
});
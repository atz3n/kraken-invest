import { ConsoleTransport, DummyTransport, initLogger } from "@atz3n/kraken-invest-common";


initLogger({
    level: "all",
    transports: [
        new DummyTransport(),
        // new ConsoleTransport()
    ]
});
import { DummyTransport, initLogger } from "@atz3n/kraken-invest-lib";


initLogger({
    level: "all",
    transports: [
        new DummyTransport(),
        // new ConsoleTransport()
    ]
});
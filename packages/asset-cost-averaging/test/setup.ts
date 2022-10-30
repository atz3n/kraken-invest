import { DummyTransport, initLogger } from "lib";


initLogger({
    level: "all",
    transports: [
        new DummyTransport(),
        // new ConsoleTransport()
    ]
});
import { PRIVATE_METHOD, PUBLIC_METHOD } from "./constants";
import { Kraken } from "./lib/Kraken";

const publicKey = "";
const privateKey = "";

async function main() {
    const kraken = new Kraken({
        apiPrivateKey: privateKey,
        apiPublicKey: publicKey
    });
    const resp = await kraken.request(PRIVATE_METHOD.Balance);
    // const resp = await kraken.request(PUBLIC_METHOD.Time);
    console.log(resp);
}

main();
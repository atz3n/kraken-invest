import axios from "axios";
import { readFileSync, writeFileSync } from "fs";
import path from "path";


interface Mapping {
    krakenId: string;
    coinGeckoId: string;
}


const MAPPING_FILE_PATH = path.join(__dirname, "../asset-mapping.json");
const COIN_GECKO_COIN_LIST_URL = "https://api.coingecko.com/api/v3/coins/list";


async function main() {
    const params = [...process.argv];
    params.shift();
    params.shift();

    if (params[0] === "-h") {
        console.log("== Coin Adder ==");
        console.log("params[0]: coin symbol");
        console.log("params[1]: coin gecko id");
        return;
    }

    const symbol = params[0].toUpperCase();
    const id = params[1];

    const mapping = <Mapping[]> JSON.parse(readFileSync(MAPPING_FILE_PATH).toString());
    if (!checkMapping(mapping, symbol)) {
        return;
    }

    if (!await checkCoin(symbol, id)) {
        return;
    }

    mapping.push({
        krakenId: symbol,
        coinGeckoId: id
    });

    writeFileSync(MAPPING_FILE_PATH, JSON.stringify(mapping, null, 4));
}

function checkMapping(mapping: Mapping[], symbol: string): boolean {
    const [ map ] = mapping.filter(_map => _map.krakenId === symbol);
    if (map) {
        console.error(`Mapping for symbol '${symbol}' already included`);
        return false;
    }
    return true;
}

async function checkCoin(symbol: string, id: string): Promise<boolean> {
    const { data } = await axios.get<{id: string, symbol: string, name: string}[]>(COIN_GECKO_COIN_LIST_URL);
    const [ coin ] = data.filter(_coin => _coin.symbol === symbol.toLowerCase() && _coin.id === id);
    if (!coin) {
        console.error(`No match for symbol '${symbol}' and coin gecko id '${id}' found`);
        return false;
    }
    return true;
}

main();
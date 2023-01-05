import axios from "axios";


const COIN_GECKO_COIN_LIST_URL = "https://api.coingecko.com/api/v3/coins/list";


async function main() {
    const params = [...process.argv];
    params.shift();
    params.shift();

    if (params[0] === "-h") {
        console.log("== Coin Finder ==");
        console.log("params[0]: coin symbol");
        return;
    }

    const symbol = params[0];
    const { data } = await axios.get<{id: string, symbol: string, name: string}[]>(COIN_GECKO_COIN_LIST_URL);
    const coins = data.filter(_coin => _coin.symbol === symbol.toLowerCase());
    console.log("Potential Coins:", JSON.stringify(coins, null, 2));
}

main();
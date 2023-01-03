# Tools

You can run the tools with:
```bash
npx ts-node <tool>
```

you must have node (v16 or later) and yarn installed. Before running the tools make sure to have the project initialized (`yarn` should've been called).


## Coin Mapping

To get a coins market cap, the coin gecko API is used. Unfortunately coin gecko provides multiple coins under the same coin symbol, so that a mapping between the kraken id and the coin gecko id is needed. The mapping file `../asset-mapping.json` contains these mappings. There are two tools to support you in adding new coins to the mapping file. The *Coin Finder* lets you find possible coin gecko ids for a coin symbol (which is also the kraken id) and the *Coin Adder* supports you in adding proper mapping into the mapping file.


### Coin Finder

```bash
# get help
npx ts-node coinFinder.ts -h
# == Coin Finder ==
# params[0]: coin symbol

# get mapping for a coin symbol
npx ts-node coinFinder.ts <coin symbol>

# Example for eth
npx ts-node coinFinder.ts eth
# Potential Coins: [
#   {
#     "id": "ethereum",
#     "symbol": "eth",
#     "name": "Ethereum"
#   },
#   {
#     "id": "ethereum-wormhole",
#     "symbol": "eth",
#     "name": "Ethereum (Wormhole)"
#   }
# ]
```


### Coin Adder

```bash
# get help
npx ts-node coinAdder.ts -h
# == Coin Adder ==
# params[0]: coin symbol
# params[1]: coin gecko id

# get mapping for a coin symbol
npx ts-node coinAdder.ts <coin symbol> <coin gecko id>

# Example for eth
npx ts-node coinAdder.ts eth ethereum
```
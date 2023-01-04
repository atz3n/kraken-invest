# Market Cap Weighting

The Market Cap Weighting Bot is an extended version of the [Asset Cost Averaging](../asset-cost-averaging/README.md) bot. It lets you buy multiple assets weighted by the market capitalization.


## General

The bot uses the same mechanisms and provides the same functionality as described in the [Asset Cost Averaging Section](../asset-cost-averaging/README.md#general). In addition to that, it lets you configure multiple buy assets where the investment amount $a$ for each asset is determined by the market capitalization ratio $r$ using the following formulas:

#### 1. $a_i$ = $r_i$ * $v$

#### 2. $r_i$ = $w_i$ * $c_i$ / $t$

#### 3. $t$ = $\sum_{i=1}^{n} w_i$ * $c_i$

$v$ is the configured investment amount, $w$ is an optional custom weighting factor for each asset (which is 1 by default), $c$ is the market capitalization of the asset and $t$ is the summed up total market capitalization.

For example, if we have three assets, BTC, ETH, and LTC, and an investment amount of $100, the bot will first reach out to the [CoinGecko](https://www.coingecko.com) API to determine the market capitalization $c$ of each asset. Let's say BTC has a market cap of $1000, ETH has a market cap of $400 and LTC a market cap of $200. The next step would be to calculate the total market capitalization using [Equation 3](#3-t--sum_i1n-w_i--c_i). In our case (assuming a weighting factor of 1):

$t$ = $1000 + $400 + $200 = $1600 

With $1600 as the total market capitalization and the help of [Equation 2](#2-r_i--w_i--c_i--t), the bot is now able to calculate the market cap ratio $r$ for each asset as follows:

$r_1$ = ($1000 / $1600) = 0.625 (BTC)

$r_2$ = ($400 / $1600) = 0.25 (ETH)

$r_3$ = ($200 / $1600) = 0.125 (LTC)

With $r$ and $v$ (and $w$ set to 1) in [Equation 1](#1-a_i--r_i--v), we get the asset investment amount $a$:

$a_1$ = 0.625 * $100 = $62.5 (BTC)

$a_2$ = 0.25 * $100 = $25 (ETH)

$a_3$ = 0.125 * $100 = $12.5 (LTC)


The weighting factor $w$ lets you adjust the asset investment amount. This is useful in configurations with high and low market cap assets or to favour certain assets over others.


## Adding Coin Mappings

To get the correct market cap of an asset, a mapping between CoinGeckos coin id and Krakens coin id is used. Have a look at the [tools README](./tools/README.md) to see how to add new coin mappings. You can find the already included coins in the [asset-mapping.json](asset-mapping.json) file.


## Getting Started

There are three ways to get the bot running. Each way requires you to have an API key pair created. Have a look at [Krakens How to](https://support.kraken.com/hc/en-us/articles/360000919966-How-to-generate-an-API-key-pair-) to get support. For buying assets you need to give permission to *query funds* and to *create and modify orders*. For withdrawing assets you also need to give permission to *withdraw funds*.


### 1. Docker Compose

The easiest way to get started is to adapt the `./docker/docker-compose-finite.yml` or `./docker/docker-compose-infinite.yml` file, rename it to `./docker/docker-compose.yml` and start it with the following command:
```bash
./scripts/run-docker.sh
```

you can stop it with:
```bash
# stop
./scripts/pause-docker.sh

# stop and destroy
./scripts/stop-docker.sh
```

You need to have docker installed. The checked in *docker-compose-finite.yml* and *docker-compose-infinite.yml* files contain two different configurations. *docker-compose-finite.yml* contains the minimum required configuration to run the bot for a finite number of buy cycles. *docker-compose-infinite.yml* is a more robust setup and lets the bot run for infinite number of buy cycles. For a full set of available configuration variables have a look into the `settings.env` file.


### 2. Docker Compose with locally built image

To use docker compose with your own created image, first build the image with the following command:
```bash
./scripts/build-docker-image.sh
```

you do not need to have Node installed on your machine. After your image is created, switch to the local image as described in the `./docker/docker-compose-*.yml` file and follow the steps described in the [Docker Compose Section](#1-docker-compose).


### 3. Plain

To start the bot with Node, first install the dependencies with:
```bash
yarn install
```

and build the javascript files with:
```bash
yarn build
```

You need to have your configuration available via environment variables before starting the bot. The easiest way to achieve this is to store your config in a `.env` file. Use the following step to get a `.env` file including the full set of available settings and configure it according to your preferences:
```bash
cp settings.env .env
```

The last step is to start the bot with:
```bash
yarn start
```


## Development

To start development, you must have [Node.js](https://nodejs.org/en/) and the [Yarn](https://yarnpkg.com) package manager installed. You also need a valid `.env` file. Follow the steps described in the [Plain Section](#3-plain) to create one.

### Commands

```bash
# start in watch mode
yarn dev

# lint
yarn lint

# autofix lint errors
yarn lint:fix

# test
yarn test

# build production
yarn build

# start in production mode
yarn start
```
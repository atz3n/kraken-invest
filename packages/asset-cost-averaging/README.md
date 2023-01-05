# Asset Cost Averaging

The Asset Cost Averaging Bot aims to implement the [Dollar Cost Averaging](https://www.investopedia.com/terms/d/dollarcostaveraging.asp) investment strategy, with the difference that it supports [all available trading pairs](https://support.kraken.com/hc/en-us/articles/202944246-All-available-currencies-and-trading-pairs-on-Kraken) that Kraken offers.

A simple [description](https://intelligent.schwab.com/article/) of Dollar Cost Averaging is:
> Dollar cost averaging is the practice of investing a fixed dollar amount on a regular basis, regardless of the share price.


## General

The bot has a core functionality, an optional functionality and can be used in two modes. The core functionality is to buy an asset according to the Dollar Cost Averaging strategy. This can be done in *finite* and *infinite* mode. In finite mode the bot stops after a certain number of buy actions. The infinit mode is an extension and allows the bot to run and perform buy actions as long as you stop it.

The bot uses [node-cron](https://www.npmjs.com/package/node-cron) to schedule the buy actions. Have a look [here](https://crontab.guru) to configure your schedule easily. To buy the asset in a short period of time, the bot uses the *market* type when placing the order and the current *ask* price to calculate the volume. This lets the price amount vary a bit, so that i.e. an investment of $100 may result in an investment of $100.10 or $99.90.

The second, optional functionality is to withdraw the purchased asset to store it in a cold wallet. Even though Kraken is (imho) one of the safest exchanges out there, you should follow the golden rule in the crypto world: *"Not your keys, not your cryptos"*. If you enable withdrawal in finite mode, the bot will withdraw your asset after the last buy action. To withdraw your asset in infinite mode, a withdrawal schedule is used, which can also be configured with a cron schedule expression.


## Getting Started

There are three ways to get the bot running. Each way requires you to have an API key pair created. Have a look at the [How to](https://support.kraken.com/hc/en-us/articles/360000919966-How-to-generate-an-API-key-pair-) to get support. For buying assets you need to give permission to *query funds* and to *create and modify orders*. For withdrawing assets you also need to give permission to *withdraw funds*.


### 1. Docker Compose

The easiest way to get started is to adapt the `./docker/docker-compose.yml` file and to start it with the following command:
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

You need to have docker and docker-compose installed. The checked in docker-compose file contains the minimum required configuration. For a full set of available settings have a look into the `settings.env` file.


### 2. Docker Compose with locally built image

To use docker-compose with your own created image, first build the image with the following command:
```bash
./scripts/build-docker-image.sh
```

you do not need to have Node installed on your machine. After your image is created, switch to the local image as described in the `./docker/docker-compose.yml` file and follow the steps described in the [Docker Compose Section](#1-docker-compose).


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
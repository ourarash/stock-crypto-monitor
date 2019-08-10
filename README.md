# stock-crypto-monitor

Continuously monitors cryptocurrency and stock prices and the total market cap.
Currently, the prices are fetched from CoinGecko and Yahoo Finance.

This is a general purpose package, but it is ideal for [Termux](https://termux.com/) in Android to continuously
show the price of cryptocurrencies in the notification area.
See [examples/termux.js](examples/termux.js)

[![NPM](https://badge.fury.io/js/stock-crypto-monitor.svg)](https://www.npmjs.com/package/stock-crypto-monitor)

<!-- [![NPM Downloads][downloadst-image]][downloads-url] -->

[downloads-image]: https://img.shields.io/npm/dm/stock-crypto-monitor.svg
[downloadst-image]: https://img.shields.io/npm/dt/stock-crypto-monitor.svg
[downloads-url]: https://npmjs.org/package/stock-crypto-monitor

- [x] Supports more than 5000 cryptocurrencies
- [x] Supports all stock tickers on Yahoo Finance
- [x] Continuously displays the prices and total market cap
- [x] Accepts callbacks for each time the price is updated

#Installation

```bash
npm install stock-crypto-monitor --save
```

# Screenshot

[examples/demo.js](examples/demo.js)
![Output example](https://raw.githubusercontent.com/ourarash/stock-crypto-monitor/master/screenshot.gif)

## Termux (Android)

![Termux](https://raw.githubusercontent.com/ourarash/stock-crypto-monitor/master/termux_screenshot2.gif)

# Usage

## Simple

```javascript
const stock_crypto_monitor = require("stock-crypto-monitor")({
  cryptosOfInterest: "BTC,ETH,LTC",
  stocksOfInterest: ["AAPL", "GOOGL"]
});
stock_crypto_monitor.start();
```

## Query prices

```javascript
const crypto_price_checker = require("../index.js")({
  cryptosOfInterest: ["BTC", "ETH", "LTC"],
  stocksOfInterest: ["AAPL", "GOOGL"],
  updateIntervalInSeconds: 10
});

async function start() {
  await crypto_price_checker.start();

  // Prices are now available
  let c = crypto_price_checker.getPrice("AAPL");
  crypto_price_checker.log("AAPL: ", c);
}

start();
```

# Other options

```javascript
var stock_crypto_monitor = require("stock-crypto-monitor")({
  getCoinGeckoPrices: true,
  getStockPricesFromYahoo: true,
  initialCallback: null, // Function called in the beginning
  updateValuesCallback: null, // Function called at each updated
  cryptosOfInterest: [`BTC`, `ETH`, `LTC`],
  stocksOfInterest: ["AAPL", "GOOGL"],
  updateIntervalInSeconds: 10,
  printIntervalInSeconds: 5,
  printStatus: true,
  updateStatusBar: true
});
```

# Logger

The logger used in this package is available separately in [log-with-statusbar](https://www.npmjs.com/package/log-with-statusbar) npm package

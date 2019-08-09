# stock-crypto-monitor

Continuously monitors cryptocurrency and stock prices and the total market cap.
Currently, the prices are fetched from CoinGecko and Yahoo Finance.

This module is ideal for [Termux](https://termux.com/) in Android to continuously
show the price of cryptocurrencies in the notification area.
See [examples/termux.js](examples/termux.js)

[![NPM](https://badge.fury.io/js/stock-crypto-monitor.svg)](https://www.npmjs.com/package/stock-crypto-monitor)
[![NPM Downloads][downloadst-image]][downloads-url]

[downloads-image]: https://img.shields.io/npm/dm/stock-crypto-monitor.svg
[downloadst-image]: https://img.shields.io/npm/dt/stock-crypto-monitor.svg
[downloads-url]: https://npmjs.org/package/stock-crypto-monitor

- [x] Supports more than 5000 cryptocurrencies
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

![Termux](https://raw.githubusercontent.com/ourarash/stock-crypto-monitor/master/termux_screenshot.gif)

# Usage

```javascript
var crypto_price_monitor = require("stock-crypto-monitor")({
  cryptosOfInteres: "BTC,ETH,LTC"
});
crypto_price_monitor.start();
```

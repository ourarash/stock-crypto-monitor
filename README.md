# crypto-price-monitor

Continuously monitors cryptocurrency prices and the total market cap.
Currently, the prices are fetched from CoinGecko.

This module is ideal for [Termux](https://termux.com/) in Android to continuously
show the price of cryptocurrencies in the notification area.
See [examples/termux.js](examples/termux.js)

[![NPM](https://badge.fury.io/js/crypto-price-monitor.svg)](https://www.npmjs.com/package/crypto-price-monitor)
[![NPM Downloads][downloadst-image]][downloads-url]

[downloads-image]: https://img.shields.io/npm/dm/crypto-price-monitor.svg
[downloadst-image]: https://img.shields.io/npm/dt/crypto-price-monitor.svg
[downloads-url]: https://npmjs.org/package/crypto-price-monitor

- [x] Supports more than 5000 cryptocurrencies
- [x] Continuously displays the prices and total market cap
- [x] Accepts callbacks for each time the price is updated

#Installation

```bash
npm install crypto-price-monitor --save
```

# Screenshot

[examples/demo.js](examples/demo.js)
![Output example](https://raw.githubusercontent.com/ourarash/crypto-price-monitor/master/screenshot.gif)

## Termux (Android)

![Termux](https://raw.githubusercontent.com/ourarash/crypto-price-monitor/master/termux_screenshot.gif)

# Usage

```javascript
var crypto_price_monitor = require("crypto-price-monitor")({
  cryptosOfInteres: "BTC,ETH,LTC"
});
crypto_price_monitor.start();
```

var crypto_price_checker = require("../index.js")({
  cryptosOfInteres: "BTC,ETH,LTC",
  stocksOfInteres: ['AAPL', 'GOOGL'],
  updateIntervalInSeconds: 10,
});
crypto_price_checker.start();

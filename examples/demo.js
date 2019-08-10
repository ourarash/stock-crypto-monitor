var crypto_price_checker = require("../index.js")({
  cryptosOfInterest: ['BTC','ETH','LTC'],
  stocksOfInterest: ['AAPL', 'GOOGL'],
  updateIntervalInSeconds: 10,
});
crypto_price_checker.start();

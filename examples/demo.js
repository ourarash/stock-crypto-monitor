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
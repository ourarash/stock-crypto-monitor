/**
 * stock-cryptoa-monitor: Continuously monitor cryptocurrency prices
 * Written by Ari Saif
 */

const api = require("termux");
require("ansicolor").nice;
const CoinGecko = require("coingecko-api");
const CoinGeckoClient = new CoinGecko();
const yahoo = require("yahoo-stocks");

const numeral = require("numeral");
const currencyFormatter = require("currency-formatter");

var defines = require("./defines");
var log = defines.log;

var moment = require("moment");
var utility_functions = require("./utility");
require("ansicolor").nice;

const { table, getBorderCharacters } = require("table");

var g_printStatusCounter = 0;
let statusBarText = Array(3);
//-----------------------------------------------------------------------------
async function getGlobalMarketData() {
  log.info("Getting global market data from CoinGecko...");

  let data = await CoinGeckoClient.global();
  defines.Globals.globalData = data.data.data;
  log.info("Updated CoinGecko global market data!");
}
//-----------------------------------------------------------------------------
async function getStockPricesFromYahoo() {
  log.info("Getting Stock prices from Yahoo...");
  for (stock of defines.Globals.options.stocksOfInterest) {
    try {
      let res = await yahoo.lookup(stock);

      defines.Globals.stockPrices[stock] = res;
      await utility_functions.sleep(100);
    } catch (error) {
      log.error(`Wasn't able to lookup ${stock}: `, error);
    }
  }
  log.info("Done getting Stock prices from Yahoo!");
}
//-----------------------------------------------------------------------------
async function getAllPriceFullCoinGeckoAll() {
  log.info("Getting prices from Coin Gecko...");

  let coinList = await CoinGeckoClient.coins.list();
  if (coinList && coinList.success) {
    let markets = [];
    // let maxNumberOfCoins = coinList.data.length;
    let maxNumberOfCoins = 2000;
    for (let p = 0; p < maxNumberOfCoins / 250; p++) {
      let partialMarket = await CoinGeckoClient.coins.markets({
        per_page: 250,
        page: p,
        vs_currency: "usd"
      });
      if (partialMarket && partialMarket.success) {
        markets = markets.concat(partialMarket.data);
      }
    }
    let prices = {};
    markets.forEach(c => {
      let symbol = c.symbol.toUpperCase();

      // Fix coins with the same abbreviation
      switch (symbol) {
        case "BTG": {
          if (c.name == "Bitcoin Gold") {
          } else {
            symbol = "BTG*";
          }
          break;
        }

        case "KEY": {
          if (c.name == "Selfkey") {
          } else {
            symbol = "KEY*";
          }
          break;
        }
      }

      prices[symbol] = {};
      prices[symbol]["USD"] = {
        PRICE: Number(c.current_price),
        CHANGEPCT24HOUR: Number(c.price_change_percentage_24h),
        MKTCAP: Number(c.market_cap)
      };

      try {
        defines.Globals.cryptoPrices[symbol] = c;
      } catch (e) {
        log.info("Error: ", e);
      }
    });

    defines.Globals.prices = prices;
    defines.Globals.priceUpdateTimestamp = moment().valueOf();
    log.info("Updated CoinGecko prices!");
  }
}
//-----------------------------------------------------------------------------
async function getAllPriceFullCoinGecko() {
  log.info("Getting prices from Coin Gecko...");

  let coinList = await CoinGeckoClient.coins.list();
  let coinIdsOfInterest = [];
  if (coinList && coinList.success) {
    coinList.data.forEach(e => {
      if (
        defines.Globals.options.cryptosOfInterest.includes(
          e.symbol.toUpperCase()
        )
      ) {
        coinIdsOfInterest.push(e.id);
      }
    });
  }
  let markets = [];
  // let maxNumberOfCoins = coinList.data.length;
  let maxNumberOfCoins = defines.Globals.options.cryptosOfInterest.length;
  let ids = coinIdsOfInterest.join(",").toLowerCase();

  for (let p = 0; p < maxNumberOfCoins / 250; p++) {
    let partialMarket = await CoinGeckoClient.coins.markets({
      ids: ids,
      // per_page: 250,
      // page: p,
      vs_currency: "usd"
    });
    if (partialMarket && partialMarket.success) {
      markets = markets.concat(partialMarket.data);
    }
  }
  let prices = {};
  markets.forEach(c => {
    let symbol = c.symbol.toUpperCase();

    // Fix coins with the same abbreviation
    switch (symbol) {
      case "BTG": {
        if (c.name == "Bitcoin Gold") {
        } else {
          symbol = "BTG*";
        }
        break;
      }

      case "KEY": {
        if (c.name == "Selfkey") {
        } else {
          symbol = "KEY*";
        }
        break;
      }
    }

    prices[symbol] = {};
    prices[symbol]["USD"] = {
      PRICE: Number(c.current_price),
      CHANGEPCT24HOUR: Number(c.price_change_percentage_24h),
      MKTCAP: Number(c.market_cap)
    };

    try {
      defines.Globals.cryptoPrices[symbol] = c;
    } catch (e) {
      log.info("Error: ", e);
    }
  });

  defines.Globals.prices = prices;
  defines.Globals.priceUpdateTimestamp = moment().valueOf();
  log.info("Updated CoinGecko prices!");
}
//-----------------------------------------------------------------------------
/**
 * Returns the price of a ticker (stock or crypto)
 * @param {String} c
 */
function getPrice(c) {
  if (Object.keys(defines.Globals.cryptoPrices).includes(c)) {
    return (
      defines.Globals.cryptoPrices[c.toUpperCase()].price_usd ||
      defines.Globals.cryptoPrices[c.toUpperCase()].current_price
    ); // coinGecko;
  } else {
    return defines.Globals.stockPrices[c.toUpperCase()]
      ? defines.Globals.stockPrices[c.toUpperCase()].currentPrice
      : 0;
  }
}
//-----------------------------------------------------------------------------

async function updateStatusBar() {
  // let frames = log.getSpinners().moon.frames.concat(log.getSpinners().earth.frames);
  let frames = log.getSpinners().dots.frames;

  statusBarText[0] =
    frames[g_printStatusCounter++ % frames.length].toString().bright.green +
    ` Prices as of: ` +
    moment(defines.Globals.priceUpdateTimestamp).format(
      `MM/DD/YYYY, h:mm:ss A`
    );
  var filtered = statusBarText.filter(el => {
    return el != null;
  });

  log.setStatusBarText(filtered);
}
//-----------------------------------------------------------------------------
/**
 * Prints the currently calculated prices
 */
async function printStatus() {
  let color = "yellow";

  let data = [
    [`#`, `Symbol`, `Price (USD)`]
    // [
    //   ``, // Number
    //   ``, // Symbol
    //   `  (USD)  `
    // ]
  ];

  let tableHorizontalLines = [0, 1];

  // keys.forEach((k, i) => {
  keys = Object.keys(defines.Globals.cryptoPrices).concat(
    Object.keys(defines.Globals.stockPrices)
  );
  for (let i = 0; i < keys.length && defines.Globals.options.enable; i++) {
    const k = keys[i];
    // if (!defines.Globals.options.cryptosOfInterest.includes(k.toLowerCase())) {
    //   continue;
    // }
    cmcPrice = getPrice(k);

    let cmcPriceFormatted =
      cmcPrice <= 0 ? "N/A".yellow : utility_functions.formatPrice(cmcPrice);

    data.push([
      `${data.length}`, // Number
      `${k}`[color].bright, // Symbol
      `${cmcPriceFormatted[color]}`
    ]);
  }

  let options = {
    /**
     * @typedef {function} drawHorizontalLine
     * @param {number} index
     * @param {number} size
     * @return {boolean}
     */
    drawHorizontalLine: (index, size) => {
      // console.log.info('index: ', JSON.stringify(index));
      // return tableHorizontalLines.indexOf(index) < 0;
      return true;
    }
  };

  // Calculate marketcap
  let mktCapFormatted = defines.Globals.globalData.total_market_cap
    ? numeral(defines.Globals.globalData.total_market_cap.usd).format("0.00 a")
    : "0 ";
  console.log("mktCapFormatted: ", JSON.stringify(mktCapFormatted));
  let pricePostFix = /\S+\s+(.*)/.exec(mktCapFormatted);

  pricePostFix = pricePostFix[1].toUpperCase();
  mktCapFormatted = currencyFormatter.format(mktCapFormatted, {
    code: "USD",
    precision: 2
  });

  data.push([
    `${data.length}`, // Number
    `Total Market Cap`[color].bright, // Symbol
    `${mktCapFormatted[color]} ${pricePostFix[color]}`
  ]);
  let output = table(data, options);

  let mktCapFormattedRaw = `MKTCAP` + `: ${mktCapFormatted} ${pricePostFix}`;

  mktCapFormatted = `MKTCAP`.bright + `: ${mktCapFormatted} ${pricePostFix}`;

  let notificationOutput = "";
  let notificationOutputRaw = "";

  let stockAndCryptosOfInterest = defines.Globals.options.cryptosOfInterest.concat(
    defines.Globals.options.stocksOfInterest
  );

  let lineCounter = 1;
  let linLength = 0;
  for (let i = 0; i < stockAndCryptosOfInterest.length; i++) {
    const c = stockAndCryptosOfInterest[i];

    let btcPrice = getPrice(c);

    let btcPriceFormatted =
      btcPrice <= 0 ? "N/A".yellow : utility_functions.formatPrice(btcPrice);

    notificationOutput += `${c.bright}: ${btcPriceFormatted}`;
    notificationOutputRaw += `${c}: ${btcPriceFormatted}`;
    linLength += `${c}: ${btcPriceFormatted}`.length;

    if (i < stockAndCryptosOfInterest.length - 1) {
      notificationOutput += `, `;
      notificationOutputRaw += `, `;
    }

    if (linLength > 30) {
      lineCounter++;
      linLength = 0;
      notificationOutputRaw += "\n";
      notificationOutput += "\n";
    }
  }
  // defines.Globals.options.cryptosOfInterest.forEach((c, i) => {

  // });

  log.info(
    "notificationOutput: ",
    notificationOutput.yellow + ", " + mktCapFormatted.cyan
  );

  // Update status bar
  if (Object.keys(defines.Globals.cryptoPrices).length > 0) {
    if (api.hasTermux) {
      log.info(output);
    } else {
      let rowsFormat = output.split("\n");

      let i = 1;
      rowsFormat.forEach(r => {
        if (r != "") {
          statusBarText[i++] = r;
        }
      });

      let newArray = [];
      newArray.push(statusBarText[0]);
      newArray = newArray.concat(rowsFormat);
      statusBarText = newArray;
    }
  }

  if (defines.Globals.options.updateValuesCallback) {
    defines.Globals.options.updateValuesCallback(
      notificationOutputRaw,
      mktCapFormattedRaw
    );
  }
}
//-----------------------------------------------------------------------------
/**
 *
 */
async function main() {
  defines.Globals.startTime = moment().valueOf();
  if (defines.Globals.options.initialCallback) {
    defines.Globals.options.initialCallback();
  }
  let promises = [];
  if (defines.Globals.options.getCoinGeckoPrices) {
    promises.push(getAllPriceFullCoinGecko());
    promises.push(getGlobalMarketData());
  }

  if (defines.Globals.options.getStockPricesFromYahoo) {
    promises.push(getStockPricesFromYahoo());
  }

  if (defines.Globals.options.printStatus) {
    defines.Globals.intervals.printInterval = setInterval(() => {
      if (defines.Globals.options.enable) {
        printStatus();
      }
    }, defines.Globals.options.printIntervalInSeconds * 1000);
  }

  defines.Globals.intervals.coingGeckoUpdateInterval = setInterval(() => {
    if (defines.Globals.options.enable) {
      if (defines.Globals.options.getCoinGeckoPrices) {
        getAllPriceFullCoinGecko();
        getGlobalMarketData();
      }
      if (defines.Globals.options.getStockPricesFromYahoo) {
        getStockPricesFromYahoo();
      }
    }
  }, defines.Globals.options.updateIntervalInSeconds * 1000);

  if (!api.hasTermux && defines.Globals.options.updateStatusBar) {
    updateStatusBar();
    defines.Globals.intervals.statusBarTextInterval = setInterval(() => {
      if (defines.Globals.options.enable) {
        updateStatusBar();
      }
    }, 0.1 * 1000);
  }

  await Promise.all(promises);
}

//-----------------------------------------------------------------------------
/**
 * Start
 */
async function start() {
  let cryptosOfInterest = defines.Globals.options.cryptosOfInterest.map(e => {
    return e.toUpperCase();
  });

  defines.Globals.options.cryptosOfInterest = cryptosOfInterest;
  log.info("Start...");
  log.info(
    "-----------------------------------------------------------------------------"
  );

  defines.Globals.options.enable = true;
  await main();

  log.info("Done requesting prices and setting intervals.");
}
//-----------------------------------------------------------------------------
/**
 * Stops geofencing
 * @param {String} message
 */
function stop(message = "Stop signal received. Please wait...") {
  log.info(message);
  defines.Globals.options.enable = false;
  Object.keys(defines.Globals.intervals).forEach(key => {
    clearInterval(defines.Globals.intervals[key]);
  });
  process.exit();
}
//-----------------------------------------------------------------------------
module.exports = function(options = {}) {
  Object.assign(defines.Globals.options, options);
  return {
    stop: stop,
    start: start,
    getPrice: getPrice,
    log: log
  };
};

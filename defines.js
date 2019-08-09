const api = require("termux");
require("ansicolor").nice;

Globals = {
  options: {
    loopForEver: true,
    getCoinGeckoPrices: true,
    initialCallback: null,
    updateValuesCallback: null,
    cryptosOfInterest : [`BTC`, `ETH`, `LTC`],
    stocksOfInteres: ['AAPL', 'GOOGL'],
    updateIntervalInSeconds: 10,
    printIntervalInSeconds:5,
    // control
    enable: true // Used for start/stop
  },
  startTime: 0,
  stockPrices: {},
  prices: {}, // Crypto
  globalData: {},
  cryptoPrices: {},
  
  forex: {},
  intervals: {
    printInterval: null,
    coingGeckoUpdateInterval: null,
    statusBarTextInterval: null
  },
  logOptions: {
    ololog_configure: {
      time: { yes: true, print: x => x.toLocaleString().bright.cyan + " " },
      locate: false,
      tag: true
    },
    initialStatusTextArray: ["Please wait..."],
    minVerbosity: 1, //Minimum verbosity level
    verbosity: 1, //Default verbosity level
    enableStatusBar: true
  },
  priceUpdateTimestamp: 0,
};


var log;
if (api.hasTermux) {
  log = require("ololog").configure({
    // time: { yes: true, print: x => x.toLocaleString().bright.cyan + " " },
    locate: false,
    tag: true
  });
} else {
  log = require("log-with-statusbar")({
    ololog_configure: {
      // time: { yes: true, print: x => x.toLocaleString().bright.cyan + " " },
      locate: false,
      tag: true
    },
    initialStatusTextArray: ["Please wait..."],
    minVerbosity: 1, //Minimum verbosity level
    verbosity: 1, //Default verbosity level
    enableStatusBar: true
  });
}
var exports = (module.exports = {
  Globals: Globals,
  log: log
});

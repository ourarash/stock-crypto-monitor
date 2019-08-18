var defines = require("./defines");
const https = require("https");

const log = defines.log;

const get = url =>
  new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      let data = "";
      res.on("data", d => {
        data += d;
      });
      res.on("end", () => {
        resolve(data);
      });
    });
    req.on("error", e => {
      reject(e);
    });
  });

const getJson = url =>
  new Promise((resolve, reject) => {
    get(url)
      .then(resp => JSON.parse(resp))
      .then(resolve)
      .catch(reject);
  });

//-----------------------------------------------------------------------------
/**
 * Checks if the chain of
 * object[keys[0]][keys[1]]...[keys[keys.length-1]] is valid
 * @param {object} object
 * @param {...any} keys
 */
function validChain(object, ...keys) {
  if (!object) return false;
  return keys.reduce((a, b) => (a || {})[b], object) !== undefined;
}
//-----------------------------------------------------------------------------
/**
 * Creates the chain of object[keys[0]][keys[1]]...[keys[keys.length-1]]
 * @param {object} object
 * @param  {...any} keys
 */
function createChain(object, ...keys) {
  // console.log('keys: ', JSON.stringify(keys));
  if (!object) return false;
  if (!keys || !keys.length) {
    return;
  }

  if (!object[keys[0]]) {
    object[keys[0]] = {};
  }
  if (keys.length == 1) {
    return;
  }
  let key0 = keys.shift();
  return exports.createChain(object[key0], ...keys);
}
//-----------------------------------------------------------------------------
/**
 * Checks if object[keys[0]][keys[1]]...[keys[keys.length-1]] is valid
 * otherwise creates it
 * @param {*} object
 * @param  {...any} keys
 */
function validOrCreateChain(object, ...keys) {
  if (!exports.validChain(object, ...keys)) {
    exports.createChain(object, ...keys);
    return false;
  } else {
    return true;
  }
}
//-----------------------------------------------------------------------------
/**
 *
 * @param {object} obj
 */
function removeUndefinedFromObject(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === "object")
      this.removeUndefinedFromObject(obj[key]);
    else if (obj[key] == null) {
      delete obj[key];
    }
  });
  return obj;
}
//-----------------------------------------------------------------------------
/**
 *
 * @param {number} time
 */
function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}
//-----------------------------------------------------------------------------
/**
 * Formats a number with its decimal points
 * @param {number} n
 * @param {number} decimalNumbers
 */
function formatNumber(n, decimalNumbers = 4) {
  return parseFloat(n.toFixed(decimalNumbers));
}
//-----------------------------------------------------------------------------
/**
 * Formats a price number into a string
 * @param {Number} n
 * @returns {string}
 */
function formatPrice(n) {
  if (!n) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n < 1 ? 4 : 2
  }).format(n);
}
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
/**
 * Hashes a string to a number
 * https://stackoverflow.com/a/7616484/1383356
 * @param {String} stringValue
 * @returns {number}
 */
function hashCode(stringValue) {
  var hash = 0;
  stringValue = stringValue || "Utility";
  if (stringValue.length == 0) return hash;
  for (let i = 0; i < stringValue.length; i++) {
    let c = stringValue.charCodeAt(i);
    hash = (hash << 5) - hash + c;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}
//-----------------------------------------------------------------------------
/**
 * Returns if a value is a string
 * @param {any} value
 */
function isString(value) {
  return typeof value === "string" || value instanceof String;
}
//-----------------------------------------------------------------------------
/**
 * Looks up yahoo price. The stock price is in the meta part of the respond
 * Therefore a short range (4m) is enough
 * @param {String} symbol
 * @param {String} range
 */
async function yahooLookup(symbol, range = "4m") {
  let json = await getJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?region=US&lang=en-US&includePrePost=false&interval=2m&range=${range}`
  );

  if (!validChain(json, "chart", "result")) {
    return;
  }

  let result;
  try {
    let regularMarketPrice = json.chart.result[0].meta.regularMarketPrice;
    let previousClose = json.chart.result[0].meta.previousClose;
    let change = regularMarketPrice - previousClose;
    let percentChange =
      ((regularMarketPrice - previousClose) / previousClose) *
      100;
    result = {
      regularMarketPrice: regularMarketPrice,
      previousClose: previousClose,
      price_change_24h: change,
      price_change_percentage_24h: percentChange
    };
  } catch (error) {
    log.error(error);
  }

  return result;
}

//-----------------------------------------------------------------------------
var exports = (module.exports = {
  validChain: validChain,
  createChain: createChain,
  validOrCreateChain: validOrCreateChain,
  removeUndefinedFromObject: removeUndefinedFromObject,
  sleep: sleep,
  formatPrice: formatPrice,
  formatNumber: formatNumber,
  hashCode: hashCode,
  isString: isString,
  yahooLookup: yahooLookup
});

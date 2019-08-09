/**
 * 
 * crypto-price-monitor: Termux example
 * Continuously monitor cryptocurrency prices
 * Written by Ari Saif
 * Should be run inside [Termux](https://termux.com/) in Android using GPS
 * First install the following apps:
 *  - https://play.google.com/store/apps/details?id=com.termux
 *  - https://play.google.com/store/apps/details?id=com.termux.api
 */
const spinners = Object.assign({}, require("./spinners.json"));

var defines = require("../defines");
const mri = require("mri");
const api = require("termux");
var utility_functions = require("../utility");
const moment = require("moment");

var log = defines.log;

if (!api.hasTermux) {
  log.info("Termux doesn't exits!");
}
var g_notification_id = 1;
var g_notificationOutput, g_mktCapFormatted;
var g_updateCounter = 0 ;
//-----------------------------------------------------------------------------
/**
 * A function that is called in the beginning
 * We set g_notificationOutput to show a proper message
 * @returns {string}
 */
async function initialCallback() {
  g_notificationOutput = `Please wait...`;
  g_mktCapFormatted = "Updating crypto prices...";
}
//-----------------------------------------------------------------------------
/**
 * Our callback function that is called each time values are updated
 * We only update g_notificationOutput to be shown in notification area
 */
async function updateValuesCallback(notificationOutput, mktCapFormatted) {
  g_notificationOutput = notificationOutput;
  g_mktCapFormatted = mktCapFormatted;
}
//-----------------------------------------------------------------------------
/**
 * This function is called in an interval to update the notification message
 */
async function updateNotification() {
  g_updateCounter++;
  
  // Set the animation frame
  let frames = spinners.moon.frames;
  if (
    
    g_notificationOutput &&
    g_mktCapFormatted
  ) {
    api
      .notification()
      .content(g_notificationOutput)
      .id(g_notification_id)
      .title(
        frames[g_updateCounter % frames.length].toString() +
        `💰 ` + moment().format("h:mm") + `: ` + g_mktCapFormatted)
      //  .url('...')
      .run();
  }
}

//-----------------------------------------------------------------------------
let options = {
  updateInterval: 5,
  loopForever: true,
  updateValuesCallback: updateValuesCallback,
  initialCallback: initialCallback
};

//-----------------------------------------------------------------------------
const argv = process.argv.slice(2);
let cliArgs = mri(argv);
let optionKeys = Object.keys(Globals.options);

optionKeys.forEach(e => {
  if (cliArgs[e]) {
    options[e] = cliArgs[e];
    log.info(`${e}: ${options[e]}`);
  }
});

if (utility_functions.isString(options.cryptosOfInterest)) {
  options.cryptosOfInterest = options.cryptosOfInterest.split(",");
}

g_notification_id = utility_functions.hashCode(
  moment()
    .valueOf()
    .toString()
);
var crypto_price_checker = require("../index.js")(options);

crypto_price_checker.start();

setInterval(() => {
  updateNotification();
}, 1 * 1000);

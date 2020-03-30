/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */


/* global cordova */

var Plugin = Plugin || {};

/*
 * Create plugin object
 */
Plugin.BarcodeScanner = {};


/*
 * Init plugin
 */
Plugin.BarcodeScanner.init = function ()
{
  Plugin.BarcodeScanner.scanning = false;
};


/*
 * Opens device camera to scan a barcode/qrcode
 * @param {object} req - request obj
 */
Plugin.BarcodeScanner.scan = function (req)
{
  if (Plugin.BarcodeScanner.scanning) {
    req.setError("Already scanning");
    return;
  }
  //
  Plugin.BarcodeScanner.scanning = true;
  //
  cordova.plugins.barcodeScanner.scan(function (result) {
    Plugin.BarcodeScanner.scanning = false;
    AppMan.disableBackButton(250);
    req.setResult(result.text);
  }, function (error) {
    Plugin.BarcodeScanner.scanning = false;
    AppMan.disableBackButton(250);
    req.setError(error);
  });
};

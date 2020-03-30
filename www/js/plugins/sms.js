/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */

/* global cordova, StatusBar */

var Plugin = Plugin || {};

/*
 * Create plugin object
 */
Plugin.Sms = {};


/*
 * Init plugin
 */
Plugin.Sms.init = function ()
{
};


/*
 * Send an sms
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Sms.send = function (req)
{
  var options = {
    replaceLineBreaks: true, // true to replace \n by a new line, false by default
    android: {
      //intent: 'INTENT'  // send SMS with the native android SMS messaging
      intent: '' // send SMS without open any other app
    }
  };
  //
  sms.send(req.params.number || "", req.params.message || "", req.params.options || options, function () {
    req.setResult("ok");
  }, function (e) {
    req.setResult(e);
  });
};


/*
 * Discover if you have permission to send SMS from the app
 * @param {type} req - pluginmanager.js request obj
 * @returns {bool}
 */
Plugin.Sms.hasPermission = function (req)
{
  if (Shell.isIOS()) {
    req.setResult(true);
  }
  else {
    sms.hasPermission(function (m) {
      req.setResult(m);
    }, function (e) {
      req.setResult(e);
    });
  }
};

/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */


/* global cordova, bluetoothle */

var Plugin = Plugin || {};
var PlugMan = PlugMan || {};

/*
 * Create plugin object
 */
Plugin.Pdf = {};


/*
 * Init plugin
 */
Plugin.Pdf.init = function ()
{
};


/*
 * print PDF
 */
Plugin.Pdf.fromData = function (req)
{
  var opt = req.params.options || {};
  //
  pdf.fromData(req.params.html, opt)
          .then((res) => req.setResult(res))
          .catch((err) => req.setError(err));
};


/*
 * print PDF
 */
Plugin.Pdf.fromURL = function (req)
{
  var opt = req.params.options || {};
  //
  pdf.fromURL(req.params.url, opt)
          .then((res) => req.setResult(res))
          .catch((err) => req.setError(err));
};

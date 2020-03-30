/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */


/* global cordova */

var Plugin = Plugin || {};
var PlugMan = PlugMan || {};

/*
 * Create plugin object
 */
Plugin.Accelerometer = {};


/*
 * Init plugin
 */
Plugin.Accelerometer.init = function ()
{
  this.watchList = [];
};


/*
 * Measures the current acceleration
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Accelerometer.getCurrentAcceleration = function (req)
{
  navigator.accelerometer.getCurrentAcceleration(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Sets a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Accelerometer.watchAcceleration = function (req)
{
  // Clean, then set.
  this.clearWatch(req);
  //
  var watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
    req.result = acceleration;
    PlugMan.sendEvent(req, "Acceleration");
  }, function () {
    req.result = {error: "error"};
    PlugMan.sendEvent(req, "Acceleration");
  }, req.params);
  //
  // Remember which app requests this watch
  this.watchList.push({id: watchID, app: req.app});
};


/*
 * Clears an acceleration watch for an app
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Accelerometer.clearWatch = function (req)
{
  var i = this.getWatch(req.app);
  if (i > -1) {
    navigator.accelerometer.clearWatch(this.watchList[i].id);
    this.watchList.splice(i, 1);
  }
};


/*
 * Returns the watch position for a given app if any
 */
Plugin.Accelerometer.getWatch = function (app)
{
  for (var i = 0; i < this.watchList.length; i++) {
    if (this.watchList[i].app === app)
      return i;
  }
  return -1;
};


/*
 * An app has stopped, clean up its watch
 */
Plugin.Accelerometer.stopApp = function (app)
{
  this.clearWatch({app: app});
};

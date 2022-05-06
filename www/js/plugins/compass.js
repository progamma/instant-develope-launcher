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
Plugin.Compass = {};


/*
 * Init plugin
 */
Plugin.Compass.init = function ()
{
  this.watchList = [];
};


/*
 * Measures the current heading
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Compass.getCurrentHeading = function (req)
{
  navigator.compass.getCurrentHeading(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Sets a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Compass.watchHeading = function (req)
{
  // Clean, then set.
  this.clearWatch(req);
  //
  var watchID = navigator.compass.watchHeading(function (heading) {
    req.result = heading;
    PlugMan.sendEvent(req, "Heading");
  }, function (error) {
    if (error.code === error.COMPASS_INTERNAL_ERR)
      req.result = {error: "internal error"};
    else
      req.result = {error: "compass not supported"};
    PlugMan.sendEvent(req, "Heading");
  }, req.params);
  //
  // Remember which app requests this watch
  this.watchList.push({id: watchID, app: req.app});
};


/*
 * Clears a compass watch for an app
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Compass.clearWatch = function (req)
{
  var i = this.getWatch(req.app);
  if (i > -1) {
    navigator.compass.clearWatch(this.watchList[i].id);
    this.watchList.splice(i, 1);
  }
};


/*
 * Returns the watch position for a given app if any
 */
Plugin.Compass.getWatch = function (app)
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
Plugin.Compass.stopApp = function (app)
{
  this.clearWatch({app: app});
};



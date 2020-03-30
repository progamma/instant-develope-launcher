/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */


/* global cordova, backgroundGeoLocation, BackgroundGeolocation */

var Plugin = Plugin || {};
var PlugMan = PlugMan || {};

/*
 * Create plugin object
 */
Plugin.BackgroundLocation = {};

Plugin.BackgroundLocation.DEFAULT = {
  desiredAccuracy: 100,
  stationaryRadius: 20,
  distanceFilter: 30,
  debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
  stopOnTerminate: false
};

/*
 * Init plugin
 */
Plugin.BackgroundLocation.init = function ()
{
  this.watchList = [];
  this.geoObj = window.BackgroundGeolocation || window.backgroundGeoLocation;
};


/*
 * Add this app to the watch list
 */
Plugin.BackgroundLocation.start = function (req)
{
  this.setWatch(req);
};


/*
 * Remove this app from the watch list
 */
Plugin.BackgroundLocation.stop = function (req)
{
  this.clearWatch(req);
};


/*
 * Changes plugin options
 */
Plugin.BackgroundLocation.configure = function (req)
{
  this._configure(req.params.options);
};


/*
 * Changes plugin options
 */
Plugin.BackgroundLocation._configure = function (options)
{
  if (!options)
    options = Plugin.BackgroundLocation.DEFAULT;
  //
  this.configured = true;
  var pthis = this;
  //
  this.geoObj.configure(function (location) {
    pthis.notify(location);
  }, function (error) {
    pthis.notify(error);
  }, options);
};


/*
 * An app has stopped, clean up its watch
 */
Plugin.BackgroundLocation.stopApp = function (app)
{
  this.clearWatch({app: app});
};


/*
 * Returns the watch position for a given app if any
 */
Plugin.BackgroundLocation.getWatch = function (app)
{
  for (var i = 0; i < this.watchList.length; i++) {
    if (this.watchList[i].app === app)
      return i;
  }
  return -1;
};


/*
 * Adds a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.setWatch = function (req)
{
  // If the watch was not set, set it
  if (this.getWatch(req.app) === -1) {
    //
    // Really start background check
    if (!this.watchList.length) {
      if (!this.configured)
        this._configure();
      this.geoObj.start();
    }
    //
    this.watchList.push(req);
  }
};


/*
 * Clears a position watch for an app
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.clearWatch = function (req)
{
  var i = this.getWatch(req.app);
  if (i > -1) {
    this.watchList.splice(i, 1);
    //
    if (!this.watchList.length)
      this.geoObj.stop();
  }
};


/*
 * Notify registered apps for a background location event
 */
Plugin.BackgroundLocation.notify = function (event)
{
  var pthis = this;
  //
  // set a 20 seconds timer to handle this request
  if (this.finishTimerID)
    window.clearTimeout(this.finishTimerID);
  this.finishTimerID = window.setTimeout(function () {
    pthis.geoObj.finish();
    pthis.finishTimerID = undefined;
  }, 20000);
  //
  for (var i = 0; i < this.watchList.length; i++) {
    var req = this.watchList[i];
    req.result = event;
    PlugMan.sendEvent(req, "Location");
  }
  //
  // Maybe the shell has crashed and we have still location services enabled...
  // better to stop them
  if (this.watchList.length === 0) {
    this.geoObj.stop();
  }
};


/*
 * One time check for status of location services
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.isLocationEnabled = function (req)
{
  this.geoObj.isLocationEnabled(function (enabled) {
    req.setResult(enabled);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Show the app location preferences
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.BackgroundLocation.showAppSettings = function (req)
{
  this.geoObj.showAppSettings();
};


/*
 * Show the system location preferences
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.BackgroundLocation.showLocationSettings = function (req)
{
  this.geoObj.showLocationSettings();
};


/*
 * Method will return all stored locations
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.getLocations = function (req)
{
  this.geoObj.getLocations(function (locations) {
    req.setResult(locations);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Method will return locations, which has not been yet posted to server
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.getValidLocations = function (req)
{
  this.geoObj.getValidLocations(function (locations) {
    req.setResult(locations);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Delete location with locationId
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.deleteLocation = function (req)
{
  this.geoObj.deleteLocation(req.params.locationId, function () {
  }, function (error) {
    console.warn(error);
  });
};


/*
 * Delete all locations
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.deleteAllLocations = function (req)
{
  this.geoObj.deleteAllLocations(function () {
  }, function (error) {
    console.warn(error);
  });
};


/*
 * Return all logged events
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.BackgroundLocation.getLogEntries = function (req)
{
  var limit = 100;
  if (req.params.limit)
    limit = req.params.limit;
  //
  this.geoObj.getLogEntries(limit, function (entries) {
    req.setResult(entries);
  }, function (error) {
    req.setError(error);
  });
};

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
Plugin.Beacon = {};


/*
 * Init plugin
 */
Plugin.Beacon.init = function ()
{
  var pthis = this;
  this.watchList = [];
  //
  var delegate = new cordova.plugins.locationManager.Delegate();
  //
  delegate.didStartMonitoringForRegion = function (event) {
    var req = pthis.getRequest(event.region, "M");
    if (req) {
      req.result = event;
      PlugMan.sendEvent(req, "StartMonitor");
    }
    //console.log("didStartMonitoringForRegion", event);
  };
  delegate.monitoringDidFailForRegionWithError = function (event) {
    var req = pthis.getRequest(event.region, "M");
    if (req) {
      req.result = event;
      PlugMan.sendEvent(req, "Error");
    }
    //console.log("monitoringDidFailForRegionWithError", event);
  };
  //
  delegate.didDetermineStateForRegion = function (event) {
    var req = pthis.getRequest(event.region, "M");
    if (req) {
      req.result = event;
      PlugMan.sendEvent(req, "RegionState");
    }
    //console.log("didDetermineStateForRegion", event);
  };
  //
  delegate.didRangeBeaconsInRegion = function (event) {
    var req = pthis.getRequest(event.region, "R");
    if (req) {
      req.result = event;
      PlugMan.sendEvent(req, "BeaconRange");
    }
    //console.log("didRangeBeaconsInRegion", event);
  };
  //
  delegate.didEnterRegion = function (event) {
    var req = pthis.getRequest(event.region, "M");
    if (req) {
      req.result = event;
      PlugMan.sendEvent(req, "EnterRegion");
    }
    //console.log("didEnterRegion", event);
  };
  //
  delegate.didExitRegion = function (event) {
    var req = pthis.getRequest(event.region, "M");
    if (req) {
      req.result = event;
      PlugMan.sendEvent(req, "ExitRegion");
    }
    //console.log("didExitRegion", event);
  };
  //
  cordova.plugins.locationManager.setDelegate(delegate);
};


/*
 * Returns true if advertising is available
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.isAdvertisingAvailable = function (req)
{
  cordova.plugins.locationManager.isAdvertisingAvailable()
          .then(function (isSupported) {
            req.setResult(isSupported);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};


/*
 * Returns true if advertising is on
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.isAdvertising = function (req)
{
  cordova.plugins.locationManager.isAdvertising()
          .then(function (isAdvertising) {
            req.setResult(isAdvertising);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};


/*
 * Start advertising
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.startAdvertising = function (req)
{
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
          req.params.beacon.identifier, req.params.beacon.uuid,
          req.params.beacon.major, req.params.beacon.minor);
  //
  cordova.plugins.locationManager.startAdvertising(beaconRegion)
          .fail(console.error)
          .done();
};


/*
 * Returns true if advertising is on
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.stopAdvertising = function (req)
{
  cordova.plugins.locationManager.stopAdvertising()
          .fail(console.error)
          .done();
};


/*
 * Returns true if bluetooth is enabled
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.isBluetoothEnabled = function (req)
{
  cordova.plugins.locationManager.isBluetoothEnabled()
          .then(function (isEnabled) {
            req.setResult(isEnabled);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};


/*
 * Enable bluetooth
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.enableBluetooth = function (req)
{
  cordova.plugins.locationManager.enableBluetooth();
};


/*
 * Disable bluetooth
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.disableBluetooth = function (req)
{
  cordova.plugins.locationManager.disableBluetooth();
};


/*
 * Request authorization
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.requestWhenInUseAuthorization = function (req)
{
  cordova.plugins.locationManager.requestWhenInUseAuthorization();
};


/*
 * Request authorization
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.requestAlwaysAuthorization = function (req)
{
  cordova.plugins.locationManager.requestAlwaysAuthorization();
};


/*
 * Returns the monitored regions
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.getMonitoredRegions = function (req)
{
  cordova.plugins.locationManager.getMonitoredRegions()
          .then(function (regions) {
            req.setResult(regions);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};


/*
 * Returns the ranged regions
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.getRangedRegions = function (req)
{
  cordova.plugins.locationManager.getRangedRegions()
          .then(function (regions) {
            req.setResult(regions);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};


/*
 * Returns true if ranging is available
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.isRangingAvailable = function (req)
{
  cordova.plugins.locationManager.isRangingAvailable()
          .then(function (isEnabled) {
            req.setResult(isEnabled);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};


/*
 * Returns the authorization status
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.getAuthorizationStatus = function (req)
{
  cordova.plugins.locationManager.getAuthorizationStatus()
          .then(function (status) {
            req.setResult(status);
          })
          .fail(function (error) {
            req.setError(error);
          })
          .done();
};

/*
 * Sets a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.startMonitoringForRegion = function (req)
{
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
          req.params.beacon.identifier, req.params.beacon.uuid,
          req.params.beacon.major, req.params.beacon.minor);
  //
  // Clean, then set.
  this.clearWatch({req: req, beacon: beaconRegion});
  //
  cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
          .fail(console.error)
          .done();
  //
  // Remember which app requests this watch
  this.watchList.push({req: req, beacon: beaconRegion, type: "M"});
};


/*
 * Clear a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.stopMonitoringForRegion = function (req)
{
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
          req.params.beacon.identifier, req.params.beacon.uuid,
          req.params.beacon.major, req.params.beacon.minor);
  //
  // Clean, then set.
  this.clearWatch({req: req, beacon: beaconRegion, type: "M"});
};


/*
 * Returns true if bluetooth is enabled
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.requestStateForRegion = function (req)
{
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
          req.params.beacon.identifier, req.params.beacon.uuid,
          req.params.beacon.major, req.params.beacon.minor);
  //
  cordova.plugins.locationManager.requestStateForRegion(beaconRegion)
          .fail(console.error)
          .done();
};


/*
 * Sets a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.startRangingBeaconsInRegion = function (req)
{
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
          req.params.beacon.identifier, req.params.beacon.uuid,
          req.params.beacon.major, req.params.beacon.minor);
  //
  // Clean, then set.
  this.clearWatch({req: req, beacon: beaconRegion});
  //
  cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
          .fail(console.error)
          .done();
  //
  // Remember which app requests this watch
  this.watchList.push({req: req, beacon: beaconRegion, type: "R"});
};


/*
 * Clear a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.stopRangingBeaconsInRegion = function (req)
{
  var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
          req.params.beacon.identifier, req.params.beacon.uuid,
          req.params.beacon.major, req.params.beacon.minor);
  //
  // Clean, then set.
  this.clearWatch({req: req, beacon: beaconRegion, type: "R"});
};


/*
 * Clears a position watch for an app
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Beacon.clearWatch = function (w)
{
  var i = this.getWatch(w);
  if (i > -1) {
    w = this.watchList[i];
    if (w.type === "M") {
      cordova.plugins.locationManager.stopMonitoringForRegion(w.beacon)
              .fail(console.error)
              .done();
    }
    else {
      cordova.plugins.locationManager.stopRangingBeaconsInRegion(w.beacon)
              .fail(console.error)
              .done();
    }
    this.watchList.splice(i, 1);
  }
};


/*
 * Returns the watch position for a given app if any
 */
Plugin.Beacon.getWatch = function (watch)
{
  for (var i = 0; i < this.watchList.length; i++) {
    var w = this.watchList[i];
    if (w.req.app === watch.req.app && w.beacon.uuid === watch.beacon.uuid && w.beacon.identifier === watch.beacon.identifier &&
            w.type === watch.type)
      return i;
  }
  return -1;
};


/*
 * Returns the watch position for a given region if any
 */
Plugin.Beacon.getRequest = function (region, type)
{
  for (var i = 0; i < this.watchList.length; i++) {
    var w = this.watchList[i];
    if (w.beacon.uuid === region.uuid && w.beacon.identifier === region.identifier && w.type === type)
      return w.req;
  }
};


/*
 * An app has stopped, clean up its watch
 */
Plugin.Beacon.stopApp = function (app)
{
  if (!this.watchList)
    return;
  //
  for (var i = this.watchList.length - 1; i >= 0; i--) {
    var w = this.watchList[i];
    if (w.req.app === app) {
      if (w.type === "M") {
        cordova.plugins.locationManager.stopMonitoringForRegion(w.beacon)
                .fail(console.error)
                .done();
      }
      else {
        cordova.plugins.locationManager.stopRangingBeaconsInRegion(w.beacon)
                .fail(console.error)
                .done();
      }
      this.watchList.splice(i, 1);
    }
  }
};


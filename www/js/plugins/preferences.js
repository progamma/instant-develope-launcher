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
Plugin.Preferences = {};


/*
 * Init plugin
 */
Plugin.Preferences.init = function ()
{
  if (Shell.isIOS()) {
    plugins.appPreferences.fetch(function (ris) {
      if (Shell.config.debugMode) {
        Shell.debugMode = true;
        console.warn("Debug mode enabled (config)");
      }
      else {
        if (ris) {
          Shell.debugMode = true;
          console.warn("Debug mode enabled (preferences)");
        }
        else {
          Shell.debugMode = false;
          console.warn("Debug mode disabled");
        }
      }
    }, function (err) {
      console.warn("Cannot get preferences: " + err);
    }, "debugMode");
  }
};


/*
 * Show the app preferences
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Preferences.show = function (req)
{
  plugins.appPreferences.show(function (ris) {
  }, function (err) {
  });
};


/*
 * Fetch an app preference
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Preferences.fetch = function (req)
{
  plugins.appPreferences.fetch(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  }, req.params.key);
};


/*
 * Fetch an app preference
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Preferences.store = function (req)
{
  plugins.appPreferences.store(function (result) {
  }, function (error) {
  }, req.params.key, req.params.value);
};


/*
 */
Plugin.Preferences.isIgnoringBatteryOptimizations = function (req)
{
  cordova.plugins.DozeOptimize.IsIgnoringBatteryOptimizations(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 */
Plugin.Preferences.isIgnoringDataSaver = function (req)
{
  cordova.plugins.DozeOptimize.IsIgnoringDataSaver(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 */
Plugin.Preferences.ignoreBatteryOptimizations = function (req)
{
  cordova.plugins.DozeOptimize.RequestOptimizations(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 */
Plugin.Preferences.displayOptimizationsMenu = function (req)
{
  cordova.plugins.DozeOptimize.RequestOptimizationsMenu(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 */
Plugin.Preferences.displayDataSaverMenu = function (req)
{
  cordova.plugins.DozeOptimize.RequestDataSaverMenu(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};

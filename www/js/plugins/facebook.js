/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */


/* global cordova, facebookConnectPlugin */

var Plugin = Plugin || {};
var PlugMan = PlugMan || {};

/*
 * Create plugin object
 */
Plugin.Facebook = {};


/*
 * Init plugin
 */
Plugin.Facebook.init = function (req)
{
  // Only for browser simulation!
  if (req && req.setResult) {
    req.setResult("OK");
  }
};


/*
 * Connect to facebook
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Facebook.login = function (req)
{
  var permissions = ["public_profile"];
  if (req.params && req.params.permissions && req.params.permissions.length) {
    permissions = [];
    for (var i = 0; i < req.params.permissions.length; i++) {
      permissions.push(req.params.permissions[i]);
    }
  }
  //
  facebookConnectPlugin.login(permissions, function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Connect to facebook
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Facebook.getLoginStatus = function (req)
{
  facebookConnectPlugin.getLoginStatus(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Logout from facebook
 */
Plugin.Facebook.logout = function ()
{
  facebookConnectPlugin.logout(function (result) {
  }, function (error) {
  });
};


/*
 * Show a dialog
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Facebook.showDialog = function (req)
{
  facebookConnectPlugin.showDialog(req.params.options, function (result) {
  }, function (error) {
  });
};


/*
 * Show a dialog
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Facebook.api = function (req)
{
  var permissions = ["public_profile"];
  if (req.params && req.params.permissions) {
    for (var i = 0; i < req.params.permissions.length; i++) {
      permissions.push(req.params.permissions[i]);
    }
  }
  facebookConnectPlugin.api(req.params.path, permissions, function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * An app has stopped
 */
Plugin.Facebook.stopApp = function (app)
{
};



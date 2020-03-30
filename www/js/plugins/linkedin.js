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
Plugin.Linkedin = {};


/*
 * Init plugin
 */
Plugin.Linkedin.init = function (req)
{
  // Only for browser simulation!
  if (req && req.setResult) {
    req.setResult("OK");
  }
};


/*
 * Connect to linkedin
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Linkedin.login = function (req)
{
  var scopes = ["r_basicprofile", "r_emailaddress"];
  if (req.params && req.params.scopes && req.params.scopes.length) {
    scopes = [];
    for (var i = 0; i < req.params.scopes.length; i++) {
      scopes.push(req.params.scopes[i]);
    }
  }
  //
  cordova.plugins.LinkedIn.login(scopes, !!req.params.prompt, function (result) {
    req.setResult(result || "OK");
  }, function (error) {
    req.setError(error);
  });
};


/*
 * Logout from linkedin
 */
Plugin.Linkedin.logout = function ()
{
  logout();
};


/*
 * Get the session (if any)
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Linkedin.getActiveSession = function (req)
{
  cordova.plugins.LinkedIn.getActiveSession(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};



/*
 * api get
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Linkedin.get = function (req)
{
  cordova.plugins.LinkedIn.getRequest(req.params.path, function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * api post
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Linkedin.post = function (req)
{
  cordova.plugins.LinkedIn.postRequest(req.params.path, req.params.body, function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * open profile
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Linkedin.openProfile = function (req)
{
  cordova.plugins.LinkedIn.openProfile(req.params.memberId, function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * An app has stopped
 */
Plugin.Linkedin.stopApp = function (app)
{
};



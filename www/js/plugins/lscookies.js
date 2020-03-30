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
Plugin.Lscookies = {};


/*
 * Init plugin
 */
Plugin.Lscookies.init = function ()
{
};


/*
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Lscookies.setCookie = function (req)
{
  // if expiry < 0, the plugin will get rid of the cookie when it is first read
  var expiry = req.params.exdays * 24 * 60 * 60 + (new Date()).getTime() / 1000;
  localStorage[req.app.name + "-" + req.params.name] = JSON.stringify({value: req.params.value, expiry: expiry});
  //
  // no one awaits an answer, hence no need to returnMessage
};


/*
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Lscookies.getCookies = function (req)
{
  var lscookies = {};
  var lskey;
  for (var i = 0; i < localStorage.length; i++) {
    lskey = localStorage.key(i);
    if (lskey.substr(0, req.app.name.length) === req.app.name) {
      try {
        var c = JSON.parse(localStorage.getItem(lskey));
        //
        if (c.expiry > (new Date()).getTime() / 1000)
          lscookies[lskey.substr(req.app.name.length + 1)] = c.value;
        else
          localStorage.removeItem(lskey);
      }
      catch (e) {
        //
        // if an error occurred, we are dealing with a malformatted cookie
        // remove it
        localStorage.removeItem(lskey);
      }
    }
  }
  if (req.params && req.params.mode) {
    //
    // Add important startup parameters
    var obj = {uuid: device.uuid};
    if (Shell.isIOS())
      obj.webview = "WK";
    lscookies["$device"] = obj;
    //
    // Add info startup params
    lscookies["$info"] = {launcherID: Shell.config.launcherID, launcherName: Shell.config.launcherName};
    //
    req.app.sendMessage({client: true, id: req.params.mode, cnt: lscookies, destination: req.destination || "app"}, req.orig || "*");
  }
  else {
    req.setResult(lscookies);
  }
};

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
Plugin.Vibration = {};


/*
 * Init plugin
 */
Plugin.Vibration.init = function ()
{
};


/*
 * Make the device vibrate for an given amount of time
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Vibration.vibrate = function (req)
{
  navigator.vibrate(req.params.time);
};

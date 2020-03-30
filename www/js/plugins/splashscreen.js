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
Plugin.SplashScreen = {};


/*
 * Init plugin
 */
Plugin.SplashScreen.init = function ()
{
};

/*
 * Hides the splashscreen
 */
Plugin.SplashScreen.hide = function ()
{
  navigator.splashscreen.hide();
};

/*
 * Shows the splashscreen
 */
Plugin.SplashScreen.show = function ()
{
  navigator.splashscreen.show();
};


/*
 * An app has started, hide splash
 */
Plugin.SplashScreen.startApp = function (app)
{
  this.hide();
};

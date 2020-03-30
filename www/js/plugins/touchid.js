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
Plugin.Touchid = {};


/*
 * Init plugin
 */
Plugin.Touchid.init = function ()
{
};


/*
 * check touchid availability
 */
Plugin.Touchid.isAvailable = function (req)
{
  window.plugins.touchid.isAvailable(
          function () {
            req.setResult(true);
          }, // success handler: TouchID available
          function () {
            req.setResult(false);
          } // error handler: no TouchID available
  );
};


/*
 * save a password in the keychain
 */
Plugin.Touchid.save = function (req)
{
  window.plugins.touchid.save(
          req.params.key,
          req.params.password,
          function () {
            req.setResult(true);
          }, // success handler: TouchID available
          function (msg) {
            req.setError(msg);
          } // error handler: no TouchID available
  );
};


/*
 * check if a password is in the keychain
 */
Plugin.Touchid.has = function (req)
{
  window.plugins.touchid.has(
          req.params.key,
          function () {
            req.setResult(true);
          }, // success handler: TouchID available
          function () {
            req.setResult(false);
          } // error handler: no TouchID available
  );
};


/*
 * delete a password from the keychain
 */
Plugin.Touchid.delete = function (req)
{
  window.plugins.touchid.delete(
          req.params.key,
          function () {
            req.setResult(true);
          }, // success handler: TouchID available
          function () {
            req.setResult(false);
          } // error handler: no TouchID available
  );
};


/*
 * delete a password from the keychain
 */
Plugin.Touchid.verify = function (req)
{
  window.plugins.touchid.verify(
          req.params.key,
          req.params.message,
          function (password) {
            req.setResult(password);
          }, // success handler: TouchID available
          function (errorCode) {
            req.setResult(errorCode);
          } // error handler: no TouchID available
  );
};


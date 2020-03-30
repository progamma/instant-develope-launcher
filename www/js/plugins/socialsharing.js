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
Plugin.SocialSharing = {};


/*
 * Init plugin
 */
Plugin.SocialSharing.init = function ()
{
  Plugin.SocialSharing.rect = {left: 0, top: 0, width: 300, height: 300};
  //
  window.plugins.socialsharing.iPadPopupCoordinates = function () {
    return Plugin.SocialSharing.rect.left + "," + Plugin.SocialSharing.rect.top + "," + Plugin.SocialSharing.rect.width + "," + Plugin.SocialSharing.rect.height;
  };
};


/*
 * Share via share sheet
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.SocialSharing.shareWithOptions = function (req)
{
  var options = req.params.options || {};
  if (options.rect)
    Plugin.SocialSharing.rect = options.rect;
  //
  var onSuccess = function (result) {
    req.setResult(result);
  };
  //
  var onError = function (msg) {
    req.setError(msg);
  };
  //
  window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
};


/*
 * share via email
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.SocialSharing.shareViaEmail = function (req)
{
  var options = req.params.options || {};
  //
  var message = options.message || "Message";
  var subject = options.subject || "Subject";
  //
  var onSuccess = function (result) {
    req.setResult(result);
  };
  //
  var onError = function (msg) {
    req.setError(msg);
  };
  //
  window.plugins.socialsharing.shareViaEmail(message, subject, options.toList, options.ccList,
          options.bccList, options.fileList, onSuccess, onError);
};


/*
 * can share via email
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.SocialSharing.canShareViaEmail = function (req)
{
  var onSuccess = function (result) {
    req.setResult(result);
  };
  //
  var onError = function (msg) {
    req.setError(msg);
  };
  //
  window.plugins.socialsharing.canShareViaEmail(onSuccess, onError);
};


/*
 * check app availability
 */
Plugin.SocialSharing.checkAvailability = function (req)
{
  appAvailability.check(
          req.params.scheme, // URI Scheme
          function () {  // Success callback
            req.setResult(true);
          },
          function () {  // Error callback
            req.setResult(false);
          }
  );
};

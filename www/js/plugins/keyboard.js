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
Plugin.Keyboard = {};

var Keyboard = Keyboard || undefined;

/*
 * Init plugin
 */
Plugin.Keyboard.init = function ()
{
  if (Shell.config.theme.HideKeyboardFormAccessoryBar)
    this.hideFormAccessoryBar(true);
  //
  window.addEventListener('keyboardWillShow', Plugin.Keyboard.keyboardShowHandler);
  window.addEventListener('keyboardWillHide', Plugin.Keyboard.keyboardHideHandler);
};

/*
 * Hides the splashscreen
 */
Plugin.Keyboard.hide = function ()
{
  if (Keyboard && Keyboard.hide)
    Keyboard.hide();
  else if (cordova.plugins.Keyboard && cordova.plugins.Keyboard.close)
    cordova.plugins.Keyboard.close();
};

/*
 * Shows the splashscreen
 */
Plugin.Keyboard.hideFormAccessoryBar = function (req)
{
  var flag = (typeof req === "object") ? req.params.hide : req;
  //
  if (Keyboard && Keyboard.hideFormAccessoryBar)
    Keyboard.hideFormAccessoryBar(flag);
  else if (cordova.plugins.Keyboard && cordova.plugins.Keyboard.hideKeyboardAccessoryBar)
    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(flag);
};

/*
 * Disable scroll
 */
Plugin.Keyboard.disableScroll = function (req)
{
  var flag = (typeof req === "object") ? req.params.disable : req;
  if (cordova.plugins.Keyboard)
    cordova.plugins.Keyboard.disableScroll(flag);
  else if (Keyboard && Keyboard.disableScroll)
    Keyboard.disableScroll(flag);
};


/*
 * An app has stopped, close keyboard
 */
Plugin.Keyboard.stopApp = function (app)
{
  this.hide();
  this.disableScroll(false);
};

/*
 * The keybobard is shown
 */
Plugin.Keyboard.keyboardShowHandler = function (e)
{
  // if hide timer if set, cancel it and do not send the hide event because it is "fake"
  if (this.hideTimer) {
    window.clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }
  //
  AppMan.onDeviceChange({keyboard: true, keyboardHeight: e.keyboardHeight}, true);
};

/*
 * The keybobard is shown
 */
Plugin.Keyboard.keyboardHideHandler = function ()
{
  if (Shell.isIOS()) {
    // Wait 50ms before sending an hide event to iOS because it "bounces" when
    // focus is changed from field to field
    this.hideTimer = window.setTimeout(function () {
      AppMan.onDeviceChange({keyboard: false}, true);
      this.hideTimer = null;
    }.bind(this), 50);
  }
  else {
    // Send hide event immediately to android
    AppMan.onDeviceChange({keyboard: false}, true);
  }
};


/*
 * Copy a text into the clipboard
 */
Plugin.Keyboard.copy = function (req)
{
  cordova.plugins.clipboard.copy(req.params.text);
};


/*
 * Paste a text from the clipboard
 */
Plugin.Keyboard.paste = function (req)
{
  cordova.plugins.clipboard.paste(function (text) {
    req.setResult(text);
  }, function (err) {
    req.setError(err);
  });
};

/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */

/* global cordova, Haptic Feedback */

var Plugin = Plugin || {};

/*
 * Create plugin object
 */
Plugin.Haptic = {};


/*
 * Init plugin
 */
Plugin.Haptic.init = function ()
{
};


/*
 * Produce haptic feedback
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Haptic.feedback = function (req)
{
  var type = req.params.type;
  var style = req.params.style;
  //
  // IOS
  if (TapticEngine) {
    switch (type) {
      case "selection":
        TapticEngine.selection();
        break;

      case "notification":
        TapticEngine.notification({type: style});
        break;

      case "impact":
        TapticEngine.impact({style: style});
        break;

      case "gestureSelection":
        switch (style) {
          case "start":
            TapticEngine.gestureSelectionStart();
            break;
          case "changed":
            TapticEngine.gestureSelectionChanged();
            break;
          case "end":
            TapticEngine.gestureSelectionEnd();
            break;
        }
        break;

      case "boom":
        switch (style) {
          case "weak":
            TapticEngine.unofficial.weakBoom();
            break;
          case "strong":
            TapticEngine.unofficial.strongBoom();
            break;
        }
        break;

      case "burst":
        TapticEngine.unofficial.burst();
        break;
    }
  }
  //
  // ANDROID
  var df = window.plugins.deviceFeedback;
  if (df) {
    switch (type) {
      case "acoustic":
        df.acoustic();
        break;

      case "virtualkey":
        df.haptic(df.VIRTUAL_KEY);
        break;

      case "longpress":
        df.haptic(df.LONG_PRESS);
        break;

      case "keyboardtap":
        df.haptic(df.KEYBOARD_TAP);
        break;
    }
  }
};

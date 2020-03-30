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
Plugin.Speech = {};


/*
 * Init plugin
 */
Plugin.Speech.init = function ()
{
};


/*
 * TTS speak
 */
Plugin.Speech.speak = function (req)
{
  TTS.speak(req.params.msg, function () {
    req.setResult(true);
  }, function (reason) {
    req.setError(reason);
  });
};


/*
 * SR
 */
Plugin.Speech.isRecognitionAvailable = function (req)
{
  window.plugins.speechRecognition.isRecognitionAvailable(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setError(error);
  });
};


/*
 * SR
 */
Plugin.Speech.hasPermission = function (req)
{
  window.plugins.speechRecognition.hasPermission(
          function (result) {
            req.setResult(result);
          }, function (error) {
    req.setError(error);
  }, req.params.onlyMicrophone);
};


/*
 * SR
 */
Plugin.Speech.requestPermission = function (req)
{
  window.plugins.speechRecognition.requestPermission(function (result) {
    req.setResult(true);
  }, function (error) {
    req.setResult(false);
  }, req.params.onlyMicrophone);
};


/*
 * SR
 */
Plugin.Speech.startListening = function (req)
{
  req.params.options = req.params.options || {};
  //
  window.plugins.speechRecognition.startListening(function (result) {
    if (req.params.options.showPartial) {
      req.result = result;
      PlugMan.sendEvent(req, "SpeechRecognized");
    }
    else {
      req.setResult(result);
    }
  }, function (error) {
    req.setResult(error);
  }, req.params.options);
  //
  if (req.params.options.showPartial) {
    req.setResult([]);
  }
};


/*
 * SR
 */
Plugin.Speech.stopListening = function (req)
{
  window.plugins.speechRecognition.stopListening(function (result) {
    req.setResult(true);
  }, function (error) {
    req.setResult(error);
  });
};


/*
 * SR
 */
Plugin.Speech.getSupportedLanguages = function (req)
{
  window.plugins.speechRecognition.getSupportedLanguages(function (result) {
    req.setResult(result);
  }, function (error) {
    req.setResult(error);
  });
};


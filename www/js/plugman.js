/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */

/* global cordova */

var PlugMan = PlugMan || {};
var Plugin = Plugin || {};
var Shell = Shell || {};

/*
 * Plugin manager init
 */
PlugMan.init = function ()
{
  document.addEventListener("deviceready", function () {
    PlugMan.onDeviceReady();
  }, false);
  //
  PlugMan.watchList = {};
};


/**
 * Load plugins
 */
PlugMan.onDeviceReady = function ()
{
  var np = 0;
  for (var p in Shell.config.plugins) {
    np++;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
      np--;
      if (np === 0)
        PlugMan.loadComplete();
    };
    script.onerror = function () {
      np--;
      if (np === 0)
        PlugMan.loadComplete();
    };
    script.src = "js/plugins/" + p.toLowerCase() + ".js";
    document.body.appendChild(script);
  }
};


/**
 * Plugin object has been loaded.
 */
PlugMan.loadComplete = function ()
{
  var count = 0;
  //
  // Send init to all plugins
  for (var p in Plugin) {
    if (Plugin[p].init) {
      var requireCB = Plugin[p].init(function () {
        count--;
        if (count <= 0)
          Shell.pluginComplete();
      });
      if (requireCB)
        count++;
    }
  }
  //
  if (count === 0)
    Shell.pluginComplete();
};


/*
 * Send a request to a plugin
 * @param {object} request
 */
PlugMan.processRequest = function (request)
{
  if (!request.obj)
    return;
  //
  // send only to valid plugins, removing "device-" prefix
  var pluginName = request.obj.substring(7);
  var pluginClass = pluginName.substring(0, 1).toUpperCase() + pluginName.substring(1);
  //
  var req = {};
  req.method = request.id;   // id of client function to call on result (if defined)
  req.params = request.cnt;  // parameters passed to function
  req.app = request.app;     // app object
  req.plugin = pluginName;
  req.cbId = request.cbId;
  //
  req.setResult = function (result, destination) {
    req.app.sendMessage({obj: "device-" + req.plugin, id: req.method + "CB", content: {result: result, cbId: req.cbId}, destination: destination || "app"});
  };
  req.setError = function (error, destination) {
    req.app.sendMessage({obj: "device-" + req.plugin, id: req.method + "CB", content: {error: error, cbId: req.cbId}, destination: destination || "app"});
  };
  //
  if (pluginClass in Plugin) {
    if (Plugin[pluginClass][req.method])
      Plugin[pluginClass][req.method](req);
    else
      req.setError("Method not found");
  }
  else
    req.setError("Plugin not found");
};


/*
 * Asks to fire a callback for an device event (onPosition, onAcceleration...)
 */
PlugMan.sendEvent = function (request, eventName, objId)
{
  request.app.sendMessage({obj: (objId ? objId : "device-" + request.plugin), id: "on" + eventName, content: request.result, destination: request.destination || "app"}, request.orig || "*");
};


/*
 * An app has stopped, cleaning up watches and so on
 */
PlugMan.stopApp = function (app)
{
  for (var p in Plugin) {
    if (Plugin[p].stopApp)
      Plugin[p].stopApp(app);
  }
};


/*
 * An app has started, initing app plugins
 */
PlugMan.startApp = function (app)
{
  for (var p in Plugin) {
    if (Plugin[p].startApp)
      Plugin[p].startApp(app);
  }
};


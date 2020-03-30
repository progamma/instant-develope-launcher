/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */

/* global cordova */

var AppMan = AppMan || {};
var Shell = Shell || {};


/**
 * initialize the application manager
 */
AppMan.init = function ()
{
  this.paused = false;
  //
  window.addEventListener("message", function (event) {
    var ok = event.data.source !== "shell"; // Don't listen to my messages
    ok = ok && (!event.data.startsWith || !event.data.startsWith("setImmediate$")); // Don't listen to setImmediate messages
    if (ok)
      AppMan.receiveMessage(event);
  }, false);
  //
  document.addEventListener("pause", function () {
    if (!this.paused) {
      this.paused = true;
      AppMan.sendMessage({id: "onPause", content: {}});
    }
  }.bind(this));
  //
  document.addEventListener("resign", function () {
    if (!this.paused) {
      this.paused = true;
      AppMan.sendMessage({id: "onPause", content: {resign: true}});
    }
  }.bind(this));
  //
  document.addEventListener("resume", function () {
    if (this.paused) {
      this.paused = false;
      AppMan.sendMessage({id: "onResume", content: {}});
    }
    //
    setTimeout(function () {
      Shell.updateLauncher();
      Shell.updateParams();
      AppMan.updateApps();
    }, 1000);
  }.bind(this));
  //
  document.addEventListener("active", function () {
    if (this.paused) {
      this.paused = false;
      AppMan.sendMessage({id: "onResume", content: {active: true}});
    }
  }.bind(this));
  //
  document.addEventListener("backbutton", function () {
    // Prevented?
    if (AppMan.preventBackButton && new Date() - AppMan.preventBackButton < 0)
      return;
    //
    var found = false;
    for (var name in AppMan.apps) {
      var app = AppMan.apps[name];
      if (app.iframe) {
        if (app.inplace)
          window.history.back();
        else
          app.iframe.contentWindow.history.back();
        found = true;
        break;
      }
    }
    // Handle back button in shell...
    if (!found) {
      Shell.onBackButton();
    }
  }, true);
};


/**
 * temporary disable back button
 * @param {int} ms
 */
AppMan.disableBackButton = function (ms)
{
  if (!ms)
    ms = 0;
  //
  AppMan.preventBackButton = (new Date()).getTime() + ms;
};


/**
 * receive a message from the iframe
 * @param {object} event
 */
AppMan.receiveMessage = function (event)
{
  var app = AppMan.getAppBySource(event.source);
  if (app)
    app.onMessage(event);
};


/**
 * find the app based on a event source
 * @param {object} source
 */
AppMan.getAppBySource = function (source)
{
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    if (app.inplace && app.iframe && source === window) // An inplace app uses my window
      return app;
    if (app.iframe && app.iframe.contentWindow === source) {
      return app;
    }
  }
};


/**
 * start an app
 * @param {string} name
 */
AppMan.startApp = function (name)
{
  if (AppMan.apps[name])
    AppMan.apps[name].start();
};


/**
 * stop an app
 * @param {string} name
 */
AppMan.stopApp = function (name)
{
  if (AppMan.apps[name])
    AppMan.apps[name].stop();
};


/**
 * The device has changed, let's apps know about it
 * @param {object} info
 * @param {bool} client
 */
AppMan.onDeviceChange = function (info, client)
{
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    app.setProp(info, client);
  }
};


/**
 * Send a message to every app
 * @param {object} msg
 * @param {string} orig
 */
AppMan.sendMessage = function (msg, orig)
{
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    app.sendMessage(msg, orig);
  }
};


/**
 * loads the app list from local storage
 */
AppMan.loadApps = function ()
{
  AppMan.apps = {};
  //
  var appsDom = document.getElementById("apps-list");
  appsDom.innerHTML = "";
  //
  var list = undefined;
  try {
    list = JSON.parse(localStorage.getItem("app-list"));
  }
  catch (ex) {
  }
  //
  if (list) {
    // List may contains more than one configuration per app (each one having different user segment).
    // So purge the list in order to have just one configuration per app
    list = AppMan.purgeList(list);
    //
    for (var i = 0; i < list.length; i++) {
      var app = new AppDef(list[i]);
      if (app.isExpired()) {
        app.uninstall(function () {
        });
      }
      else {
        AppMan.apps[app.name] = app;
        app.updateDom();
      }
    }
  }
};


/**
 * save the app list to the local storage
 */
AppMan.saveApps = function ()
{
  var al = [];
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    var c = app.getConfig();
    if (c)
      al.push(c);
  }
  localStorage.setItem("app-list", JSON.stringify(al));
};


/**
 * change the app list
 * @param {array} list
 * @param {boolean} reset
 */
AppMan.changeApps = function (list, reset)
{
  // List may contains more than one configuration per app (each one having different user segment).
  // So purge the list in order to have just one configuration per app
  list = AppMan.purgeList(list);
  //
  if (reset) {
    // Change all apps to invisible
    for (var name in AppMan.apps) {
      if (!AppMan.apps[name].beta)
        AppMan.apps[name].visible = false;
    }
  }
  //
  for (var i = 0; i < list.length; i++) {
    var a = list[i];
    if (!a.ide && !a.root)
      a.visible = true;
    //
    // Change inplace to true/false if a device type was specificed (ios, android)
    if (typeof a.inplace === "string")
      a.inplace = a.inplace.indexOf(Shell.getMobileOperatingSystem().toLowerCase()) > -1;
    //
    var app = AppMan.apps[a.name];
    if (app)
      app.change(list[i]);
    else {
      app = new AppDef(list[i], false);
      AppMan.apps[app.name] = app;
    }
  }
  //
  // Update DOM for all apps
  for (var name in AppMan.apps) {
    AppMan.apps[name].updateDom();
  }
  //
  AppMan.saveApps();
};


/**
 * delete an app
 * @param {string} appName
 */
AppMan.deleteApp = function (appName)
{
  var app = AppMan.apps[appName];
  if (app) {
    app.visible = false;
    app.updateDom();
    app.uninstall(function () {
    });
    delete AppMan.apps[appName];
    AppMan.saveApps();
  }
};


/**
 * filter the app list
 * @param {string} f filter
 */
AppMan.filterApps = function (f)
{
  var c = 0;
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    if (app.filter(f))
      c++;
  }
  //
  if (c === 0 && !f) {
    rc("apps-message", "hidden");
    ac("apps-search", "hidden");
    ac("apps-list", "hidden");
  }
  else {
    ac("apps-message", "hidden");
    rc("apps-search", "hidden");
    rc("apps-list", "hidden");
  }
};


/**
 * filter the app list
 * @param {object} params
 */
AppMan.installByUrl = function (params)
{
  EacAPI.installApp(params, function (response, error) {
    if (error || !response) {
      console.log(error);
    }
    else {
      //
      if (!Shell.profileData) {
        var ms = new Date().getTime() + (86400000 * 30);
        var expDate = new Date(ms);
        EacAPI.setProfileData({username: "_betauser", expire: expDate}, true);
      }
      //
      response.beta = true;
      response.removable = true;
      //
      AppMan.changeApps([response]);
      Shell.loadApps(true);
    }
  });
};



/**
 * A custom URL link has been opened
 * @param {string} url
 */
function handleOpenURL(url)
{
  console.log("handleOpenURL", url);
  //
  if (!AppMan.apps) {
    // Too early!
    setTimeout(function () {
      handleOpenURL(url);
    }, 500);
    return;
  }
  //
  // Extract cmd & query string
  var cmd = "";
  var qs = "";
  var p1 = url.indexOf("://");
  if (p1 > 0) {
    var p2 = url.indexOf("?", p1 + 1);
    if (p2 > 0) {
      cmd = url.substring(p1 + 3, p2);
      qs = url.substring(p2 + 1);
    }
    else
      cmd = url.substring(p1 + 3);
  }
  cmd = cmd.trim();
  qs = qs.trim();
  //
  // Split into key/value pairs
  var q = qs.split("&");
  var params = {};
  //
  // Convert the array of strings into an object
  for (var i = 0; i < q.length; i++) {
    var temp = q[i].split('=');
    params[temp[0]] = temp[1];
  }
  //
  // If cmd is the name of an installed app, open it and send the onCommand event
  var app = AppMan.apps[cmd];
  if (app) {
    app.start(params);
  }
  else {
    // No app has installed yet. Maybe a system command?
    if (cmd.toLowerCase() === "eacinstall" && Shell.config.eacInstallCmd) {
      // A new app should be installed, lets check the ccc about it
      AppMan.installByUrl(params);
    }
  }
}


/**
 * update apps using url
 */
AppMan.updateApps = function ()
{
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    app.updateApp();
  }
};


/**
 * update params using url
 */
AppMan.updateParams = function (p)
{

  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    app.updateParams(p);
  }
  localStorage.setItem("app-params", JSON.stringify(p));
};


/**
 * Returns true if at least one app is loading
 */
AppMan.isLoading = function ()
{
  var ris = false;
  for (var name in AppMan.apps) {
    var app = AppMan.apps[name];
    ris = ris || app.isLoading();
  }
  return ris;
};


/**
 * List may contains more than one configuration per app (each one having different user segment).
 * So purge the list in order to have just one configuration per app
 * @param {Object} list
 */
AppMan.purgeList = function (list)
{
  var newList = [];
  var purgedApps = [];
  //
  // Get user segments from local storage
  var userSegments = JSON.parse(localStorage.getItem("user-segments") || "{}");
  //
  for (var i = 0; i < list.length; i++) {
    var appName = list[i].name;
    if (purgedApps.indexOf(appName) !== -1)
      continue;
    //
    // If I have a user segment for current app, look into list for a specific configuration (an app having same name and same segment)
    // and a default configuration (an app having same name and no segment)
    if (userSegments[appName]) {
      var specificConfig = null;
      var defaultConfig = null;
      //
      for (var j = 0; j < list.length; j++) {
        if (list[j].name === appName) {
          if (!list[j].userSegment)
            defaultConfig = Object.assign({}, list[j]);
          else if (list[j].userSegment === userSegments[appName])
            specificConfig = Object.assign({}, list[j]);
        }
      }
      //
      // If there is a specific configuration, this is the configuration this app has to use
      if (specificConfig) {
        newList.push(specificConfig);
        purgedApps.push(appName);
      }
      else if (defaultConfig) { // Otherwise it has to use default configuration (if any)
        newList.push(defaultConfig);
        purgedApps.push(appName);
      }
    }
    else if (!list[i].userSegment) { // Otherwise I don't have a user segment for current app and so I'm interested just in an app config have no user segment
      newList.push(list[i]);
      purgedApps.push(appName);
    }
  }
  //
  return newList;
};


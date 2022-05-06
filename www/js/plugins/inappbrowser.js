/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */


/* global cordova, device */

var Plugin = Plugin || {};

/*
 * Create plugin object
 */
Plugin.Inappbrowser = {};


/*
 * Init plugin
 */
Plugin.Inappbrowser.init = function ()
{
  this.windowList = [];
};


/*
 * An app has stopped, clean up its windows
 */
Plugin.Inappbrowser.stopApp = function (app)
{
  for (var i = 0; i < this.windowList.length; i++) {
    this.windowList[i].close();
  }
  this.windowList = [];
};


/*
 * Opens an inappbrowser window
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Inappbrowser.open = function (req)
{
  var href = req.params.href || "";
  var target = req.params.target || "_blank";
  var options = req.params.options || "location=no,enableViewportScale=yes";
  //
  var isAndroid = device.platform.toLowerCase() === "android";
  var isIOS = device.platform.toLowerCase() === "ios";
  //
  // Cordova 10 on iOS use a local webserver available at [your_scheme]:localhost://_app_file_/... to access app files.
  // But if I want to access an external file I have to use "file:///" protocol
  if (isIOS) {
    var localString = "localhost/_app_file_";
    var idx = href.indexOf(localString);
    //
    if (idx !== -1)
      href = "file:///" + href.substr(idx + localString.length);
  }
  //
  var isPdf = href.split("?")[0].substr(-4).toLowerCase() === ".pdf";
  //
  // If trying to open a pdf on android download it and open it with the default app
  if (isPdf && isAndroid && target === "_blank") {
    // If pdf is remote download and open it
    if (href.indexOf("http://") !== -1 || href.indexOf("https://") !== -1 || href.indexOf("ftp://") !== -1
            || href.indexOf("ftps://") !== -1 || href.indexOf("file://") !== -1) {
      var fileURL = cordova.file.externalDataDirectory + "/" + ((href.split("?")[0]).split("/").pop());
      //
      // Trim spaces as they cause problems while opening the file
      fileURL = fileURL.replace(/ /g, "");
      var fileTransfer = new FileTransfer();
      var uri = encodeURI(href);
      //
      fileTransfer.download(uri, fileURL,
              function (entry) {
                cordova.plugins.fileOpener2.open(entry.toURL(), "application/pdf");
              },
              function (error) {
              }, false);
    }
    else // Otherwise use file opener plugin to open it
      cordova.plugins.fileOpener2.open(href, "application/pdf");
  }
  else if (options.indexOf("dialog=yes") > -1)
    cordova.plugins.fileOpener2.showOpenWithDialog(href, target);
  else if (options.indexOf("mime=yes") > -1)
    cordova.plugins.fileOpener2.open(href, isPdf ? "application/pdf" : target);
  else {
    // standard window.open...
    // in current inappbrowser, cordova.InAppBrowser is not there
    // in future inappbrowser, window.open will not be cordova.InAppBrowser.open anymore
    // I moved this check here rather than keep it in the constructor because the constructor
    // is executed before onDeviceReady.
    //
    var window = cordova.InAppBrowser.open(href, target, options);
    this.windowList.push(window);
  }
};

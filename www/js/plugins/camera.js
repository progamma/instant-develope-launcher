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
Plugin.Camera = {};


/*
 * Init plugin
 */
Plugin.Camera.init = function ()
{
};


/*
 * Opens the camera/photo library and uploads a picture
 * Calls onCommand on server
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Camera.getPicture = function (req)
{
  // The following values are taken from Cordova Camera documentation
  // http://plugins.cordova.io/#/package/org.apache.cordova.camera
  var opt = {};
  if (req.params && req.params.options)
    opt = req.params.options;
  //
  var online = req.app.online && req.app.mode !== "offline";
  //
  switch (opt.sourceType) {
    case "camera":
      opt.sourceType = navigator.camera.PictureSourceType.CAMERA;
      break;
    case "photolibrary":
      opt.sourceType = navigator.camera.PictureSourceType.PHOTOLIBRARY;
      break;
    case "savedphotoalbum":
      opt.sourceType = navigator.camera.PictureSourceType.SAVEDPHOTOALBUM;
      break;
    default:
      delete opt.sourceType;
  }
  //
  switch (opt.cameraDirection) {
    case "back":
      opt.cameraDirection = navigator.camera.Direction.BACK;
      break;
    case "front":
      opt.cameraDirection = navigator.camera.Direction.FRONT;
      break;
    default:
      delete opt.cameraDirection;
  }
  //
  // Adjusting target size
  opt.targetHeight = opt.targetHeight || opt.targetWidth;
  opt.targetWidth = opt.targetWidth || opt.targetHeight;
  //
  if (opt.correctOrientation === undefined)
    opt.correctOrientation = true;
  //
  var picId = opt.id || "";
  opt.destinationType = navigator.camera.DestinationType.FILE_URI;
  //
  /*
   If we are running online, we take a picture as imageuri, and upload the file from imageuri, to the server. easy.
   If we are running offline, it gets complicated. If we are an installed app, we take the file as imageuri, move it to
   cordova.file.dataDirectory/fs/appname/uploaded/ and send this publicUrl to the server. Since the server is loaded from file:// inside
   the iframe, it can load other resources from file://.
   If we are offline, but inside the shell, then the server is loaded remotely (https://remoteserver/offline.html), and hence it cannot load
   resources from file://. Hence in such case we force a low-res image, save it where it should stay, but pass a datauri as publicUrl and pass that to the server, that handles the situation an fakes
   loading a publicUrl from data: as base64.
   */
  //
  if (!online && !req.app.inplace && req.app.name == "ideapp")
    opt.quality = 20;
  //
  var fterrors = {
    1: "FILE_NOT_FOUND_ERR",
    2: "INVALID_URL_ERR",
    3: "CONNECTION_ERR",
    4: "ABORT_ERR",
    5: "NOT_MODIFIED_ERR"
  };
  //
  navigator.camera.getPicture(function (imageURI) {
    //
    var uploadHandler = function (imageURI) {
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = opt.fileName || imageURI.substr(imageURI.lastIndexOf('/') + 1);
      //
      // Sometimes, imageURI contains a "query string", so it is better to cut it off
      var p = options.fileName.indexOf("?");
      if (p > -1)
        options.fileName = options.fileName.substring(0, p);
      //
      options.httpMethod = "POST";
      options.mimeType = "image/jpeg"; // should be calculated when using photolibrary as source
      options.headers = {Connection: "close"};
      //
      var cmd = "?mode=rest&";
      if (online)
        cmd += "msgType=device-camera&sid=" + req.app.sid;
      else
        cmd += opt.upload.cmd;
      //
      var aurl = req.app.url;
      var p = aurl.indexOf("?");
      if (p > -1)
        aurl = aurl.substring(0, p);
      //
      var url = (opt.upload && opt.upload.url) || aurl;
      //
      var ft = new FileTransfer();
      ft.onprogress = function (progressEvent) {
        req.result = progressEvent;
        PlugMan.sendEvent(req, "Progress");
      };
      //
      // when sending a rest upload with msgType, it is ignored by onCommand and sent to a
      // specific callback for the plugin
      ft.upload(imageURI, url + cmd, function (result) {
        if (online)
          req.setResult({bytesSent: result.bytesSent, responseCode: result.responseCode, response: result.response});
        else {
          req.result = {id: picId, fileName: options.fileName, byteSent: result.bytesSent, responseCode: result.responseCode, responseText: result.response};
          PlugMan.sendEvent(req, "Transfer");
          //console.log("camera upload - byteSent: " + result.bytesSent + ", responseCode: " + result.responseCode + ", responseText: " + result.response);
        }
      }, function (error) {
        var e = error.code ? fterrors[error.code] : error;
        if (online)
          req.setError(e);
        else {
          req.result = {error: e};
          PlugMan.sendEvent(req, "Transfer");
          //console.log("camera upload - error: " + e);
        }
      }, options);
    };
    //
    // OFFLINE
    if (!online) {
      //
      // Setting up an error handler
      var errHandler = function (error) {
        req.setError(error.code ? fterrors[error.code] : error);
      };
      //
      // move the image into dataDirectory/fs/appname/uploaded/file.jpg
      req.app.createFs(function (err) {
        var basedir = cordova.file.dataDirectory + "/fs/" + req.app.name + "/";
        window.resolveLocalFileSystemURL(imageURI, function (origFileEntry) {
          //
          var imgFileName = opt.fileName || origFileEntry.name;
          //
          window.resolveLocalFileSystemURL(basedir, function (dataDirEntry) {
            dataDirEntry.getDirectory("uploaded", {create: true, exclusive: false}, function (destDirEntry) {
              origFileEntry.moveTo(destDirEntry, imgFileName, function (fileEntry) {
                var picture;
                //
                // We are using the IDE to test an offline app
                if (!online && req.app.name === "ideapp" && !req.app.inplace) {
                  var fileReader = new FileReader();
                  fileReader.onloadend = function () {
                    var picture = {file: [{type: undefined, path: "uploaded/" + imgFileName, publicUrl: fileReader.result}], id: picId};
                    req.result = picture;
                    PlugMan.sendEvent(req, "PreUpload");
                    //
                    if (opt.upload) {
                      uploadHandler(fileEntry.toURL());
                    }
                  };
                  fileEntry.file(function (f) {
                    fileReader.readAsDataURL(f);
                  }, errHandler);
                }
                else { // We are using an offline app (no IDE)
                  var fn = fileEntry.toInternalURL();
                  var fn2 = fileEntry.toURL();
                  fn2 = Plugin.Shelldriverhandler.adaptUrl(fn2);
                  console.warn("TOINTERNALURL=" + fn);
                  console.warn("TOURL=" + fn2);
                  var picture = {file: [{type: undefined, path: "uploaded/" + imgFileName, publicUrl: fn2}], id: picId};
                  req.result = picture;
                  PlugMan.sendEvent(req, "PreUpload");
                  //
                  if (opt.upload) {
                    uploadHandler(fileEntry.toURL());
                  }
                }
              }, errHandler);
            }, errHandler);
          }, errHandler);
        }, errHandler);
      });
    }
    else {
      // ONLINE
      uploadHandler(imageURI);
    }
  }, function (error) {
    req.setError(error);
  }, opt);
};


/*
 * save a local/remote/file object file in the camera roll
 * @param {type} req - pluginmanager.js request obj
 * @returns {true}
 */
Plugin.Camera.saveImageToGallery = function (req)
{
  var p = req.params.path + "";
  //
  // is p a remote url?
  if (p.startsWith("http://") || p.startsWith("https://")) {
    this.downloadAndSave(req);
  }
  else {
    // save it as a local file
    cordova.plugins.imagesaver.saveImageToGallery(p,
            function () {
              req.setResult(true);
            },
            function (error) {
              req.setError(error);
            });
  }
};


/*
 * download image and save it
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Camera.downloadAndSave = function (req)
{
  var opt = {};
  var fn = "cdvfile://localhost/temporary/temp" + (Math.random() + "").substring(2) + ".jpg";
  var uri = encodeURI(req.params.path);
  //
  var ft = new FileTransfer();
  //
  var fterrors = {
    1: "FILE_NOT_FOUND_ERR",
    2: "INVALID_URL_ERR",
    3: "CONNECTION_ERR",
    4: "ABORT_ERR",
    5: "NOT_MODIFIED_ERR"
  };
  //
  ft.download(uri, fn,
          function (entry) {
            var d = entry.toURL();
            cordova.plugins.imagesaver.saveImageToGallery(d,
                    function () {
                      req.setResult(true);
                      entry.remove(function () {
                      }, function () {
                      });
                    },
                    function (error) {
                      req.setError(error);
                      entry.remove(function () {
                      }, function () {
                      });
                    });
          },
          function (error) {
            var e = error.code ? fterrors[error.code] : error;
            req.setError(e);
          },
          /*
           //trustAllHosts: Optional parameter, defaults to false. If set to true, it accepts all security certificates.
           //This is useful since Android rejects self-signed security certificates. Not recommended for production use.
           //Supported on Android and iOS. (boolean)
           */
          false,
          //options: Optional parameters, currently only supports headers (such as Authorization (Basic Authentication), etc).
                  {headers: opt.headers}
          );
        };


/*
 * Get a screenshot and upload it
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Camera.getScreenshot = function (req)
{
  var opt = {};
  if (req.params && req.params.options)
    opt = req.params.options;
  //
  var fmt = opt.format === "png" ? "png" : "jpg";
  var quality = opt.quality ? parseInt(opt.quality) : 75;
  if (quality < 1)
    quality = 1;
  if (quality > 100)
    quality = 100;
  if (Shell.isIOS())
    quality = quality / 100;
  //
  var online = req.app.online && req.app.mode !== "offline";
  var picId = opt.id || "";
  //
  var fterrors = {
    1: "FILE_NOT_FOUND_ERR",
    2: "INVALID_URL_ERR",
    3: "CONNECTION_ERR",
    4: "ABORT_ERR",
    5: "NOT_MODIFIED_ERR"
  };
  //
  navigator.screenshot.save(function (error, res) {
    if (error) {
      req.setError(error);
    }
    else {
      //
      var imageURI = res.filePath;
      if (!online) {
        if (imageURI && imageURI.startsWith("/private"))
          imageURI = imageURI.substring(8);
        if (imageURI && !imageURI.startsWith("file://"))
          imageURI = "file://" + imageURI;
      }
      //
      var uploadHandler = function (imageURI) {
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = opt.fileName || imageURI.substr(imageURI.lastIndexOf('/') + 1);
        //
        // Sometimes, imageURI contains a "query string", so it is better to cut it off
        var p = options.fileName.indexOf("?");
        if (p > -1)
          options.fileName = options.fileName.substring(0, p);
        //
        options.httpMethod = "POST";
        options.mimeType = "image/jpeg"; // should be calculated when using photolibrary as source
        options.headers = {Connection: "close"};
        //
        var cmd = "?mode=rest&";
        if (online)
          cmd += "msgType=device-camera&sid=" + req.app.sid;
        else
          cmd += opt.upload.cmd;
        //
        var aurl = req.app.url;
        var p = aurl.indexOf("?");
        if (p > -1)
          aurl = aurl.substring(0, p);
        //
        var url = (opt.upload && opt.upload.url) || aurl;
        //
        var ft = new FileTransfer();
        ft.onprogress = function (progressEvent) {
          req.result = progressEvent;
          PlugMan.sendEvent(req, "Progress");
        };
        //
        // when sending a rest upload with msgType, it is ignored by onCommand and sent to a
        // specific callback for the plugin
        ft.upload(imageURI, url + cmd, function (result) {
          if (online)
            req.setResult({bytesSent: result.bytesSent, responseCode: result.responseCode, response: result.response});
          else {
            req.result = {id: picId, fileName: options.fileName, byteSent: result.bytesSent, responseCode: result.responseCode, responseText: result.response};
            PlugMan.sendEvent(req, "Transfer");
            //console.log("camera upload - byteSent: " + result.bytesSent + ", responseCode: " + result.responseCode + ", responseText: " + result.response);
          }
        }, function (error) {
          var e = error.code ? fterrors[error.code] : error;
          if (online)
            req.setError(e);
          else {
            req.result = {error: e};
            PlugMan.sendEvent(req, "Transfer");
            //console.log("camera upload - error: " + e);
          }
        }, options);
      };
      //
      // OFFLINE
      if (!online) {
        //
        // Setting up an error handler
        var errHandler = function (error) {
          req.setError(error.code ? fterrors[error.code] : error);
        };
        //
        // move the image into dataDirectory/fs/appname/uploaded/file.jpg
        req.app.createFs(function (err) {
          var basedir = cordova.file.dataDirectory + "/fs/" + req.app.name + "/";
          window.resolveLocalFileSystemURL(imageURI, function (origFileEntry) {
            //
            var imgFileName = opt.fileName || origFileEntry.name;
            //
            window.resolveLocalFileSystemURL(basedir, function (dataDirEntry) {
              dataDirEntry.getDirectory("uploaded", {create: true, exclusive: false}, function (destDirEntry) {
                origFileEntry.moveTo(destDirEntry, imgFileName, function (fileEntry) {
                  var picture;
                  //
                  // We are using the IDE to test an offline app
                  if (!online && req.app.name === "ideapp" && !req.app.inplace) {
                    var fileReader = new FileReader();
                    fileReader.onloadend = function () {
                      var picture = {file: [{type: undefined, path: "uploaded/" + imgFileName, publicUrl: fileReader.result}], id: picId};
                      req.result = picture;
                      PlugMan.sendEvent(req, "PreUpload");
                      //
                      if (opt.upload) {
                        uploadHandler(fileEntry.toURL());
                      }
                    };
                    fileEntry.file(function (f) {
                      fileReader.readAsDataURL(f);
                    }, errHandler);
                  }
                  else { // We are using an offline app (no IDE)
                    var fn = fileEntry.toInternalURL();
                    var fn2 = fileEntry.toURL();
                    fn2 = Plugin.Shelldriverhandler.adaptUrl(fn2);
                    console.warn("TOINTERNALURL=" + fn);
                    console.warn("TOURL=" + fn2);
                    var picture = {file: [{type: undefined, path: "uploaded/" + imgFileName, publicUrl: fn2}], id: picId};
                    req.result = picture;
                    PlugMan.sendEvent(req, "PreUpload");
                    //
                    if (opt.upload) {
                      uploadHandler(fileEntry.toURL());
                    }
                  }
                }, errHandler);
              }, errHandler);
            }, errHandler);
          }, errHandler);
        });
      }
      else {
        // ONLINE
        uploadHandler(imageURI);
      }

    }
  }, fmt, quality);
};


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
Plugin.Nfc = {};


/*
 * Init plugin
 */
Plugin.Nfc.init = function ()
{
  this.watchList = [];
};


/*
 * check nfc availability
 */
Plugin.Nfc.isAvailable = function (req)
{
  if (typeof nfc === "undefined") {
    req.setResult(undefined);
    return;
  }
  nfc.enabled(function () {
    req.setResult(true);
  }, function () {
    req.setResult(false);
  });
};


/*
 * Sets a watch
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Nfc.listen = function (req)
{
  if (typeof nfc === "undefined")
    return;
  //
  // Clean, then set.
  this.unlisten(req);
  //
  var pthis = this;
  var watchFunction;
  //
  nfc.beginSession();
  //
  // TAG DISCOVERED
  if (req.params.type === "tag") {
    watchFunction = function (nfcEvent) {
      pthis.processRequest(nfcEvent, req);
    };
    nfc.addTagDiscoveredListener(watchFunction);
  }
  //
  // NDEF
  if (req.params.type === "ndef") {
    watchFunction = function (nfcEvent) {
      pthis.processRequest(nfcEvent, req);
    };
    nfc.addNdefListener(watchFunction);
  }
  //
  // MIME
  if (req.params.type === "mime" && req.params.options && req.params.options.mimeType) {
    watchFunction = function (nfcEvent) {
      pthis.processRequest(nfcEvent, req);
    };
    nfc.addMimeTypeListener(req.params.options.mimeType, watchFunction);
  }
  //
  // Remember which app requests this watch
  if (watchFunction)
    this.watchList.push({fnc: watchFunction, app: req.app});
};


/*
 * Clears an acceleration watch for an app
 * @param {type} req - pluginmanager.js request obj
 */
Plugin.Nfc.unlisten = function (req)
{
  if (typeof nfc === "undefined")
    return;
  var i = this.getWatch(req.app);
  if (i > -1) {
    nfc.removeTagDiscoveredListener(this.watchList[i].fnc);
    nfc.removeNdefListener(this.watchList[i].fnc);
    nfc.removeMimeTypeListener(this.watchList[i].fnc);
    this.watchList.splice(i, 1);
  }
  nfc.invalidateSession();
};


/*
 * Returns the watch position for a given app if any
 */
Plugin.Nfc.getWatch = function (app)
{
  for (var i = 0; i < this.watchList.length; i++) {
    if (this.watchList[i].app === app)
      return i;
  }
  return -1;
};


/*
 * An app has stopped, clean up its watch
 */
Plugin.Nfc.stopApp = function (app)
{
  this.unlisten({app: app});
};


/*
 * Process a write request
 * @param {object} opt
 * @returns {undefined}
 */
Plugin.Nfc.processRequest = function (nfcEvent, req)
{
  var ok = true;
  var pthis = this;
  //
  if (req && req.params && req.params.options) {
    //
    // Test for erase request
    if (ok && req.params.options.erase && req.params.options.write === undefined) {
      ok = false;
      delete req.params.options.erase;
      nfc.erase(
              function () {
                pthis.processRequest("ok-erased", req);
              },
              function (reason) {
                delete req.params.options;
                pthis.processRequest(reason, req);
              }
      );
    }
    //
    // Test for write request
    if (ok && req.params.options.write !== undefined) {
      //
      ok = false;
      var s = req.params.options.write + "";
      var message = [];
      if (nfcEvent.tag && nfcEvent.tag.ndefMessage && !req.params.options.erase)
        message = nfcEvent.tag.ndefMessage;
      message.push(ndef.textRecord(s));
      //
      delete req.params.options.write;
      delete req.params.options.erase;
      nfc.write(message,
              function () {
                pthis.processRequest("ok-wrote:" + s, req);
              },
              function (reason) {
                delete req.params.options;
                pthis.processRequest(reason, req);
              }
      );
    }
    //
    // Test for readonly request
    if (ok && req.params.options.makeReadOnly) {
      //
      ok = false;
      //
      delete req.params.options.makeReadOnly;
      nfc.makeReadOnly(
              function () {
                pthis.processRequest("ok-readonly", req);
              },
              function (reason) {
                delete req.params.options;
                pthis.processRequest(reason, req);
              }
      );
    }
  }
  //
  // Return results to app
  if (ok) {
    req.result = nfcEvent;
    //
    // If we have a tag, return it
    if (nfcEvent.tag) {
      //
      // Setting message type
      nfcEvent.tag.eventType = nfcEvent.type;
      //
      // Converting ID in hex
      if (nfcEvent.tag.id)
        nfcEvent.tag.id = util.bytesToHexString(nfcEvent.tag.id);
      //
      // Converting the first text message if any
      if (nfcEvent.tag.ndefMessage instanceof Array) {
        nfcEvent.tag.textMessage = [];
        for (var i = 0; i < nfcEvent.tag.ndefMessage.length; i++) {
          var msg = nfcEvent.tag.ndefMessage[i];
          if (msg.tnf === 1)
            nfcEvent.tag.textMessage.push(ndef.textHelper.decodePayload(msg.payload));
        }
      }
      //
      req.result = nfcEvent.tag;
    }
    //
    PlugMan.sendEvent(req, "Tag");
  }
};


/*
 * show nfc availability (android)
 */
Plugin.Nfc.showSettings = function (req)
{
  nfc.showSettings(function () {
    req.setResult(true);
  }, function () {
    req.setResult(false);
  });
};


/*
 * enable NFC session
 */
Plugin.Nfc.beginSession = function (req)
{
  nfc.beginSession(function () {
    req.setResult(true);
  }, function () {
    req.setResult(false);
  });
};


/*
 * close NFC session (IOS)
 */
Plugin.Nfc.invalidateSession = function (req)
{
  nfc.invalidateSession(function () {
    req.setResult(true);
  }, function () {
    req.setResult(false);
  });
};

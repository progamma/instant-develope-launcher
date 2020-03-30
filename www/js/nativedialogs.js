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
Plugin.Notification = {};


/*
 * Init plugin
 */
Plugin.Notification.init = function ()
{
  this.dialogQueue = [];
  this.clearingDialogQueue = false;
};


/*
 * Alert dialog
 * Calls alertCB on server
 * @returns {undefined}
 */
Plugin.Notification.alert = function (req)
{
  // add call to queue
  this.dialogQueue.push({cmd: "alert", msg: req.params.message, title: req.params.title, btn: req.params.buttonName, req: req});
  // if the queue is not currently beaing cleared, start doing it
  if (!this.clearingDialogQueue) {
    this.clearingDialogQueue = true;
    this.recursiveDialog();
  }
};


/*
 * Confirm dialog
 * Calls confirmCB on server
 * @returns {undefined}
 */
Plugin.Notification.confirm = function (req)
{
  // add call to queue
  this.dialogQueue.push({cmd: "confirm", msg: req.params.message, title: req.params.title, btn: req.params.buttonLabels, req: req});
  if (!this.clearingDialogQueue) {
    // if the queue is not currently beaing cleared, start doing it
    this.clearingDialogQueue = true;
    this.recursiveDialog();
  }
};


/*
 * Prompt dialog
 * Calls promptCB on server
 * @returns {undefined}
 */
Plugin.Notification.prompt = function (req)
{
  // add call to queue
  this.dialogQueue.push({cmd: "prompt", msg: req.params.message, title: req.params.title, btn: req.params.buttonLabels, def: req.params.defaultText, req: req});
  if (!this.clearingDialogQueue) {
    // if the queue is not currently beaing cleared, start doing it
    this.clearingDialogQueue = true;
    this.recursiveDialog();
  }
};


/*
 * Dialog callback generator. It updates the dialog queue and
 * calls a specific callback for each dialog kind
 */
Plugin.Notification.recursiveCB = function (cb) {
  var pthis = this;
  var f = function (res) {
    pthis.dialogQueue.splice(0, 1);
    cb(res);
    if (pthis.dialogQueue.length > 0) {
      // go to next dialog in queue
      pthis.recursiveDialog();
    } else {
      // it was the last element in queue, stop clearing and end recursion
      pthis.clearingDialogQueue = false;
    }
  };
  return f;
};


/*
 * Recursive call to dialogs
 * It reads the first dialog object in the queue, and based on its kind
 * it defines the call to be made.
 * @returns {undefined}
 */
Plugin.Notification.recursiveDialog = function ()
{
  var dialog = this.dialogQueue[0];
  var args = [];
  var timeout = 0;
  //
  // Argument sanitizaton. If not string, the shell exits
  dialog.msg = dialog.msg + "";
  if (dialog.title)
    dialog.title = dialog.title + "";
  if (dialog.btn && dialog.btn.length > 0) {
    for (var i = 0; i < dialog.btn.length; i++)
      dialog.btn[i] = dialog.btn[i] + "";
  }
  //
  switch (dialog.cmd) {
    case "alert":
      args = [dialog.msg, this.recursiveCB(function () {
          dialog.req.setResult(true);
        }), dialog.title, dialog.btn];
      break;

    case "confirm":
      args = [dialog.msg, this.recursiveCB(function (buttonIndex) {
          dialog.req.setResult(buttonIndex);
        }), dialog.title, dialog.btn];
      break;

    case "prompt":
      if (device.platform.toLowerCase() === "ios")
        timeout = 400; // Without it the keyboard shows and hides immediately
      args = [dialog.msg, this.recursiveCB(function (result) {
          dialog.req.setResult(result); // { buttonIndex:  (Number), input1: (String) }
        }), dialog.title, dialog.btn, dialog.def];
      break;
  }
  //
  // open the dialog
  setTimeout(function () {
    navigator.notification[dialog.cmd].apply(this, args);
  }, timeout);
};



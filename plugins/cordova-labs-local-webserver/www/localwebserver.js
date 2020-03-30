/*
 *
 *
 */

var argscheck = require('cordova/argscheck'),
        exec = require('cordova/exec');

var localwebserver = {
  getPort: function (successCB, failureCB) {
    argscheck.checkArgs('fF', 'CordovaLocalWebServer.getPort', arguments);
    exec(successCB, failureCB, "CordovaLocalWebServer", "getPort", []);
  },
  getToken: function (successCB, failureCB) {
    argscheck.checkArgs('fF', 'CordovaLocalWebServer.getToken', arguments);
    exec(successCB, failureCB, "CordovaLocalWebServer", "getToken", []);
  },
};

module.exports = localwebserver;

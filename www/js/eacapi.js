/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */

var EacAPI = EacAPI || {};
var Shell = Shell || {};


/*
 * init eac api
 */
EacAPI.init = function ()
{
  try {
    Shell.profileData = JSON.parse(localStorage.getItem("profile-data"));
  }
  catch (ex) {
  }
  if (Shell.profileData) {
    if (!Shell.profileData.expire || Shell.profileData.expire < new Date()) {
      Shell.profileData = undefined;
      localStorage.removeItem("profile-data");
    }
  }
  //
  // Add profile data to handle multi-app console launchers
  if (!Shell.profileData && Shell.config.eacLoginCmd && !Shell.config.eacLogin) {
    Shell.profileData = {username: "username"};
  }
  //
  // Update applications (not when reconnecting)
  if (!window.sessionStorage.getItem("reconnect"))
    EacAPI.refreshApps();
};


/*
 * Update applications
 */
EacAPI.refreshApps = function (flWait)
{
  // Update applications
  if (Shell.profileData) {
    if (!Shell.loginData)
      Shell.loginData = {username: Shell.profileData.username, keep: true};
    if (flWait)
      Shell.setWaitMode(true);
    EacAPI.tryLogin(Shell.loginData, function (field, error) {
      if (!error)
        Shell.loadApps(false, true);
    });
  }
};


/*
 * signup command
 */
EacAPI.trySignup = function (signupData, cb)
{
  Shell.setWaitMode(true);
  //
  var url = Shell.config.eacSignupCmd;
  //
  var params = {username: signupData.username, password: signupData.password, email: signupData.email};
  if (Shell.Device && Shell.Device.uuid)
    params.deviceid = Shell.Device.uuid;
  params.launcherid = Shell.config.launcherID;
  //
  EacAPI.request(url, params, function (response, error) {
    Shell.setWaitMode(false);
    if (error)
      cb("signup-username", error);
    else if (!response)
      cb("signup-username", "Response error");
    else if (response.error)
      cb(response.field, response.error);
    else
      cb();
  });
};


/*
 * get terms command
 */
EacAPI.signTerms = function (cb)
{
  var url = Shell.config.eacTermsCmd;
  //
  if (!url) {
    cb();
    return;
  }
  //
  Shell.setWaitMode(true);
  //
  var params = {};
  if (Shell.Device && Shell.Device.uuid)
    params.deviceid = Shell.Device.uuid;
  params.launcherid = Shell.config.launcherID;
  //
  EacAPI.request(url, params, function (response, error) {
    Shell.setWaitMode(false);
    cb(response);
  });
};


/*
 * login command
 */
EacAPI.tryLogin = function (loginData, cb)
{
  if (loginData.password && loginData.wait !== false)
    Shell.setWaitMode(true);
  //
  var url = Shell.config.eacLoginCmd;
  //
  var params = {username: loginData.username || "", password: loginData.password || ""};
  if (Shell.profileData && Shell.profileData.autk)
    params.autk = Shell.profileData.autk;
  if (Shell.Device && Shell.Device.uuid)
    params.deviceid = Shell.Device.uuid;
  params.launcherid = Shell.config.launcherID;
  //
  EacAPI.request(url, params, function (response, error) {
    Shell.setWaitMode(false);
    if (error)
      cb("signup-username", error);
    else if (!response)
      cb("signup-username", "Response error");
    else if (response.error)
      cb(response.field, response.error);
    else {
      EacAPI.setProfileData(response, loginData.keep);
      cb();
    }
  });
};


/*
 * recover password command
 */
EacAPI.recoverPassword = function (recoverData, cb)
{
  Shell.setWaitMode(true);
  //
  var url = Shell.config.eacRecoverCmd;
  //
  var params = {username: recoverData.username};
  if (Shell.Device && Shell.Device.uuid)
    params.deviceid = Shell.Device.uuid;
  params.launcherid = Shell.config.launcherID;
  //
  EacAPI.request(url, params, function (response, error) {
    Shell.setWaitMode(false);
    if (error)
      cb("recover-user", error);
    else if (!response)
      cb("recover-user", "Response error");
    else if (response.error)
      cb(response.field, response.error);
    else
      cb(null, response.message);
  });
};


/*
 * store profile data
 */
EacAPI.setProfileData = function (profileData, keep)
{
  Shell.profileData = profileData;
  if (Shell.loginData && Shell.profileData)
    Shell.profileData.username = Shell.loginData.username;
  if (keep)
    localStorage.setItem("profile-data", JSON.stringify(Shell.profileData));
  else
    localStorage.removeItem("profile-data");
};


/*
 * install app command
 */
EacAPI.installApp = function (params, cb)
{
  Shell.setWaitMode(true);
  //
  var url = Shell.config.eacInstallCmd;
  //
  if (Shell.Device && Shell.Device.uuid)
    params.deviceid = Shell.Device.uuid;
  params.launcherid = Shell.config.launcherID;
  //
  EacAPI.request(url, params, function (response, error) {
    Shell.setWaitMode(false);
    cb(response, error);
  });
};


/*
 * execute a request to the server
 */
EacAPI.request = function (url, params, cb)
{
  var req = new XMLHttpRequest();
  //
  var formData = new FormData();
  for (var p in params) {
    formData.append(p, params[p]);
  }
  //
  req.responseType = "json";
  req.open("POST", url, true);
  //
  req.ontimeout = function () {
    this.abort();
    cb(null, "Timeout");
    return;
  };
  //
  req.onerror = function () {
    cb(null, "Request error");
  };
  //
  req.onload = function () {
    cb(this.response);
  };
  //
  req.send(formData);
};

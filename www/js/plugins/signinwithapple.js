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
Plugin.SignInWithApple = {};


/*
 * Init plugin
 */
Plugin.SignInWithApple.init = function (cb)
{
  // If not iOS, I will use Sign in with Apple JS
  // (https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
  // So load appleid.auth.js and call cb at the end
  if (!Shell.isIOS()) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
      cb();
    };
    script.onerror = function () {
      cb();
    };
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    document.body.appendChild(script);
    //
    // Return true to increment callback count
    return true;
  }
};


/*
 * Returns true if Sign in with Apple is available
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.SignInWithApple.isAvailable = function (req)
{
  if (Shell.isIOS()) {
    SignInWithApple.isAvailable().then(function (isAvailable) {
      req.setResult(isAvailable);
    }).catch(function (error) {
      req.setError(error);
    });
  }
  else
    req.setResult(AppleID ? true : false);
};


/*
 * Request authentication for Apple ID
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.SignInWithApple.request = function (req)
{
  req.params.options = req.params.options || {};
  var options = {};
  //
  if (Shell.isIOS()) {
    // Set requested scopes using ios syntax (0 means "name" and 1 means "email")
    options.requestedScopes = [];
    if (req.params.options.scope) {
      if (req.params.options.scope.indexOf("name") !== -1)
        options.requestedScopes.push(0);
      if (req.params.options.scope.indexOf("email") !== -1)
        options.requestedScopes.push(1);
    }
    //
    // Set the requested operation. The default value is 1 and it means "login".
    // This property shoulden't be set by user, but I handle it if he does
    options.requestedOperation = req.params.options.requestedOperation || 1;
    //
    // Set other iOS options copying from request options
    options.user = req.params.options.userId;
    options.state = req.params.options.state;
    options.nonce = req.params.options.nonce;
    //
    // Request credential to Apple
    SignInWithApple.request(options).then(function (credential) {
      req.setResult(credential);
    }).catch(function (error) {
      req.setError(error);
    });
  }
  else {
    if (AppleID) {
      var credentialData = null;
      //
      options.clientId = req.params.options.clientId;
      options.scope = req.params.options.scope;
      options.redirectURI = req.params.options.redirectURI;
      options.state = req.params.options.state;
      options.usePopup = true;
      //
      // Init authentication request asking for scope data
      AppleID.auth.init(options);
      //
      // Prepare sign in with apple url
      var href = "https://appleid.apple.com/auth/authorize?";
      href += ("client_id=" + options.clientId);
      href += ("&redirect_uri=" + encodeURIComponent(options.redirectURI));
      href += "&response_type=code%20id_token";
      href += ("&scope=" + encodeURIComponent(options.scope));
      href += "&response_mode=form_post";
      //
      // Open url in in app browser
      var w = cordova.InAppBrowser.open(href, "_blank", "location=no,hardwareback=no");
      //
      // Prepare a script to inject into child browser in order to intercept http requests
      var script = "";
      script += "var oldXHROpen = window.XMLHttpRequest.prototype.open;";
      script += "window.XMLHttpRequest.prototype.open = function(method, url, async, user, password) {";
      script += "   this.addEventListener('load', function() {";
      script += "       if(url.indexOf('appleauth/auth/oauth/authorize') !== -1) ";
      script += "           document.cookie = '__appleLoginCredential__='+JSON.stringify(this.responseText);";
      script += "   });";
      script += "   return oldXHROpen.apply(this, arguments);";
      script += "}";
      //
      // Listen on page load start
      w.addEventListener("loadstart", function () {
        // Clear out the apple login cookie after page load start
        w.executeScript({code: "document.cookie = '__appleLoginCredential__='"});
      });
      //
      // Listen on page load stop
      w.addEventListener("loadstop", function (params) {
        // After login, Apple would redirect to URI provided in options.
        // But since I don't want to be redirected, I close the in app browser when
        // the loaded url is redirectURI and go back to the app.
        // After close, "exit" event will be fired
        if (params.url.indexOf(options.redirectURI) !== -1)
          w.close();
        //
        // Execute script that intercepts http requests
        w.executeScript({code: script});
        //
        // Start an interval
        window.getCookieInterval = setInterval(function () {
          // Check for the existence of __appleLoginCredential__ in the child browser's cookies.
          w.executeScript({code: "document.cookie"}, function (values) {
            values = values[0] || "";
            values = values.split(";");
            //
            var credentialCookie = null;
            for (var i = 0; i < values.length; i++) {
              var parts = values[i].split("=");
              if (parts[0] === "__appleLoginCredential__") {
                credentialCookie = parts[1];
                break;
              }
            }
            //
            // If I found the cookie I was looking for, save it and clear get cookie interval
            if (credentialCookie) {
              credentialData = credentialCookie;
              clearInterval(window.getCookieInterval);
            }
          });
        }, 100);
      });
      //
      // Listen on page load error
      w.addEventListener("loaderror", function () {
        if (window.getCookieInterval)
          clearInterval(window.getCookieInterval);
        //
        w.close();
        req.setError("");
      });
      //
      // Listen on in app browser close
      w.addEventListener("exit", function () {
        // Clear get cookie interval
        if (window.getCookieInterval)
          clearInterval(window.getCookieInterval);
        //
        // Parse credential data
        try {
          credentialData = JSON.parse(JSON.parse(credentialData));
        }
        catch (ex) {
          credentialData = null;
        }
        // If I have credential data prepare result
        if (credentialData) {
          var user = credentialData.user || {};
          user.name = user.name || {};
          var authorization = credentialData.authorization || {};
          //
          var tokenParts = authorization.id_token.split(".");
          var decodedToken = JSON.parse(atob(tokenParts[1]));
          //
          var credential = {};
          credential.fullName = {givenName: user.name.firstName, familyName: user.name.lastName};
          credential.email = user.email;
          credential.user = decodedToken.sub;
          credential.identityToken = authorization.id_token;
          //
          req.setResult(credential);
        }
        else // Otherwise it means user cancelled authorize
          req.setError("user_cancelled_authorize");
      });
    }
    else
      req.setError("Plugin not available");
  }
};


/*
 * Returns the user credential status
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.SignInWithApple.getCredentialState = function (req)
{
  if (Shell.isIOS()) {
    SignInWithApple.getCredentialState(req.params.options).then(function (credentialState) {
      req.setResult(credentialState);
    }).catch(function (error) {
      req.setError(error);
    });
  }
  else
    req.setError("Plugin not available");
};

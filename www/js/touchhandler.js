/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2014
 * All rights reserved
 */

/* global device */

var TH = TH || {};
var View = View || {};
var Client = undefined;


TH.props = {
  threshold: 20,
  timeThreshold: 300
};


TH.init = function (ele)
{
  ele.addEventListener("touchstart", TH.handleTouchStart, {passive: true});
  ele.addEventListener("touchmove", TH.handleTouchMove, {passive: true});
  ele.addEventListener("touchend", TH.handleTouchEnd);
  ele.addEventListener("touchcancel", TH.handleCancel, {passive: true});
};


TH.clearTouchData = function ()
{
  TH.state = {
    touchId: null,
    touchX: null,
    touchY: null,
    touchTime: null
  };
};


TH.handleTouchStart = function (e)
{
  // one+ touches means the user isn't trying to tap this element
  if (e.touches.length !== 1 || e.targetTouches.length !== 1) {
    TH.clearTouchData();
    return;
  }
  var tch = e.targetTouches[ 0 ];
  TH.state = {
    touchId: tch.identifier,
    touchX: tch.screenX,
    touchY: tch.screenY,
    touchTime: (new Date()).getTime()
  };
};


TH.handleTouchMove = function (e)
{
  if (TH.state.touchId === null) {
    return;
  }
  if (e.touches.length !== 1 || e.targetTouches.length !== 1) {
    TH.clearTouchData();
    return;
  }
  var tch = e.targetTouches[ 0 ];
  if (TH.state.touchId !== tch.identifier) {
    TH.clearTouchData();
    return;
  }
  // verify that the touch did not move outside the threshold
  var dist = Math.sqrt(Math.pow(tch.screenX - TH.state.touchX, 2) + Math.pow(tch.screenY - TH.state.touchY, 2));
  // if it was moved farther than the allowed amount, then we should cancel the touch
  if (dist > TH.props.threshold) {
    TH.clearTouchData();
  }
};


TH.handleTouchEnd = function (e)
{
  if (TH.state.touchId === null) {
    return;
  }
  if (TH.props.timeThreshold !== null) {
    // length of press exceeds the amount of time that we are doing anything for
    if (((new Date()).getTime() - TH.state.touchTime > TH.props.timeThreshold)) {
      TH.clearTouchData();
      return;
    }
  }
  // still a touch remaining
  if (e.touches.length !== 0) {
    TH.clearTouchData();
    return;
  }
  // get the touch from the list of changed touches
  var tch;
  for (var i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === TH.state.touchId) {
      tch = e.changedTouches[i];
      break;
    }
  }
  if (!tch) {
    TH.clearTouchData();
    return;
  }
  var target = tch.target;
  if (target === document.activeElement) {
    // if it's an input where typing is allowed and it's already focused,
    // don't do anything. this is probably an attempt to move the cursor
    TH.clearTouchData();
    return;
  }
  //
  // trigger the click and clear the data
  TH.triggerClick(target, e);
  TH.clearTouchData();
};


TH.handleTouchCancel = function ()
{
  TH.clearTouchData();
};

TH.triggerClick = function (target, e)
{
  // Search for a clickable element (use/svg is special)
  if (target && target.tagName !== "use") {
    while (target && typeof target.click !== "function") {
      target = target.parentNode;
    }
  }
  if (!target || target.classList.contains("want-click"))
    return;
  //
  var appObj;
  var appObjWantInput;
  if (Client && Client.eleMap)
    appObj = Client.eleMap[target.id];
  if (appObj && appObj.wantInput)
    appObjWantInput = appObj.wantInput();
  //
  var lbl = false;
  var obj = target;
  while (obj) {
    if (obj.tagName === "LABEL" && !obj.classList.contains("want-click")) {
      var f = document.getElementById(obj.htmlFor);
      if (TH.objWantInput(f)) {
        lbl = true;
        target = f;
      }
      break;
    }
    obj = obj.parentNode;
  }
  //
  // Keyboard is open?
  var ko = false;
  var ae = document.activeElement;
  if (ae !== TH.lastActiveElement && TH.objWantInput(ae))
    ko = true;
  //
  TH.lastActiveElement = undefined;
  //
  // Keyboard will open?
  var kw = lbl;
  if (TH.objWantInput(target))
    kw = true;
  //
  // If keyboard will open but now it is not open, force focus
  if (kw) {
    target.focus();
    // prevent the simulated mouse events
    e.preventDefault();
    // we don't need this touch end event to be handled multiple times if it's interpreted as a click
    e.stopPropagation();
  }
  //
  // If keyboard is open but the tap do not open it, close it
  if (ko && !kw && !appObjWantInput) {
    //
    // Send on change if needed
    if (ae && ae.onchange)
      ae.onchange();
    ae.blur();
    document.body.focus();
    TH.lastActiveElement = ae;
    //
    // Really close the keyboard!
    if (View && View.mainFrame && View.mainFrame.device.shell)
      View.mainFrame.device.shell.postMessage({obj: "device-keyboard", id: "hide"}, "*");
  }
  //
  // Don't want to click on label because keyboard will be weird in this case
  if (!kw) {
    TH.sendClick(target, e);
    // prevent the simulated mouse events
    e.preventDefault();
    // we don't need this touch end event to be handled multiple times if it's interpreted as a click
    e.stopPropagation();
  }
};


TH.objWantInput = function (obj)
{
  if (obj && obj.tagName === "TEXTAREA")
    return true;
  if (obj && obj.tagName === "SELECT")
    return true;
  if (obj && obj.tagName === "INPUT" && obj.type !== "button" && obj.type !== "checkbox")
    return true;
};


TH.sendClick = function (target, srcEvent)
{
  var t = srcEvent.changedTouches[0];
  var ev = document.createEvent('MouseEvents');
  ev.initMouseEvent('click', true, true, window, 1, t.screenX, t.screenY, t.clientX, t.clientY, false, false, false, false, 0, null);
  //
  // on iOS delay click for a little to allow scroll/touch event to settle
  var dobj = target;
  var c = 0;
  var delay = null;
  while (dobj && c < 4 && !delay) {
    delay = dobj.getAttribute("click-delay");
    dobj = dobj.parentNode;
    c++;
  }
  if (delay)
    delay = parseInt(delay);
  //
  if (delay) {
    setTimeout(function () {
      target.dispatchEvent(ev);
    }, delay);
  }
  else {
    target.dispatchEvent(ev);
  }
};

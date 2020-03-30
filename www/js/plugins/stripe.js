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
Plugin.Stripe = {};


/*
 * Init plugin
 */
Plugin.Stripe.init = function ()
{
  this.handler = {};
};


/*
 * Configure stripe payment
 */
Plugin.Stripe.configure = function (req)
{
  if (StripeCheckout)
    this.handler = StripeCheckout.configure({
      key: req.params.key,
      token: function (token) {
        req.result = token;
        PlugMan.sendEvent(req, "Pay", req.params.obj);
      }
    });
};


/*
 * Close the stripe handler
 */
Plugin.Stripe.handlerClose = function ()
{
  if (this.handler.close)
    this.handler.close();
};


/*
 * Start payment
 */
Plugin.Stripe.handlerOpen = function (req)
{
  if (this.handler.open)
    this.handler.open(req.params);
};

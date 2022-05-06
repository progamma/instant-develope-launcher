/*
 * Instant Developer Next
 * Copyright Pro Gamma Spa 2000-2015
 * All rights reserved
 */

/* global cordova, StatusBar */

var Plugin = Plugin || {};

/*
 * Create plugin object
 */
Plugin.Calendar = {};


/*
 * Init plugin
 */
Plugin.Calendar.init = function ()
{
};


/*
 * Create a calendar
 */
Plugin.Calendar.createCalendar = function (req)
{
  window.plugins.calendar.createCalendar(req.params.calendarName,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * delete a calendar
 */
Plugin.Calendar.deleteCalendar = function (req)
{
  window.plugins.calendar.deleteCalendar(req.params.calendarName,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * open a calendar
 */
Plugin.Calendar.openCalendar = function (req)
{
  var d = this.convertDate(req.params.date);
  window.plugins.calendar.openCalendar(d,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * create an event
 */
Plugin.Calendar.createEvent = function (req)
{
  var opt = req.params.options || {};
  //
  var title = opt.title || "New event";
  delete opt.title;
  //
  var location = opt.location || "";
  delete opt.location;
  //
  var notes = opt.notes || "";
  delete opt.notes;
  //
  var startDate = this.convertDate(opt.startDate);
  delete opt.startDate;
  //
  var endDate = this.convertDate(opt.endDate);
  delete opt.endDate;
  //
  var interactive = opt.interactive;
  delete opt.interactive;
  //
  if (opt.recurrenceEndDate)
    opt.recurrenceEndDate = this.convertDate(opt.recurrenceEndDate);
  //
  var met = interactive ? "createEventInteractivelyWithOptions" : "createEventWithOptions";
  //
  window.plugins.calendar[met](title, location, notes, startDate, endDate, opt,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * find an event
 */
Plugin.Calendar.findEvent = function (req)
{
  var opt = req.params.options || {};
  //
  var title = opt.title;
  delete opt.title;
  //
  var location = opt.location;
  delete opt.location;
  //
  var notes = opt.notes;
  delete opt.notes;
  //
  var startDate = new Date();
  if (opt.startDate)
    startDate = this.convertDate(opt.startDate);
  delete opt.startDate;
  //
  var endDate = new Date(new Date().getTime() + 31556952000);
  if (opt.endDate)
    endDate = this.convertDate(opt.endDate);
  delete opt.endDate;
  //
  window.plugins.calendar.findEventWithOptions(title, location, notes, startDate, endDate, opt,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * find all events in a calendar
 */
Plugin.Calendar.findAllEventsInNamedCalendar = function (req)
{
  window.plugins.calendar.findAllEventsInNamedCalendar(req.params.calendarName,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * delete an event
 */
Plugin.Calendar.deleteEvent = function (req)
{
  var opt = req.params.options || {};
  //
  var title = opt.title;
  delete opt.title;
  //
  var location = opt.location;
  delete opt.location;
  //
  var notes = opt.notes;
  delete opt.notes;
  //
  var startDate;
  if (opt.startDate)
    startDate = this.convertDate(opt.startDate);
  delete opt.startDate;
  //
  var endDate;
  if (opt.endDate)
    endDate = this.convertDate(opt.endDate);
  delete opt.endDate;
  //
  var calendarName = opt.calendarName;
  delete opt.calendarName;
  //
  if (calendarName) {
    window.plugins.calendar.deleteEventFromNamedCalendar(title, location, notes, startDate, endDate, calendarName,
            function (result) {
              req.setResult(result);
            },
            function (error) {
              req.setError(error);
            });
  }
  else {
    window.plugins.calendar.deleteEvent(title, location, notes, startDate, endDate,
            function (result) {
              req.setResult(result);
            },
            function (error) {
              req.setError(error);
            });
  }
};


/*
 * modify an event
 */
Plugin.Calendar.modifyEvent = function (req)
{
  var oldEve = req.params.oldEvent || {};
  var newEve = req.params.newEvent || {};
  //
  var oldTitle = oldEve.title;
  delete oldEve.title;
  //
  var oldLocation = oldEve.location;
  delete oldEve.location;
  //
  var oldNotes = oldEve.notes;
  delete oldEve.notes;
  //
  var oldStartDate;
  if (oldEve.startDate)
    oldStartDate = this.convertDate(oldEve.startDate);
  delete oldEve.startDate;
  //
  var oldEndDate;
  if (oldEve.endDate)
    oldEndDate = this.convertDate(oldEve.endDate);
  delete oldEve.endDate;
  //
  var newTitle = newEve.title;
  delete newEve.title;
  //
  var newLocation = newEve.location;
  delete newEve.location;
  //
  var newNotes = newEve.notes;
  delete newEve.notes;
  //
  var newStartDate;
  if (newEve.startDate)
    newStartDate = this.convertDate(newEve.startDate);
  delete newEve.startDate;
  //
  var newEndDate;
  if (newEve.endDate)
    newEndDate = this.convertDate(newEve.endDate);
  delete newEve.endDate;
  //
  window.plugins.calendar.modifyEventWithOptions(oldTitle, oldLocation, oldNotes, oldStartDate, oldEndDate, newTitle, newLocation, newNotes, newStartDate, newEndDate, oldEve, newEve,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * list events
 */
Plugin.Calendar.listEventsInRange = function (req)
{
  var startDate = this.convertDate(req.params.startDate);
  //
  var endDate = this.convertDate(req.params.endDate);
  //
  window.plugins.calendar.listEventsInRange(startDate, endDate,
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * list calendars
 */
Plugin.Calendar.listCalendars = function (req)
{
  window.plugins.calendar.listCalendars(
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * Get permission
 */
Plugin.Calendar.hasPermission = function (req)
{
  var met = "has";
  if (req.params.read || !req.params.write)
    met += "Read";
  if (req.params.write)
    met += "Write";
  met += "Permission";
  //
  window.plugins.calendar[met](
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * Ask permission
 */
Plugin.Calendar.requestPermission = function (req)
{
  var met = "request";
  if (req.params.read || !req.params.write)
    met += "Read";
  if (req.params.write)
    met += "Write";
  met += "Permission";
  //
  window.plugins.calendar[met](
          function (result) {
            req.setResult(result);
          },
          function (error) {
            req.setError(error);
          });
};


/*
 * Init plugin
 */
Plugin.Calendar.convertDate = function (str)
{
  if (!str)
    return new Date();
  //
  var d = new Date(str);
  //
  // Adjust space into T
  if (isNaN(d.getTime()) && str.length > 10) {
    str = str.substring(0, 10) + "T" + str.substring(11);
    d = new Date(str);
  }
  //
  // Today is better than nothing
  if (isNaN(d.getTime()))
    d = new Date();
  //
  return d;
};

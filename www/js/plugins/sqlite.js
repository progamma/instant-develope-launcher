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
Plugin.Sqlite = {};


/*
 * Init plugin
 */
Plugin.Sqlite.init = function ()
{
  this.dbs = {};
  this.SQLite = window.cordova.require('cordova-sqlite-plugin.SQLite');
};


/*
 */
Plugin.Sqlite.openDatabase = function (req)
{
  var name = req.params.name;
  //
  // Let's see if the DB is already open: we reuse the same connection because
  // iOS does not support multiple connection on the same sqlite DB
  for (var p in this.dbs) {
    var edb = this.dbs[p];
    if (edb.name === name) {
      edb.count++;
      req.setResult(edb.id);
      var nl = this.addLogEntry({cmd: "openDatabase", id: edb.id, name: name});
      this.completeLogEntry(nl, {open: false, count: edb.count});
      return;
    }
  }
  //
  var id = (Math.random() + "").substring(2);
  var conn = new this.SQLite(name);
  var dbobj = {id: id, name: name, conn: conn, app: req.app, count: 1, queryCount: 0};
  var nl = this.addLogEntry({cmd: "openDatabase", id: id, name: name});
  conn.open(function (err) {
    if (err) {
      req.setError(err.message);
      this.completeLogEntry(nl, {error: err.message});
    }
    else {
      this.dbs[id] = dbobj;
      req.setResult(id);
      this.completeLogEntry(nl);
    }
  }.bind(this));
};


/*
 */
Plugin.Sqlite.logStart = function (req)
{
  this.log = true;
};


/*
 */
Plugin.Sqlite.logStop = function (req)
{
  this.log = false;
};


/*
 */
Plugin.Sqlite.logGet = function (req)
{
  req.setResult(this.logBuffer);
};


/*
 */
Plugin.Sqlite.logClear = function (req)
{
  delete this.logBuffer;
};


/*
 */
Plugin.Sqlite.addLogEntry = function (data)
{
  if (this.log) {
    if (!this.logBuffer) {
      this.logBuffer = [];
      this.openLogCount = 0;
    }
    //
    data.start = new Date();
    data.olc = this.openLogCount++;
    this.logBuffer.push(data);
    return this.logBuffer.length;
  }
};


/*
 */
Plugin.Sqlite.completeLogEntry = function (nl, data)
{
  if (nl > 0) {
    var le = this.logBuffer[nl - 1];
    if (le) {
      if (data)
        Object.assign(le, data);
      le.dur = new Date() - le.start;
    }
    this.openLogCount--;
  }
};


/*
 */
Plugin.Sqlite.closeDatabase = function (req)
{
  var id = req.params.id;
  var nl = this.addLogEntry({cmd: "closeDatabase", id: id});
  var db = this.dbs[id];
  if (!db) {
    req.setError("database not open");
    this.completeLogEntry(nl, {error: "database not open"});
    return;
  }
  //
  // Handle multiple DB open to the same connection
  db.count--;
  if (db.count > 0) {
    this.completeLogEntry(nl, {close: false, count: db.count});
    req.setResult("ok");
    return;
  }
  //
  db.conn.close(function (err) {
    if (err) {
      req.setError(err.message);
      this.completeLogEntry(nl, {error: err.message});
    }
    else {
      this.completeLogEntry(nl);
      req.setResult("ok");
    }
    delete this.dbs[id];
  }.bind(this));
};


/*
 */
Plugin.Sqlite.query = function (req)
{
  var sql = req.params.sql || "";
  //
  var id = req.params.id;
  var db = this.dbs[id];
  if (!db) {
    req.setError("database not open");
    return;
  }
  //
  var isCommit = sql.substring(0, 6) === "commit";
  var isRollback = sql.substring(0, 8) === "rollback";
  var isBegin = sql.substring(0, 5) === "begin";
  //
  // Let's see if there are open statements. We need to wait for them as
  // if error occurs and it won't be related to this transaction
  if (isCommit || isRollback || isBegin) {
    if (db.queryCount) {
      if (!db.queryCountTimeout) {
        var nl = this.addLogEntry({id: id, cmd: "query", sql: sql, error: "waiting 5ms for other queries"});
        this.completeLogEntry(nl, {count: db.queryCount});
        db.queryCountTimeout = setTimeout(function () {
          delete db.queryCountTimeout;
          Plugin.Sqlite.query(req);
        }, 5);
      }
      return;
    }
  }
  //
  // If an error occurred in this transaction, the commit method behaves as rollback
  // and an exception will be thrown
  if (db.error && isCommit)
    sql = "rollback";
  //
  var params = req.params.params || [];
  //
  var data = {id: id, cmd: "query", sql: sql};
  if (params && params.length)
    data.params = params;
  var nl = this.addLogEntry(data);
  //
  // Skip double open trans
  if (isBegin && db.trBeginResult) {
    this.completeLogEntry(nl, {error: "Skipping 'begin' while in transaction"});
    req.setResult(db.trBeginResult);
    return;
  }
  //
  // Skip double commit/rollback trans
  if ((isCommit || isRollback) && !db.trBeginResult) {
    this.completeLogEntry(nl, {error: "Skipping 'commit/rollback' while not in transaction"});
    req.setResult({rows: [], affectedRows: 0});
    return;
  }
  //
  db.queryCount++;
  db.conn.query(sql, params, function (err, res) {
    db.queryCount--;
    if (err) {
      if (req.cbId) {
        req.setError(err.message);
        this.completeLogEntry(nl, {error: err.message});
      }
      else {
        // cache error for later
        if (!db.error)
          db.error = err.message;
        this.completeLogEntry(nl, {error: err.message, cached: true});
      }
    }
    else {
      // Log
      var nr = null;
      if (res) {
        if (res.rows)
          nr = res.rows.length;
        else if (res.affectedRows !== undefined)
          nr = res.affectedRows;
      }
      this.completeLogEntry(nl, {rows: nr});
      //
      // Transaction open/close handling
      if (isBegin)
        db.trBeginResult = res;
      if (isCommit || isRollback)
        delete db.trBeginResult;
      //
      if (req.cbId) {
        //
        // if we are closing a transaction and an error occurred, throw it to the client
        if (isCommit && db.error)
          req.setError(db.error);
        else
          req.setResult(res);
        //
        // if we are closing a transaction, reset cached error
        if (isCommit || isRollback)
          delete db.error;
      }
    }
  }.bind(this));
};


/*
 */
Plugin.Sqlite.deleteDatabase = function (req)
{
  var name = req.params.name;
  var nl = this.addLogEntry({cmd: "deleteDatabase", name: name});
  this.SQLite.deleteDatabase(name, function (err) {
    if (err) {
      req.setError(err.message);
      this.completeLogEntry(nl, {error: err.message});
    }
    else {
      req.setResult("ok");
      this.completeLogEntry(nl);
    }
  }.bind(this));
};


/*
 * An app has stopped, close dbs
 */
Plugin.Sqlite.stopApp = function (app)
{
  for (var n in this.dbs) {
    var db = this.dbs[n];
    if (db.app === app) {
      db.conn.close(function () {
      });
      delete this.dbs[n];
    }
  }
};

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
  for (let id in this.dbs) {
    let db = this.dbs[id];
    if (db.name === name) {
      // If there are pending open database, add current request to queue
      if (db.pendingOpenQueue)
        return db.pendingOpenQueue.push(req);
      //
      // If database is closing, create pending open database queue
      if (!db.count) {
        db.pendingOpenQueue = [req];
        return;
      }
      //
      db.count++;
      req.setResult(db.id);
      //
      var nl = this.addLogEntry({cmd: "openDatabase", id: db.id, name: name});
      this.completeLogEntry(nl, {open: false, count: db.count});
      return;
    }
  }
  //
  let id = (Math.random() + "").substring(2);
  var conn = new this.SQLite(name);
  var dbobj = {id: id, name: name, conn: conn, app: req.app, count: 1, queryCount: 0, pendingOpenQueue: [req]};
  this.dbs[id] = dbobj;
  //
  var nl = this.addLogEntry({cmd: "openDatabase", id: id, name: name});
  conn.open(function (err) {
    //
    // Unlock all pending open database requests
    for (var i = 0; i < dbobj.pendingOpenQueue.length; i++) {
      let req = dbobj.pendingOpenQueue[i];
      if (err) {
        req.setError(err.message);
        this.completeLogEntry(nl, {error: err.message});
      }
      else {
        req.setResult(id);
        this.completeLogEntry(nl);
      }
    }
    //
    delete dbobj.pendingOpenQueue;
    if (err)
      delete this.dbs[id];
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
  db.count--;
  //
  // I cannot close if there are other connections or if there are pending queries or if there is a pending begin transaction
  if (db.count > 0 || db.queryCount > 0 || db.trBeginResult) {
    this.completeLogEntry(nl, {close: false, count: db.count});
    req.setResult("ok");
    return;
  }
  //
  // If there are pending open database requests, don't close database and unlock them instead
  if (db.pendingOpenQueue) {
    delete this.dbs[id];
    //
    this.completeLogEntry(nl, {close: false, count: db.count});
    req.setResult("ok");
    //
    for (let i = 0; i < db.pendingOpenQueue.length; i++)
      Plugin.Sqlite.openDatabase(db.pendingOpenQueue[i]);
    //
    return;
  }
  //
  db.conn.close(function (err) {
    delete this.dbs[id];
    //
    // If there are pending open database requests unlock them
    if (db.pendingOpenQueue) {
      for (let i = 0; i < db.pendingOpenQueue.length; i++)
        Plugin.Sqlite.openDatabase(db.pendingOpenQueue[i]);
    }
    //
    if (err) {
      req.setError(err.message);
      this.completeLogEntry(nl, {error: err.message});
    }
    else {
      this.completeLogEntry(nl);
      req.setResult("ok");
    }
  }.bind(this));
};


/*
 */
Plugin.Sqlite.query = function (req)
{
  var id = req.params.id;
  var db = this.dbs[id];
  if (!db)
    return req.setError("database not open");
  //
  var sql = req.params.sql || "";
  var isCommit = sql.substring(0, 6) === "commit";
  var isRollback = sql.substring(0, 8) === "rollback";
  var isBegin = sql.substring(0, 5) === "begin";
  //
  // If there are pending statements, remember end transaction request
  if ((isCommit || isRollback || isBegin) && db.queryCount) {
    db.pendingQueryQueue = [req];
    return;
  }
  //
  // If there are pending statements, push it in queue
  if (db.pendingQueryQueue)
    return db.pendingQueryQueue.push(req);
  //
  // If an error occurred in this transaction, the commit method behaves as rollback and an exception will be thrown
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
      //
      // If there are no pending queries and there is an end transaction request, unlock it
      if (!db.queryCount && db.pendingQueryQueue) {
        let queue = db.pendingQueryQueue;
        delete db.pendingQueryQueue;
        queue.forEach(q => Plugin.Sqlite.query(q));
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
  for (var id in this.dbs) {
    var db = this.dbs[id];
    //
    if (db.app === app) {
      delete this.dbs[id];
      let nl = this.addLogEntry({cmd: "closeDatabase", id: id});
      //
      db.conn.close(function () {
        this.completeLogEntry(nl);
      }.bind(this));
    }
  }
};

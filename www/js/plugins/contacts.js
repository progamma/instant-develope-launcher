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
Plugin.Contacts = {};


/*
 * Init plugin
 */
Plugin.Contacts.init = function ()
{
  this.fields = "id name nickname phoneNumbers emails addresses organizations birthday photos urls".split(" ");
};


/*
 * Open a native "choose contact" dialog
 * @param {type} req
 * @returns {undefined}
 */
Plugin.Contacts.pick = function (req)
{
  navigator.contacts.pickContact(function (contact) {
    req.setResult(contact || {});
  }, function (error) {
    Plugin.Contacts.setError(req, error);
  });
};


/*
 * Reports an error
 * @param {type} req
 * @param {type} code
 */
Plugin.Contacts.setError = function (req, error)
{
  switch (error.code) {
    case error.UNKNOWN_ERROR:
      req.setError("unknown error");
      break;
    case error.INVALID_ARGUMENT_ERROR:
      req.setError("invalid argument");
      break;
    case error.TIMEOUT_ERROR:
      req.setError("timeout");
      break;
    case error.PENDING_OPERATION_ERROR:
      req.setError("pending operation");
      break;
    case error.IO_ERROR:
      req.setError("io error");
      break;
    case error.NOT_SUPPORTED_ERROR:
      req.setError("not supported");
      break;
    case error.PERMISSION_DENIED_ERROR:
      req.setError("permission denied");
      break;
    default:
      req.setError("error");
      break;
  }
};


/*
 * Searches the contact list returning matches
 * calls findCB on server
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Contacts.find = function (req)
{
  // find all contacts with 'Bob' in any name field
  //  "id name nickname phoneNumbers emails addresses organizations birthday photos urls.split(" ");
  var options = new ContactFindOptions();
  options.filter = req.params.filter || "";
  options.multiple = true;
  var desired = req.params.fieldsToReturn || this.fields;
  options.desiredFields = [];
  for (var i = 0; i < desired.length; i++) {
    // if it's a valid field
    if (navigator.contacts.fieldType[desired[i]])
      options.desiredFields.push(navigator.contacts.fieldType[desired[i]]);
  }
  var fields = [];
  if (req.params.fieldsToMatch) {
    for (var i = 0; i < req.params.fieldsToMatch.length; i++) {
      // if it's a valid field
      if (navigator.contacts.fieldType[req.params.fieldsToMatch[i]])
        fields.push(navigator.contacts.fieldType[req.params.fieldsToMatch[i]]);
    }
  }
  else {
    fields = ["*"];
  }
  //
  navigator.contacts.find(fields, function (contacts) {
    var jsonContacts = [];
    for (var i = 0; i < contacts.length; i++) {
      var jsonContact = {};
      for (var prop in desired)
        jsonContact[desired[prop]] = contacts[i][desired[prop]];
      jsonContacts.push(jsonContact);
    }
    req.setResult(jsonContacts);
  }, function (error) {
    Plugin.Contacts.setError(req, error);
  }, options);
};


/*
 * Adds a contact to the contact list
 * Calls createCB on server
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Contacts.create = function (req)
{
  var data = req.params.info;
  var contact = navigator.contacts.create();
  //
  // name
  try {
    var name = new ContactName();
    name.givenName = data.name.givenName;
    name.middleName = data.name.middleName;
    name.familyName = data.name.familyName;
    var nickname = data.nickname;
    //
    // numbers
    var phoneNumbers = [];
    for (var i in data.phoneNumbers)
      phoneNumbers.push(new ContactField(data.phoneNumbers[i].type, data.phoneNumbers[i].value, false));
    //
    // emails
    var emails = [];
    for (var i in data.emails)
      emails.push(new ContactField(data.emails[i].type, data.emails[i].value, false));
    //
    // addresses
    var addresses = [];
    for (var i in data.addresses) {
      var addr = new ContactAddress();
      addr.type = data.addresses[i].type;
      addr.streetAddress = data.addresses[i].streetAddress;
      addr.locality = data.addresses[i].locality;
      addr.region = data.addresses[i].region;
      addr.postalCode = data.addresses[i].postalCode;
      addr.country = data.addresses[i].country;
      addresses.push(addr);
    }
    //
    // organizations
    var organizations = [];
    for (var i in data.organizations) {
      var org = new ContactOrganization();
      org.type = data.organizations[i].type;
      org.name = data.organizations[i].name;
      org.department = data.organizations[i].department;
      org.title = data.organizations[i].title;
      organizations.push(org);
    }
    //
    // birthday
    var birthday = data.birthday;
    //
    // photos
    var photos = [];
    for (var i in data.photos)
      photos.push(new ContactField(data.photos[i].type, data.photos[i].value, false));
    //
    // urls
    var urls = [];
    for (var i in data.urls)
      urls.push(new ContactField(data.urls[i].type, data.urls[i].value, false));
    //
    contact.name = name;
    contact.nickname = nickname;
    contact.phoneNumbers = phoneNumbers;
    contact.emails = emails;
    contact.addresses = addresses;
    contact.organizations = organizations;
    contact.birthday = birthday;
    contact.photos = photos;
    contact.urls = urls;
    //
    // clean contact from methods that could mess up save in ios8
    delete contact.clone;
    delete contact.display;
    delete contact.remove;
    delete contact.save;
    delete contact.prototype;
    contact.__proto__ = {};
    //
    Contact.prototype.save.call(contact, function () {
      req.setResult("success");
    }, function (error) {
      Plugin.Contacts.setError(req, error);
    });
  }
  catch (ex) {
    Plugin.Contacts.setError(req, ex.message);
  }
};


/*
 * Given req.params = id, removes the contact with such id
 * Calls deleteCB on server
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Contacts.delete = function (req)
{
  var options = new ContactFindOptions();
  options.filter = req.params.id;
  var fields = [navigator.contacts.fieldType.id];
  navigator.contacts.find(fields, function (contacts) {
    if (contacts[0])
      contacts[0].remove(function () {
        req.setResult("success");
      }, function (error) {
        Plugin.Contacts.setError(req, error);
      });
    else {
      req.setResult("not found");
    }
  }, function (error) {
    Plugin.Contacts.setError(req, error);
  }, options);
};


/*
 * Updates information for a given contact
 * Calls updateCB on server
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Contacts.update = function (req)
{
  var options = new ContactFindOptions();
  options.filter = req.params.id;
  var fields = [navigator.contacts.fieldType.id];
  navigator.contacts.find(fields, function (contacts) {
    if (contacts[0]) {
      var data = req.params.info;
      //
      // name
      if (data.name) {
        var name = new ContactName();
        for (var key in data.name) {
          // contacts[0].name[key] = data.name[key];
          name[key] = data.name[key];
        }
        contacts[0].name = name;
      }
      //
      if (typeof data.nickname !== "undefined") {
        contacts[0].nickname = data.nickname;
      }
      //
      // the following 4 are all identical contactfields arrays
      // phoneNumbers, emails, photos, urls
      var cf = ["phoneNumbers", "emails", "photos", "urls"];
      //
      for (var k = 0; k < cf.length; k++)
      {
        var field = cf[k];
        for (var i in data[field])
        {
          var entry = data[field][i];
          if (typeof entry.id !== "undefined") // fails if id === 0 number!!!!
          {
            // the entry is already present, edit it
            for (var j in contacts[0][field])
            {
              if (contacts[0][field][j].id === entry.id)
              {
                if (typeof entry.type !== "undefined")
                  contacts[0][field][j].type = entry.type;
                if (typeof entry.value !== "undefined")
                  contacts[0][field][j].value = entry.value;
                break;
              }
            }
          }
          else {
            // it's a new entry, create it
            if (!contacts[0][field])
              contacts[0][field] = [];
            contacts[0][field].push(new ContactField(entry.type, entry.value, false));
          }
        }
      }
      //
      // addresses
      for (var i in data.addresses) {
        if (typeof data.addresses[i].id !== "undefined") {
          for (var j in contacts[0].addresses) {
            if (contacts[0].addresses[j].id === data.addresses[i].id)
            {
              if (typeof data.addresses[i].type !== "undefined")
                contacts[0].addresses[j].type = data.addresses[i].type;
              if (typeof data.addresses[i].streetAddress !== "undefined")
                contacts[0].addresses[j].streetAddress = data.addresses[i].streetAddress;
              if (typeof data.addresses[i].locality !== "undefined")
                contacts[0].addresses[j].locality = data.addresses[i].locality;
              if (typeof data.addresses[i].region !== "undefined")
                contacts[0].addresses[j].region = data.addresses[i].region;
              if (typeof data.addresses[i].postalCode !== "undefined")
                contacts[0].addresses[j].postalCode = data.addresses[i].postalCode;
              if (typeof data.addresses[i].country !== "undefined")
                contacts[0].addresses[j].country = data.addresses[i].country;
              break;
            }
          }
        }
        else {
          var addr = new ContactAddress();
          addr.type = data.addresses[i].type;
          addr.streetAddress = data.addresses[i].streetAddress;
          addr.locality = data.addresses[i].locality;
          addr.region = data.addresses[i].region;
          addr.postalCode = data.addresses[i].postalCode;
          addr.country = data.addresses[i].country;
          if (!contacts[0].addresses)
            contacts[0].addresses = [];
          contacts[0].addresses.push(addr);
        }
      }
      //
      // organizations
      for (var i in data.organizations) {
        if (typeof data.organizations[i].id !== "undefined") {
          for (var j in contacts[0].organizations) {
            if (contacts[0].organizations[j].id === data.organizations[i].id)
            {
              if (typeof data.organizations[i].type !== "undefined")
                contacts[0].organizations[j].type = data.organizations[i].type;
              if (typeof data.organizations[i].name !== "undefined")
                contacts[0].organizations[j].name = data.organizations[i].name;
              if (typeof data.organizations[i].department !== "undefined")
                contacts[0].organizations[j].department = data.organizations[i].department;
              if (typeof data.organizations[i].title !== "undefined")
                contacts[0].organizations[j].title = data.organizations[i].title;
              break;
            }
          }
        }
        else {
          var org = new ContactOrganization();
          org.type = data.organizations[i].type;
          org.name = data.organizations[i].name;
          org.department = data.organizations[i].department;
          org.title = data.organizations[i].title;
          if (!contacts[0].organizations)
            contacts[0].organizations = [];
          contacts[0].organizations.push(org);
        }
      }
      //
      // birthday
      if (typeof data.birthday !== "undefined")
        contacts[0].birthday = data.birthday;
      //now .save
//      var errCbTimeout = setTimeout(function () {
//        // if contact.save timed out is because of an error (we think)
//        req.result = "contact update timed out";
//        Shell.pm.returnMessage(req);
//      }, 10000);
      //
      // clean contacts from methods that mess up saving on ios8
      delete contacts[0].clone;
      delete contacts[0].display;
      delete contacts[0].remove;
      delete contacts[0].save;
      delete contacts[0].prototype;
      contacts[0].__proto__ = {};
      //
      Contact.prototype.save.call(contacts[0], function () {
//        clearTimeout(errCbTimeout);
        req.setResult("success");
      }, function (error) {
//        clearTimeout(errCbTimeout);
        Plugin.Contacts.setError(req, error);
      });
    }
    else {
      req.setResult("not found");
    }
  }, function (error) {
    Plugin.Contacts.setError(req, error);
  }, options);
};


/*
 * Given req.params = id, returns the contact with such id
 * Calls readCB on server
 * @param {type} req - pluginmanager.js request obj
 * @returns {undefined}
 */
Plugin.Contacts.read = function (req)
{
  var options = new ContactFindOptions();
  options.filter = req.params;
  var fields = [navigator.contacts.fieldType.id];
  navigator.contacts.find(fields, function (contacts) {
    if (contacts[0])
      req.setResult(contacts[0]);
    else
      req.result(undefined);
  }, function (error) {
    Plugin.Contacts.setError(req, error);
  }, options);
};

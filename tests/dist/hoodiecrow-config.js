"use strict";

var fs = require("fs");
var mailcomposer = require("mailcomposer");

var ranger = function ranger(x, y) {
  var r = [];
  for (var i = 0; i < x; i++) {
    r.push(y);
  }return r;
};

module.exports = function (cb) {

  var testPlainAttachment = {
    filename: 'document.txt',
    content: new Buffer("John Smith\n\n    University of secret agents\n    35 Rue du Château du Four des Remparts De la Santé Des Rentiers De la Seine\n    john.smith@serious-university.edu\n    Looking for a position as lead robot mental state debugging psychologist\n\n    My skills: Erlang, CSS3, Project Management.\n\n    Career Summary\n    Thirty years experience in developping hacking software in Go and JS2016.\n    Employment History\n    1901-1902 Tokyo University.\n    ", "utf-8"),
    contentType: 'text/plain'
  };

  var testAttachments = [testPlainAttachment];

  var testMessageComposer = mailcomposer({
    from: "Test XXX <test.xxx@datagica.com>",
    to: "YYY <yyy@datagica.com>",
    subject: "for you sir",
    text: "Dear Sir Please Buy My iPhone Pills $999 Only Thanks",
    attachments: testAttachments
  });

  testMessageComposer.build(function (err, testMessage) {

    var testMessages = ranger(1, { raw: testMessage });

    cb({
      debug: false,
      plugins: ["ID", "STARTTLS",
      // "LOGINDISABLED",
      "SASL-IR", "AUTH-PLAIN", "NAMESPACE", "IDLE", "ENABLE", "CONDSTORE", "XTOYBIRD", "LITERALPLUS", "UNSELECT", "SPECIAL-USE", "CREATE-SPECIAL-USE"],

      id: {
        name: "hoodiecrow",
        version: "0.1"
      },

      storage: {
        "INBOX": {
          messages: testMessages
        }
      }
    });
  });
};
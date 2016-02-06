'use strict';

const fs = require("fs");
const mailcomposer = require("mailcomposer");

const ranger = function (x,y) {
  const r = [];
  for (let i = 0; i < x; i++) r.push(y);
  return r;
};

module.exports = (cb) => {

  const testPlainAttachment = {
    filename: 'document.txt',
    content: new Buffer(`John Smith

    University of secret agents
    35 Rue du Château du Four des Remparts De la Santé Des Rentiers De la Seine
    john.smith@serious-university.edu
    Looking for a position as lead robot mental state debugging psychologist

    My skills: Erlang, CSS3, Project Management.

    Career Summary
    Thirty years experience in developping hacking software in Go and JS2016.
    Employment History
    1901-1902 Tokyo University.
    `, "utf-8"),
    contentType: 'text/plain'
  };

  const testAttachments = [
    testPlainAttachment
  ];

  const testMessageComposer = mailcomposer({
    from: `Test XXX <test.xxx@datagica.com>`,
    to: `YYY <yyy@datagica.com>`,
    subject: `for you sir`,
    text: `Dear Sir Please Buy My iPhone Pills $999 Only Thanks`,
    attachments: testAttachments
  });

  testMessageComposer.build((err, testMessage) => {

    const testMessages = ranger(1, {raw: testMessage});

    cb({
      debug: false,
      plugins: [
        "ID",
        "STARTTLS",
        // "LOGINDISABLED",
        "SASL-IR",
        "AUTH-PLAIN",
        "NAMESPACE",
        "IDLE",
        "ENABLE",
        "CONDSTORE",
        "XTOYBIRD",
        "LITERALPLUS",
        "UNSELECT",
        "SPECIAL-USE",
        "CREATE-SPECIAL-USE"
      ],

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

}

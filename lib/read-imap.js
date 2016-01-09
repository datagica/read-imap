"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var moment = require("moment");
var imaps = require('imap-simple');

var ReadImap = (function () {
  function ReadImap() {
    (0, _classCallCheck3.default)(this, ReadImap);
  }

  (0, _createClass3.default)(ReadImap, [{
    key: "formatDateForImapSearch",
    value: function formatDateForImapSearch(date) {
      var DATE_RFC2822 = "ddd, DD MMM YYYY HH:mm:ss ZZ";
      return moment(date).lang('en').format(this.DATE_RFC2822);
    }
  }, {
    key: "fetchMailbox",
    value: function fetchMailbox(account, query) {

      //console.log(`fetchMailboxAccount: account = ${JSON.stringify(account)}`);
      //console.log(`fetchMailboxAccount: query = ${JSON.stringify(query)}`);

      return imaps.connect(account).then(function (connection) {
        //console.log(`fetchMailboxAccount: connection.openBox(${JSON.stringify(query.box)})`);

        return connection.openBox(query.box).then(function () {
          //console.log(`fetchMailboxAccount: connected to mailbox! going to search..`);
          var dateMarker = new Date();
          dateMarker.setTime(Date.now() - query.delay);
          dateMarker = dateMarker.toISOString();
          var searchCriteria = ['UNSEEN', ['SINCE', dateMarker]];
          var fetchOptions = {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
            struct: true
          };

          // retrieve only the headers of the messages
          //console.log(`fetchMailboxAccount: connection.search(${JSON.stringify(searchCriteria)}, ${JSON.stringify(fetchOptions)})`);
          return connection.search(searchCriteria, fetchOptions);
        }).then(function (messages) {
          //console.log(`fetchMailboxAccount: got ${messages.length} messages`);

          function downloadAttachment(message, part) {
            return connection.getPartData(message, part).then(function (partData) {
              //console.log(part.disposition.params.filename + ': got ' + partData.length + ' bytes');
              // Add message label
              connection.addMessageLabel(message.attributes.uid, 'downloaded');
            });
          }

          var attachments = [];

          messages.forEach(function (message) {
            //console.log(`fetchMailboxAccount: parsing a message`);

            var parts = imaps.getParts(message.attributes.struct);
            //console.log(`fetchMailboxAccount: message has ${parts.length} parts`);

            attachments = attachments.concat(parts.filter(function (part) {

              var disposition = part.disposition;
              var type = (disposition || {}).type;
              var params = (disposition || {}).params;
              //console.log(`fetchMailboxAccount: part.disposition: ${JSON.stringify(disposition)}`);
              //console.log(`fetchMailboxAccount: part.disposition.type: ${type}`);
              //console.log(`fetchMailboxAccount: part.disposition.params: ${params}`);

              return disposition && type.toLowerCase() === 'attachment';
            }).map(function (part) {
              // retrieve the attachments only of the messages with attachments
              //console.log(`fetchMailboxAccount: retrieving attachments`);

              return connection.getPartData(message, part).then(function (partData) {
                //console.log(`fetchMailboxAccount: got a partData for ${JSON.stringify(part.disposition)}`);

                return {
                  filename: part.disposition.params.filename,
                  data: partData
                };
              });
            }));
          });

          return _promise2.default.all(attachments);
        });
      });
    }
  }, {
    key: "fetchMailboxes",
    value: function fetchMailboxes(accounts, query) {
      var _this = this;

      query.options = query.options || {};

      var initializedQuery = {
        box: typeof query.box === "string" ? query.box : 'INBOX',

        delay: typeof query.delay === "number" ? query.delay : 24 * 3600 * 1000
      };

      //console.log(`gonna fetch ${accounts.length} mail accounts, plase wait..`);
      return _promise2.default.all(accounts.map(function (account) {
        return _this.fetchMailbox(account, query);
      })).then(function (accountsEmails) {
        return _promise2.default.resolve(accountsEmails);
      });
    }
  }, {
    key: "getMails",
    value: function getMails() {
      var accounts = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
      var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.fetchMailboxes(accounts, query).then(function (mailAccounts) {
        return _promise2.default.resolve((mailAccounts || []).reduce(function (acc, mails) {
          return acc.concat(mails || []);
        }, []));
      });
    }
  }]);
  return ReadImap;
})();

module.exports = ReadImap;
module.exports.default = module.exports;
module.exports.ReadImap = module.exports;
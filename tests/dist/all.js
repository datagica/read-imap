'use strict';

var _readImap = require('../../lib/read-imap');

var _readImap2 = _interopRequireDefault(_readImap);

var _hoodiecrow = require('hoodiecrow');

var _hoodiecrow2 = _interopRequireDefault(_hoodiecrow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var chai = require('chai');
chai.use(require('chai-fuzzy'));
var expect = chai.expect;
var assert = chai.assert;
var bufferEquals = require('buffer-equals');

var moment = require('moment');

var util = require('util');

// local functions
function pretty(obj) {
  return util.inspect(obj, false, 20, true);
};

// test data for our mock server
var makeHoodiecrowConfig = require("./hoodiecrow-config");

describe('read-imap', function () {

  var imapServer = null;
  var hoodiecrowConfig = null;

  var testServerPort = 1143;
  var testServerHost = "localhost";

  var accounts = [{
    imap: {
      fullname: "Test Account",
      email: "test@datagica.com",
      host: testServerHost,
      port: testServerPort,
      tls: false, // true
      user: "testuser",
      password: "testpass"
    }
  }];

  before(function (done) {
    makeHoodiecrowConfig(function (hoodieConfig) {
      hoodiecrowConfig = hoodieConfig;
      imapServer = (0, _hoodiecrow2.default)(hoodiecrowConfig);
      imapServer.listen(testServerPort, function (ready) {
        done();
      });
    });
  });

  after(function (done) {
    imapServer.close();
    done();
  });

  it("should get attachments from multiple mailboxes", function (done) {

    this.timeout(20000);
    var query = {
      box: 'INBOX',
      delay: 24 * 3600 * 1000 // Fetch emails from the last 24h
    };

    var expected = {
      "filename": "document.txt",
      // ok there is a bug with hoodiecrow, UTF-8 characters get ripped off
      // because at the moment "CHARSET argument is ignored"
      // and the problem is "probably not going to get fixed". Uh, okay.
      "data": "John Smith\r\n\r\n    University of secret agents\r\n    35 Rue du ChÃ¢teau du Four des Remparts De la SantÃ© Des Rentiers De la Seine\r\n    john.smith@serious-university.edu\r\n    Looking for a position as lead robot mental state debugging psychologist\r\n\r\n    My skills: Erlang, CSS3, Project Management.\r\n\r\n    Career Summary\r\n    Thirty years experience in developping hacking software in Go and JS2016.\r\n    Employment History\r\n    1901-1902 Tokyo University.\r\n    "
    };

    var readImap = new _readImap2.default();
    readImap.getMails(accounts, query).then(function (mails) {
      console.log('ok, got a batch of ' + mails.length + ' mails!');
      //console.log(bufferEquals(mails[0].data, expected.data));
      //console.log(`"${mails[0].data}"`);
      console.log(pretty(mails));
      expect(mails[0]).to.be.like(expected);
      done();
    }).catch(function (err) {
      console.error('failed: ' + err);
      //done();
    });
  });
});
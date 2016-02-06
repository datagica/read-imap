'use strict';

const chai = require('chai');
chai.use(require('chai-fuzzy'));
const expect = chai.expect;
const assert = chai.assert;
const bufferEquals = require('buffer-equals');

const moment = require('moment');

var util = require('util');

// local functions
function pretty(obj) {
  return util.inspect(obj, false, 20, true)
};

const ReadImap = require("../lib/read-imap");
const hoodiecrow = require("hoodiecrow-imap");

// test data for our mock server
const makeHoodiecrowConfig = require("./hoodiecrow-config");

describe('read-imap', function() {

  let imapServer = null;
  let hoodiecrowConfig = null;

  let testServerPort = 1143;
  let testServerHost = "localhost";

  const accounts = [{
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

before(done => {
  makeHoodiecrowConfig(hoodieConfig => {
    hoodiecrowConfig = hoodieConfig;
    imapServer = hoodiecrow(hoodiecrowConfig);
    imapServer.listen(testServerPort, ready => {
      done();
    })
  })
})

after(done => {
  imapServer.close();
  done();
})

it("should get attachments from multiple mailboxes", function(done) {

  this.timeout(20000);
  const query = {
    box: 'INBOX',
    delay: 24 * 3600 * 1000 // Fetch emails from the last 24h
  };

  const expected = {
    "filename": "document.txt",
    // ok there is a bug with hoodiecrow, UTF-8 characters get ripped off
    // because at the moment "CHARSET argument is ignored"
    // and the problem is "probably not going to get fixed". Uh, okay.
    "data": "John Smith\r\n\r\n    University of secret agents\r\n    35 Rue du ChÃ¢teau du Four des Remparts De la SantÃ© Des Rentiers De la Seine\r\n    john.smith@serious-university.edu\r\n    Looking for a position as lead robot mental state debugging psychologist\r\n\r\n    My skills: Erlang, CSS3, Project Management.\r\n\r\n    Career Summary\r\n    Thirty years experience in developping hacking software in Go and JS2016.\r\n    Employment History\r\n    1901-1902 Tokyo University.\r\n    "
  };

  const readImap = new ReadImap();
  readImap.getMails(accounts, query).then(mails => {
    console.log(`ok, got a batch of ${mails.length} mails!`);
    //console.log(bufferEquals(mails[0].data, expected.data));
    //console.log(`"${mails[0].data}"`);
    console.log(pretty(mails));
    expect(mails[0]).to.be.like(expected);
    done();
  }).catch(err => {
    console.error(`failed: ${err}`);
    //done();
  })

})
})


const moment = require("moment");
const imaps = require('imap-simple');

class ReadImap {

  constructor() {
  }

  formatDateForImapSearch(date) {
    const DATE_RFC2822 = "ddd, DD MMM YYYY HH:mm:ss ZZ";
    return moment(date).lang('en').format(this.DATE_RFC2822);
  }

  fetchMailbox(account, query) {

    //console.log(`fetchMailboxAccount: account = ${JSON.stringify(account)}`);
    //console.log(`fetchMailboxAccount: query = ${JSON.stringify(query)}`);

    return imaps.connect(account).then(connection => {
      //console.log(`fetchMailboxAccount: connection.openBox(${JSON.stringify(query.box)})`);

      return connection.openBox(query.box).then(() => {
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
      }).then(messages => {
        //console.log(`fetchMailboxAccount: got ${messages.length} messages`);

        function downloadAttachment(message, part) {
          return connection.getPartData(message, part)
            .then(partData => {
              //console.log(part.disposition.params.filename + ': got ' + partData.length + ' bytes');
              // Add message label
              connection.addMessageLabel(message.attributes.uid, 'downloaded');
            });
        }

        var attachments = [];

        messages.forEach(message => {
          //console.log(`fetchMailboxAccount: parsing a message`);

          var parts = imaps.getParts(message.attributes.struct);
          //console.log(`fetchMailboxAccount: message has ${parts.length} parts`);

          attachments = attachments.concat(parts.filter(part => {

            const disposition = part.disposition;
            const type = (disposition || {}).type;
            const params = (disposition || {}).params;
            //console.log(`fetchMailboxAccount: part.disposition: ${JSON.stringify(disposition)}`);
            //console.log(`fetchMailboxAccount: part.disposition.type: ${type}`);
            //console.log(`fetchMailboxAccount: part.disposition.params: ${params}`);

            return disposition && type.toLowerCase() === 'attachment';
          }).map(part => {
            // retrieve the attachments only of the messages with attachments
            //console.log(`fetchMailboxAccount: retrieving attachments`);

            return connection.getPartData(message, part)
              .then(partData => {
                //console.log(`fetchMailboxAccount: got a partData for ${JSON.stringify(part.disposition)}`);

                return {
                  filename: part.disposition.params.filename,
                  data: partData
                };
              });
          }));
        });

        return Promise.all(attachments);
      });
    });
  }


  fetchMailboxes(accounts, query) {
    query.options = query.options || {};

    const initializedQuery = {
      box: (typeof query.box === "string") ? query.box : 'INBOX',

      delay: (typeof query.delay === "number") ? query.delay : 24 * 3600 * 1000
    };

    //console.log(`gonna fetch ${accounts.length} mail accounts, plase wait..`);
    return Promise.all(accounts.map(account => {
      return this.fetchMailbox(account, query);
    })).then(accountsEmails => {
      return Promise.resolve(accountsEmails);
    })

  }

  getMails(accounts = [], query = {}) {
    return this.fetchMailboxes(accounts, query).then(mailAccounts =>
      Promise.resolve((mailAccounts || []).reduce((acc, mails) => acc.concat(mails || []), []))
    )
  }
}

module.exports = ReadImap;
module.exports.default = module.exports;
module.exports.ReadImap = module.exports;

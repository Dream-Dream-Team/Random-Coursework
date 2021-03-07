const moment = require('moment');


var Filter = require('bad-words'),
  clean = new Filter();

function formatMessage(username, text) {
  let cleanMsg = clean.clean(text);
  console.log(cleanMsg);
  return {
    username,
    text: cleanMsg,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;


const request = require('request');
const crypto = require('crypto');

const cid = 'test';
const user_cid = 'apiaccess';
const secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1';
const file_name = 'igloo.jpg';

const token = crypto.createHash('sha1')
  .update(cid + user_cid + secret_cid + file_name)
  .digest('hex');

console.log('SEND_TOKEN: ', token);

const options = {
  url: `http://localhost:3000/${cid}/${file_name}`,
  headers: {
    'x-authentication': user_cid,
    'x-authentication-token': token
  }
};

const cb = function(error, response, body) {
  console.log('REQUEST_CODE: ', response.statusCode);
  if (!error && (response.statusCode === 200)) {
    const info = JSON.parse(body);
    return console.log('INFO: ', info);
  } else {
    return console.log('REQUEST_ERROR: ', error);
  }
};

request.del(options, cb);

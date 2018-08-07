
import request from 'request'
import crypto from 'crypto'

const cid = 'test'
const userCID = 'apiaccess'
const secretCID = '4ec2b79b81ee67e305b1eb4329ef2cd1'
const fileName = 'igloo.jpg'

const token = crypto.createHash('sha1')
  .update(cid + userCID + secretCID + fileName)
  .digest('hex')

console.log('SEND_TOKEN: ', token)

const options = {
  url: `http://localhost:3000/${cid}/${fileName}`,
  headers: {
    'x-authentication': userCID,
    'x-authentication-token': token
  }
}

const cb = function (error, response, body) {
  console.log('REQUEST_CODE: ', response.statusCode)
  if (!error && (response.statusCode === 200)) {
    const info = JSON.parse(body)
    return console.log('INFO: ', info)
  } else {
    return console.log('REQUEST_ERROR: ', error)
  }
}

request.del(options, cb)

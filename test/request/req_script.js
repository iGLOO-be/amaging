
import request from 'request'
// const crypto = require('crypto')

// console.log '##########'
// console.log 'ADD A FILE'
// console.log '##########'

// cid = 'test'
// user_cid = 'apiaccess'
// secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1'
// fileName = 'req_auth.json'
// file = require('fs').readFileSync(__dirname + '/testfile.json')
// content_type = 'application/json'
// content_length = file.length

// console.log 'CONTENT-LENGTH: ', content_length

// token = crypto.createHash('sha1')
//   .update(cid + user_cid + secret_cid + fileName + content_type + content_length)
//   .digest('hex')

// options =
//   url: "http://localhost:3000/#{cid}/#{fileName}"
//   body: file.toString()
//   headers:
//     'x-authentication': user_cid
//     'x-authentication-token': token
//     'content-type' : content_type
//     'content-length' : content_length

// cb = (error, response, body) ->
//   console.log 'REQUEST_CODE: ', response.statusCode
//   if !error && response.statusCode == 200
//     info = JSON.parse(body)
//     console.log 'INFO: ', info
//   else
//     console.log 'REQUEST_ERROR: ', error

// request.post options, cb

// console.log '############################'
// console.log 'UPDATE AN IMAGE in multipart'
// console.log '############################\n'

// cid = 'test'
// user_cid = 'apiaccess'
// secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1'
// fileName = 'new_igloo.jpg'
// file = require('fs').readFileSync(__dirname + '/igloo.jpg')
// content_type = 'image/jpeg'
// content_length = file.length

// console.log 'CONTENT-LENGTH: ', content_length

// token = crypto.createHash('sha1')
//   .update(cid + user_cid + secret_cid + fileName)
//   .digest('hex')

// console.log 'SEND_TOKEN: ', token

// console.log(__dirname + '/igloo.jpg')

// options =
//   url: "http://localhost:3000/#{cid}/#{fileName}"
//   headers:
//     'x-authentication': user_cid
//     'x-authentication-token': token

// cb = (error, response, body) ->
//   #console.log 'REQUEST_CODE: ', response.statusCode
//   if !error && response.statusCode == 200
//     info = JSON.parse(body)
//     console.log 'INFO: ', info
//   else
//     console.log 'REQUEST_ERROR: ', error

// r = request.post options, cb
// form = r.form()
// form.append('file', require('fs').createReadStream(__dirname + '/igloo.jpg'), {
//   contentType: 'image/jpg'
// })

// console.log '############################'
// console.log 'UPDATE AN IMAGE classic mode'
// console.log '############################\n'

// cid = 'test'
// user_cid = 'apiaccess'
// secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1'
// fileName = 'igloo.jpg'
// file = require('fs').readFileSync(__dirname + '/igloo.jpg')
// content_type = 'image/jpeg'
// content_length = file.length

// console.log 'CONTENT-LENGTH: ', content_length

// token = crypto.createHash('sha1')
//   .update(cid + user_cid + secret_cid + fileName + content_type + content_length)
//   .digest('hex')

// console.log 'SEND_TOKEN: ', token

// console.log(__dirname + '/igloo.jpg')

// options =
//   url: "http://localhost:1337/#{cid}/#{fileName}"
//   body: file.toString()
//   headers:
//     'x-authentication': user_cid
//     'x-authentication-token': token
//     'content-type' : content_type
//     'content-length' : content_length

// cb = (error, response, body) ->
//   #console.log 'REQUEST_CODE: ', response.statusCode
//   if !error && response.statusCode == 200
//     info = JSON.parse(body)
//     console.log 'INFO: ', info
//   else
//     console.log 'REQUEST_ERROR: ', error

// request.put options, cb

// console.log '############################'
// console.log 'GET AN IMAGE to cache'
// console.log '############################\n'

// cid = 'test'
// user_cid = 'apiaccess'
// secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1'
// fileName = 'igloo.jpg'
// file = require('fs').readFileSync(__dirname + '/igloo.jpg')
// content_type = 'image/jpeg'
// content_length = file.length

// console.log 'CONTENT-LENGTH: ', content_length

// token = crypto.createHash('sha1')
//   .update(cid + user_cid + secret_cid + fileName + content_type + content_length)
//   .digest('hex')

// console.log 'SEND_TOKEN: ', token

// console.log(__dirname + '/igloo.jpg')

// options =
//   url: "http://localhost:3000/#{cid}/#{fileName}"
//   headers:
//     'x-authentication': user_cid
//     'x-authentication-token': token
//     'content-type' : content_type
//     'content-length' : content_length
//     'cache-control' : 'public'
//     'max-age': 30

// cb = (error, response, body) ->
//   console.log 'REQUEST_CODE: ', response.statusCode
//   if !error && response.statusCode == 200
//     info = JSON.parse(body)
//     console.log 'INFO: ', info
//   else
//     console.log 'REQUEST_ERROR: ', error

// request.get options, cb

console.log('###########################')
console.log('GET AN EXISTING FILE IMAGE')
console.log('###########################\n')

const cid = 'test'
const fileName = 'igloo.jpg'

const options =
  { url: `http://localhost:3000/${cid}/${fileName}` }

const cb = (error, res, body) => console.log('REQUEST_CODE: ', res.headers, error)
// if !error && response.statusCode == 200
//   info = JSON.parse(body)
//   console.log 'INFO: ', info
// else
//   console.log 'REQUEST_ERROR: ', error

request.head(options, cb)

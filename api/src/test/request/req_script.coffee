
request = require 'request'
crypto = require 'crypto'

# console.log '##########'
# console.log 'ADD A FILE'
# console.log '##########'

# cid = 'test'
# user_cid = 'apiaccess'
# secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1'
# file_name = 'req_auth.json'
# file = require('fs').readFileSync(__dirname + '/testfile.json')
# content_type = 'application/json'
# content_length = file.length

# console.log 'CONTENT-LENGTH: ', content_length

# token = crypto.createHash('sha1')
#   .update(cid + user_cid + secret_cid + file_name + content_type + content_length)
#   .digest('hex')

# options =
#   url: "http://localhost:3000/#{cid}/#{file_name}"
#   body: file.toString()
#   headers:
#     'x-authentication': user_cid
#     'x-authentication-token': token
#     'content-type' : content_type
#     'content-length' : content_length

# cb = (error, response, body) ->
#   console.log 'REQUEST_CODE: ', response.statusCode
#   if !error && response.statusCode == 200
#     info = JSON.parse(body)
#     console.log 'INFO: ', info
#   else
#     console.log 'REQUEST_ERROR: ', error

# request.post options, cb

console.log '###############'
console.log 'UPDATE AN IMAGE'
console.log '###############\n'

cid = 'test'
user_cid = 'apiaccess'
secret_cid = '4ec2b79b81ee67e305b1eb4329ef2cd1'
file_name = 'igloo.jpg'
file = require('fs').readFileSync(__dirname + '/igloo.jpg')
content_type = 'image/jpeg'
content_length = file.length

console.log 'CONTENT-LENGTH: ', content_length

token = crypto.createHash('sha1')
  .update(cid + user_cid + secret_cid + file_name + content_type + content_length)
  .digest('hex')

console.log 'SEND_TOKEN: ', token

options =
  url: "http://localhost:3000/#{cid}/#{file_name}"
  body: file
  headers:
    'x-authentication': user_cid
    'x-authentication-token': token
    'content-type' : content_type
    'content-length' : content_length

cb = (error, response, body) ->
  console.log 'REQUEST_CODE: ', response.statusCode
  if !error && response.statusCode == 200
    info = JSON.parse(body)
    console.log 'INFO: ', info
  else
    console.log 'REQUEST_ERROR: ', error

request.put options, cb
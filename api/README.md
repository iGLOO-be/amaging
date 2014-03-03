

## Amaging


# READ

GET /:cid/:options/:file

:cid = Customer ID
:options
:files

# WRITE

POST /:cid/:file

:cid = Customer ID
:files

Body: The file content

Headers:
  content-type
  X-Authorization-For: api_user_name
  X-Authorization-Token: sha(cid + file + contentType + api_user_name + api_secret + sha file)

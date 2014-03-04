

# Amaging


## READ

GET /:cid/:options/:file

:cid = Customer ID
:options
:files


### Samples

```sh
curl -i "localhost:3000/test/file.json"
```

## WRITE

POST /:cid/:file

:cid = Customer ID
:files

Body: The file content

Headers:
  content-type
  X-Authorization-For: api_user_name
  X-Authorization-Token: sha(cid + file + contentType + api_user_name + api_secret + sha file)


### Samples

```sh
curl -i -d "{\"test\":3}" "localhost:3000/test/file.json"
```

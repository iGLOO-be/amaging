

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



### Dependencies needed

## Graphics Magick

```sh
$ sudo add-apt-repository ppa:dhor/myway
$ sudo apt-get update
$ sudo apt-get install graphicsmagick
```

## CImg & pHash

```sh
$ sudo apt-get install cimg-dev libphash0-dev
```

### Run S3 tests

In order to test with S3, you need to start a Minio server:

```
export MINIO_DOCKER_NAME=amaging-test-minio
export MINIO_ACCESS_KEY=foobar
export MINIO_SECRET_KEY=barfoobarfoo
export MINIO_BUCKET=barfoobarfoo

docker stop $MINIO_DOCKER_NAME || true
docker rm -v $MINIO_DOCKER_NAME || true
docker run --name $MINIO_DOCKER_NAME -d -p 9000:9000 -e MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY -e MINIO_SECRET_KEY=$MINIO_SECRET_KEY minio/minio server /data
docker run --rm --link $MINIO_DOCKER_NAME:minio -e MINIO_BUCKET=$MINIO_BUCKET --entrypoint sh minio/mc -c "\
  while ! nc -z minio 9000; do echo 'Wait minio to startup...' && sleep 0.1; done; \
  sleep 5 && \
  mc config host add myminio http://minio:9000 \$MINIO_ENV_MINIO_ACCESS_KEY \$MINIO_ENV_MINIO_SECRET_KEY && \
  mc rm -r --force myminio/\$MINIO_BUCKET || true && \
  mc mb myminio/\$MINIO_BUCKET && \
  mc policy download myminio/\$MINIO_BUCKET \
"

npm run test:s3

docker stop $MINIO_DOCKER_NAME || true
docker rm -v $MINIO_DOCKER_NAME || true
```

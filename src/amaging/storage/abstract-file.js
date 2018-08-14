
import mime from 'mime'

const optionsRegex = /^(.*)&\//
const optionsSep = '&'

export default class AbstractFile {
  constructor (storage, filename) {
    this.storage = storage
    const match = filename.match(optionsRegex)

    if (match) {
      this.options = match[1].split(optionsSep)
      this.filename = filename.replace(optionsRegex, '')
    } else {
      this.options = []
      this.filename = filename
    }

    this.path = this.filename
  }

  async readInfo () {
    const info = await this.storage.readInfo(this.path)
    this.info = info
    return info
  }

  contentLength () {
    return (this.info != null ? this.info.ContentLength : undefined)
  }

  contentType () {
    return (this.info != null ? this.info.ContentType : undefined) || mime.getType(this.filename)
  }

  eTag () {
    return (this.info != null ? this.info.ETag : undefined)
  }

  lastModified () {
    return (this.info != null ? this.info.LastModified : undefined)
  }

  exists () {
    return !!this.info
  }

  async requestReadStream () {
    return this.storage.requestReadStream(this.path)
  }

  async requestWriteStream (info) {
    return this.storage.requestWriteStream(this.path, info)
  }

  async deleteFile () {
    return this.storage.deleteFile(this.path)
  }

  toJSON () {
    const json = {
      path: this.path
    }
    Object.assign(json, this.info)
    return json
  }
}

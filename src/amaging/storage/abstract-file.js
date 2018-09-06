
import mime from 'mime'
import path from 'path'

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

    this.basename = path.basename(this.filename)
    this.path = this.filename.charAt(0) === '/' ? this.filename : '/' + this.filename
  }

  async readInfo (inputInfo) {
    const info = inputInfo || await this.storage.readInfo(this.path)
    if (info) {
      this.info = Object.assign({}, info, {
        ContentType: info.ContentType || mime.getType(this.filename) || 'application/octet-stream'
      })
    }
    return this.info
  }

  contentLength () {
    return (this.info != null ? this.info.ContentLength : undefined)
  }

  contentType () {
    return (this.info != null ? this.info.ContentType : undefined)
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

  async createAsDirectory () {
    await this.storage.createAsDirectory(this.filename)
    await this.readInfo()
  }

  isDirectory () {
    return (this.info != null ? this.info.isDirectory : undefined)
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
      path: this.path,
      basename: this.basename
    }
    Object.assign(json, this.info)
    return json
  }
}

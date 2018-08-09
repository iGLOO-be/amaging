
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
  }

  async readInfo () {
    const info = await this.storage.readInfo(this._filepath())
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
    return this.info && (typeof this.info === 'object')
  }

  requestReadStream (cb) {
    return this.storage.requestReadStream(this._filepath(), cb)
  }

  requestWriteStream (info, cb) {
    return this.storage.requestWriteStream(this._filepath(), info, cb)
  }

  deleteFile (cb) {
    return this.storage.deleteFile(this._filepath(), cb)
  }

  _filepath () {
    return this.filename
  }
}

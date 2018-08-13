
import AbstractFile from './abstract-file'

export default class File extends AbstractFile {
  static async create (storage, cacheStorage, filename) {
    const file = new File(storage, cacheStorage, filename)
    await file.readInfo()
    return file
  }

  constructor (storage, cacheStorage, filename) {
    super(storage, filename)
    this.cacheStorage = cacheStorage
  }

  async requestWriteStream (info) {
    const stream = await super.requestWriteStream(info)
    await this.deleteCachedFiles()
    return stream
  }

  async deleteFile () {
    await super.deleteFile()
    await this.deleteCachedFiles()
  }

  async deleteCachedFiles () {
    // TODO @martin : Move cache eviction to another place
    return this.cacheStorage.deleteCachedFiles(this._filepath())
  }
}

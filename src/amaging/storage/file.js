
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
}

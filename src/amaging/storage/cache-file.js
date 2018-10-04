
import AbstractFile from './abstract-file'

export default class CacheFile extends AbstractFile {
  static async create (storage, filename) {
    const file = new CacheFile(storage, filename)
    if (file.options.length) {
      await file.readInfo()
    }
    return file
  }

  constructor (storage, filename) {
    super(storage, filename)
    this.path = this.filename + '/' + this.options.join('_')
  }
}

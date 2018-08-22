
import AbstractFile from './abstract-file'

export default class CacheFile extends AbstractFile {
  static async create (storage, filename) {
    const file = new CacheFile(storage, filename)
    await file.readInfo()
    return file
  }

  // todo: not fetch info if no options

  constructor (storage, filename) {
    super(storage, filename)
    this.path = this.filename + '/' + this.options.join('_')
  }
}

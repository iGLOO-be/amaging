
import AbstractFile from './abstract-file'

export default class File extends AbstractFile {
  static async create (storage, filename, info) {
    const file = new File(storage, filename)
    await file.readInfo(info)
    return file
  }
}

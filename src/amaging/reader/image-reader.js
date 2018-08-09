
import { fileTypeOrLookup } from '../lib/utils'

import GMFilterEngine from '../../gm-filter/gm-filter'
import tmp from 'tmp'
import fs from 'fs-extra'
import { promisify } from 'util'
import pEvent from 'p-event'

import debugFactory from 'debug'
const debug = debugFactory('amaging:reader:image')

const createTmpFile = promisify(tmp.file)

export default () =>
  async function (req, res, next) {
    const { amaging } = req
    const { options } = amaging.file
    const acceptType = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/x-jg'
    ]

    debug('Start image reader for file: %j', amaging.file)

    if (!amaging.file.exists()) {
      debug('Stop image reader cause to not found file.')
      return next()
    }

    if (!options.length) {
      return next()
    }

    if (amaging.cacheFile.exists()) {
      debug('Stop image reader cause to cache file exists.')
      // really bad no?
      amaging.file = amaging.cacheFile
      return next()
    }

    const fileType = fileTypeOrLookup(amaging.file.contentType(), amaging.file.filename)
    if (!(acceptType.indexOf(fileType) > -1)) {
      debug('Stop image reader cause the file is not an image')
      return next()
    }

    const gmFilter = new GMFilterEngine()
    gmFilter.addOptions(options)

    if (!gmFilter.hasFilters()) {
      debug('Stop image reader cause to no filters match.')
      return next()
    }

    debug('Begin image transform with filters. %j', gmFilter)

    const tmpFile = await createTmpFile()
    debug('Temp file created: ', tmpFile)

    debug('Request a read stream on original file')
    const readStream = await amaging.file.requestReadStream()

    debug('Start copy of original file to temp file')
    const write = fs.createWriteStream(tmpFile)
    readStream.pipe(write)

    await pEvent(readStream, 'end')
    debug('Copy of original file is done')

    debug('Run GM filters on temp file')
    await gmFilter.runOn(tmpFile)

    debug('Get file info about temp file')
    const tmpStats = await fs.stat(tmpFile)

    debug('Request a write stream on cache file')
    const writeStream = await amaging.cacheFile.requestWriteStream({
      ContentLength: tmpStats.size,
      ContentType: amaging.file.contentType()
    })

    debug('Start copy of temp file to cache file')
    const tmpRead = fs.createReadStream(tmpFile)
    tmpRead.pipe(writeStream)
    await pEvent(writeStream, 'close')

    debug('Remove temp file')
    await fs.unlink(tmpFile)

    debug('Ready info about cache file')
    await amaging.cacheFile.readInfo()

    // really bad no?
    amaging.file = amaging.cacheFile

    next()
  }

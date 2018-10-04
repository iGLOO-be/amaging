
import mime from 'mime'

export async function executeMiddleware (fn, ...args) {
  await new Promise((resolve, reject) => {
    const promise = fn(...args, (err) => {
      if (err) reject(err)
      else resolve()
    })

    if (promise && promise.catch) {
      promise.catch(err => {
        reject(err)
      })
    }
  })
}

export function cleanAmagingFile (filePath) {
  // Security concerns
  return filePath.replace(/(\.\.\/)+/g, '')
}

export function fileTypeOrLookup (type, file) {
  if (!type || (type === 'application/octet-stream')) {
    return mime.getType(file) || 'application/octet-stream'
  } else {
    return type
  }
}

export function findMaxSizeFromPolicy (policy, maxSize = Infinity) {
  const conditions = policy.getConditionsForKey('Content-Length')
  const eqCondition = conditions
    .find(condition => condition.validatorName === 'eq')
  if (eqCondition && Number.isInteger(eqCondition.validatorArgs[0])) {
    return Math.min(eqCondition.validatorArgs[0], maxSize)
  }
  const rangeCondition = conditions
    .find(condition => condition.validatorName === 'range')
  if (rangeCondition && Number.isInteger(rangeCondition.validatorArgs[1])) {
    return Math.min(rangeCondition.validatorArgs[1], maxSize)
  }

  return maxSize
}

import { isString, isUndefined, isFunction, isNumber } from '../is'

const toArr = [].slice.call
const dotSplit = val => val.split('.')
const REDUCE = 'reduce'

export const value = function() {
  const values = toArr(arguments)
  return values[REDUCE](
    (value, nextValue) => (isUndefined(value) ? nextValue : value),
    undefined
  )
}

export const get = (obj, keys, defaultValue) => {
  keys = value(keys, [])
  try {
    if (isNumber(keys)) {
      keys = String(keys)
    }
    let result = (isString(keys) ? dotSplit(keys) : keys)[REDUCE](
      (res, key) => res[key],
      obj
    )
    return isUndefined(result) ? defaultValue : result
  } catch (e) {
    return defaultValue
  }
}

export const run = function() {
  const args = arguments
  let obj = args[0]
  let keys = get(args[1], [])
  const rest = toArr(args, 2)
  keys = isString(keys) ? dotSplit(keys) : keys

  const func = get(obj, keys)
  const context = get(obj, keys.slice(0, -1))

  return isFunction(func) ? func.apply(context, rest) : func
}

import { isFunction, isUndefined } from './base/is'

/**
 * [缓存函数结果]
 * @param {Function} func 被处理的函数
 */
export const memoize = func => {
  const cache = new Map()
  const memoizedFunc = function() {
    const args = arguments
    const key = args[0]
    const rest = [].slice.call(args, 1)
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.apply(this, [key].concat(rest))

    cache.set(key, result)

    return result
  }

  // memoizedFunc.cache = cache
  return memoizedFunc
}

export const defaultVal = (val, defaultVal) =>
  isUndefined(val) ? defaultVal : val

const tmpReg = /{{\s*\w*\s*}}/g
export const template = function() {
  // 等同于参数声明 function (srt = '', data = {}, { split = false, fallback = '(unknow)' } = {})
  // 为优化压缩才写成这个样子
  const args = arguments
  const str = defaultVal(args[0], '')
  const data = defaultVal(args[1], {})
  const opts = defaultVal(args[2], {})
  const split = defaultVal(opts.split, false)
  const fallback = defaultVal(opts.fallback, '(unknow)')

  const isFunctionFallback = isFunction(fallback)
  const vars = (str.match(tmpReg) || []).map(val => {
    const origWord = val
    val = val.replace(/({{\s*)|(\s*}})/g, '')
    const fallbackWord = isFunctionFallback ? fallback(val, origWord) : fallback
    val = defaultVal(data[val], fallbackWord)
    return val
  })

  const slitted = (str.split(tmpReg) || []).reduce((res, word) => {
    return res.concat([word, vars.shift()])
  }, [])

  return split ? slitted : slitted.join('')
}

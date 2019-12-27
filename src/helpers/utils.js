const toArr = [].slice.call

/**
 * [缓存函数结果]
 * @param {Function} func 被处理的函数
 */
export const memoize = func => {
  const cache = new Map()
  const memoizedFunc = function() {
    const args = arguments
    const key = args[0]
    const rest = toArr(args, 1)
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

/**
 * [缓存函数结果]
 * @param {Function} func 被处理的函数
 */
export const memoize = func => {
  const cache = new Map()
  const memoizedFunc = function(key, ...rest) {
    if (cache.has(key)) {
      return cache.get(key)
    }
    const result = func.call(this, key, ...rest)

    cache.set(key, result)

    return result
  }

  memoizedFunc.cache = cache
  return memoizedFunc
}

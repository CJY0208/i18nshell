const isType = (val, type) => type === typeof val

// 值类型判断 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export const isUndefined = val => isType(val, 'undefined')

export const isNull = val => val === null

export const isFunction = val => isType(val, 'function')

export const isArray = val => val instanceof Array

// export const isRegExp = val => val instanceof RegExp

export const isObject = val =>
  isType(val, 'object') && !(isArray(val) || isNull(val))

// export const isBoolean = val => isType(val, 'boolean')

export const isString = val => isType(val, 'string')

// export const isExist = val => !(isUndefined(val) || isNull(val))

export const isPromiseLike = val => !!val && isFunction(val.then)

export const isNaN = val => val !== val

export const isNumber = val => isType(val, 'number') && !isNaN(val)
// 值类型判断 -------------------------------------------------------------

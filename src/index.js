import {
  get,
  run,
  value,
  isArray,
  isObject,
  isFunction,
  isPromiseLike,
  memoize,
  EventBus
} from './helpers'

const NSReg = /:/
const TmpMarkReg = /\{\{\s*\w*\s*\}\}/g
const TmpMarkLeftReg = /\{\{\s*/
const TmpMarkRightReg = /\s*\}\}/
const resolvedPromise = Promise.resolve()
const PromiseAll = Promise.all
const extend = Object.assign

const LNG = 'lng'
const APPLY_LNG = 'applyLng'
const RESOURCES = 'resources'
const EVENT_BUS = 'eventBus'
const SPLIT = 'split'
const INSTANCES = 'instances'
const DEFAULT = 'default'
const CHANGE = 'change'
const REPLACE = 'replace'
const THEN = 'then'
const TEMPLATE = 'template'
const CONFIG = 'config'
const TYPES = 'types'
const MAP = 'map'
const EMIT = 'emit'
const T = 't'
const TYPE_SEPARATOR = '@'
const CONCAT = 'concat'

export default class I {
  static [INSTANCES] = []
  static [LNG] = undefined
  static [EVENT_BUS] = new EventBus()
  /**
   * [template 简易字符串模板函数]
   * e.g: template('hello {{name}}', { name: 'CJY' }) ==> 'hello CJY'
   * @param  {[字符串]} str  [description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  static [TEMPLATE] = (str, data) => {
    str = value(str, '')
    const keys = str.match(TmpMarkReg) || {}

    Object.keys(keys).forEach(_k => {
      const key = keys[_k][REPLACE](TmpMarkLeftReg, '')[REPLACE](
        TmpMarkRightReg,
        ''
      )
      str = str[REPLACE](
        new RegExp('\\{\\{' + key + '\\}\\}', 'g'),
        get(data, key)
      )
    })

    return str
  }
  static load = function() {
    const loaders = [].slice.call(arguments)
    return memoize(() =>
      PromiseAll(
        loaders[MAP](loader => {
          const res = run(loader)
          const getValue = res => get(res, DEFAULT, res)

          return isPromiseLike(res) ? res[THEN](getValue) : getValue(res)
        })
      )[THEN](res => extend.apply(null, [{}][CONCAT](res)))
    )
  }
  static [APPLY_LNG] = lng =>
    lng
      ? PromiseAll(I[INSTANCES][MAP](instance => instance[APPLY_LNG](lng)))[
          THEN
        ](() => {
          I[LNG] = lng
          I[EVENT_BUS][EMIT](CHANGE, lng)
        })
      : resolvedPromise;
  [RESOURCES] = {};
  [LNG] = undefined;
  [EVENT_BUS] = new EventBus()

  constructor(config) {
    this[CONFIG] = value(config, {})

    I[INSTANCES].push(this)
    const applyLng = this[APPLY_LNG]
    if (I[LNG]) {
      applyLng(I[LNG])
    } else {
      I[EVENT_BUS].once(CHANGE, applyLng)
    }
  }

  [APPLY_LNG] = lng =>
    lng
      ? PromiseAll(
          Object.entries(this[CONFIG][TYPES])[MAP](entries => {
            const type = entries[0]
            const { [RESOURCES]: resources } = entries[1]
            if (!this[RESOURCES][type]) {
              this[RESOURCES][type] = {}
            }
            const res = run(get(resources, lng, resources))
            const applyRes = res => {
              this[RESOURCES][type][lng] = res
            }

            return isPromiseLike(res) ? res[THEN](applyRes) : applyRes(res)
          })
        )[THEN](() => {
          this[LNG] = lng
          this[EVENT_BUS][EMIT](CHANGE, lng)
        })
      : resolvedPromise;
  [T] = (str, options) => {
    options = value(options, {})
    const useNamespace = NSReg.test(str)
    const { [CONFIG]: config, [LNG]: lng } = this
    const { defaultType = DEFAULT } = config
    const splitRes = str[SPLIT](TYPE_SEPARATOR)
    const _keys = splitRes[0]
    const type = value(splitRes[1], defaultType)

    let keys = _keys
    let namespace

    if (useNamespace) {
      const splitRes = _keys[SPLIT](':')
      namespace = splitRes[0]
      keys = splitRes[1]
    }

    if (!useNamespace && lng) {
      const formatKeyMap = [TYPES, type, 'format']
      const format = get(
        config,
        formatKeyMap[CONCAT](lng),
        get(config, formatKeyMap, I[TEMPLATE])
      )
      const useResource = !isObject(get(this[RESOURCES], [type, lng]))

      if (isFunction(format)) {
        const res = run(
          format,
          undefined,
          useResource
            ? get(this[RESOURCES], [type, this[LNG]][CONCAT](keys[SPLIT]('.')))
            : keys,
          options
        )

        if (res) {
          return res
        }
      }
    }

    return this.fT(keys + TYPE_SEPARATOR + type, options, namespace) || keys
  }

  fT = (str, options, namespace) => {
    const { fallback } = this[CONFIG]
    if (!isArray(fallback) && !isObject(fallback)) {
      return undefined
    }

    const fallbackOptions = extend({ _fbT: true }, options)

    if (namespace) {
      const res = run(fallback, [namespace, T], str, fallbackOptions)

      if (res) {
        return res
      }
    } else {
      for (let I of Object.values(fallback)) {
        let res = run(I, T, str, fallbackOptions)

        if (res) {
          return res
        }
      }
    }

    if (options._fbT) {
      return undefined
    }
  }
}

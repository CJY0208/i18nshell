import {
  get,
  run,
  isArray,
  isObject,
  isFunction,
  isString,
  isPromiseLike,
  memoize,
  defaultVal,
  template,
  EventBus
} from './helpers'

const P = Promise
const NSReg = /:/
const resolvedPromise = P.resolve()
const PromiseAll = P.all.bind(P)
const extend = Object.assign

const LNG = 'lng'
const APPLY_LNG = 'applyLng'
const RESOURCES = 'resources'
const EVENT_BUS = 'eventBus'
const SPLIT = 'split'
const INSTANCES = 'instances'
const DEFAULT = 'default'
const CHANGE = 'change'
const THEN = 'then'
const TEMPLATE = 'template'
const CONFIG = 'config'
const TYPES = 'types'
const MAP = 'map'
const EMIT = 'emit'
const T = 't'
const TYPE_SEPARATOR = '@'
const CONCAT = 'concat'

const I18n = extend(
  class {
    [RESOURCES] = {};
    [LNG] = undefined;
    [EVENT_BUS] = new EventBus()

    constructor(config) {
      this[CONFIG] = defaultVal(config, {})

      I18n[INSTANCES].push(this)
      const lng = I18n[LNG]
      const applyLng = this[APPLY_LNG]
      if (lng) {
        applyLng(lng)
      } else {
        I18n[EVENT_BUS].once(CHANGE, applyLng)
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
      if (!isString(str)) {
        return ''
      }
      options = defaultVal(options, {})
      const useNamespace = NSReg.test(str)
      const { [CONFIG]: config, [LNG]: lng } = this
      const { defaultType = DEFAULT } = config
      const splitRes = str[SPLIT](TYPE_SEPARATOR)
      const _keys = splitRes[0]
      const type = defaultVal(splitRes[1], defaultType)

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
          get(config, formatKeyMap, I18n[TEMPLATE])
        )
        const useResource = isObject(get(this[RESOURCES], [type, lng]))

        if (isFunction(format)) {
          const resource = useResource
            ? get(this[RESOURCES], [type, this[LNG]][CONCAT](keys[SPLIT]('.')))
            : keys

          const isCustomizedFormat = format !== template

          const res = run(
            format,
            undefined,
            resource,
            options,
            isCustomizedFormat ? lng : undefined
          )

          if (res) {
            return res
          }
        }
      }

      return this.fT(keys + TYPE_SEPARATOR + type, options, namespace) || keys
    }

    fT = (str, options, namespace) => {
      if (!isString(str)) {
        return ''
      }
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
        for (let i18n of Object.values(fallback)) {
          let res = run(i18n, T, str, fallbackOptions)

          if (res) {
            return res
          }
        }
      }

      if (options._fbT) {
        return undefined
      }
    }
  },
  {
    [INSTANCES]: [],
    [LNG]: undefined,
    [EVENT_BUS]: new EventBus(),
    /**
     * [template 简易字符串模板函数]
     * e.g: template('hello {{name}}', { name: 'CJY' }) ==> 'hello CJY'
     * @param  {[字符串]} str  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    [TEMPLATE]: template,
    load: function() {
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
    },
    [APPLY_LNG]: lng =>
      lng
        ? PromiseAll(
            I18n[INSTANCES][MAP](instance => instance[APPLY_LNG](lng))
          )[THEN](() => {
            I18n[LNG] = lng
            I18n[EVENT_BUS][EMIT](CHANGE, lng)
          })
        : resolvedPromise
  }
)

export { I18n }
export default I18n

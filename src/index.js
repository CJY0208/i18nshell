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
const KEY_LNG = 'lng'
const KEY_APPLY_LNG = 'applyLng'
const KEY_RESOURCES = 'resources'
const KEY_EVENT_BUS = 'eventBus'
const KEY_SPLIT = 'split'
const KEY_INSTANCES = 'instances'
const KEY_DEFAULT = 'default'
const KEY_CHANGE = 'change'
const KEY_REPLACE = 'replace'

export default class I18n {
  static [KEY_INSTANCES] = []
  static [KEY_LNG] = undefined
  static [KEY_EVENT_BUS] = new EventBus()
  /**
   * [template 简易字符串模板函数]
   * e.g: template('hello {{name}}', { name: 'CJY' }) ==> 'hello CJY'
   * @param  {[字符串]} str  [description]
   * @param  {[type]} data [description]
   * @return {[type]}      [description]
   */
  static template = (str, data) => {
    str = value(str, '')
    const keys = str.match(TmpMarkReg) || {}

    Object.keys(keys).forEach(_k => {
      const key = keys[_k][KEY_REPLACE](TmpMarkLeftReg, '')[KEY_REPLACE](
        TmpMarkRightReg,
        ''
      )
      str = str[KEY_REPLACE](
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        get(data, key)
      )
    })

    return str
  }
  static load = (...loaders) =>
    memoize(() =>
      Promise.all(
        loaders.map(loader => {
          const res = run(loader)
          const getValue = res => get(res, KEY_DEFAULT, res)

          return isPromiseLike(res) ? res.then(getValue) : getValue(res)
        })
      ).then(res => Object.assign({}, ...res))
    )
  static [KEY_APPLY_LNG] = lng =>
    lng
      ? Promise.all(
          I18n[KEY_INSTANCES].map(instance => instance[KEY_APPLY_LNG](lng))
        ).then(() => {
          I18n[KEY_LNG] = lng
          I18n[KEY_EVENT_BUS].emit(KEY_CHANGE, lng)
        })
      : Promise.resolve();
  [KEY_RESOURCES] = {};
  [KEY_LNG] = undefined;
  [KEY_EVENT_BUS] = new EventBus()

  constructor(config) {
    this.config = value(config, {})

    I18n[KEY_INSTANCES].push(this)
    const applyLng = this[KEY_APPLY_LNG]
    if (I18n[KEY_LNG]) {
      applyLng(I18n[KEY_LNG])
    } else {
      I18n[KEY_EVENT_BUS].once(KEY_CHANGE, applyLng)
    }
  }

  [KEY_APPLY_LNG] = lng =>
    lng
      ? Promise.all(
          Object.entries(this.config.types).map(([type, { resources }]) => {
            if (!this[KEY_RESOURCES][type]) {
              this[KEY_RESOURCES][type] = {}
            }
            const res = run(get(resources, lng, resources))
            const applyRes = res => {
              this[KEY_RESOURCES][type][lng] = res
            }

            return isPromiseLike(res) ? res.then(applyRes) : applyRes(res)
          })
        ).then(() => {
          this[KEY_LNG] = lng
          this[KEY_EVENT_BUS].emit(KEY_CHANGE, lng)
        })
      : Promise.resolve()

  t = (str, options) => {
    options = value(options, {})
    const useNamespace = NSReg.test(str)
    const { config } = this
    const { defaultType = KEY_DEFAULT } = config
    const [_keys, type = defaultType] = str[KEY_SPLIT]('@')

    let keys = _keys
    let namespace

    if (useNamespace) {
      ;[namespace, keys] = _keys[KEY_SPLIT](':')
    }

    if (!useNamespace && this[KEY_LNG]) {
      const formatKeyMap = ['types', type, 'format']
      const format = get(
        config,
        [...formatKeyMap, this[KEY_LNG]],
        get(config, formatKeyMap, I18n.template)
      )
      const useResource =
        get(this[KEY_RESOURCES], [type, this[KEY_LNG]]) !== false

      if (isFunction(format)) {
        const res = run(
          format,
          undefined,
          useResource
            ? get(this[KEY_RESOURCES], [
                type,
                this[KEY_LNG],
                ...keys[KEY_SPLIT]('.')
              ])
            : keys,
          options
        )

        if (res) {
          return res
        }
      }
    }

    return this.fT(keys + '@' + type, options, namespace) || keys
  }

  fT = (str, options, namespace) => {
    const { fallback } = this.config
    if (!isArray(fallback) && !isObject(fallback)) {
      return undefined
    }

    const fallbackOptions = {
      ...options,
      _fbT: true
    }

    if (namespace) {
      const res = run(fallback, [namespace, 't'], str, fallbackOptions)

      if (res) {
        return res
      }
    } else {
      for (let i18n of Object.values(fallback)) {
        let res = i18n.t(str, fallbackOptions)

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

import { isFunction, isUndefined } from './base/is'
import { value } from './base/try'

const KEY_LISTENERS = '_listeners'
const KEY_GET_EVENT_MAP = '_getEventMap'

export default class EventBus {
  [KEY_LISTENERS] = {};
  [KEY_GET_EVENT_MAP] = event => {
    if (!this[KEY_LISTENERS][event]) {
      this[KEY_LISTENERS][event] = new Map()
    }

    return this[KEY_LISTENERS][event]
  }

  on = (event, listener, config) => {
    let once = get(config, 'once', false)
    if (!isFunction(listener)) {
      return
    }

    this[KEY_GET_EVENT_MAP](event).set(
      listener,
      once
        ? (...args) => {
            listener(...args)
            this.off(event, listener)
          }
        : listener
    )

    return this
  }

  once = (event, listener, config) => {
    config = value(config, {})
    return this.on(event, listener, { ...config, once: true })
  }

  off = (event, listener) => {
    const eventMap = this[KEY_GET_EVENT_MAP](event)

    if (isUndefined(listener)) {
      eventMap.clear()
    } else {
      eventMap.delete(listener)
    }

    return this
  }

  emit = (event, ...args) =>
    this[KEY_GET_EVENT_MAP](event).forEach(listener => listener(...args))
}

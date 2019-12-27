import { isFunction, isUndefined } from './base/is'
import { value, get } from './base/try'

const LISTENERS = '_listeners'
const GET_EVENT_MAP = '_getEventMap'
const ON = 'on'
const ONCE = 'once'
const OFF = 'off'
const APPLY = 'apply'

export default class EventBus {
  [LISTENERS] = {};
  [GET_EVENT_MAP] = event => {
    if (!this[LISTENERS][event]) {
      this[LISTENERS][event] = new Map()
    }

    return this[LISTENERS][event]
  };
  [ON] = (event, listener, config) => {
    const self = this
    let once = get(config, ONCE, false)
    if (!isFunction(listener)) {
      return self
    }
    self[GET_EVENT_MAP](event).set(
      listener,
      once
        ? function() {
            listener[APPLY](undefined, arguments)
            self[OFF](event, listener)
          }
        : listener
    )

    return self
  };
  [ONCE] = (event, listener, config) => {
    config = value(config, {})
    return this[ON](
      event,
      listener,
      Object.assign({}, config, { [ONCE]: true })
    )
  };
  [OFF] = (event, listener) => {
    const eventMap = this[GET_EVENT_MAP](event)

    if (isUndefined(listener)) {
      eventMap.clear()
    } else {
      eventMap.delete(listener)
    }

    return this
  }

  emit = function() {
    const args = arguments
    const event = args[0]
    const rest = [].slice.call(args, 1)
    return this[GET_EVENT_MAP](event).forEach(listener =>
      listener[APPLY](undefined, rest)
    )
  }.bind(this)
}

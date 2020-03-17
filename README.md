# I18nshell

[![size](https://img.shields.io/bundlephobia/minzip/i18nshell.svg)](https://github.com/CJY0208/i18nshell)
[![dm](https://img.shields.io/npm/dm/i18nshell.svg)](https://github.com/CJY0208/i18nshell)

Tiny i18n shell

English | [中文说明](./README_CN.md)

---

# Install

```bash
yarn add i18nshell
# or
npm install i18nshell --save
```

---

# Basic Usage

```js
import I18n from 'i18nshell'

const i18n = new I18n({
  types: {
    default: {
      resources: {
        en: {
          greet: 'Hello, {{name}}'
        },
        zh: {
          greet: '你好，{{name}}'
        }
      }
    }
  }
})

test()
async function test() {
  await I18n.applyLng('en');
  i18n.t('greet', {
    name: 'CJY'
  }) // get string 'Hello, CJY'

  await I18n.applyLng('zh');
  i18n.t('greet', {
    name: 'CJY'
  }) // get string '你好，CJY' 
}
```

---
# Increase internationalization types such as currency, time, etc.

`i18nshell` has simple text translation built in

Currency, time and other nationalization functions need to be implemented by expanding types

Use `@` to select the type of translation you want to use

```jsx
import I18n from 'i18nshell'

const i18n = new I18n({
  types: {
    price: {
      resource: false, // Not using resources
      format: (value) => {
        const unit = {
          en: '$',
          zh: '¥'
        }[I18n.lng]

        return `${unit}${value}`
      }
    },
    jsx: { 
      resources: {
        en: {
          clickHere: 'click {{here}}'
        },
        zh: {
          clickHere: '点击 {{here}}'
        }
      },
      format: (value, data) => (
        <Fragment>
          {I18n.template(value, data, { split: true }).map((item, idx) => (
            <Fragment key={idx}>{item}</Fragment>
          ))}
        </Fragment>
      )
    }
  }
})

test()
async function test() {
  await I18n.applyLng('en');
  i18n.t('1000@price') // get string '$1000'

  await I18n.applyLng('zh');
  i18n.t('1000@price') // get string '¥1000'

  // get jsx content
  i18n.t('clickHere@jsx', {
    here: (
      <a href="https://www.google.com">google</a>
    )
  })
}
```

---
# Load resources on demand

The following settings work with the `import (...)` syntax, en language packs are only loaded when needed

```js
// en.js
export default {
  greet: 'Hello, {{name}}'
}
```

```js
// ./i18n.js
import I18n from 'i18nshell'

new I18n({
  types: {
    default: {
      resources: {
        en: I18n.load(() => import('./en.js')),
        zh: {
          greet: '你好，{{name}}'
        }
      }
    }
  }
})
```

---
# Split and inherit other language packs

Implemented using the fallback configuration item

```js
import I18n from 'i18nshell'

const i18n_1 = new I18n({
  types: {
    default: {
      resources: {
        zh: {
          test1: '测试1'
        }
      }
    }
  }
})

const i18n_2 = new I18n({
  fallback: [i18n_1],
  types: {
    default: {
      resources: {        
        zh: {
          test2: '测试2'
        }
      }
    }
  }
})

const i18n_3 = new I18n({
  fallback: [i18n_2],
  types: {
    default: {
      resources: {        
        zh: {
          test3: '测试3'
        }
      }
    }
  }
})

test()
async function test() {
  await I18n.applyLng('zh')
  i18n_3.t('test1') // get string '测试1' fallback i18n_2 -> i18n_1
  i18n_3.t('test2') // get string '测试2' fallback i18n_2
  i18n_3.t('test3') // get string '测试3'
}
```

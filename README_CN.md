# i18nshell

[![size](https://img.shields.io/bundlephobia/minzip/i18nshell.svg)](https://github.com/CJY0208/i18nshell)
[![dm](https://img.shields.io/npm/dm/i18nshell.svg)](https://github.com/CJY0208/i18nshell)

轻便的 i18n 外壳

[English](./README.md) | 中文说明

---

# 安装

```bash
yarn add i18nshell
# or
npm install i18nshell --save
```

---

# 基础用法

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
  await I18n.applyLng('en')
  i18n.t('greet', {
    name: 'CJY'
  }) // get string 'Hello, CJY'

  await I18n.applyLng('zh')
  i18n.t('greet', {
    name: 'CJY'
  }) // get string '你好，CJY'
}
```

---

# 增加国际化类型如货币、时间等

i18nshell 内置了简单的文本翻译

货币、时间等其他国家化功能需要通过拓展 types 实现

使用 `@` 来选择需要使用的翻译类型

```jsx
import I18n from 'i18nshell'

const i18n = new I18n({
  types: {
    price: {
      resource: false, // Not using resources
      format: value => {
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
  await I18n.applyLng('en')
  i18n.t('1000@price') // get string '$1000'

  await I18n.applyLng('zh')
  i18n.t('1000@price') // get string '¥1000'

  // get jsx content
  i18n.t('clickHere@jsx', {
    here: <a href="https://www.google.com">google</a>
  })
}
```

---

# 按需加载资源

以下设置配合 `import(...)` 语法，en 语言包只在需要时加载

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

# 拆分并继承其他语言包

使用 `fallback` 配置项实现

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

---

## 待办

- [ ] 异步加载语言包失败时自动重试

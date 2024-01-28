jest.mock('@linaria/react', () => {
  const styled = (tag) => {
    const element = typeof tag === 'string' ? tag : 'div'
    return jest.fn(() => `mock-styled.${element}`)
  }
  return {
    styled: new Proxy(styled, {
      get(o, prop) {
        return o(prop)
      },
    }),
  }
})

jest.mock('@linaria/core', () => {
  const css = (tag) => {
    return `mock-css.${tag}`
  }

  const { cx } = jest.requireActual('@linaria/core')

  return {
    cx,
    css,
  }
})

const mockStorage = (() => {
  let store = {
    __REAPIT_MARKETPLACE_GLOBALS__: null,
  }
  return {
    getItem: (key) => {
      return store[key]
    },
    setItem: (key, value) => {
      store[key] = value.toString()
    },
    removeItem: (key) => {
      store[key] = undefined
    },
    clear: () => {
      store = {}
    },
  }
})()

if (typeof window === 'object') {
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
  })

  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      reload: jest.fn(),
    },
  })

  Object.defineProperty(window, 'getComputedStyle', {
    value: () => ({
      getPropertyValue: () => {
        return ''
      },
    }),
  })

  Object.defineProperty(window, 'open', {
    value: jest.fn(),
  })

  Object.defineProperty(window, 'alert', {
    value: jest.fn(),
  })

  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: jest.fn(),
    },
  })

  HTMLElement.prototype.scrollIntoView = function () {}
}

if (global) {
  global.console = { warn: jest.fn(), log: jest.fn(), error: jest.fn(), info: jest.fn() }
}

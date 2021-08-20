import faker from 'faker'

export default class Compiler {
  compile(template) {
    const result = {}
    Object.keys(template).forEach((key) => {
      const value = template[key]
      result[key] = this._populate(key, value)
    })

    return result
  }

  _populate(key, value) {
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      value instanceof Date ||
      value === null ||
      value === undefined
    ) {
      return value
    } else if (value instanceof String || typeof value === 'string') {
      return faker.fake(value)
    } else if (Array.isArray(value)) {
      return value.map((x) => this._populate(key, x))
    } else if (typeof value === 'function') {
      return value()
    }
    // Otherwise, this is an object, and potentially a template itself
    else {
      return this.compile(value)
    }
  }
}

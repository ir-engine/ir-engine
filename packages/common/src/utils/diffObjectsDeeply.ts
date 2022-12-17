export function diffObjectsDeeply(base, object) {
  const changes = {}

  function walkObject(base, object, path = '') {
    for (const key of Object.keys(base)) {
      const currentPath = path === '' ? key : `${path}.${key}`

      if (object[key] === undefined) {
        changes[currentPath] = '-'
      }
    }

    for (const [key, value] of Object.entries(object)) {
      const currentPath = Array.isArray(object) ? path + `[${key}]` : path === '' ? key : `${path}.${key}`

      if (base[key] === undefined) {
        changes[currentPath] = '+'
      } else if (value !== base[key]) {
        if (typeof value === 'object' && typeof base[key] === 'object') {
          walkObject(base[key], value, currentPath)
        } else {
          changes[currentPath] = object[key]
        }
      }
    }
  }

  walkObject(base, object)

  return changes
}

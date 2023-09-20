function castValue(value, type) {
  switch (type.toLowerCase()) {
    case 'number':
      return parseFloat(value)
    case 'boolean':
      return value === 'true'
    case 'string':
      return value
    default:
      return value
  }
}

export function objectToArgs(obj: any, prefix = '') {
  const args: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    let newPrefix = prefix ? `${prefix}_${key}` : `${key}`

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        args.push(...objectToArgs(item, `${newPrefix}_${index}`))
      })
    } else if (value !== null && typeof value === 'object') {
      args.push(...objectToArgs(value, newPrefix))
    } else {
      const type = typeof value
      args.push(`--${newPrefix}_${type}`, String(value))
    }
  }

  return args
}

export function argsToObject(args: string[]): any {
  const obj: Record<string, any> = {}
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i]
    const value = args[i + 1]

    const keys: string[] = arg.slice(2).split('_')
    const type = keys.pop()
    const parsedKeys = keys.map((key, i) => (isNaN(Number.parseFloat(keys[i])) ? key.toLowerCase() : Number(key)))

    let current = obj

    parsedKeys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = castValue(value, type)
      } else {
        if (current[key] === undefined) {
          current[key] = typeof keys[index + 1] === 'number' ? [] : {}
        }
        current = current[key]
      }
    })
  }
  return obj
}

import { IParser } from '../matches'

export function parserAsTypescriptString(validator?: IParser<unknown, unknown>) {
  let result = null
  let nextResult = parserAsTypescriptStringDuplicated(validator)
  while (result !== nextResult) {
    result = nextResult
    nextResult = result
      .replace(/ & unknown/g, '')
      .replace(/unknown &/g, '')
      .replace(/ \| unknown/g, '')
      .replace(/unknown \| /g, '')
      .replace(/\((\w+)\)/g, '$1')
  }
  return result
}

function parserAsTypescriptStringDuplicated(validator?: IParser<unknown, unknown>): string {
  if (!validator) {
    return 'unknown'
  }
  switch (validator.description.name) {
    case 'Guard':
      return 'unknown'
    case 'Array':
      return `Array<unknown>`
    case 'ArrayOf':
      return `Array<${parserAsTypescriptString(validator.description.children[0])}>`
    case 'Dictionary':
      return `{${validator.description.children
        .map(parserAsTypescriptString)
        .map((val, i, rest) => (i % 2 == 0 ? `[keyT${i / 2} in ${val}]` : `:${val}${i + 1 < rest.length ? '}&{' : ''}`))
        .join('')}}`
    case 'Concat':
      return `(${validator.description.children.map(parserAsTypescriptString).join(' & ')})`
    case 'Literal':
      return `(${validator.description.extras.map((x) => JSON.stringify(x)).join(' | ')})`
    case 'Named':
      return validator.description.extras[0]
    case 'Default':
    case 'Maybe':
      return `null | ${parserAsTypescriptString(validator.description.children[0])}`
    case 'Tuple':
      return `[${validator.description.children.map(parserAsTypescriptStringDuplicated).join(', ')}]`
    case 'Or':
      return `(${validator.description.children.map(parserAsTypescriptString).join(' | ')})`
    case 'Shape': {
      const shapeString = `{${validator.description.children
        .map((x) => parserAsTypescriptString(x))
        .map((val, i) => `${JSON.stringify(validator.description.extras[i])}:${val}`)
        .join(', ')}}`
      return shapeString
    }

    case 'Partial': {
      const shapeString = `{${validator.description.children
        .map((x) => parserAsTypescriptString(x))
        .map((val, i) => `${JSON.stringify(validator.description.extras[i])}:${val}`)
        .join(', ')}}`

      return `Partial<${shapeString}>`
    }
    case 'Mapped':
    case 'Wrapper':
      return parserAsTypescriptString(validator.description.children[0])
    case 'Number':
    case 'Object':
    case 'Boolean':
    case 'String':
    case 'Any':
    case 'Unknown':
      return validator.description.name.toLowerCase()
    case 'Function':
      return validator.description.name
    case 'Null':
      return 'null'
  }
}

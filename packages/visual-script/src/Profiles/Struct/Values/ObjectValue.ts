import { ValueType } from '../../../VisualScriptModule'

export const ObjectValue: ValueType = {
  name: 'object',
  creator: () => [],
  deserialize: (value: string | object) => (typeof value === 'string' ? JSON.parse(value) : value),
  serialize: (value: object) => JSON.stringify(value),
  equals: (a: string, b: string) => a === b,
  clone: (value: object) => value,
  lerp: (value: object) => {
    throw new Error('Not implemented')
  }
}

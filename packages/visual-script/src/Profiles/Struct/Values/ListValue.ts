import { equals } from 'rambdax'
import { ValueType } from '../../../VisualScriptModule'

export const ListValue: ValueType = {
  name: 'list',
  creator: () => [],
  deserialize: (value: string | unknown[]) => (typeof value === 'string' ? JSON.parse(value) : value),
  serialize: (value: unknown[]) => JSON.stringify(value),
  equals: (a: unknown[], b: unknown[]) => equals(a, b),
  clone: (value: unknown[]) => value,
  lerp: (value: unknown[]) => {
    throw new Error('Not implemented')
  }
}

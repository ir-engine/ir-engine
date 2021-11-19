import { ITuple } from '../types'
import HashMap from './HashMap'

export default class HashSet<Value extends ITuple> extends HashMap<Value, Value> {
  add(value: Value) {
    this.set(value, value)
  }

  keys() {
    return this.values()
  }
}

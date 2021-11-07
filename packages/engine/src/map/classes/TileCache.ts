import { TileKey } from '../types'
import ParametricCache from './ParametricCache'

export default class TileCache<Value> extends ParametricCache<TileKey, Value> {}

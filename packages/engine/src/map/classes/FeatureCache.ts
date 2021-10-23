import { FeatureKey } from '../types'
import MapCache from './MapCache'

export default class FeatureCache<Value> extends MapCache<FeatureKey, Value> {}

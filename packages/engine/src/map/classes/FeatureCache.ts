import { FeatureKey } from '../types'
import ParametricCache from './ParametricCache'

export default class FeatureCache<Value> extends ParametricCache<FeatureKey, Value> {}

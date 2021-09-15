import { Feature } from 'geojson'
import FeatureCache from './FeatureCache'
import Phase from './Phase'
import UnifyFeaturesTask from './UnifyFeaturesTask'

export default class UnifyFeaturesPhase extends Phase<UnifyFeaturesTask> {
  featureCache: FeatureCache<Feature>

  constructor(featureCache: FeatureCache<Feature>) {
    super()
    this.featureCache = featureCache
  }

  *getTasks() {
    yield new UnifyFeaturesTask(this.featureCache)
  }

  cleanup() {}
}

import { Feature } from 'geojson'

import updateKeyVal from '../../common/functions/updateKeyVal'
import zipIterators from '../../common/functions/zipIterators'
import { FeatureKey } from '../types'

type GroupKey = Feature['id']
type Group = [FeatureKey, Feature][]

/** Useful for when a feature is split across multiple vector tiles */
export default function* findSplitFeatures(keys: Iterator<FeatureKey>, features: Iterator<Feature>): Generator<Group> {
  const zipped = zipIterators<[FeatureKey, Feature]>(keys, features)
  const groups = new Map<GroupKey, Group>()
  const addToGroup = updateKeyVal(
    groups.get.bind(groups),
    groups.set.bind(groups),
    (group: Group, newKey: FeatureKey, newFeature: Feature) => {
      return [...group, [newKey, newFeature]]
    },
    []
  )
  for (const [key, feature] of zipped) {
    if (feature.id) {
      addToGroup(feature.id, key, feature)
    }
  }
  for (const value of groups.values()) {
    if (value.length > 1) {
      yield value
    }
  }
}

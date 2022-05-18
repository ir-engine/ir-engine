import findSplitFeatures from '../../../src/map/functions/findSplitFeatures'
import { Feature } from 'geojson'
import { scalePolygon, translatePolygon } from '../../../src/map/GeoJSONFns'
import assert from 'assert'
import FeatureKey from '../../../src/map/classes/FeatureKey'

const boxCoords = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
]

describe('findSplitFeatures', () => {
  it('finds sets of feature objects that describe parts of the same physical feature', () => {
    const keyArray: FeatureKey[] = [
      new FeatureKey('building', 1, 2, '3'),
      new FeatureKey('building', 2, 2, '7'),
      new FeatureKey('building', 2, 1, '5'),
      new FeatureKey('road', 4, 8, '6')
    ]
    const featureArray: Feature[] = [
      {
        type: 'Feature',
        id: 1,
        geometry: {
          type: 'Polygon',
          coordinates: [scalePolygon(boxCoords, 5, 5)]
        },
        properties: {}
      },
      {
        type: 'Feature',
        id: 1,
        geometry: {
          type: 'Polygon',
          coordinates: [translatePolygon(scalePolygon(boxCoords, 5, 5), 5, 0)]
        },
        properties: {}
      },
      {
        type: 'Feature',
        id: 1,
        geometry: {
          type: 'Polygon',
          coordinates: [translatePolygon(scalePolygon(boxCoords, 5, 5), 10, 0)]
        },
        properties: {}
      },
      {
        type: 'Feature',
        id: 2,
        geometry: {
          type: 'Polygon',
          coordinates: [translatePolygon(scalePolygon(boxCoords, 5, 5), -5, 0)]
        },
        properties: {}
      }
    ]
    const keys = new Set(keyArray)
    const features = new Set(featureArray)

    const output = [] as [FeatureKey, Feature][]
    for (const group of findSplitFeatures(keys.values(), features.values())) {
      output.push(group as any)
    }

    assert.deepEqual(output, [
      [
        [keyArray[0], featureArray[0]],
        [keyArray[1], featureArray[1]],
        [keyArray[2], featureArray[2]]
      ]
    ])
  })
})

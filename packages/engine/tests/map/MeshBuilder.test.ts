import { buildMeshes } from '../../src/map/MeshBuilder'
import * as turf from '@turf/turf'

jest.mock('../../src/map/GeometryWorker', () => {
  return () => ({postMessage: () => {}})
})

// const box5x5Feature = turf.transformScale(boxFeature, 5)
// const features: Feature[] = [
//   box5x5Feature
// ]
describe('buildMeshes', () => {
  it('uses a UUID for each feature to track its work', async () => {
    const boxFeature = turf.polygon([
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
        [0, 0]
      ]
    ])
    boxFeature.properties.uuid = 'building,0,0,0'
    const center = [2.5, 2.5]
    const features = [boxFeature]
    const { tasks } = buildMeshes('building', features, center)

    expect(tasks).toEqual([expect.objectContaining({ id: 'building,0,0,0' })])
  })
})

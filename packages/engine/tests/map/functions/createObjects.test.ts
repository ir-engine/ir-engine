import createGeometry, { $geometriesByTaskId } from '../../../src/map/functions/createGeometry'
import createMesh from '../../../src/map/functions/createMesh'
import * as turf from '@turf/turf'
import { LongLat } from '../../../src/map/units'
import { BufferGeometry, Mesh } from 'three'
import createObjects from '../../../src/map/functions/createObjects'
import { FeatureWithTileIndex } from '../../../src/map/types'

jest.mock('../../../src/map/functions/createMesh')
jest.mock('../../../src/map/functions/createGeometry')

// TODO add labels option

describe('createObjects', () => {
  let results: Iterable<{ mesh: Mesh; geographicCenterPoint: LongLat }>
  let features: FeatureWithTileIndex[], center: LongLat
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createMesh as jest.Mock).mockImplementation(() => new Mesh())
    ;(createGeometry as jest.Mock).mockImplementation((id) => {
      $geometriesByTaskId.set(id, { geometry: new BufferGeometry(), geographicCenterPoint: [0, 0] })
    })

    const boxFeature = turf.polygon(
      [
        [
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
          [0, 0]
        ]
      ],
      { tileIndex: `0` }
    )
    center = [2.5, 2.5]
    features = [boxFeature]
    results = createObjects('building', 42, 13, features, center)
  })

  it('returns an iterable of the results', () => {
    const resultsArray = []
    for (const result of results) {
      resultsArray.push(result)
    }
    const mesh = (createMesh as jest.Mock).mock.results[0].value
    const { geographicCenterPoint } = $geometriesByTaskId.get('building,42,13,0')
    expect(resultsArray).toEqual([{ mesh, geographicCenterPoint }])
  })
})

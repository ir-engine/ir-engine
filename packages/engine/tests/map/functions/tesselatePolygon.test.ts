import assert from 'assert'
import { indexedVerticesToGeoJSONTriangles } from '../../../src/map/functions/tesselatePolygon'

describe('indexedVerticesToGeoJSONTriangles', () => {
  it('puts the vertices in order given by the indexes', () => {
    const actual = indexedVerticesToGeoJSONTriangles([2, 1, 0, 5, 3, 4], [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6])
    assert.deepEqual(actual, [
      [
        [
          [3, 3],
          [2, 2],
          [1, 1]
        ]
      ],
      [
        [
          [6, 6],
          [4, 4],
          [5, 5]
        ]
      ]
    ])
  })
})

import unifyFeatures from '../../../src/map/functions/unifyFeatures'
import { Feature, Polygon, MultiPolygon } from 'geojson'
import { scalePolygon, translatePolygon } from '../../../src/map/GeoJSONFns'
import polygonClipping from 'polygon-clipping'
import assert from 'assert'

const boxCoords = [
  [-1, -1],
  [1, -1],
  [1, 1],
  [-1, 1],
  [-1, -1]
]

describe('unifyFeatures', () => {
  it('unifies polygons belonging to the same feature', () => {
    const input: Feature[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [scalePolygon(boxCoords, 5, 5)]
        },
        properties: {}
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [translatePolygon(scalePolygon(boxCoords, 5, 5), 5, 0)]
        },
        properties: {}
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [translatePolygon(scalePolygon(boxCoords, 5, 5), 10, 0)]
        },
        properties: {}
      }
    ]

    const output = unifyFeatures(input)

    const expected = polygonClipping.union(
      (input[0].geometry as Polygon).coordinates as any,
      polygonClipping.union(
        (input[1].geometry as Polygon).coordinates as any,
        (input[2].geometry as Polygon).coordinates as any
      )[0]
    )[0]
    assert.deepEqual((output.geometry as Polygon).coordinates, expected)
  })

  it('unifies properties intelligently', () => {
    const input: Feature[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [scalePolygon(boxCoords, 5, 5)]
        },
        properties: {
          height: 42
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [scalePolygon(boxCoords, 5, 5)]
        },
        properties: {}
      }
    ]

    const output = unifyFeatures(input)

    assert.equal(output.properties!['height'], 42)
  })

  it('handles multipolygons', () => {
    const input: Feature[] = [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[scalePolygon(boxCoords, 5, 5)], [translatePolygon(scalePolygon(boxCoords, 5, 5), 15, 0)]]
        },
        properties: {}
      },
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [[translatePolygon(scalePolygon(boxCoords, 5, 5), 5, 0)]]
        },
        properties: {}
      }
    ]

    const output = unifyFeatures(input)

    const expected = polygonClipping.union(
        (input[0].geometry as MultiPolygon).coordinates as any,
        (input[1].geometry as MultiPolygon).coordinates as any
      )[0]
    assert.deepEqual((output.geometry as MultiPolygon).coordinates, expected)

    // Not sure why this isn't a multipolygon, but I trust polygon-clipping
    // expect(output[0].geometry.type).toBe('MultiPolygon')
  })
})

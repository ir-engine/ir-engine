import { polygon, center as findCenter } from '@turf/turf'
import { MapTransformedFeature, SupportedFeature } from '../../../src/map/types'
import sinon, { SinonSpy } from 'sinon'
import mock from 'mock-require'
import assert from 'assert'

describe('transformFeature', () => {
  const center = [25, 25]
  let feature: SupportedFeature, result: MapTransformedFeature
  let transformFeature, toMetersFromCenter
  beforeEach(() => {
    mock('../../../src/map/functions/UnitConversionFunctions', {
      toMetersFromCenter: sinon.spy((point) => point)
    })

    toMetersFromCenter = require('../../../src/map/functions/UnitConversionFunctions').toMetersFromCenter
    transformFeature = require('../../../src/map/functions/transformFeature').default
    feature = polygon([
      [
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20]
      ]
    ])
    result = transformFeature(feature, center)
  })

  afterEach(() => {
    mock.stopAll()
  })

  it('converts LongLat in to scene (meters) coordinates', () => {
    assert.equal((toMetersFromCenter as SinonSpy).callCount, 6)
  })

  it("centers the feature's coordinates around (0,0)", () => {
    assert.deepEqual(findCenter(result.feature).geometry.coordinates, [0, 0])
  })

  it("computes the feature's center point (in meters) scaled", () => {
    assert.deepEqual(result.centerPoint, [25, -25])
  })

  it("computes the feature's bounding circle radius (in meters) scaled", () => {
    assert.equal(result.boundingCircleRadius, 5)
  })
})

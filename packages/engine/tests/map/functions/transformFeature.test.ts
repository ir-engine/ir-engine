import * as turf from '@turf/turf'
import { MapTransformedFeature, SupportedFeature } from '../../../src/map/types'
import type TransformFeature from '../../../src/map/functions/transformFeature'
import sinon, { SinonSpy } from 'sinon'
import mock from 'mock-require'
import assert from 'assert'

describe('transformFeature', () => {
  const center = [25, 25]
  let polyFeature: SupportedFeature, lineFeature: SupportedFeature, polyResult: MapTransformedFeature
  let transformFeature: typeof TransformFeature, toMetersFromCenter: SinonSpy, buffer: SinonSpy
  beforeEach(() => {
    mock('../../../src/map/functions/UnitConversionFunctions', {
      toMetersFromCenter: sinon.spy((point) => point)
    })
    mock('@turf/turf', {
      buffer: sinon.spy((feature) => feature),
      center: turf.center,
      bbox: turf.bbox
    })

    toMetersFromCenter = require('../../../src/map/functions/UnitConversionFunctions').toMetersFromCenter
    buffer = require('@turf/turf').buffer

    // need to clear this cache so the module is actually reloaded
    delete require.cache[require.resolve('../../../src/map/functions/transformFeature')]
    transformFeature = require('../../../src/map/functions/transformFeature').default
    polyFeature = turf.polygon([
      [
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20]
      ]
    ])
    lineFeature = turf.lineString([
      [20, 20],
      [30, 20],
      [30, 30],
      [20, 30]
    ])
    polyResult = transformFeature('building', polyFeature, center)
    transformFeature('road', lineFeature, center)
  })

  afterEach(() => {
    mock.stopAll()
  })

  it('converts lines to polygons', () => {
    assert.equal(buffer.callCount, 1)
  })

  it('converts LongLat in to scene (meters) coordinates', () => {
    assert.equal((toMetersFromCenter as SinonSpy).callCount, 11)
  })

  it("centers the feature's coordinates around (0,0)", () => {
    assert.deepEqual(turf.center(polyResult.feature).geometry.coordinates, [0, 0])
  })

  it("computes the feature's center point (in meters) scaled", () => {
    assert.deepEqual(polyResult.centerPoint, [25, -25])
  })

  it("computes the feature's bounding circle radius (in meters) scaled", () => {
    assert.equal(polyResult.boundingCircleRadius, 5)
  })
})

import { polygon, center as findCenter } from '@turf/turf'
import transformFeature, {measure} from '../../../src/map/functions/transformFeature'
import { MapTransformedFeature, SupportedFeature } from '../../../src/map/types'
import { toMetersFromCenter } from '../../../src/map/units'

jest.mock('../../../src/map/units', () => {
  return {
    toMetersFromCenter: jest.fn((point) => point)
  }
})

describe('transformFeature', () => {
  const scale = 0.5,
    center = [25, 25]
  let feature: SupportedFeature, result: MapTransformedFeature, originalMeasurements: {width: number, height: number}
  beforeEach(() => {
    jest.clearAllMocks()
    feature = polygon([
      [
        [20, 20],
        [30, 20],
        [30, 30],
        [20, 30],
        [20, 20]
      ]
    ])
    originalMeasurements = measure(feature)
    result = transformFeature(feature, scale, center)
  })
  it("scales the feature's coordinates", () => {
    const {width, height} = measure(result.feature)
    expect(width).toEqual(originalMeasurements.width * scale)
    expect(height).toEqual(originalMeasurements.height * scale)
  })

  it('converts LongLat in to scene (meters) coordinates', () => {
    expect(toMetersFromCenter).toHaveBeenCalledTimes(5)
  })

  it("centers the feature's coordinates around (0,0)", () => {
    expect(findCenter(result.feature).geometry.coordinates).toEqual([0,0])
  })

  it("computes the feature's center point (in meters) scaled", () => {
    expect(result.centerPoint).toEqual([12.5, 12.5])
  })

  it("computes the feature's bounding circle radius (in meters) scaled", () => {
    expect(result.boundingCircleRadius).toEqual(2.5)
  })
})

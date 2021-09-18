import { longToTileXFraction, latToTileYFraction, tileXToLong, tileYToLat } from '../../src/map/units'

const LATITUDE_ABS_MAX = 85.0511

describe('coordinates conversions', () => {
  // See https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#X_and_Y
  test('longToTileXFraction', () => {
    expect(longToTileXFraction(-180, 2)).toBeCloseTo(0)
    expect(longToTileXFraction(180 - 1e-8, 2)).toBeCloseTo(4)
  })
  test('lat2tile', () => {
    expect(latToTileYFraction(LATITUDE_ABS_MAX, 2)).toBeCloseTo(0)
    expect(latToTileYFraction(-LATITUDE_ABS_MAX, 2)).toBeCloseTo(4)
  })
  test('tileXToLong', () => {
    expect(tileXToLong(0, 2)).toBeCloseTo(-180)
    expect(tileXToLong(4, 2)).toBeCloseTo(180)
  })
  test('tileYToLat', () => {
    expect(tileYToLat(0, 2)).toBeCloseTo(LATITUDE_ABS_MAX)
    expect(tileYToLat(4, 2)).toBeCloseTo(-LATITUDE_ABS_MAX)
  })
})

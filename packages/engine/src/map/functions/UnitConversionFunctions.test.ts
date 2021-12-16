import assert from 'assert'
import { longToTileXFraction, latToTileYFraction, tileXToLong, tileYToLat } from '../../../src/map/functions/UnitConversionFunctions'

const LATITUDE_ABS_MAX = 85.0511

function assertCloseTo(actual: number, expected: number) {
  if(Math.abs(actual - expected) > 0.005) {
    assert.fail()
  }
}

describe('unit conversions', () => {
  // See https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#X_and_Y
  it('handles the entire possible range of longitudes', () => {
    assertCloseTo(longToTileXFraction(-180, 2), 0)
    assertCloseTo(longToTileXFraction(180 - 1e-8, 2), 4)
  })
  it('handles the entire possible range of latitudes', () => {
    assertCloseTo(latToTileYFraction(LATITUDE_ABS_MAX, 2), 0)
    assertCloseTo(latToTileYFraction(-LATITUDE_ABS_MAX, 2), 4)
  })
  it('tileXToLong', () => {
    assertCloseTo(tileXToLong(0, 2), -180)
    assertCloseTo(tileXToLong(4, 2), 180)
  })
  it('tileYToLat', () => {
    assertCloseTo(tileYToLat(0, 2), LATITUDE_ABS_MAX)
    assertCloseTo(tileYToLat(4, 2), -LATITUDE_ABS_MAX)
  })
})

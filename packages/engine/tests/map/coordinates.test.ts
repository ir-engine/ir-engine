import { lat2tile, long2tile, tile2lat, tile2long, TILE_ZOOM } from "../../src/map/MapBoxClient";
import { llToScene, llToScene2, sceneToLl } from "../../src/map/MeshBuilder";
import { expect } from "@jest/globals";
import { atlantaGeoCoord, atlantaGeoCoord2, atlantaTileCoord, atlantaTileGeoCoordinate } from "./constants";

describe('coordinates conversions', () => {
    // See https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#X_and_Y
  // TODO add tests like this for tile2*
    test("long2tile", () => {
      expect(long2tile(-180, 2)).toBe(0)
      expect(long2tile(180 - 1e-8, 2)).toBe(3)
    })
    test("lat2tile", () => {
      expect(lat2tile(85.0511, 2)).toBe(0)
      expect(lat2tile(-85.0511, 2)).toBe(3)
    })
    // TODO move to MapBoxClient.test?
    it("converts geo to tile", () => {
        const tileX = long2tile(atlantaGeoCoord2[0], TILE_ZOOM)
        const tileY = lat2tile(atlantaGeoCoord2[1], TILE_ZOOM)

        expect([ tileX, tileY ]).toMatchObject(atlantaTileCoord)
    })
    it("converts tile to geo", () => {
        const long = tile2long(atlantaTileCoord[0], TILE_ZOOM)
        const lat = tile2lat(atlantaTileCoord[1], TILE_ZOOM)

        expect(long).toBeCloseTo(atlantaTileGeoCoordinate[0], 3)
        expect(lat).toBeCloseTo(atlantaTileGeoCoordinate[1], 3)
    })
    it("geo -> scene -> geo ", () => {
        const sceneCoords = llToScene(atlantaGeoCoord2, atlantaGeoCoord)
        const geoCoords = sceneToLl(sceneCoords, atlantaGeoCoord)
        expect(geoCoords[0]).toBeCloseTo(atlantaGeoCoord2[0], 3)
        expect(geoCoords[1]).toBeCloseTo(atlantaGeoCoord2[1], 3)
    })
})

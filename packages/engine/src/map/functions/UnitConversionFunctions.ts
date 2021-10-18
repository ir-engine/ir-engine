import { degreesToRadians } from '@turf/turf'
export const METERS_PER_LONGLAT = 111139

/** Memnonic drop-in replacement for geojson.Position */
export type LongLat = number[]

export function toMetersFromCenter([lng, lat]: LongLat, [lngCenter, latCenter]: LongLat, target = Array(2)): number[] {
  const x = (lng - lngCenter) * 111134.861111
  const z = (lat - latCenter) * (Math.cos((latCenter * Math.PI) / 180) * 111321.377778)
  target[0] = x
  target[1] = z
  return target
}

export function fromMetersFromCenter(
  sceneCoord: number[],
  [lngCenter, latCenter] = [0, 0] as LongLat,
  scale = 1
): LongLat {
  const longtitude = sceneCoord[0] / (111134.861111 * scale) + lngCenter
  const latitude = -sceneCoord[1] / (Math.cos((latCenter * Math.PI) / 180) * 111321.377778 * scale) + latCenter
  return [longtitude, latitude]
}

export function longToTileXFraction(lon: number, zoom: number) {
  return ((lon + 180) / 360) * Math.pow(2, zoom)
}

export function latToTileYFraction(lat: number, zoom: number) {
  const latRadians = degreesToRadians(lat)

  return ((1 - Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI) / 2) * Math.pow(2, zoom)
}

export function tileXToLong(tileX: number, zoom: number) {
  return (tileX / Math.pow(2, zoom)) * 360 - 180
}

export function tileYToLat(tileY: number, zoom: number) {
  return Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / Math.pow(2, zoom)))) * (180 / Math.PI)
}

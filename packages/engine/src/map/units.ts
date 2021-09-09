export const METERS_PER_LONGLAT = 111139

/** Memnonic drop-in replacement for geojson.Position */
export type LongLat = number[]

export function toMetersFromCenter([lng, lat]: LongLat, [lngCenter, latCenter]: LongLat, sceneScale = 1): number[] {
  return [(lng - lngCenter) * METERS_PER_LONGLAT * sceneScale, (lat - latCenter) * METERS_PER_LONGLAT * sceneScale]
}

// TODO try this instead
export function toMetersFromCenter2([lng, lat]: LongLat, [lngCenter, latCenter]: LongLat, scale = 1): LongLat {
  const x = (lng - lngCenter) * 111134.861111 * scale
  const z = (lat - latCenter) * (Math.cos((latCenter * Math.PI) / 180) * 111321.377778) * scale
  return [x, z]
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

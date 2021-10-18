import { Geometry, Position } from 'geojson'

function transformRing(
  coordinatesSource: Position[],
  transformer: (source: Position, target: Position) => void,
  coordinatesTarget = coordinatesSource
) {
  for (let index = 0, length = coordinatesSource.length; index < length; index++) {
    transformer(coordinatesSource[index], coordinatesTarget[index])
  }
  return coordinatesTarget
}

export default function transformGeometry<Coordinates extends Position[] | Position[][] | Position[][][]>(
  type: Geometry['type'],
  coordSource: Coordinates,
  transformer: (source: [number, number], target: [number, number]) => void,
  coordTarget = coordSource
) {
  // TODO use ts-matches
  switch (type) {
    case 'LineString':
      transformRing(coordSource as Position[], transformer)
      break
    case 'MultiLineString':
    case 'Polygon':
      for (let index = 0, length = coordSource.length; index < length; index++) {
        coordTarget[index] = transformRing(
          coordSource[index] as Position[],
          transformer,
          coordTarget[index] as Position[]
        ) as Position[]
      }
      break
    case 'MultiPolygon':
      for (let index = 0, length = coordSource.length; index < length; index++) {
        const polySource = coordSource[index]
        coordTarget[index] = transformGeometry(
          'Polygon',
          polySource as Position[][],
          transformer,
          coordTarget[index] as any
        ) as any
      }
      break
    default:
      throw new Error('encountered unsupported geometry type ' + type)
  }
  return coordTarget
}

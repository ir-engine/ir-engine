import { Geometry, Position } from 'geojson'

function transformRing(
  coordinatesSource: Position[],
  transformer: (source: Position, target: Position) => void,
  coordinatesTarget = coordinatesSource
) {
  for (let index = 0, length = coordinatesSource.length; index < length; index++) {
    const coordSource = coordinatesSource[index]
    const coordTarget = coordinatesTarget[index]
    transformer(coordSource, coordTarget)
  }
}

export default function transformPolygon<Coordinates extends Position[] | Position[][] | Position[][][]>(
  type: Geometry['type'],
  coordSource: Coordinates,
  transformer: (source: [number, number], target: [number, number]) => void,
  coordTarget = coordSource
) {
  switch (type) {
    case 'LineString':
      transformRing(coordSource as Position[], transformer)
      break
    case 'MultiLineString':
    case 'Polygon':
      for (let index = 0, length = coordSource.length; index < length; index++) {
        const ringSource = coordSource[index]
        const ringTarget = coordTarget[index]
        transformRing(ringSource as Position[], transformer, ringTarget as any)
      }
      break
    case 'MultiPolygon':
      for (let index = 0, length = coordSource.length; index < length; index++) {
        const polySource = coordSource[index]
        const polyTarget = coordTarget[index]
        transformPolygon('Polygon', polySource as Position[][], transformer, polyTarget as any)
      }
  }
  return coordTarget
}

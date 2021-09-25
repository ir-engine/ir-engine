import { Feature, Polygon } from 'geojson'
import pc, { Pair } from 'polygon-clipping'

export default function computePolygonsOfFeaturesNegative(
  negativeSpace: Feature<Polygon>,
  positiveSpaces: Feature<Polygon>[]
) {
  const negativeSpaceCoords = negativeSpace.geometry.coordinates as Pair[][]
  const positiveSpaceCoords = positiveSpaces.map((pos) => {
    return pos.geometry.coordinates
  }) as Pair[][][]
  return pc.difference(negativeSpaceCoords, ...positiveSpaceCoords)
}

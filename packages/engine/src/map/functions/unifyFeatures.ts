import { multiPolygon, polygon } from '@turf/turf'
import { Feature, Polygon } from 'geojson'
import polygonClipping from 'polygon-clipping'

/** Useful for when a feature is split across multiple vector tiles */
export default function unifyFeatures(features: Feature[]): Feature {
  if (features.length > 1) {
    const allCoords = features.map(getCoords)

    const unifiedCoords = polygonClipping.union.apply(null, allCoords)
    let maxHeight = 0

    features.forEach((f) => {
      maxHeight = f.properties?.['height'] ? Math.max(f.properties?.['height']) : maxHeight
    })
    const unifiedProperties = {
      ...features[0].properties,
      height: maxHeight
    }

    return unifiedCoords.length === 1
      ? polygon(unifiedCoords[0] as any, unifiedProperties)
      : multiPolygon(unifiedCoords as any, unifiedProperties)
  } else {
    return features[0]
  }

  function getCoords(f: Feature): polygonClipping.Polygon | polygonClipping.MultiPolygon {
    return (f.geometry as Polygon).coordinates as any
  }
}

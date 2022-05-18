import { round } from 'lodash'
import pc, { Polygon } from 'polygon-clipping'

function roundEach(array: any[]) {
  array.forEach((item, index) => {
    const itemType = typeof item
    if (itemType === 'number') {
      array[index] = round(item, 3)
    }
    if (Array.isArray(item)) {
      roundEach(item)
    }
  })
}

export default function computePolygonDifference(subjectGeometry: Polygon, ...clippingGeometries: Polygon[]) {
  // Quick and dirty fix for polygon-clipping's floating point woes
  roundEach(clippingGeometries)
  return pc.difference([subjectGeometry], ...clippingGeometries)
}

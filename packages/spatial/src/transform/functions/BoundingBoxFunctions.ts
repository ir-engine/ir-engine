import { Box3, Vector3 } from 'three'

/**
 * Returns all vertices of the bounding box, useful for including all vertices in the camera's view rather than hoping min and max are aligned with the camera
 * @param boundingBox
 */
export function getBoundingBoxVertices(boundingBox: Box3): Vector3[] {
  const min = boundingBox.min
  const max = boundingBox.max

  return [
    new Vector3(min.x, min.y, min.z),
    new Vector3(min.x, min.y, max.z),
    new Vector3(min.x, max.y, min.z),
    new Vector3(min.x, max.y, max.z),
    new Vector3(max.x, min.y, min.z),
    new Vector3(max.x, min.y, max.z),
    new Vector3(max.x, max.y, min.z),
    new Vector3(max.x, max.y, max.z)
  ]
}

import { BufferGeometry } from 'three'
/**
 * @param target if the result is applied to this geometry's scale it would be the same size as `source`
 */
export function getRelativeSizesOfGeometries(
  target: BufferGeometry,
  source: BufferGeometry,
  dimension: 'x' | 'y' | 'z'
) {
  target.computeBoundingBox()
  source.computeBoundingBox()

  const targetBBox = target.boundingBox
  const sourceBBox = source.boundingBox

  return (
    (sourceBBox.max[dimension] - sourceBBox.min[dimension]) / (targetBBox.max[dimension] - targetBBox.min[dimension])
  )
}

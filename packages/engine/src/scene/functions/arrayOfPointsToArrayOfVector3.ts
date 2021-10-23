import { Vector3 } from 'three'

export const arrayOfPointsToArrayOfVector3 = (points: ArrayLike<number>) => {
  const verts: Vector3[] = []
  for (let i = 0; i < points.length; i += 3) {
    verts.push(new Vector3(points[i], points[i + 1], points[i + 2]))
  }
  return verts
}

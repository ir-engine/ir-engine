import { Vector3 } from 'three'
import { NavMesh, Path, Vector3 as YukaVector3 } from 'yuka'

export const updatePath = (path: Path, navMesh: NavMesh, from: Vector3, to: Vector3, base = from): Path => {
  // graph is in local coordinates, we need to convert "from" and "to" to local using "base" and center
  // TODO: handle scale and rotation of graph object, pass world matrix?
  const graphBaseCoordinate = new YukaVector3(base.x, base.y, base.z)
  const localFrom = new YukaVector3(from.x, from.y, from.z).sub(graphBaseCoordinate)
  const localTo = new YukaVector3(to.x, to.y, to.z).sub(graphBaseCoordinate)
  const points = navMesh.findPath(localFrom, localTo)

  path.clear()
  for (const point of points) {
    const worldPoint = point.clone().add(graphBaseCoordinate) // convert point back to world coordinates
    path.add(worldPoint)
  }
  return path
}

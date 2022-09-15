import { Camera, Intersection, Object3D, Raycaster, Vector2, Vector3 } from 'three'

const raycaster = new Raycaster()
export function findFirstIntersection(camera: Camera, surfaces: Object3D[], point: Vector2): [Vector3 | null, number] {
  raycaster.setFromCamera(point, camera)

  const raycasterResults: Intersection[] = []

  const best = surfaces.reduce(
    (currentBest, currentSurface, index) => {
      raycasterResults.length = 0
      raycaster.intersectObject(currentSurface, true, raycasterResults)

      if (raycasterResults.length > 0 && raycasterResults[0].distance < currentBest.distance) {
        return {
          distance: raycasterResults[0].distance,
          point: raycasterResults[0].point,
          index
        }
      } else {
        return currentBest
      }
    },
    { distance: Infinity, point: null, index: -1 }
  )
  return [best.point, best.index]
}

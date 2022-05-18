import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three'

type RaycastIntersectionNode = Intersection<Object3D> & {
  node: Object3D
}

export function getIntersectingNode(results: Intersection<Object3D>[], scene: Object3D): RaycastIntersectionNode {
  if (results.length > 0) {
    for (const result of results) {
      let curObject = result.object as any
      while (curObject) {
        if (curObject.isNode) {
          break
        }
        curObject = curObject.parent
      }
      if (curObject && curObject !== scene && !curObject.ignoreRaycast) {
        ;(result as RaycastIntersectionNode).node = curObject
        return result as RaycastIntersectionNode
      }
    }
  }
  return null
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = Engine.camera,
  object: Object3D = Engine.scene,
  recursive: boolean = true
): RaycastIntersectionNode => {
  raycaster.setFromCamera(coord, camera)
  raycaster.intersectObject(object, recursive, target)
  return getIntersectingNode(target, object)
}

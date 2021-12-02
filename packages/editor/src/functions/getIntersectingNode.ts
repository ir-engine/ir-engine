import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three'

type RaycastIntersectionNode = Intersection<Object3DWithEntity> & {
  obj3d: Object3DWithEntity
  node?: EntityTreeNode
}

function getParentEntity(obj: Object3DWithEntity): Object3DWithEntity {
  let curObj = obj

  while (curObj) {
    if (curObj.entity) break
    curObj = curObj.parent! as Object3DWithEntity
  }

  return curObj
}

export function getIntersectingNode(results: Intersection<Object3DWithEntity>[]): RaycastIntersectionNode | undefined {
  if (results.length <= 0) return

  for (const result of results as RaycastIntersectionNode[]) {
    const obj = getParentEntity(result.object as Object3DWithEntity)

    if (obj && (obj as Object3D) !== Engine.scene && !(obj as any).ignoreRaycast) {
      result.obj3d = obj
      result.node = useWorld().entityTree.findNodeFromEid(obj.entity)
      return result
    }
  }
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = Engine.camera,
  object: Object3D = Engine.scene,
  recursive: boolean = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.intersectObject<Object3DWithEntity>(object, recursive, target as Intersection<Object3DWithEntity>[])
  return getIntersectingNode(target as Intersection<Object3DWithEntity>[])
}

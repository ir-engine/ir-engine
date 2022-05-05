import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { IgnoreRaycastTagComponent } from '@xrengine/engine/src/scene/components/IgnoreRaycastTagComponent'
import { Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { ObjectLayers } from '@xrengine/engine/src/scene/constants/ObjectLayers'

type RaycastIntersectionNode = Intersection<Object3DWithEntity> & {
  obj3d: Object3DWithEntity
  node?: EntityTreeNode
}

function getParentEntity(obj: Object3DWithEntity): Object3DWithEntity {
  let curObj = obj

  while (curObj) {
    if (curObj.entity && !hasComponent(curObj.entity, IgnoreRaycastTagComponent)) break
    curObj = curObj.parent! as Object3DWithEntity
  }

  return curObj
}

export function getIntersectingNode(results: Intersection<Object3DWithEntity>[]): RaycastIntersectionNode | undefined {
  if (results.length <= 0) return

  for (const result of results as RaycastIntersectionNode[]) {
    const obj = getParentEntity(result.object)

    if (obj && (obj as Object3D) !== Engine.instance.scene) {
      result.obj3d = obj
      result.node = useWorld().entityTree.entityNodeMap.get(obj.entity)
      return result
    }
  }
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = Engine.instance.camera,
  object?: Object3D,
  recursive: boolean = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.intersectObject<Object3DWithEntity>(
    object ?? Engine.instance.scene,
    recursive,
    target as Intersection<Object3DWithEntity>[]
  )
  raycaster.layers.disable(ObjectLayers.NodeHelper)
  return getIntersectingNode(target as Intersection<Object3DWithEntity>[])
}

import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { GroupComponent, Object3DWithEntity } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'

import { accessSelectionState } from '../services/SelectionServices'

type RaycastIntersectionNode = Intersection<Object3DWithEntity> & {
  obj3d: Object3DWithEntity
  node?: EntityOrObjectUUID
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
  const selectionState = accessSelectionState()
  const selected = new Set<string | Entity>(selectionState.selectedEntities.value)
  for (const result of results as RaycastIntersectionNode[]) {
    const obj = result.object //getParentEntity(result.object)
    const parentNode = getParentEntity(obj)
    if (!parentNode) continue //skip obj3ds that are not children of EntityNodes
    if (!obj.entity && parentNode && !selected.has(parentNode.entity)) {
      result.node = getEntityNodeArrayFromEntities([parentNode.entity])[0]
      result.obj3d = getComponent(parentNode.entity, GroupComponent)[0] as Object3DWithEntity
      return result
    }

    if (obj && (obj as Object3D) !== Engine.instance.currentWorld.scene) {
      result.obj3d = obj
      result.node = obj.entity ?? obj.uuid
      //if(result.node && hasComponent(result.node.entity, GroupComponent))
      //result.obj3d = result.object
      //result.node = result.object.uuid
      return result
    }
  }
}

export const getIntersectingNodeOnScreen = (
  raycaster: Raycaster,
  coord: Vector2,
  target: Intersection<Object3D>[] = [],
  camera: Camera = Engine.instance.currentWorld.camera,
  object?: Object3D,
  recursive: boolean = true
): RaycastIntersectionNode | undefined => {
  raycaster.setFromCamera(coord, camera)
  raycaster.layers.enable(ObjectLayers.NodeHelper)
  raycaster.intersectObject<Object3DWithEntity>(
    object ?? Engine.instance.currentWorld.scene,
    recursive,
    target as Intersection<Object3DWithEntity>[]
  )
  raycaster.layers.disable(ObjectLayers.NodeHelper)
  return getIntersectingNode(target as Intersection<Object3DWithEntity>[])
}

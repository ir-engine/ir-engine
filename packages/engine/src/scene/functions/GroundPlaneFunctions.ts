import { Color, Group } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  ComponentDeserializeFunction,
  ComponentUpdateFunction,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../physics/functions/createCollider'
import { GroundPlaneComponent } from '../components/GroundPlaneComponent'
import { Engine } from '../../ecs/classes/Engine'
import GroundPlane from '../classes/GroundPlane'
import { Object3DComponent } from '../components/Object3DComponent'
import { WalkableTagComponent } from '../components/Walkable'
import { isClient } from '../../common/functions/isClient'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

export const createGround: ComponentDeserializeFunction = async function (
  entity: Entity,
  json: ComponentJson
): Promise<void> {
  const groundPlane = new GroundPlane()
  addComponent(entity, Object3DComponent, { value: groundPlane })

  json.props.color = new Color(json.props.color)
  addComponent(entity, GroundPlaneComponent, json.props)

  if (!Engine.isEditor) createCollider(entity, groundPlane.mesh)

  updateGroundPlane(entity)
}

let navigationRaycastTarget: Group

export const updateGroundPlane: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, GroundPlaneComponent)
  const groundPlane = getComponent(entity, Object3DComponent)?.value as GroundPlane

  groundPlane.color.set(component.color)

  const isWalkable = hasComponent(entity, WalkableTagComponent)
  if (component.walkable && !isWalkable) {
    addComponent(entity, WalkableTagComponent, {})
  } else if (!component.walkable && isWalkable) {
    removeComponent(entity, WalkableTagComponent)
  }

  groundPlane.generateNavmesh = component.generateNavmesh
  if (isClient && !Engine.isEditor) {
    if (component.generateNavmesh) {
      if (!navigationRaycastTarget) navigationRaycastTarget = new Group()

      navigationRaycastTarget.scale.setScalar(getComponent(entity, TransformComponent).scale.x)
      Engine.scene.add(navigationRaycastTarget)
      addComponent(entity, NavMeshComponent, { navTarget: navigationRaycastTarget })
    } else {
      Engine.scene.remove(navigationRaycastTarget)
      removeComponent(entity, NavMeshComponent)
    }
  }
}

import { Color, Group } from 'three'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../../ecs/functions/ComponentFunctions'
import { createCollider } from '../../../physics/functions/createCollider'
import { GroundPlaneComponent, GroundPlaneComponentType } from '../../components/GroundPlaneComponent'
import { Engine } from '../../../ecs/classes/Engine'
import GroundPlane from '../../classes/GroundPlane'
import { Object3DComponent } from '../../components/Object3DComponent'
import { isClient } from '../../../common/functions/isClient'
import { NavMeshComponent } from '../../../navigation/component/NavMeshComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../../common/constants/ComponentNames'

export const SCENE_COMPONENT_GROUND_PLANE = 'ground-plane'

export const deserializeGround: ComponentDeserializeFunction = async function (
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

export const serializeGroundPlane: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, GroundPlaneComponent) as GroundPlaneComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_GROUND_PLANE,
    props: {
      color: component.color?.getHex(),
      generateNavmesh: component.generateNavmesh
    }
  }
}

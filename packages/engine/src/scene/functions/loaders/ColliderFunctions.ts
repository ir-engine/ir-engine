import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { createBody, getAllShapesFromObject3D, ShapeOptions } from '../../../physics/functions/createCollider'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'

export const SCENE_COMPONENT_COLLIDER = 'collider'
export const SCENE_COMPONENT_COLLIDER_DEFAULT_VALUES = {}

export const deserializeCollider: ComponentDeserializeFunction = (
  entity: Entity,
  json: ComponentJson<ShapeOptions>
): void => {
  const object3d = getComponent(entity, Object3DComponent)
  if (object3d) {
    const shapes = getAllShapesFromObject3D(entity, object3d.value as any, json.props)
    const body = createBody(entity, json.props, shapes)
    addComponent(entity, ColliderComponent, { body })
    addComponent(entity, CollisionComponent, { collisions: [] })
  }
  if (Engine.isEditor) getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_COLLIDER)
}

export const serializeCollider: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ColliderComponent)
  if (!component) return

  return {
    name: SCENE_COMPONENT_COLLIDER,
    props: {
      /**
       * TODO: rewrite this when we clean up our physics implementation
       * since this is only ever used from gltf metadata, we dont yet need to support serialisation
       */
    }
  }
}

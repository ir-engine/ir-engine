import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { ComponentDeserializeFunction, ComponentSerializeFunction } from '../../../common/constants/ComponentNames'
import { Engine } from '../../../ecs/classes/Engine'
import { IncludeInCubemapBakeComponent } from '../../components/IncludeInCubemapBakeComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'

export const SCENE_COMPONENT_CUBEMAP_BAKE = 'includeInCubemapBake'

export const deserializeIncludeInCubeMapBake: ComponentDeserializeFunction = (entity: Entity, _: ComponentJson) => {
  if (Engine.isEditor) {
    addComponent(entity, IncludeInCubemapBakeComponent, {})
    getComponent(entity, EntityNodeComponent)?.components.push(SCENE_COMPONENT_CUBEMAP_BAKE)
  }
}

export const serializeIncludeInCubeMapBake: ComponentSerializeFunction = (entity) => {
  if (hasComponent(entity, IncludeInCubemapBakeComponent)) {
    return {
      name: SCENE_COMPONENT_CUBEMAP_BAKE,
      props: {}
    }
  }
}

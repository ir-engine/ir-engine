import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Mesh } from 'three'
import {
  ComponentDeserializeFunction,
  ComponentSerializeFunction,
  ComponentUpdateFunction
} from '../../common/constants/ComponentNames'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { ShadowComponent, ShadowComponentType } from '../components/ShadowComponent'

export const SCENE_COMPONENT_SHADOW = 'shadow'

export const deserializeShadow: ComponentDeserializeFunction = (entity: Entity, component: ComponentJson) => {
  addComponent(entity, ShadowComponent, {
    castShadow: component.props.cast,
    receiveShadow: component.props.receive
  })

  updateShadow(entity)
}

export const updateShadow: ComponentUpdateFunction = (entity: Entity) => {
  const component = getComponent(entity, ShadowComponent)
  const obj3d = getComponent(entity, Object3DComponent)?.value
  if (!obj3d) return

  obj3d.traverse((mesh: Mesh) => {
    mesh.castShadow = component.castShadow
    mesh.receiveShadow = component.receiveShadow

    if (Array.isArray(mesh.material)) {
      for (let i = 0; i < mesh.material.length; i++) {
        if (mesh.material[i]) mesh.material[i].needsUpdate = true
      }
    } else if (mesh.material) {
      mesh.material.needsUpdate = true
    }
  })
}

export const serializeShadow: ComponentSerializeFunction = (entity) => {
  const component = getComponent(entity, ShadowComponent) as ShadowComponentType
  if (!component) return

  return {
    name: SCENE_COMPONENT_SHADOW,
    props: {
      cast: component.castShadow,
      receive: component.receiveShadow
    }
  }
}

import { useEffect } from 'react'
import { InstancedMesh, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  createMappedComponent,
  defineComponent,
  getComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../ecs/functions/EntityFunctions'
import { DropShadowComponent } from './DropShadowComponent'
import { GroupComponent } from './GroupComponent'

export type ShadowComponentType = {
  cast: boolean
  receive: boolean
}

export const ShadowComponent = defineComponent({
  name: 'ShadowComponent',

  onInit: (entity) => {
    return {
      cast: true,
      receive: true,
      castDropShadow: false
    }
  },

  toJSON: (entity, component) => {
    return {
      cast: component.cast.value,
      receive: component.receive.value,
      castDropShadow: component.castDropShadow.value
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.cast && typeof json.cast == 'boolean') component.cast.set(json.cast)
    if (json.receive && typeof json.receive == 'boolean') component.receive.set(json.receive)
    if (json.castDropShadow && typeof json.castDropShadow == 'boolean')
      component.castDropShadow.set(json.castDropShadow)
  },

  reactor: ShadowReactor
})

function ShadowReactor({ root }: EntityReactorProps) {
  const shadowComponent = useOptionalComponent(root.entity, ShadowComponent)
  useEffect(() => {
    if (shadowComponent && shadowComponent.castDropShadow.value) setComponent(root.entity, DropShadowComponent)
  })

  return null
}

export const SCENE_COMPONENT_SHADOW = 'shadow'
export const SCENE_COMPONENT_SHADOW_DEFAULT_VALUES = {
  cast: true,
  receive: true
}

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Color, CubeTexture, FogBase, Texture } from 'three'

import { defineComponent, Entity } from '@etherealengine/ecs'

import { useAncestorWithComponent } from '../../transform/components/EntityTree'

export const SceneComponent = defineComponent({
  name: 'SceneComponent'
})

/**
 * Returns the scene entity ancestor for a given entity (if one exists)
 * @deprecated - use useAncestorWithComponent instead
 * @param entity
 * @returns
 */
export function useScene(entity: Entity) {
  return useAncestorWithComponent(entity, SceneComponent)
}

export const BackgroundComponent = defineComponent({
  name: 'BackgroundComponent',

  onInit(entity) {
    return null! as Color | Texture | CubeTexture
  },

  onSet(entity, component, json: Color | Texture | CubeTexture) {
    if (typeof json === 'object') component.set(json)
  }
})

export const EnvironmentMapComponent = defineComponent({
  name: 'EnvironmentMapComponent',

  onInit(entity) {
    return null! as Texture
  },

  onSet(entity, component, json: Texture) {
    if (typeof json === 'object') component.set(json)
  }
})

export const FogComponent = defineComponent({
  name: 'FogComponent',

  onInit(entity) {
    return null! as FogBase
  },

  onSet(entity, component, json: FogBase) {
    if (typeof json === 'object') component.set(json)
  }
})

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Component,
  Entity,
  EntityUUID,
  getAncestorWithComponents,
  hasComponent,
  SerializedComponentType,
  UUIDComponent
} from '@ir-engine/ecs'
import { NodeID } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import {
  defineState,
  getMutableState,
  getState,
  NO_PROXY_STEALTH,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { SceneState } from '../../gltf/GLTFState'

export type SceneDeltaRegistry = Record<EntityUUID, SceneDeltaEntry<any>>
export type SceneDeltaEntry<C extends Component> = Record<NodeID, Record<string, Partial<SerializedComponentType<C>>>>
export type MaterialDeltaEntry = Record<typeof MATERIAL_JSON_ID, any>

export const MATERIAL_JSON_ID = 'materialParameters' as const
export const MATERIAL_PROTOTYPE_JSON_ID = 'prototypeConstructor' as const

export const SceneDeltaState = defineState({
  name: 'SceneDeltaState',
  initial: {} as SceneDeltaRegistry,
  getDelta: (entity: Entity) => {
    const uuid = UUIDComponent.get(entity)
    return getState(SceneDeltaState)[uuid] as SceneDeltaEntry<any>
  },
  setDelta<C extends Component>(entity: Entity, component: C, delta: Partial<SerializedComponentType<C>>) {
    if (!component.jsonID) return
    if (!hasComponent(entity, UUIDComponent)) return
    if (!getAncestorWithComponents(entity, [GLTFComponent])) return
    const deltaState = getMutableState(SceneDeltaState)
    const uuid = UUIDComponent.get(entity)
    if (!deltaState[uuid].value) deltaState[uuid].set({} as SceneDeltaEntry<C>)
    const componentDelta = deltaState[uuid].get(NO_PROXY_STEALTH) as SceneDeltaEntry<C>
    componentDelta[component.jsonID] = { ...componentDelta[component.jsonID], ...delta }
  },
  removeDelta: (entity: Entity) => {
    const deltaState = getMutableState(SceneDeltaState)
    const uuid = UUIDComponent.get(entity)
    if (!deltaState[uuid].value) return
    deltaState[uuid].set(none)
  },
  reactor: () => {
    const sceneState = useMutableState(SceneState)
    const currentRoot = useHookstate(sceneState.keys[0])
    useEffect(() => {
      const newRoot = sceneState.keys[0]
      if (newRoot !== currentRoot.value) {
        getMutableState(SceneDeltaState).set({})
        currentRoot.set(newRoot)
      }
    }, [sceneState.keys])
  }
})

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
  getAncestorWithComponents,
  getComponent,
  hasComponent,
  SerializedComponentType
} from '@ir-engine/ecs'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { defineState, getMutableState, NO_PROXY_STEALTH, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { SceneState } from '../../gltf/GLTFState'

export type SceneDeltaEntry<C extends Component> = Record<string, Partial<SerializedComponentType<C>>>

export const MATERIAL_JSON_ID = 'materialParameters' as const
export const MATERIAL_PROTOTYPE_JSON_ID = 'prototypeConstructor' as const

export type MaterialDeltaEntry = Record<typeof MATERIAL_JSON_ID, any>

export type SceneDeltaRegistry = Record<NodeID, Record<NodeID, SceneDeltaEntry<any> | MaterialDeltaEntry>>

export const SceneDeltaState = defineState({
  name: 'SceneDeltaState',
  initial: {} as SceneDeltaRegistry,
  getSource: (entity: Entity) => {
    const rootNodeID = getComponent(getAncestorWithComponents(entity, [GLTFComponent]), NodeIDComponent)
    const state = getMutableState(SceneDeltaState)
    if (!state.value[rootNodeID]) state[rootNodeID].set({})
    const source = state[rootNodeID]
    return source
  },
  registerDelta<C extends Component>(entity: Entity, component: C, delta: Partial<SerializedComponentType<C>>) {
    if (!component.jsonID || !hasComponent(entity, NodeIDComponent)) return
    const source = SceneDeltaState.getSource(entity)
    const nodeID = getComponent(entity, NodeIDComponent)
    if (!source.value[nodeID]) source[nodeID].set({} as SceneDeltaEntry<C>)
    const componentMap = source[nodeID].get(NO_PROXY_STEALTH) as SceneDeltaEntry<C>
    componentMap[component.jsonID] = { ...componentMap[component.jsonID], ...delta }
    source[nodeID].set(componentMap)
  },
  registerMaterialDelta(entity: Entity, props?: any, prototype?: string) {
    if (!hasComponent(entity, NodeIDComponent)) return
    const source = SceneDeltaState.getSource(entity)
    const nodeID = getComponent(entity, NodeIDComponent)
    if (!source.value[nodeID]) source[nodeID].set({} as MaterialDeltaEntry)
    const componentMap = source[nodeID].get(NO_PROXY_STEALTH) as MaterialDeltaEntry
    if (props) componentMap[MATERIAL_JSON_ID] = { ...componentMap[MATERIAL_JSON_ID], ...props }
    if (prototype) componentMap[MATERIAL_PROTOTYPE_JSON_ID] = prototype
    source[nodeID].set(componentMap)
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

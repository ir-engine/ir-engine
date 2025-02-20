import { Component, Entity, getComponent, hasComponent, SerializedComponentType } from '@ir-engine/ecs'
import { NodeID, NodeIDComponent } from '@ir-engine/engine/src/gltf/NodeIDComponent'
import { SourceComponent, SourceID } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { defineState, getMutableState, NO_PROXY_STEALTH } from '@ir-engine/hyperflux'

export type SceneDeltaEntry<C extends Component> = Record<string, Partial<SerializedComponentType<C>>>

export type SceneDeltaRegistry = Record<SourceID, Record<NodeID, SceneDeltaEntry<any>>>

export const SceneDeltaState = defineState({
  name: 'SceneDeltaState',
  initial: {} as SceneDeltaRegistry,
  registerDelta<C extends Component>(entity: Entity, component: C, delta: Partial<SerializedComponentType<C>>) {
    if (!hasComponent(entity, SourceComponent) || !hasComponent(entity, NodeIDComponent)) return
    if (!component.jsonID) return
    const sourceID = getComponent(entity, SourceComponent)
    const nodeID = getComponent(entity, NodeIDComponent)
    const state = getMutableState(SceneDeltaState)
    if (!state.value[sourceID]) state[sourceID].set({})
    const source = state[sourceID]
    if (!source.value[nodeID]) source[nodeID].set({} as SceneDeltaEntry<C>)
    const componentMap = source[nodeID].get(NO_PROXY_STEALTH) as SceneDeltaEntry<C>
    componentMap[component.jsonID] = delta
  }
})

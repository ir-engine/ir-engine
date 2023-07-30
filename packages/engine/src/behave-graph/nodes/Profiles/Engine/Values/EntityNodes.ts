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

import {
  NodeCategory,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  makeInNOutFunctionDesc
} from '@behave-graph/core'
import { eulerToQuat, toQuat, toVector3 } from '@behave-graph/scene'
import { generateUUID } from 'three/src/math/MathUtils'
import { Engine } from '../../../../../ecs/classes/Engine'
import { Entity } from '../../../../../ecs/classes/Entity'
import { defineQuery, getComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../../../../ecs/functions/EntityFunctions'
import { NameComponent } from '../../../../../scene/components/NameComponent'
import { SceneObjectComponent } from '../../../../../scene/components/SceneObjectComponent'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'
import { addEntityToScene } from '../helper/entityHelper'

const sceneQuery = defineQuery([SceneObjectComponent])
export const getEntity = makeFunctionNodeDefinition({
  typeName: 'engine/getEntityInScene',
  category: NodeCategory.Query,
  label: 'Get entity in scene',
  in: {
    entity: (_, graphApi) => {
      const choices = sceneQuery().map((entity) => ({ text: getComponent(entity, NameComponent), value: entity }))
      choices.unshift({ text: 'none', value: -1 as Entity })
      return {
        valueType: 'entity',
        choices: choices
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write, graph }) => {
    const entity = read('entity')
    console.log('DEBUG enitity in scene', entity)
    write('entity', entity)
  }
})

export const getCameraEntity = makeFunctionNodeDefinition({
  typeName: 'engine/getCameraEntity',
  category: NodeCategory.Query,
  label: 'Get camera entity',
  in: {},
  out: { entity: 'entity' },
  exec: ({ write, graph }) => {
    const entity = Engine.instance.cameraEntity
    console.log('DEBUG enitity in scene', entity)
    write('entity', entity)
  }
})

export const addEntity = makeFlowNodeDefinition({
  typeName: 'engine/addEntity',
  category: NodeCategory.Action,
  label: 'Add entity',
  in: {
    flow: 'flow',
    parentEntity: (_, graphApi) => {
      const choices = sceneQuery().map((entity) => ({ text: getComponent(entity, NameComponent), value: entity }))
      choices.unshift({ text: 'none', value: -1 as Entity })
      return {
        valueType: 'entity',
        choices: choices
      }
    },
    entityName: 'string'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    let parentEntity: Entity | null = read('parentEntity')
    parentEntity = parentEntity! < 0 ? null : parentEntity
    const entityName: string = read('entityName') ?? `new Entity ${generateUUID()}`
    const entity = addEntityToScene(entityName, parentEntity)
    write('entity', entity)
    commit('flow')
  }
})

export const deleteEntity = makeFlowNodeDefinition({
  typeName: 'engine/deleteEntity',
  category: NodeCategory.Action,
  label: 'Delete entity',
  in: {
    flow: 'flow',
    entity: 'entity'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity: Entity = read('entity')
    removeEntity(entity)
    commit('flow')
  }
})

export const teleportEntity = makeFlowNodeDefinition({
  typeName: 'engine/teleportEntity',
  category: NodeCategory.Action,
  label: 'Teleport Entity',
  in: {
    flow: 'flow',
    entity: 'entity',
    targetPosition: 'vec3',
    targetRotation: 'vec3'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const position = toVector3(read('targetPosition'))

    const rotation = toQuat(eulerToQuat(read('targetRotation')))
    const entity = Number(read('entity')) as Entity
    setComponent(entity, TransformComponent, { position: position, rotation: rotation })
    commit('flow')
  }
})

export const Constant = makeInNOutFunctionDesc({
  name: 'engine/entity',
  label: 'Entity',
  in: ['entity'],
  out: 'entity',
  exec: (a: Entity) => a
})

export const Equal = makeInNOutFunctionDesc({
  name: 'engine/equal/entity',
  label: 'Entity =',
  in: ['entity', 'entity'],
  out: 'boolean',
  exec: (a: Entity, b: Entity) => a === b
})

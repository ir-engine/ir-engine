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
import { toQuat, toVector3 } from '@behave-graph/scene'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { teleportAvatar } from '../../../../../avatar/functions/moveAvatar'
import { Engine } from '../../../../../ecs/classes/Engine'
import { Entity } from '../../../../../ecs/classes/Entity'
import { ComponentMap, defineQuery, getComponent, setComponent } from '../../../../../ecs/functions/ComponentFunctions'
import { removeEntity } from '../../../../../ecs/functions/EntityFunctions'
import { NameComponent } from '../../../../../scene/components/NameComponent'
import { SceneObjectComponent } from '../../../../../scene/components/SceneObjectComponent'
import { UUIDComponent } from '../../../../../scene/components/UUIDComponent'
import { TransformComponent } from '../../../../../transform/components/TransformComponent'
import { copyTransformToRigidBody } from '../../../../../transform/systems/TransformSystem'
import { addEntityToScene } from '../helper/entityHelper'

const sceneQuery = defineQuery([SceneObjectComponent])
export const getEntity = makeFunctionNodeDefinition({
  typeName: 'engine/entity/getEntityInScene',
  category: NodeCategory.Query,
  label: 'Get entity in scene',
  in: {
    entity: (_, graphApi) => {
      const choices = sceneQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      choices.unshift({ text: 'none', value: '' })
      return {
        valueType: 'string',
        choices: choices
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write, graph }) => {
    const entityUUID = read<EntityUUID>('entity')
    const entity = UUIDComponent.entitiesByUUID[entityUUID]
    write('entity', entity)
  }
})

export const getLocalClientEntity = makeFunctionNodeDefinition({
  typeName: 'engine/entity/getLocalClientEntity',
  category: NodeCategory.Query,
  label: 'Get local client entity',
  in: {},
  out: { entity: 'entity' },
  exec: ({ write, graph }) => {
    const entity = Engine.instance.localClientEntity
    write('entity', entity)
  }
})

export const getCameraEntity = makeFunctionNodeDefinition({
  typeName: 'engine/entity/getCameraEntity',
  category: NodeCategory.Query,
  label: 'Get camera entity',
  in: {},
  out: { entity: 'entity' },
  exec: ({ write, graph }) => {
    const entity = Engine.instance.cameraEntity
    write('entity', entity)
  }
})

export const getEntityTransform = makeFunctionNodeDefinition({
  typeName: 'engine/entity/getEntityTransform',
  category: NodeCategory.Query,
  label: 'Get entity transform',
  in: {
    entity: 'entity'
  },
  out: { position: 'vec3', rotation: 'quat', scale: 'vec3', matrix: 'mat4' },
  exec: ({ read, write, graph }) => {
    const entity = Number(read('entity')) as Entity
    const transform = getComponent(entity, TransformComponent)
    write('position', transform.position)
    write('rotation', transform.rotation)
    write('scale', transform.scale)
    write('matrix', transform.matrix)
  }
})

export const addEntity = makeFlowNodeDefinition({
  typeName: 'engine/entity/addEntity',
  category: NodeCategory.Action,
  label: 'Add entity',
  in: {
    flow: 'flow',
    parentEntity: (_, graphApi) => {
      const choices = sceneQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      choices.unshift({ text: 'none', value: '' as string })
      return {
        valueType: 'string',
        choices: choices
      }
    },
    component: (_, graphApi) => {
      const choices = Array.from(ComponentMap.keys()).sort()
      choices.unshift('none')
      return {
        valueType: 'string',
        choices: choices
      }
    },
    entityName: 'string'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const parentEntityUUID = read<string>('parentEntity')
    const parentEntity: Entity = parentEntityUUID == '' ? null : UUIDComponent.entitiesByUUID[parentEntityUUID]
    const componentName = read<string>('component')
    const entity = addEntityToScene(componentName, parentEntity)
    const entityName = read<string>('entityName')
    if (entityName.length > 0) setComponent(entity, NameComponent, entityName)
    write('entity', entity)
    commit('flow')
  }
})

export const deleteEntity = makeFlowNodeDefinition({
  typeName: 'engine/entity/deleteEntity',
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

export const setEntityTransform = makeFlowNodeDefinition({
  typeName: 'engine/entity/setEntityTransform',
  category: NodeCategory.Action,
  label: 'Set entity transform',
  in: {
    flow: 'flow',
    entity: 'entity',
    position: 'vec3',
    rotation: 'quat',
    scale: 'vec3'
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const position = toVector3(read('position'))
    const rotation = toQuat(read('rotation'))
    const scale = toVector3(read('scale'))
    const entity = Number(read('entity')) as Entity
    if (entity === Engine.instance.localClientEntity) {
      teleportAvatar(entity, position!, true)
    } else {
      setComponent(entity, TransformComponent, { position: position!, rotation: rotation!, scale: scale! })
      copyTransformToRigidBody(entity)
    }
    commit('flow')
  }
})

export const getUUID = makeInNOutFunctionDesc({
  name: 'engine/entity/getUuid',
  label: 'Entity uuid',
  in: ['entity'],
  out: 'string',
  exec: (entity: Entity) => getComponent(entity, UUIDComponent)
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

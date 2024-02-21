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
  makeEventNodeDefinition,
  makeFlowNodeDefinition,
  makeFunctionNodeDefinition,
  makeInNOutFunctionDesc
} from '@behave-graph/core'
import { toQuat, toVector3 } from '@behave-graph/scene'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { ComponentMap, getComponent, hasComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { removeEntity } from '@etherealengine/ecs/src/EntityFunctions'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { SystemUUID, defineSystem, destroySystem } from '@etherealengine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'
import { getState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { copyTransformToRigidBody } from '@etherealengine/spatial/src/physics/systems/PhysicsPreTransformSystem'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { cloneDeep, isEqual, uniqueId } from 'lodash'
import { teleportAvatar } from '../../../../../avatar/functions/moveAvatar'
import { SceneObjectComponent } from '../../../../../scene/components/SceneObjectComponent'
import { addEntityToScene } from '../helper/entityHelper'

type State = {
  systemUUID: SystemUUID
}
const initialState = (): State => ({
  systemUUID: '' as SystemUUID
})

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
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: getComponent(SceneState.getRootEntity(getState(SceneState).activeScene!), UUIDComponent)
      }
    }
  },
  out: { entity: 'entity' },
  exec: ({ read, write, graph }) => {
    const entityUUID = read<EntityUUID>('entity')
    const entity = UUIDComponent.getEntityByUUID(entityUUID)
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

export const onEntity = makeFlowNodeDefinition({
  typeName: 'engine/entity/onEntity',
  category: NodeCategory.Action,
  label: 'Test if entity is valid',
  in: {
    flow: 'flow',
    entity: 'entity'
  },
  out: {
    flow: 'flow',
    entity: 'entity',
    exists: 'bool',
    position: 'vec3',
    rotation: 'quat',
    scale: 'vec3',
    matrix: 'mat4'
  },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const entity: Entity = read('entity')
    if (!entity) {
      write('exists', false)
    } else {
      write('exists', true)
      write('entity', entity)
      const transform = getComponent(entity, TransformComponent)
      write('position', transform.position)
      write('rotation', transform.rotation)
      write('scale', transform.scale)
      write('matrix', transform.matrix)
    }
    commit('flow')
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
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: getComponent(SceneState.getRootEntity(getState(SceneState).activeScene!), UUIDComponent)
      }
    },
    componentName: (_, graphApi) => {
      const choices = Array.from(ComponentMap.entries())
        .filter(([, component]) => !!component.jsonID)
        .map(([name]) => name)
        .sort()
      return {
        valueType: 'string',
        choices: choices,
        defaultValue: TransformComponent.name
      }
    },
    entityName: 'string'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const parentEntityUUID = read<EntityUUID>('parentEntity')
    const parentEntity: Entity =
      parentEntityUUID == '' ? UndefinedEntity : UUIDComponent.getEntityByUUID(parentEntityUUID)
    const componentName = read<string>('componentName')
    const entity = addEntityToScene([{ name: ComponentMap.get(componentName)!.jsonID! }], parentEntity)
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
    entity: (_, graphApi) => {
      const choices = sceneQuery().map((entity) => ({
        text: getComponent(entity, NameComponent),
        value: getComponent(entity, UUIDComponent) as string
      }))
      choices.unshift({ text: 'none', value: '' })
      return {
        valueType: 'string',
        choices: choices // no default beacause we dont want to acciedently delete the default, none is safer
      }
    }
  },
  out: { flow: 'flow' },
  initialState: undefined,
  triggered: ({ read, commit, graph: { getDependency } }) => {
    const entity: Entity = read('entity')
    removeEntity(entity)
    commit('flow')
  }
})

export const getEntityTransform = makeFunctionNodeDefinition({
  typeName: 'engine/entity/TransformComponent/get',
  category: NodeCategory.Query,
  label: 'Get entity transform',
  in: {
    entity: 'entity'
  },
  out: { entity: 'entity', position: 'vec3', rotation: 'quat', scale: 'vec3', matrix: 'mat4' },
  exec: ({ read, write, graph }) => {
    const entity = Number(read('entity')) as Entity
    const transform = getComponent(entity, TransformComponent)
    write('position', transform.position)
    write('rotation', transform.rotation)
    write('scale', transform.scale)
    write('matrix', transform.matrix)
    write('entity', entity)
  }
})

export const setEntityTransform = makeFlowNodeDefinition({
  typeName: 'engine/entity/TransformComponent/set',
  category: NodeCategory.Action,
  label: 'Set entity transform',
  in: {
    flow: 'flow',
    entity: 'entity',
    position: 'vec3',
    rotation: 'quat',
    scale: 'vec3'
  },
  out: { flow: 'flow', entity: 'entity' },
  initialState: undefined,
  triggered: ({ read, write, commit, graph: { getDependency } }) => {
    const position = toVector3(read('position'))
    const rotation = toQuat(read('rotation'))
    const scale = toVector3(read('scale'))
    const entity = Number(read('entity')) as Entity
    if (entity === Engine.instance.localClientEntity) {
      teleportAvatar(entity, position!, true)
    } else {
      setComponent(entity, TransformComponent, { position: position!, rotation: rotation!, scale: scale! })
      if (hasComponent(entity, RigidBodyComponent)) copyTransformToRigidBody(entity)
    }
    write('entity', entity)
    commit('flow')
  }
})

export const useEntityTransform = makeEventNodeDefinition({
  typeName: 'engine/entity/TransformComponent/use',
  category: NodeCategory.Event,
  label: 'Use entity transform',
  in: {
    entity: 'entity'
  },
  out: {
    entity: 'entity',
    positionChange: 'flow',
    position: 'vec3',
    rotationChange: 'flow',
    rotation: 'quat',
    scaleChange: 'flow',
    scale: 'vec3'
  },
  initialState: initialState(),
  init: ({ read, commit, write, graph: { getDependency } }) => {
    const entity = Number(read('entity')) as Entity
    const prevTransform = {}
    const systemUUID = defineSystem({
      uuid: 'behave-graph-useTransform-' + uniqueId(),
      insert: { with: InputSystemGroup },
      execute: () => {
        const transform = getComponent(entity, TransformComponent)
        Object.entries(transform).forEach(([key, value]) => {
          if (!Object.keys(useEntityTransform.out).includes(key)) return
          if (Object.hasOwn(prevTransform, key)) {
            if (isEqual(prevTransform[key], transform[key])) return
          }
          write(key as any, value)
          commit(`${key}Change` as any)
          prevTransform[key] = cloneDeep(transform[key])
        })
      },
      reactor: () => {
        /*const transformState = useComponent(entity, TransformComponent)
        Object.entries(transformState.value).forEach(([key, value]) => {
          if (!Object.keys(useEntityTransform.out).includes(key)) return
          useEffect(() => {
            write(key as any, value)
            commit(`${key}Change` as any)
          }, [transformState[key]])
        })*/
        return null
      }
    })
    const state: State = {
      systemUUID
    }
    write('entity', entity)

    return state
  },
  dispose: ({ state: { systemUUID }, graph: { getDependency } }) => {
    destroySystem(systemUUID)
    return initialState()
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

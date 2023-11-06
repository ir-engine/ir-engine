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

import { AnimationMixer, InstancedMesh, Mesh, Object3D } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { ComponentJson, EntityJson } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getState } from '@etherealengine/hyperflux'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import {
  ComponentJSONIDMap,
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { GroupComponent, Object3DWithEntity, addObjectToGroup } from '../components/GroupComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { MeshComponent } from '../components/MeshComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { SceneObjectComponent } from '../components/SceneObjectComponent'
import { UUIDComponent } from '../components/UUIDComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import iterateObject3D from '../util/iterateObject3D'
import { enableObjectLayer } from './setObjectLayers'

export const parseECSData = (entity: Entity, data: [string, any][]): ComponentJson[] => {
  const components: { [key: string]: any } = {}
  const prefabs: { [key: string]: any } = {}

  for (const [key, value] of data) {
    const parts = key.split('.')
    if (parts.length > 1) {
      if (parts[0] === 'xrengine') {
        const componentExists = ComponentMap.has(parts[1])
        const _toLoad = componentExists ? components : prefabs
        if (typeof _toLoad[parts[1]] === 'undefined') {
          _toLoad[parts[1]] = {}
        }
        if (parts.length > 2) {
          let val = value
          if (value === 'true') val = true
          if (value === 'false') val = false
          _toLoad[parts[1]][parts[2]] = val
        }
      }
    }
  }

  const result: ComponentJson[] = []
  for (const [key, value] of Object.entries(components)) {
    const component = ComponentMap.get(key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
      continue
    }
    result.push({ name: component.jsonID!, props: value })
    setComponent(entity, component, value)
    getComponent(entity, GLTFLoadedComponent).push(component)
  }

  for (const [key, value] of Object.entries(prefabs)) {
    const Component = ComponentJSONIDMap.get(key)!
    if (typeof Component === 'undefined') {
      console.warn(`Could not load component '${Component}'`)
      continue
    }
    result.push({ name: Component.jsonID!, props: value })
    getComponent(entity, GLTFLoadedComponent).push(Component)
    setComponent(entity, Component, value)
  }

  return result
}

export const createObjectEntityFromGLTF = (entity: Entity, obj3d: Object3D): ComponentJson[] => {
  return parseECSData(entity, Object.entries(obj3d.userData))
}

export const parseObjectComponentsFromGLTF = (
  entity: Entity,
  object3d?: Object3D
): { entities: Entity[]; entityJson: Record<EntityUUID, EntityJson> } => {
  const scene = object3d ?? getComponent(entity, ModelComponent).scene
  const meshesToProcess: Mesh[] = []

  if (!scene) return { entities: [], entityJson: {} }

  scene.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  // if (meshesToProcess.length === 0) {
  //   setComponent(entity, GLTFLoadedComponent)
  //   scene.traverse((obj) => createObjectEntityFromGLTF(entity, obj))
  //   return { entities: [], entityJson: {} }
  // }

  const entities: Entity[] = []
  const entityJson: Record<EntityUUID, EntityJson> = {}

  for (const mesh of meshesToProcess) {
    const e = createEntity()
    entities.push(e)
    const name = mesh.userData['xrengine.entity'] ?? mesh.uuid
    const uuid = mesh.uuid as EntityUUID
    const parentUuid = getComponent(entity, UUIDComponent)
    const eJson: EntityJson = {
      name,
      components: [],
      parent: parentUuid
    }

    // setComponent(e, EntityTreeComponent, { parentEntity: entity, uuid })
    // setComponent(e, UUIDComponent, uuid)

    if (hasComponent(entity, SceneObjectComponent)) setComponent(e, SceneObjectComponent)

    setComponent(e, NameComponent, name)

    delete mesh.userData['xrengine.entity']
    delete mesh.userData.name

    setComponent(e, LocalTransformComponent, {
      position: mesh.position,
      rotation: mesh.quaternion,
      scale: mesh.scale
    })
    eJson.components.push({
      name: LocalTransformComponent.jsonID,
      props: {
        position: mesh.position,
        rotation: mesh.quaternion,
        scale: mesh.scale
      }
    })

    computeTransformMatrix(entity)

    addObjectToGroup(e, mesh)

    setComponent(e, GLTFLoadedComponent, ['entity', GroupComponent.name, TransformComponent.name])
    eJson.components.push(...createObjectEntityFromGLTF(e, mesh))

    mesh.visible = false
    entityJson[uuid] = eJson
  }

  return { entities, entityJson }
}

export const parseGLTFModel = (entity: Entity) => {
  const model = getComponent(entity, ModelComponent)
  if (!model.scene) return []
  const scene = model.scene
  scene.updateMatrixWorld(true)

  // always parse components first
  const { entities: spawnedEntities, entityJson } = parseObjectComponentsFromGLTF(entity, scene)
  iterateObject3D(
    scene,
    (obj) => {
      if (obj === scene) {
        Object.defineProperties(obj, {
          children: {
            get() {
              return hasComponent(entity, EntityTreeComponent)
                ? getComponent(entity, EntityTreeComponent)
                    .children.filter((child) => getOptionalComponent(child, GroupComponent)?.length ?? 0 > 0)
                    .flatMap((child) => getComponent(child, GroupComponent))
                : []
            },
            set(value) {
              throw new Error('Cannot set children of proxified object')
            }
          }
        })
        return
      }
      const objEntity = (obj as Object3DWithEntity).entity ?? createEntity()
      spawnedEntities.push(objEntity)

      const parentEntity = obj === scene ? entity : (obj.parent as Object3DWithEntity).entity
      const uuid = obj.uuid as EntityUUID
      const name = obj.userData['xrengine.entity'] ?? obj.name

      const eJson: EntityJson = {
        name,
        components: [],
        parent: getComponent(parentEntity, UUIDComponent)
      }
      setComponent(objEntity, SceneObjectComponent)
      setComponent(objEntity, EntityTreeComponent, {
        parentEntity,
        uuid
      })

      setComponent(objEntity, LocalTransformComponent, {
        position: obj.position,
        rotation: obj.quaternion,
        scale: obj.scale
      })
      eJson.components.push({
        name: LocalTransformComponent.jsonID,
        props: {
          position: obj.position,
          rotation: obj.quaternion,
          scale: obj.scale
        }
      })

      setComponent(objEntity, NameComponent, name)
      addObjectToGroup(objEntity, obj)
      if (obj.visible) {
        setComponent(objEntity, VisibleComponent)
        eJson.components.push({
          name: VisibleComponent.jsonID,
          props: obj.visible
        })
      }
      if (obj === scene) {
        const transformComponent = getComponent(entity, TransformComponent)
        obj.matrix = transformComponent.matrix
      }
      setComponent(objEntity, GLTFLoadedComponent, ['entity'])
      eJson.components.push(...createObjectEntityFromGLTF(objEntity, obj))

      const mesh = obj as Mesh
      mesh.isMesh && setComponent(objEntity, MeshComponent, mesh)

      const instancedMesh = obj as InstancedMesh
      instancedMesh.isInstancedMesh &&
        setComponent(objEntity, InstancingComponent, {
          instanceMatrix: instancedMesh.instanceMatrix
        })

      obj.userData.ecsData && eJson.components.push(...parseECSData(objEntity, obj.userData.ecsData))
      entityJson[uuid] = eJson
      /** Proxy children with EntityTreeComponent if it exists */
      Object.defineProperties(obj, {
        parent: {
          get() {
            if (getComponent(objEntity, EntityTreeComponent)?.parentEntity) {
              return getComponent(getComponent(objEntity, EntityTreeComponent).parentEntity!, GroupComponent)[0]
            }
            return null
          },
          set(value) {
            throw new Error('Cannot set parent of proxified object')
          }
        },
        children: {
          get() {
            return hasComponent(objEntity, EntityTreeComponent)
              ? getComponent(objEntity, EntityTreeComponent)
                  .children.filter((child) => getOptionalComponent(child, GroupComponent)?.length ?? 0 > 0)
                  .flatMap((child) => getComponent(child, GroupComponent))
              : []
          },
          set(value) {
            throw new Error('Cannot set children of proxified object')
          }
        },
        removeFromParent: {
          value: () => {
            if (getComponent(objEntity, EntityTreeComponent).parentEntity) {
              setComponent(objEntity, EntityTreeComponent, {
                parentEntity: null
              })
            }
          }
        }
      })
    },
    (obj) => !obj.userData['xrengine.entity'] //ignore objects with old ecs schema as they have already been processed
  )

  enableObjectLayer(scene, ObjectLayers.Scene, true)

  // if the model has animations, we may have custom logic to initiate it. editor animations are loaded from `loop-animation` below
  if (scene.animations?.length) {
    // We only have to update the mixer time for this animations on each frame
    if (getComponent(entity, AnimationComponent)) removeComponent(entity, AnimationComponent)
    setComponent(entity, AnimationComponent, {
      mixer: new AnimationMixer(scene),
      animations: scene.animations
    })
  }

  //add spawned entities to scene state
  SceneState.addEntitiesToScene(getState(SceneState).activeScene!, entityJson)

  return spawnedEntities
}

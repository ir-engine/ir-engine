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

import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { Entity } from '../../ecs/classes/Entity'
import {
  ComponentJSONIDMap,
  ComponentMap,
  getComponent,
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
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import iterateObject3D from '../util/iterateObject3D'
import { enableObjectLayer } from './setObjectLayers'

export const parseECSData = (entity: Entity, data: [string, any][]): void => {
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

  for (const [key, value] of Object.entries(components)) {
    const component = ComponentMap.get(key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
      continue
    }
    setComponent(entity, component, value)
    getComponent(entity, GLTFLoadedComponent).push(component)
  }

  for (const [key, value] of Object.entries(prefabs)) {
    const Component = ComponentJSONIDMap.get(key)!
    if (typeof Component === 'undefined') {
      console.warn(`Could not load component '${Component}'`)
      continue
    }
    getComponent(entity, GLTFLoadedComponent).push(Component)
    setComponent(entity, Component, value)
  }
}

export const createObjectEntityFromGLTF = (entity: Entity, obj3d: Object3D): void => {
  parseECSData(entity, Object.entries(obj3d.userData))
}

export const parseObjectComponentsFromGLTF = (entity: Entity, object3d?: Object3D): Entity[] => {
  const scene = object3d ?? getComponent(entity, ModelComponent).scene
  const meshesToProcess: Mesh[] = []

  if (!scene) return []

  scene.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  if (meshesToProcess.length === 0) {
    setComponent(entity, GLTFLoadedComponent)
    scene.traverse((obj) => createObjectEntityFromGLTF(entity, obj))
    return []
  }

  const entities: Entity[] = []

  for (const mesh of meshesToProcess) {
    const e = createEntity()
    entities.push(e)

    setComponent(e, EntityTreeComponent, { parentEntity: entity, uuid: mesh.uuid as EntityUUID })

    if (hasComponent(entity, SceneObjectComponent)) setComponent(e, SceneObjectComponent)

    setComponent(e, NameComponent, mesh.userData['xrengine.entity'] ?? mesh.uuid)

    delete mesh.userData['xrengine.entity']
    delete mesh.userData.name

    setComponent(e, LocalTransformComponent, {
      position: mesh.position,
      rotation: mesh.quaternion,
      scale: mesh.scale
    })
    computeTransformMatrix(entity)

    addObjectToGroup(e, mesh)

    setComponent(e, GLTFLoadedComponent, ['entity', GroupComponent.name, TransformComponent.name])
    createObjectEntityFromGLTF(e, mesh)

    mesh.visible = false
  }

  return entities
}

export const parseGLTFModel = (entity: Entity) => {
  const model = getComponent(entity, ModelComponent)
  if (!model.scene) return []
  const scene = model.scene
  scene.updateMatrixWorld(true)

  // always parse components first
  const spawnedEntities = parseObjectComponentsFromGLTF(entity, scene)

  iterateObject3D(
    scene,
    (obj) => {
      if (obj === scene) {
        const originalChildren = obj.children
        Object.defineProperties(obj, {
          children: {
            get() {
              return hasComponent(entity, EntityTreeComponent)
                ? getComponent(entity, EntityTreeComponent)
                    .children.map((child) => getComponent(child, GroupComponent))
                    .flat()
                : originalChildren
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
      setComponent(objEntity, EntityTreeComponent, {
        parentEntity,
        uuid: obj.uuid as EntityUUID
      })
      setComponent(objEntity, LocalTransformComponent, {
        position: obj.position,
        rotation: obj.quaternion,
        scale: obj.scale
      })
      setComponent(objEntity, NameComponent, obj.userData['xrengine.entity'] ?? obj.name)
      addObjectToGroup(objEntity, obj)
      if (obj.visible) setComponent(objEntity, VisibleComponent)
      setComponent(objEntity, GLTFLoadedComponent, ['entity'])
      createObjectEntityFromGLTF(objEntity, obj)

      const mesh = obj as Mesh
      mesh.isMesh && setComponent(objEntity, MeshComponent, mesh)

      const instancedMesh = obj as InstancedMesh
      instancedMesh.isInstancedMesh &&
        setComponent(objEntity, InstancingComponent, {
          instanceMatrix: instancedMesh.instanceMatrix
        })

      obj.userData.ecsData && parseECSData(objEntity, obj.userData.ecsData)
      // !hasComponent(objEntity, UUIDComponent) &&
      //   setComponent(objEntity, UUIDComponent, MathUtils.generateUUID() as EntityUUID)

      /** Proxy children with EntityTreeComponent if it exists */
      const originalChildren = obj.children
      const originalParent = obj.parent
      Object.defineProperties(obj, {
        // parent: {
        //   get() {
        //     if (getComponent(objEntity, EntityTreeComponent)?.parentEntity) {
        //       return getComponent(getComponent(objEntity, EntityTreeComponent).parentEntity!, GroupComponent)[0]
        //     }
        //     return originalParent
        //   },
        //   set(value) {
        //     throw new Error('Cannot set parent of proxified object')
        //   }
        // },
        children: {
          get() {
            return hasComponent(objEntity, EntityTreeComponent)
              ? getComponent(objEntity, EntityTreeComponent)
                  .children.map((child) => getComponent(child, GroupComponent))
                  .flat()
              : originalChildren
          },
          set(value) {
            throw new Error('Cannot set children of proxified object')
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

  return spawnedEntities
}

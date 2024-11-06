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

import { Bone, InstancedMesh, Mesh, Object3D, Scene, SkinnedMesh } from 'three'
import { v4 as uuidv4 } from 'uuid'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import {
  ComponentJSONIDMap,
  ComponentMap,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import iterateObject3D from '@ir-engine/spatial/src/common/functions/iterateObject3D'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { proxifyParentChildRelationships } from '@ir-engine/spatial/src/renderer/functions/proxifyParentChildRelationships'
import { FrustumCullCameraComponent } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { GLTFLoadedComponent } from '../components/GLTFLoadedComponent'
import { InstancingComponent } from '../components/InstancingComponent'
import { ModelComponent } from '../components/ModelComponent'
import { SourceComponent } from '../components/SourceComponent'
import { ComponentJsonType, EntityJsonType } from '../types/SceneTypes'
import { getModelSceneID } from './loaders/ModelFunctions'

export const parseECSData = (userData: Record<string, any>): ComponentJsonType[] => {
  const components: { [key: string]: any } = {}
  const prefabs: { [key: string]: any } = {}
  const keysToRemove: string[] = []
  const data = [...Object.entries(userData)]
  for (const [key, value] of data) {
    const parts = key.split('.')
    if (parts.length > 1) {
      if (parts[0] === 'xrengine') {
        keysToRemove.push(key)
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

  // remove keys that have been processed as they will be exported in different format
  for (const key of keysToRemove) {
    delete userData[key]
  }

  const result: ComponentJsonType[] = []
  for (const [key, value] of Object.entries(components)) {
    const component = ComponentMap.get(key)
    if (typeof component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
      continue
    }
    result.push({ name: component.jsonID!, props: value })
  }

  for (const [key, value] of Object.entries(prefabs)) {
    const Component = ComponentJSONIDMap.get(key)!
    if (typeof Component === 'undefined') {
      console.warn(`Could not load component '${key}'`)
      continue
    }
    result.push({ name: Component.jsonID!, props: value })
  }

  return result
}

export const createObjectEntityFromGLTF = (obj3d: Object3D): ComponentJsonType[] => {
  return parseECSData(obj3d.userData)
}

export const parseObjectComponentsFromGLTF = (
  entity: Entity,
  object3d?: Object3D
): Record<EntityUUID, EntityJsonType> => {
  const scene = object3d ?? getComponent(entity, ModelComponent).scene
  const meshesToProcess: Mesh[] = []

  if (!scene) return {}

  scene.traverse((mesh: Mesh) => {
    if ('xrengine.entity' in mesh.userData) {
      meshesToProcess.push(mesh)
    }
  })

  const entityJson: Record<EntityUUID, EntityJsonType> = {}

  for (const mesh of meshesToProcess) {
    const name = mesh.userData['xrengine.entity'] ?? mesh.uuid
    const uuid = mesh.uuid as EntityUUID
    const eJson: EntityJsonType = {
      name,
      components: []
    }
    eJson.components.push(...createObjectEntityFromGLTF(mesh))

    entityJson[uuid] = eJson
  }

  return entityJson
}

export const parseGLTFModel = (entity: Entity, scene: Scene) => {
  const model = getComponent(entity, ModelComponent)

  scene.updateMatrixWorld(true)
  computeTransformMatrix(entity)

  // always parse components first using old ECS parsing schema
  const entityJson = parseObjectComponentsFromGLTF(entity, scene)
  // current ECS parsing schema

  const children = [...scene.children]
  for (const child of children) {
    child.parent = model.scene
    iterateObject3D(child, (obj: Object3D) => {
      const uuid =
        (obj.userData?.gltfExtensions?.EE_uuid as EntityUUID) || (obj.uuid as EntityUUID) || (uuidv4() as EntityUUID)
      obj.uuid = uuid
      const eJson = generateEntityJsonFromObject(entity, obj, entityJson[uuid])
      entityJson[uuid] = eJson
    })
  }

  return entityJson
}

export const generateEntityJsonFromObject = (rootEntity: Entity, obj: Object3D, entityJson?: EntityJsonType) => {
  if (!obj.uuid) throw new Error('Object3D must have a UUID')

  // create entity outside of scene loading reactor since we need to access it before the reactor is guaranteed to have executed
  const objEntity = UUIDComponent.getOrCreateEntityByUUID(obj.uuid as EntityUUID)
  const parentEntity = obj.parent ? obj.parent.entity : rootEntity
  const uuid = obj.uuid as EntityUUID
  const name = obj.userData['xrengine.entity'] ?? obj.name

  const eJson: EntityJsonType = entityJson ?? {
    name,
    components: []
  }

  eJson.parent = getComponent(parentEntity, UUIDComponent)

  const sceneID = getModelSceneID(rootEntity)
  setComponent(objEntity, SourceComponent, sceneID)
  setComponent(objEntity, EntityTreeComponent, {
    parentEntity
  })
  setComponent(objEntity, UUIDComponent, uuid)

  setComponent(objEntity, NameComponent, name)
  setComponent(objEntity, TransformComponent, {
    position: obj.position.clone(),
    rotation: obj.quaternion.clone(),
    scale: obj.scale.clone()
  })
  computeTransformMatrix(objEntity)

  for (const component of eJson.components) {
    if (ComponentJSONIDMap.has(component.name))
      setComponent(objEntity, ComponentJSONIDMap.get(component.name)!, component.props)
  }

  if (!eJson.components.find((c) => c.name === TransformComponent.jsonID))
    eJson.components.push({
      name: TransformComponent.jsonID,
      props: {
        position: obj.position.clone(),
        rotation: obj.quaternion.clone(),
        scale: obj.scale.clone()
      }
    })

  addObjectToGroup(objEntity, obj)
  setComponent(objEntity, GLTFLoadedComponent, ['entity'])
  ObjectLayerMaskComponent.setMask(objEntity, ObjectLayerMaskComponent.mask[rootEntity])

  /** Proxy children with EntityTreeComponent if it exists */
  proxifyParentChildRelationships(obj)

  obj.removeFromParent = () => {
    if (getOptionalComponent(objEntity, EntityTreeComponent)?.parentEntity) {
      setComponent(objEntity, EntityTreeComponent, { parentEntity: UndefinedEntity })
    }
    return obj
  }

  const findColliderData = (obj: Object3D) => {
    if (
      hasComponent(obj.entity, ColliderComponent) ||
      Object.keys(obj.userData).find(
        (key) => key.startsWith('xrengine.collider') || key.startsWith('xrengine.EE_collider')
      )
    ) {
      return true
    }
    // else if (obj.parent) {
    //   return (
    //     hasComponent(obj.parent.entity, ColliderComponent) ||
    //     Object.keys(obj.parent.userData).some(
    //       (key) => key.startsWith('xrengine.collider') || key.startsWith('xrengine.EE_collider')
    //     )
    //   )
    // }
    return false
  }
  //if we're not using visible component, set visible by default
  if (
    !obj.userData['useVisible'] &&
    //if this object has a collider component attached to it, set visible to false
    !findColliderData(obj)
  ) {
    setComponent(objEntity, VisibleComponent, true)
    eJson.components.push({
      name: VisibleComponent.jsonID,
      props: true
    })
  }

  const mesh = obj as Mesh
  mesh.isMesh && setComponent(objEntity, MeshComponent, mesh)

  //check if mesh is instanced. If so, add InstancingComponent
  const instancedMesh = obj as InstancedMesh
  instancedMesh.isInstancedMesh &&
    setComponent(objEntity, InstancingComponent, {
      instanceMatrix: instancedMesh.instanceMatrix
    })

  const bone = obj as Bone
  bone.isBone && setComponent(objEntity, BoneComponent, bone)

  const skinnedMesh = obj as SkinnedMesh
  if (skinnedMesh.isSkinnedMesh) setComponent(objEntity, SkinnedMeshComponent, skinnedMesh)
  else if (mesh.isMesh) setComponent(objEntity, FrustumCullCameraComponent)

  if (obj.userData['componentJson']) {
    for (const json of obj.userData['componentJson']) {
      if (!eJson.components.find((c) => c.name === json.name)) eJson.components.push(json)
    }
  }

  if (!hasComponent(objEntity, MeshComponent)) {
    setComponent(objEntity, Object3DComponent, obj)
  }

  delete mesh.userData['componentJson']
  delete mesh.userData['gltfExtensions']
  delete mesh.userData['useVisible']
  delete mesh.userData['name']
  return eJson
}

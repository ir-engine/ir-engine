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

import React, { useEffect } from 'react'
import {
  Light,
  Material,
  Mesh,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  SkinnedMesh,
  Texture
} from 'three'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { useEntityContext } from '@etherealengine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  serializeComponent,
  setComponent,
  useOptionalComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { QueryReactor, defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { ThreeToPhysics } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { GroupComponent, GroupQueryReactor } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { RenderOrderComponent } from '@etherealengine/spatial/src/renderer/components/RenderOrderComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { ResourceManager } from '../../assets/state/ResourceState'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { ModelComponent, useMeshOrModel } from '../components/ModelComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SourceComponent } from '../components/SourceComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { getModelSceneID, useModelSceneID } from '../functions/loaders/ModelFunctions'

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])

const disposeMaterial = (material: Material) => {
  for (const [key, val] of Object.entries(material) as [string, Texture][]) {
    if (val && typeof val.dispose === 'function') {
      val.dispose()
    }
  }
  material.dispose()
}

export const disposeObject3D = (obj: Object3D) => {
  const mesh = obj as Mesh<any, any>
  if (mesh.material) {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(disposeMaterial)
    } else {
      disposeMaterial(mesh.material)
    }
  }

  if (mesh.geometry) {
    mesh.geometry.dispose()
    for (const key in mesh.geometry.attributes) {
      mesh.geometry.deleteAttribute(key)
    }
  }

  const skinnedMesh = obj as SkinnedMesh
  if (skinnedMesh.isSkinnedMesh) {
    skinnedMesh.skeleton?.dispose()
  }

  const light = obj as Light // anything with dispose function
  if (typeof light.dispose === 'function') light.dispose()
}

/**@todo refactor this to use preprocessor directives instead of new cloned materials with different shaders */
export function setupObject(obj: Object3D, forceBasicMaterials = false) {
  // const child = obj as any as Mesh<any, any>
  // if (child.material) {
  //   if (!child.userData) child.userData = {}
  //   const shouldMakeBasic =
  //     (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(child.material.constructor)
  //   if (!forceBasicMaterials && !isMobileXRHeadset && child.userData.lastMaterial) {
  //     const prevEntry = unregisterMaterial(child.material)
  //     child.material = child.userData.lastMaterial
  //     prevEntry && registerMaterial(child.userData.lastMaterial, prevEntry.src, prevEntry.parameters)
  //     delete child.userData.lastMaterial
  //   } else if (shouldMakeBasic && !child.userData.lastMaterial) {
  //     const basicMaterial = getState(MaterialLibraryState).materials[`basic-${child.material.uuid}`]
  //     if (basicMaterial) {
  //       child.material = basicMaterial.material
  //       return
  //     }
  //     const prevMaterial = child.material
  //     const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
  //     const prevMatEntry = unregisterMaterial(prevMaterial)
  //     const nuMaterial = new MeshLambertMaterial().copy(prevMaterial)
  //     nuMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap
  //     if (onlyEmmisive) nuMaterial.emissiveMap = prevMaterial.emissiveMap
  //     else nuMaterial.map = prevMaterial.map
  //     nuMaterial.reflectivity = prevMaterial.metalness
  //     nuMaterial.envMap = prevMaterial.envMap
  //     nuMaterial.vertexColors = prevMaterial.vertexColors
  //     child.material = nuMaterial
  //     child.userData.lastMaterial = prevMaterial
  //     nuMaterial.uuid = `basic-${prevMaterial.uuid}`
  //     prevMatEntry && registerMaterial(nuMaterial, prevMatEntry.src, prevMatEntry.parameters)
  //   }
  // }
}

const groupQuery = defineQuery([GroupComponent])
const renderOrder = defineQuery([RenderOrderComponent, GroupComponent, VisibleComponent])
const updatableQuery = defineQuery([UpdatableComponent, CallbackComponent])

function SceneObjectReactor(props: { entity: Entity; obj: Object3D }) {
  const { entity, obj } = props

  const renderState = getMutableState(RendererState)
  const forceBasicMaterials = useHookstate(renderState.forceBasicMaterials)

  useEffect(() => {
    const source = hasComponent(entity, ModelComponent)
      ? getModelSceneID(entity)
      : getOptionalComponent(entity, SourceComponent)
    return () => {
      ResourceManager.unloadObj(obj, source)
    }
  }, [])

  useEffect(() => {
    setupObject(obj, forceBasicMaterials.value)
  }, [forceBasicMaterials])

  return null
}

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  const delta = getState(ECSState).deltaSeconds
  for (const entity of updatableQuery()) {
    const callbacks = getComponent(entity, CallbackComponent)
    callbacks.get(UpdatableCallback)?.(delta)
  }

  for (const entity of groupQuery()) {
    const group = getComponent(entity, GroupComponent)
    /**
     * do frustum culling here, but only if the object is more than 5 units away
     */
    const visible =
      hasComponent(entity, VisibleComponent) &&
      !(
        FrustumCullCameraComponent.isCulled[entity] &&
        DistanceFromCameraComponent.squaredDistance[entity] > minimumFrustumCullDistanceSqr
      )

    for (const obj of group) obj.visible = visible
  }

  for (const entity of renderOrder()) {
    const group = getComponent(entity, GroupComponent)
    for (const obj of group) obj.renderOrder = RenderOrderComponent.renderOrder[entity]
  }
}

const SceneObjectEntityReactor = () => {
  const entity = useEntityContext()
  const isMeshOrModel = useMeshOrModel(entity)

  useEffect(() => {
    if (!isMeshOrModel) return

    setComponent(entity, InputComponent, { highlight: getState(EngineState).isEditing })
    return () => {
      removeComponent(entity, InputComponent)
    }
  }, [isMeshOrModel])

  return null
}

const ModelEntityReactor = () => {
  const entity = useEntityContext()
  const modelSceneID = useModelSceneID(entity)
  const childEntities = useHookstate(SourceComponent.entitiesBySourceState[modelSceneID])

  return (
    <>
      {childEntities.value?.map((childEntity: Entity) => (
        <ChildReactor key={childEntity} entity={childEntity} parentEntity={entity} />
      ))}
    </>
  )
}

const ChildReactor = (props: { entity: Entity; parentEntity: Entity }) => {
  const isMesh = useOptionalComponent(props.entity, MeshComponent)
  const isModelColliders = useOptionalComponent(props.parentEntity, RigidBodyComponent)

  const shadowComponent = useOptionalComponent(props.parentEntity, ShadowComponent)
  useEffect(() => {
    if (!isMesh) return
    if (shadowComponent)
      setComponent(props.entity, ShadowComponent, serializeComponent(props.parentEntity, ShadowComponent))
    else removeComponent(props.entity, ShadowComponent)
  }, [isMesh, shadowComponent?.cast, shadowComponent?.receive])

  const envmapComponent = useOptionalComponent(props.parentEntity, EnvmapComponent)
  useEffect(() => {
    if (!isMesh) return
    if (envmapComponent)
      setComponent(props.entity, EnvmapComponent, serializeComponent(props.parentEntity, EnvmapComponent))
    else removeComponent(props.entity, EnvmapComponent)
  }, [
    isMesh,
    envmapComponent,
    envmapComponent?.envMapIntensity,
    envmapComponent?.envmap,
    envmapComponent?.envMapSourceColor,
    envmapComponent?.envMapSourceURL,
    envmapComponent?.envMapTextureType,
    envmapComponent?.envMapSourceEntityUUID
  ])

  useEffect(() => {
    if (!isModelColliders || !isMesh) return

    const geometry = getComponent(props.entity, MeshComponent).geometry

    const shape = ThreeToPhysics[geometry.type]

    if (!shape) return

    setComponent(props.entity, ColliderComponent, { shape })

    return () => {
      removeComponent(props.entity, ColliderComponent)
    }
  }, [isModelColliders, isMesh])

  return null
}

const reactor = () => {
  return (
    <>
      <QueryReactor Components={[SourceComponent]} ChildEntityReactor={SceneObjectEntityReactor} />
      <QueryReactor Components={[ModelComponent]} ChildEntityReactor={ModelEntityReactor} />
      <GroupQueryReactor GroupChildReactor={SceneObjectReactor} />
    </>
  )
}

export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})

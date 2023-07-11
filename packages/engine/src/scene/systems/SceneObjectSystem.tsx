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

import { useEffect } from 'react'
import React from 'react'
import {
  Color,
  DataTexture,
  DoubleSide,
  IntType,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RGBAFormat,
  Texture
} from 'three'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { createGLTFLoader } from '../../assets/functions/createGLTFLoader'
import { loadDRACODecoderNode } from '../../assets/loaders/gltf/NodeDracoLoader'
import { isClient } from '../../common/functions/getEnvironment'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeQuery,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { updateShadowMap } from '../../renderer/functions/RenderSettingsFunction'
import { registerMaterial, unregisterMaterial } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isMobileXRHeadset } from '../../xr/XRState'
import { CallbackComponent } from '../components/CallbackComponent'
import { applyBoxProjection, EnvMapBakeComponent } from '../components/EnvMapBakeComponent'
import { EnvmapComponent } from '../components/EnvmapComponent'
import { GroupComponent, GroupQueryReactor, Object3DWithEntity } from '../components/GroupComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { getRGBArray } from '../constants/Util'
import { EnvironmentSystem } from './EnvironmentSystem'
import { FogSystem } from './FogSystem'
import { ShadowSystem } from './ShadowSystem'

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])

export function setupObject(obj: Object3DWithEntity, force = false) {
  const mesh = obj as any as Mesh<any, any>
  /** @todo do we still need this? */
  //Lambert shader needs an empty normal map to prevent shader errors
  // const res = 8
  // const normalTexture = new DataTexture(getRGBArray(new Color(0.5, 0.5, 1)), res, res, RGBAFormat)
  // normalTexture.needsUpdate = true
  mesh.traverse((child: Mesh<any, any>) => {
    if (child.material) {
      if (!child.userData) child.userData = {}
      const shouldMakeSimple = (force || isMobileXRHeadset) && ExpensiveMaterials.has(child.material.constructor)
      if (!force && !isMobileXRHeadset && child.userData.lastMaterial) {
        child.material = child.userData.lastMaterial
        delete child.userData.lastMaterial
      } else if (shouldMakeSimple && !child.userData.lastMaterial) {
        const prevMaterial = child.material
        const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
        const prevMatEntry = unregisterMaterial(prevMaterial)
        const nuMaterial = new MeshLambertMaterial().copy(prevMaterial)

        nuMaterial.normalMap = nuMaterial.normalMap //?? normalTexture
        nuMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap

        if (onlyEmmisive) nuMaterial.emissiveMap = prevMaterial.emissiveMap
        else nuMaterial.map = prevMaterial.map

        nuMaterial.reflectivity = prevMaterial.metalness
        nuMaterial.envMap = prevMaterial.envMap
        nuMaterial.vertexColors = prevMaterial.vertexColors

        child.material = nuMaterial
        child.userData.lastMaterial = prevMaterial
        prevMatEntry && registerMaterial(nuMaterial, prevMatEntry.src)
      }
      // normalTexture.dispose()
    }
  })
}

const groupQuery = defineQuery([GroupComponent])
const updatableQuery = defineQuery([GroupComponent, UpdatableComponent, CallbackComponent])

function SceneObjectReactor(props: { entity: Entity; obj: Object3DWithEntity }) {
  const { entity, obj } = props

  const shadowComponent = useOptionalComponent(entity, ShadowComponent)
  const renderState = getMutableState(RendererState)
  const forceBasicMaterials = useHookstate(renderState.forceBasicMaterials)
  const csm = useHookstate(renderState.csm)

  useEffect(() => {
    return () => {
      const layers = Object.values(Engine.instance.objectLayerList)
      for (const layer of layers) {
        if (layer.has(obj)) layer.delete(obj)
      }
    }
  }, [])

  useEffect(() => {
    setupObject(obj, forceBasicMaterials.value)
  }, [forceBasicMaterials])

  useEffect(() => {
    const shadow = shadowComponent?.value
    const csm = getState(RendererState).csm
    obj.traverse((child: Mesh<any, Material>) => {
      if (!child.isMesh) return
      child.castShadow = !!shadow?.cast
      child.receiveShadow = !!shadow?.receive
      if (child.material && child.receiveShadow && csm) {
        csm.setupMaterial(child)
      }
    })
  }, [shadowComponent?.cast, shadowComponent?.receive, csm])

  return null
}

const minimumFrustumCullDistanceSqr = 5 * 5 // 5 units

const execute = () => {
  const delta = getState(EngineState).deltaSeconds
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
}

const reactor = () => {
  useEffect(() => {
    Engine.instance.gltfLoader = createGLTFLoader()
  }, [])
  return <GroupQueryReactor GroupChildReactor={SceneObjectReactor} />
}

export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  execute,
  reactor,
  subSystems: isClient ? [FogSystem, EnvironmentSystem, ShadowSystem] : []
})

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
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  SkinnedMesh,
  Texture
} from 'three'

import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { RendererState } from '../../renderer/RendererState'
import { RenderSettingsState } from '../../renderer/WebGLRendererSystem'
import { registerMaterial, unregisterMaterial } from '../../renderer/materials/functions/MaterialLibraryFunctions'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { isMobileXRHeadset } from '../../xr/XRState'
import { CallbackComponent } from '../components/CallbackComponent'
import { GroupComponent, GroupQueryReactor } from '../components/GroupComponent'
import { ModelComponent } from '../components/ModelComponent'
import { SourceComponent } from '../components/SourceComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { getModelSceneID } from '../functions/loaders/ModelFunctions'
import iterateObject3D from '../util/iterateObject3D'

export const ExpensiveMaterials = new Set([MeshPhongMaterial, MeshStandardMaterial, MeshPhysicalMaterial])

export const disposeMaterial = (material: Material) => {
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

export function setupObject(obj: Object3D, forceBasicMaterials = false, disableBasicMaterials = false) {
  const child = obj as any as Mesh<any, any>

  if (child.material) {
    if (!child.userData) child.userData = {}
    const shouldMakeBasic =
      !disableBasicMaterials &&
      (forceBasicMaterials || isMobileXRHeadset) &&
      ExpensiveMaterials.has(child.material.constructor)
    if (disableBasicMaterials || (!forceBasicMaterials && !isMobileXRHeadset && child.userData.lastMaterial)) {
      child.material = child.userData.lastMaterial
      delete child.userData.lastMaterial
    } else if (!disableBasicMaterials && shouldMakeBasic && !child.userData.lastMaterial) {
      const prevMaterial = child.material
      const onlyEmmisive = prevMaterial.emissiveMap && !prevMaterial.map
      const prevMatEntry = unregisterMaterial(prevMaterial)
      const nuMaterial = new MeshLambertMaterial().copy(prevMaterial)

      nuMaterial.specularMap = prevMaterial.roughnessMap ?? prevMaterial.specularIntensityMap

      if (onlyEmmisive) nuMaterial.emissiveMap = prevMaterial.emissiveMap
      else nuMaterial.map = prevMaterial.map

      nuMaterial.reflectivity = prevMaterial.metalness
      nuMaterial.envMap = prevMaterial.envMap
      nuMaterial.vertexColors = prevMaterial.vertexColors

      child.material = nuMaterial
      child.userData.lastMaterial = prevMaterial
      prevMatEntry && registerMaterial(nuMaterial, prevMatEntry.src, prevMatEntry.parameters)
    }
  }
}

const groupQuery = defineQuery([GroupComponent])
const updatableQuery = defineQuery([UpdatableComponent, CallbackComponent])

function SceneObjectReactor(props: { entity: Entity; obj: Object3D }) {
  const { entity, obj } = props

  const renderState = useHookstate(getMutableState(RendererState))
  const renderSettingsState = useHookstate(getMutableState(RenderSettingsState))

  useEffect(() => {
    const source = hasComponent(entity, ModelComponent)
      ? getModelSceneID(entity)
      : getComponent(entity, SourceComponent)
    return () => {
      if (obj.isProxified) {
        disposeObject3D(obj)
      } else {
        iterateObject3D(obj, disposeObject3D, (obj: Object3D) => getComponent(obj.entity, SourceComponent) === source)
      }
    }
  }, [])

  useEffect(() => {
    setupObject(obj, renderState.forceBasicMaterials.value, renderSettingsState.disableBasicMaterials.value)
  }, [renderState.forceBasicMaterials, renderSettingsState.disableBasicMaterials])

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
  return <GroupQueryReactor GroupChildReactor={SceneObjectReactor} />
}

export const SceneObjectSystem = defineSystem({
  uuid: 'ee.engine.SceneObjectSystem',
  insert: { after: AnimationSystemGroup },
  execute,
  reactor
})

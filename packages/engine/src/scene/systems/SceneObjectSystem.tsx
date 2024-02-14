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

import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery, useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'
import iterateObject3D from '@etherealengine/spatial/src/common/functions/iterateObject3D'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { GroupComponent, GroupQueryReactor } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { isMobileXRHeadset } from '@etherealengine/spatial/src/xr/XRState'
import { registerMaterial, unregisterMaterial } from '../../scene/materials/functions/MaterialLibraryFunctions'
import { ModelComponent, useMeshOrModel } from '../components/ModelComponent'
import { SceneObjectComponent } from '../components/SceneObjectComponent'
import { SourceComponent } from '../components/SourceComponent'
import { UpdatableCallback, UpdatableComponent } from '../components/UpdatableComponent'
import { getModelSceneID } from '../functions/loaders/ModelFunctions'

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

export function setupObject(obj: Object3D, forceBasicMaterials = false) {
  const child = obj as any as Mesh<any, any>

  if (child.material) {
    if (!child.userData) child.userData = {}
    const shouldMakeBasic =
      (forceBasicMaterials || isMobileXRHeadset) && ExpensiveMaterials.has(child.material.constructor)
    if (!forceBasicMaterials && !isMobileXRHeadset && child.userData.lastMaterial) {
      child.material = child.userData.lastMaterial
      delete child.userData.lastMaterial
    } else if (shouldMakeBasic && !child.userData.lastMaterial) {
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

  const renderState = getMutableState(RendererState)
  const forceBasicMaterials = useHookstate(renderState.forceBasicMaterials)

  useEffect(() => {
    const source = hasComponent(entity, ModelComponent)
      ? getModelSceneID(entity)
      : getOptionalComponent(entity, SourceComponent)
    return () => {
      if (obj.isProxified) {
        disposeObject3D(obj)
      } else {
        iterateObject3D(
          obj,
          disposeObject3D,
          (obj: Object3D) => getOptionalComponent(obj.entity, SourceComponent) === source
        )
      }
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
}

const SceneObjectEntityReactor = (props: { entity: Entity }) => {
  const isMeshOrModel = useMeshOrModel(props.entity)

  useEffect(() => {
    if (!isMeshOrModel) return

    setComponent(props.entity, InputComponent, { highlight: getState(EngineState).isEditing })
    return () => {
      removeComponent(props.entity, InputComponent)
    }
  }, [isMeshOrModel])

  return null
}

const reactor = () => {
  const sceneObjectEntities = useQuery([SceneObjectComponent])

  return (
    <>
      {sceneObjectEntities.map((entity) => (
        <SceneObjectEntityReactor key={entity} entity={entity} />
      ))}
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

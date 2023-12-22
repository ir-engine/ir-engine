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
  Box3,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Sphere,
  Texture,
  Vector3
} from 'three'

import config from '@etherealengine/common/src/config'
import { defineState, getMutableState, getState, hookstate, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CSM } from '../../assets/csm/CSM'
import { CSMHelper } from '../../assets/csm/CSMHelper'
import { V_001 } from '../../common/constants/MathConstants'
import { isClient } from '../../common/functions/getEnvironment'
import { createPriorityQueue, createSortAndApplyPriorityQueue } from '../../ecs/PriorityQueue'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { iterateEntityNode } from '../../ecs/functions/EntityTree'
import { QueryReactor, defineQuery, useQuery } from '../../ecs/functions/QueryFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/SystemGroups'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer, RenderSettingsState } from '../../renderer/WebGLRendererSystem'
import { getShadowsEnabled, useShadowsEnabled } from '../../renderer/functions/RenderSettingsFunction'
import { compareDistanceToCamera } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRLightProbeState } from '../../xr/XRLightProbeSystem'
import { isMobileXRHeadset } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { GroupComponent, GroupQueryReactor, addObjectToGroup } from '../components/GroupComponent'
import { MeshComponent } from '../components/MeshComponent'
import { useContainsMesh } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { ObjectLayerComponents } from '../components/ObjectLayerComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'

export const ShadowSystemState = defineState({
  name: 'ee.engine.scene.ShadowSystemState',
  initial: () => {
    const accumulationBudget = isMobileXRHeadset ? 4 : 20

    const priorityQueue = createPriorityQueue({
      accumulationBudget
    })

    return {
      priorityQueue
    }
  }
})

export const shadowDirection = new Vector3(0, -1, 0)
const shadowRotation = new Quaternion()
const raycaster = new Raycaster()
raycaster.firstHitOnly = true
const raycasterPosition = new Vector3()

const EntityCSMReactor = (props: { entity: Entity }) => {
  const activeLightEntity = props.entity

  const directionalLightComponent = useComponent(activeLightEntity, DirectionalLightComponent)

  const directionalLight = directionalLightComponent?.light.value

  useEffect(() => {
    getMutableState(RendererState).csm.set(new CSM({ light: directionalLight }))
    return () => {
      getState(RendererState).csm?.dispose()
      getMutableState(RendererState).csm.set(null)
    }
  }, [directionalLightComponent.useInCSM])

  useEffect(() => {
    const csm = getState(RendererState).csm!
    if (!csm) return

    for (const light of csm.lights) {
      light.color = directionalLight.color
      light.intensity = directionalLight.intensity
      light.shadow.bias = directionalLight.shadow.bias
      light.shadow.radius = directionalLight.shadow.radius
      light.shadow.mapSize.copy(directionalLight.shadow.mapSize)
      light.shadow.camera.far = directionalLight.shadow.camera.far
      light.shadow.camera.updateProjectionMatrix()
      light.shadow.map?.dispose()
      light.shadow.map = null as any
      light.shadow.needsUpdate = true
    }
  }, [
    directionalLightComponent?.useInCSM,
    directionalLightComponent?.shadowBias,
    directionalLightComponent?.intensity,
    directionalLightComponent?.color,
    directionalLightComponent?.castShadow,
    directionalLightComponent?.shadowRadius,
    directionalLightComponent?.cameraFar
  ])

  return null
}

const PlainCSMReactor = () => {
  const shadowMapResolution = useHookstate(getMutableState(RendererState).shadowMapResolution)

  useEffect(() => {
    getMutableState(RendererState).csm.set(
      new CSM({
        shadowMapSize: shadowMapResolution.value
      })
    )

    return () => {
      getState(RendererState).csm?.dispose()
      getMutableState(RendererState).csm.set(null)
    }
  }, [])

  useEffect(() => {
    const csm = getState(RendererState).csm!

    for (const light of csm.lights) {
      light.shadow.mapSize.setScalar(shadowMapResolution.value)
      light.shadow.camera.updateProjectionMatrix()
      light.shadow.map?.dispose()
      light.shadow.map = null as any
      light.shadow.needsUpdate = true
    }
  }, [shadowMapResolution])

  return null
}

const directionalLightQuery = defineQuery([VisibleComponent, DirectionalLightComponent])

function CSMReactor() {
  const xrLightProbeState = getMutableState(XRLightProbeState)
  const xrLightProbeEntity = useHookstate(xrLightProbeState.directionalLightEntity)
  const directionalLights = useQuery([VisibleComponent, DirectionalLightComponent])

  const rendererState = useHookstate(getMutableState(RendererState))
  useEffect(() => {
    if (!rendererState.csm.value || !rendererState.nodeHelperVisibility.value) return
    const helper = new CSMHelper()
    rendererState.csmHelper.set(helper)
    return () => {
      helper.remove()
      rendererState.csmHelper.set(null)
    }
  }, [rendererState.csm, rendererState.nodeHelperVisibility])

  const csmEnabled = useHookstate(getMutableState(RenderSettingsState))?.csm?.value
  if (!csmEnabled) return null

  let activeLightEntity = null as Entity | null

  if (xrLightProbeEntity.value) activeLightEntity = xrLightProbeEntity.value
  /** @todo support multiple lights #8277 */
  /** @todo useQuery returns no results for the mount render, so use a query directly here (query will still rerender) #9015 */
  // for (const entity of directionalLights) {
  else
    for (const entity of directionalLightQuery()) {
      if (getComponent(entity, DirectionalLightComponent).useInCSM) activeLightEntity = entity
      break
    }

  /** @todo directional light useInCSM does not reactivly update between these when switching in studio */
  if (!activeLightEntity) return <PlainCSMReactor />

  return <EntityCSMReactor entity={activeLightEntity} key={activeLightEntity} />
}

const shadowGeometry = new PlaneGeometry(1, 1, 1, 1)
const shadowMaterial = new MeshBasicMaterial({
  side: DoubleSide,
  transparent: true,
  opacity: 1,
  depthTest: true,
  depthWrite: false
})

const shadowState = hookstate(null as MeshBasicMaterial | null)

const dropShadowComponentQuery = defineQuery([DropShadowComponent])

const minRadius = 0.15
const maxRadius = 5
const sphere = new Sphere()
const box3 = new Box3()
const vec3 = new Vector3()

const DropShadowReactor = () => {
  const entity = useEntityContext()
  const shadowMaterial = useHookstate(shadowState)
  const containsMesh = useContainsMesh(entity)
  const shadow = useComponent(entity, ShadowComponent)

  useEffect(() => {
    if (
      getState(EngineState).isEditor ||
      !shadow.cast.value ||
      !shadowMaterial.value ||
      !containsMesh ||
      hasComponent(entity, DropShadowComponent)
    )
      return

    box3.makeEmpty()

    let foundMesh = false

    iterateEntityNode(entity, (child) => {
      const mesh = getOptionalComponent(child, MeshComponent)
      if (mesh) {
        box3.expandByObject(mesh)
        foundMesh = true
      }
    })

    if (!foundMesh) return

    box3.getBoundingSphere(sphere)

    if (sphere.radius > maxRadius) return

    const radius = Math.max(sphere.radius * 2, minRadius)
    const center = sphere.center.sub(TransformComponent.getWorldPosition(entity, vec3))
    const shadowEntity = createEntity()
    const shadowObject = new Mesh(shadowGeometry, shadowMaterial.value.clone())
    addObjectToGroup(shadowEntity, shadowObject)
    setComponent(shadowEntity, NameComponent, 'Shadow for ' + getComponent(entity, NameComponent))
    setComponent(shadowEntity, VisibleComponent)
    setComponent(entity, DropShadowComponent, { radius, center, entity: shadowEntity })

    return () => {
      removeComponent(entity, DropShadowComponent)
      removeEntity(shadowEntity)
    }
  }, [shadowMaterial, containsMesh, shadow])

  return null
}

function ShadowMeshReactor(props: { entity: Entity; obj: Mesh<any, Material> }) {
  const { entity, obj } = props

  const shadowComponent = useComponent(entity, ShadowComponent)
  const csm = useHookstate(getMutableState(RendererState).csm)

  useEffect(() => {
    obj.castShadow = shadowComponent.cast.value
    obj.receiveShadow = shadowComponent.receive.value

    const csm = getState(RendererState).csm
    if (obj.material && obj.receiveShadow) {
      csm?.setupMaterial(obj)
    }

    return () => {
      if (obj.material) csm?.teardownMaterial(obj)
    }
  }, [shadowComponent.cast, shadowComponent.receive, csm])

  return null
}

const shadowOffset = new Vector3(0, 0.01, 0)

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(dropShadowComponentQuery, compareDistanceToCamera)
const sortedEntityTransforms = [] as Entity[]

const sceneLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene]])

const updateDropShadowTransforms = () => {
  const { deltaSeconds } = getState(EngineState)
  const { priorityQueue } = getState(ShadowSystemState)

  sortAndApplyPriorityQueue(priorityQueue, sortedEntityTransforms, deltaSeconds)

  const sceneObjects = sceneLayerQuery().flatMap((entity) => getComponent(entity, GroupComponent))

  for (const entity of priorityQueue.priorityEntities) {
    const dropShadow = getComponent(entity, DropShadowComponent)
    const dropShadowTransform = getComponent(dropShadow.entity, TransformComponent)

    TransformComponent.getWorldPosition(entity, raycasterPosition).add(dropShadow.center)
    raycaster.set(raycasterPosition, shadowDirection)

    const intersected = raycaster.intersectObjects(sceneObjects)[0]
    if (!intersected || !intersected.face) {
      dropShadowTransform.scale.setScalar(0)
      continue
    }

    const centerCorrectedDist = Math.max(intersected.distance - dropShadow.center.y, 0.0001)

    //arbitrary bias to make it a bit smaller
    const sizeBias = 0.3
    const finalRadius = sizeBias * dropShadow.radius + dropShadow.radius * centerCorrectedDist * 0.5

    const shadowMaterial = (getComponent(dropShadow.entity, GroupComponent)[0] as any).material as Material
    shadowMaterial.opacity = Math.min(1 / (1 + centerCorrectedDist), 1) * 0.6

    shadowRotation.setFromUnitVectors(intersected.face.normal, V_001)
    dropShadowTransform.rotation.copy(shadowRotation)
    dropShadowTransform.scale.setScalar(finalRadius * 2)
    dropShadowTransform.position.copy(intersected.point.add(shadowOffset))
  }
}

const execute = () => {
  if (!isClient) return

  const useShadows = getShadowsEnabled()
  if (!useShadows && !getState(EngineState).isEditor) {
    updateDropShadowTransforms()
    return
  }

  const { csm, csmHelper } = getState(RendererState)
  if (csm) {
    csm.update()
    if (csmHelper) csmHelper.update(csm)
  }
}

const reactor = () => {
  if (!isClient) return null

  const useShadows = useShadowsEnabled()

  useEffect(() => {
    AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/assets/drop-shadow.png`).then(
      (texture: Texture) => {
        shadowMaterial.map = texture
        shadowMaterial.needsUpdate = true
        shadowState.set(shadowMaterial)
      }
    )
  }, [])

  EngineRenderer.instance.renderer.shadowMap.enabled = EngineRenderer.instance.renderer.shadowMap.autoUpdate =
    useShadows

  return (
    <>
      {useShadows ? (
        <CSMReactor />
      ) : (
        <QueryReactor Components={[ShadowComponent]} ChildEntityReactor={DropShadowReactor} />
      )}
      <GroupQueryReactor GroupChildReactor={ShadowMeshReactor} Components={[ShadowComponent]} />
    </>
  )
}

export const ShadowSystem = defineSystem({
  uuid: 'ee.engine.ShadowSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})

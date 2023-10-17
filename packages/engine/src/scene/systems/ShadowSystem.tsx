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
  DirectionalLight,
  DoubleSide,
  Group,
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
import { CameraComponent } from '../../camera/components/CameraComponent'
import { V_001 } from '../../common/constants/MathConstants'
import { createPriorityQueue, createSortAndApplyPriorityQueue } from '../../ecs/PriorityQueue'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { QueryReactor, defineSystem } from '../../ecs/functions/SystemFunctions'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer, RenderSettingsState } from '../../renderer/WebGLRendererSystem'
import { getShadowsEnabled, useShadowsEnabled } from '../../renderer/functions/RenderSettingsFunction'
import { compareDistanceToCamera } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRLightProbeState } from '../../xr/XRLightProbeSystem'
import { isMobileXRHeadset } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { GroupComponent, addObjectToGroup } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
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

const csmGroup = new Group()
csmGroup.name = 'CSM-group'
let helper

/** @deprecated @todo replace this whith EntityCSM when WebXR Light Estimation is entity driven */
const SimpleCSM = (props: { light: DirectionalLight }) => {
  useEffect(() => {
    getMutableState(RendererState).csm.set(
      new CSM({
        camera: getComponent(Engine.instance.cameraEntity, CameraComponent),
        parent: csmGroup,
        light: props.light
      })
    )
    return () => {
      getState(RendererState).csm?.dispose()
      getMutableState(RendererState).csm.set(null)
    }
  }, [])

  return null
}

const EntityCSMReactor = (props: { entity: Entity }) => {
  const activeLightEntity = props.entity

  const directionalLightComponent = useComponent(activeLightEntity, DirectionalLightComponent)

  const directionalLight = directionalLightComponent?.light.value

  useEffect(() => {
    getMutableState(RendererState).csm.set(
      new CSM({
        camera: getComponent(Engine.instance.cameraEntity, CameraComponent),
        parent: csmGroup,
        light: directionalLight
      })
    )
    // helper = new CSMHelper(getState(RendererState).csm!)
    // Engine.instance.scene.add(helper)

    const activeLightParent = directionalLight.parent
    if (activeLightParent) activeLightParent.remove(directionalLight)

    return () => {
      activeLightParent?.add(directionalLight!)
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
        camera: getComponent(Engine.instance.cameraEntity, CameraComponent),
        parent: csmGroup,
        shadowMapSize: shadowMapResolution.value
      })
    )
    // helper = new CSMHelper(getState(RendererState).csm!)
    // Engine.instance.scene.add(helper)

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
  const xrState = getMutableState(XRLightProbeState)
  const isEstimatingLight = useHookstate(xrState.isEstimatingLight)
  const directionalLights = useQuery([VisibleComponent, DirectionalLightComponent])

  const csmEnabled = useHookstate(getMutableState(RenderSettingsState))?.csm?.value

  if (!csmEnabled) return null

  if (isEstimatingLight.value)
    return <SimpleCSM light={xrState.directionalLight.value} key={xrState.directionalLight.value!.uuid} />

  let activeLightEntity = null as Entity | null

  /** @todo support multiple lights #8277 */
  /** @todo useQuery returns no results for the mount render, so use a query directly here (query will still rerender) #9015 */
  // for (const entity of directionalLights) {
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

const dropShadowComponentQuery = defineQuery([DropShadowComponent, GroupComponent])

const minRadius = 0.15
const maxRadius = 5
const sphere = new Sphere()
const box3 = new Box3()

const DropShadowReactor = () => {
  const entity = useEntityContext()
  const shadowMaterial = useHookstate(shadowState)
  const groupComponent = useOptionalComponent(entity, GroupComponent)
  const shadow = useComponent(entity, ShadowComponent)

  useEffect(() => {
    if (
      getState(EngineState).isEditor ||
      !shadow.cast.value ||
      !shadowMaterial.value ||
      !groupComponent ||
      groupComponent.value.length === 0 ||
      hasComponent(entity, DropShadowComponent)
    )
      return

    for (const obj of groupComponent.value) {
      if (obj.type.includes('Helper')) continue
      box3.setFromObject(obj)
    }
    box3.getBoundingSphere(sphere)

    if (sphere.radius > maxRadius) return

    const radius = Math.max(sphere.radius * 2, minRadius)
    const center = sphere.center
    const shadowEntity = createEntity()
    const shadowObject = new Mesh(shadowGeometry, shadowMaterial.value.clone())
    addObjectToGroup(shadowEntity, shadowObject)
    addComponent(shadowEntity, NameComponent, 'Shadow for ' + getComponent(entity, NameComponent))
    addComponent(shadowEntity, VisibleComponent)
    setComponent(entity, DropShadowComponent, { radius, center, entity: shadowEntity })

    return () => {
      removeComponent(entity, DropShadowComponent)
      removeEntity(shadowEntity)
    }
  }, [shadowMaterial, groupComponent, shadow])

  return null
}

const shadowOffset = new Vector3(0, 0.01, 0)

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(dropShadowComponentQuery, compareDistanceToCamera)
const sortedEntityTransforms = [] as Entity[]

const updateDropShadowTransforms = () => {
  const { deltaSeconds } = getState(EngineState)
  const { priorityQueue } = getState(ShadowSystemState)

  sortAndApplyPriorityQueue(priorityQueue, sortedEntityTransforms, deltaSeconds)

  const sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Camera] || [])

  for (const entity of priorityQueue.priorityEntities) {
    const dropShadow = getComponent(entity, DropShadowComponent)
    const group = getComponent(entity, GroupComponent)
    const dropShadowTransform = getComponent(dropShadow.entity, TransformComponent)

    raycasterPosition.copy(group[0].position).add(dropShadow.center)
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
  const renderState = getState(RendererState)

  const useShadows = getShadowsEnabled()
  if (!useShadows && !getState(EngineState).isEditor) {
    updateDropShadowTransforms()
    return
  }

  const csm = getState(RendererState).csm
  if (!csm) return
  csm.sourceLight?.getWorldDirection(csm.lightDirection)
  if (renderState.qualityLevel > 0) csm.update()
  // if (helper) helper.update()
}

const reactor = () => {
  const useShadows = useShadowsEnabled()

  useEffect(() => {
    Engine.instance.scene.add(csmGroup)

    AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/assets/drop-shadow.png`).then(
      (texture: Texture) => {
        shadowMaterial.map = texture
        shadowMaterial.needsUpdate = true
        shadowState.set(shadowMaterial)
      }
    )

    EngineRenderer.instance.renderer.shadowMap.enabled = EngineRenderer.instance.renderer.shadowMap.autoUpdate =
      getShadowsEnabled()

    return () => {
      Engine.instance.scene.remove(csmGroup)
    }
  }, [])

  return (
    <>
      {useShadows ? (
        <CSMReactor />
      ) : (
        <QueryReactor Components={[ShadowComponent]} ChildEntityReactor={DropShadowReactor} />
      )}
    </>
  )
}

export const ShadowSystem = defineSystem({
  uuid: 'ee.engine.ShadowSystem',
  execute,
  reactor
})

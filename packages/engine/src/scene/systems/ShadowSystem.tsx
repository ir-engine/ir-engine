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
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Sphere,
  Texture,
  Vector3
} from 'three'

import config from '@etherealengine/common/src/config'
import { getMutableState, getState, hookstate, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CSM } from '../../assets/csm/CSM'
import CSMHelper from '../../assets/csm/CSMHelper'
import { V_001 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
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
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { createQueryReactor, defineSystem } from '../../ecs/functions/SystemFunctions'
import { getShadowsEnabled, useShadowsEnabled } from '../../renderer/functions/RenderSettingsFunction'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer, RenderSettingsState } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRLightProbeState } from '../../xr/XRLightProbeSystem'
import { XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { addObjectToGroup, GroupComponent } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'

export const shadowDirection = new Vector3(0, -1, 0)
const shadowRotation = new Quaternion()
const raycaster = new Raycaster()
const raycasterPosition = new Vector3()

const csmGroup = new Group()
csmGroup.name = 'CSM-group'
let helper
const UpdateCSMFromActiveDirectionalLight = (props: { activeLightEntity: Entity; activeLight?: DirectionalLight }) => {
  let activeLight = props.activeLight
  const activeLightEntity = props.activeLightEntity

  // track visibility and light properties for CSM updates
  useOptionalComponent(activeLightEntity, VisibleComponent)?.value
  useOptionalComponent(activeLightEntity, DirectionalLightComponent)?.useInCSM.value

  const activeLightFromEntity = useOptionalComponent(activeLightEntity, DirectionalLightComponent)?.value.light
  if (!activeLight) activeLight = activeLightFromEntity

  const csmEnabled = useHookstate(getMutableState(RenderSettingsState))?.csm?.value

  const shadowsEnabled = useShadowsEnabled()
  const useCSM = shadowsEnabled && csmEnabled

  useEffect(() => {
    if (!activeLight || !useCSM) {
      const csm = getState(RendererState).csm
      csm?.dispose()
      getMutableState(RendererState).csm.set(null)
      return
    }

    if (!getState(RendererState).csm) {
      getMutableState(RendererState).csm.set(
        new CSM({
          camera: Engine.instance.camera as PerspectiveCamera,
          parent: csmGroup,
          light: activeLight
        })
      )
      // helper = new CSMHelper(getState(RendererState).csm!)
      // Engine.instance.scene.add(helper)
    }

    const csm = getState(RendererState).csm!
    const activeLightParent = activeLight.parent
    if (activeLightParent) activeLightParent.remove(activeLight)

    for (const light of csm.lights) {
      light.color = activeLight.color
      light.intensity = activeLight.intensity
      light.shadow.bias = activeLight.shadow.bias
      light.shadow.radius = activeLight.shadow.radius
      light.shadow.mapSize = activeLight.shadow.mapSize
      light.shadow.camera.far = activeLight.shadow.camera.far
      light.shadow.map?.dispose()
      light.shadow.map = null as any
      light.shadow.needsUpdate = true
    }

    return () => {
      activeLightParent?.add(activeLight!)
    }
  }, [useCSM, activeLight])

  return null
}

function CSMReactor() {
  const xrState = getMutableState(XRLightProbeState)
  const isEstimatingLight = useHookstate(xrState.isEstimatingLight)
  const directionalLights = useQuery([DirectionalLightComponent])

  let activeLight: DirectionalLight | undefined

  // TODO: convert light estimator to an entity to simplify all this logic
  let activeLightEntity = UndefinedEntity
  if (isEstimatingLight.value) activeLight = xrState.directionalLight.value
  else
    for (const entity of directionalLights) {
      const component = getComponent(entity, DirectionalLightComponent)
      const visible = hasComponent(entity, VisibleComponent)
      // TODO: source of truth for which light to use for CSM should be in renderer state, not DirectionalLightComponent
      if (component.useInCSM && visible) {
        activeLightEntity = entity
        activeLight = component.light
        break
      }
    }

  return React.createElement(UpdateCSMFromActiveDirectionalLight, {
    activeLightEntity,
    activeLight,
    key: activeLightEntity
  })
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

let sceneObjects = [] as Object3D<any>[]

const minRadius = 0.15
const sphere = new Sphere()
const box3 = new Box3()

const DropShadowReactor = createQueryReactor([ShadowComponent], function DropShadowReactor(props) {
  const entity = useEntityContext()
  const useShadows = useShadowsEnabled()
  const shadowMaterial = useHookstate(shadowState)
  const groupComponent = useOptionalComponent(entity, GroupComponent)
  const shadow = useComponent(entity, ShadowComponent)

  useEffect(() => {
    if (
      getState(EngineState).isEditor ||
      !shadow.cast.value ||
      !shadowMaterial.value ||
      useShadows ||
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

    const radius = Math.max(sphere.radius * 2, minRadius)
    const center = groupComponent.value[0].worldToLocal(sphere.center)
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
  }, [useShadows, shadowMaterial, groupComponent, shadow])

  return null
})

const shadowOffset = new Vector3(0, 0.01, 0)

const execute = () => {
  const renderState = getState(RendererState)

  sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Camera] || [])

  const useShadows = getShadowsEnabled()
  if (!useShadows && !getState(EngineState).isEditor) {
    for (const entity of dropShadowComponentQuery()) {
      const dropShadow = getComponent(entity, DropShadowComponent)
      const dropShadowTransform = getComponent(dropShadow.entity, TransformComponent)

      raycaster.firstHitOnly = true
      raycasterPosition.copy(dropShadow.center)
      getComponent(entity, GroupComponent)[0].localToWorld(raycasterPosition)
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
    return
  }

  const csm = getState(RendererState).csm
  if (!csm) return
  csm.sourceLight.getWorldDirection(csm.lightDirection)
  if (renderState.qualityLevel > 0) csm.update()
  // if (helper) helper.update()
}

const reactor = () => {
  useEffect(() => {
    Engine.instance.scene.add(csmGroup)

    AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/public/drop-shadow.png`).then(
      (texture: Texture) => {
        shadowMaterial.map = texture
        shadowMaterial.needsUpdate = true
        shadowState.set(shadowMaterial)
      }
    )

    return () => {
      Engine.instance.scene.remove(csmGroup)
    }
  }, [])
  return (
    <>
      <CSMReactor />
      <DropShadowReactor />
    </>
  )
}

export const ShadowSystem = defineSystem({
  uuid: 'ee.engine.ShadowSystem',
  execute,
  reactor
})

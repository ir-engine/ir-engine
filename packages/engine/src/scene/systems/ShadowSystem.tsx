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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import {
  Box3,
  Color,
  DirectionalLight,
  DoubleSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Sphere,
  Vector3
} from 'three'

import {
  AnimationSystemGroup,
  createEntity,
  Engine,
  removeEntity,
  useEntityContext,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useHasComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { defineQuery, QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem, useExecute } from '@ir-engine/ecs/src/SystemFunctions'
import { defineState, getMutableState, getState, NO_PROXY, useHookstate } from '@ir-engine/hyperflux'
import { Vector3_Back } from '@ir-engine/spatial/src/common/constants/MathConstants'
import {
  createPriorityQueue,
  createSortAndApplyPriorityQueue
} from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { DirectionalLightComponent } from '@ir-engine/spatial/src/renderer/components/lights/DirectionalLightComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import {
  ObjectLayerComponents,
  ObjectLayerMaskComponent
} from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { CSM } from '@ir-engine/spatial/src/renderer/csm/CSM'
//import { CSMHelper } from '@ir-engine/spatial/src/renderer/csm/CSMHelper'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/ecs'
import { getShadowsEnabled, useShadowsEnabled } from '@ir-engine/spatial/src/renderer/functions/RenderSettingsFunction'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { compareDistanceToCamera } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { XRLightProbeState } from '@ir-engine/spatial/src/xr/XRLightProbeSystem'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'

import { ReferenceSpaceState } from '@ir-engine/spatial'
import { RenderModes } from '@ir-engine/spatial/src/renderer/constants/RenderModes'
import { useRendererEntity } from '@ir-engine/spatial/src/renderer/functions/useRendererEntity'
import { TransformSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { useTexture } from '../../assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { useHasModelOrIndependentMesh } from '../../gltf/GLTFComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { RenderSettingsComponent } from '../components/RenderSettingsComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { SceneObjectSystem } from './SceneObjectSystem'

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
const _shadowRotation = new Quaternion()
const _raycaster = new Raycaster()
_raycaster.firstHitOnly = true
const _raycasterPosition = new Vector3()

const EntityCSMReactor = (props: { entity: Entity; rendererEntity: Entity; renderSettingsEntity: Entity }) => {
  const { entity, rendererEntity, renderSettingsEntity } = props
  const rendererComponent = useComponent(rendererEntity, RendererComponent)
  const renderSettingsComponent = useComponent(renderSettingsEntity, RenderSettingsComponent)

  const directionalLightComponent = useComponent(entity, DirectionalLightComponent)

  const shadowMapResolution = useHookstate(getMutableState(RendererState).shadowMapResolution)

  const directionalLight = directionalLightComponent.light.get(NO_PROXY) as DirectionalLight

  const csm = rendererComponent.csm.get(NO_PROXY) as CSM | null

  useEffect(() => {
    if (!directionalLight) return
    if (!directionalLightComponent.castShadow.value) return
    const csm = new CSM({
      light: directionalLight as DirectionalLight,
      shadowMapSize: shadowMapResolution.value,
      shadowBias: directionalLightComponent.shadowBias.value,
      maxFar: directionalLightComponent.cameraFar.value,
      lightIntensity: directionalLightComponent.intensity.value,
      lightColor: directionalLightComponent.color.value,
      cascades: renderSettingsComponent.cascades.value
    })
    rendererComponent.csm.set(csm)
    return () => {
      csm.dispose()
      if (!hasComponent(rendererEntity, RendererComponent)) return
      rendererComponent.csm.set(null)
    }
  }, [directionalLight, directionalLightComponent?.castShadow.value, renderSettingsComponent.cascades])

  /** Must run after scene object system to ensure source light is not lit */
  useExecute(
    () => {
      if (!directionalLight) return
      if (!getOptionalComponent(entity, DirectionalLightComponent)?.castShadow) return
      directionalLight.visible = false
    },
    { after: SceneObjectSystem }
  )

  useEffect(() => {
    if (!csm) return
    if (!directionalLight) return
    if (!directionalLightComponent.castShadow.value) return

    csm.shadowBias = directionalLight.shadow.bias
    csm.maxFar = directionalLightComponent.cameraFar.value
    csm.shadowMapSize = shadowMapResolution.value

    for (const light of csm.lights) {
      light.color.set(new Color(directionalLightComponent.color.value))
      light.intensity = directionalLightComponent.intensity.value
      light.shadow.mapSize.setScalar(shadowMapResolution.value)
      light.shadow.radius = directionalLightComponent.shadowRadius.value
    }
    csm.needsUpdate = true
  }, [
    rendererComponent.csm,
    shadowMapResolution,
    directionalLight,
    directionalLightComponent.shadowBias,
    directionalLightComponent.intensity,
    directionalLightComponent.color,
    directionalLightComponent.castShadow,
    directionalLightComponent.shadowRadius,
    directionalLightComponent.cameraFar
  ])

  useEffect(() => {
    if (!csm) return
    csm.cascades = renderSettingsComponent.cascades.value
    csm.needsUpdate = true
  }, [csm, renderSettingsComponent.cascades])

  return (
    <QueryReactor
      Components={[ShadowComponent, ObjectComponent]}
      ChildEntityReactor={ShadowSystemReactors.EntityChildCSMReactor}
      props={{ rendererEntity: rendererEntity }}
    />
  )
}

const EntityChildCSMReactor = (props: { rendererEntity: Entity }) => {
  const entity = useEntityContext()
  const { rendererEntity } = props

  const shadowComponent = useComponent(entity, ShadowComponent)
  const obj = useComponent(entity, ObjectComponent).get(NO_PROXY) as Mesh
  const csm = useComponent(rendererEntity, RendererComponent).csm.value

  useEffect(() => {
    if (!csm || !shadowComponent.receive.value) return

    if (obj.material) {
      csm.setupMaterial(obj)
    }

    return () => {
      if (obj.material) {
        csm.teardownMaterial(obj.material as any)
      }
    }
  }, [shadowComponent.receive, csm])

  return null
}

function RenderSettingsQueryReactor() {
  const entity = useEntityContext()
  const rendererEntity = useRendererEntity(entity)
  const renderMode = useHookstate(getMutableState(RendererState).renderMode).value
  /**
   * @todo Currently we only have support for CSM for the core renderer, since we need to add proper multi-scene support via spatial volumes.
   */
  const viewerEntity = useHookstate(getMutableState(ReferenceSpaceState).viewerEntity).value

  if (!rendererEntity || rendererEntity !== viewerEntity) return null
  if (renderMode === RenderModes.UNLIT || renderMode === RenderModes.LIT) return null

  return <ShadowSystemReactors.CSMReactor rendererEntity={rendererEntity} renderSettingsEntity={entity} />
}

function CSMReactor(props: { rendererEntity: Entity; renderSettingsEntity: Entity }) {
  const { rendererEntity, renderSettingsEntity } = props
  //const rendererComponent = useComponent(rendererEntity, RendererComponent)

  const renderSettingsComponent = useComponent(renderSettingsEntity, RenderSettingsComponent)
  const xrLightProbeEntity = useHookstate(getMutableState(XRLightProbeState).directionalLightEntity)
  const activeLightEntity = UUIDComponent.useEntityFromSameSourceByID(
    renderSettingsEntity,
    renderSettingsComponent.primaryLight.value
  )

  const activeLightEntityState = useHookstate(activeLightEntity)
  const directionalLightComponent = useHasComponent(activeLightEntityState.value, DirectionalLightComponent)

  const primaryLightVisibleComponent = useHasComponent(activeLightEntity, VisibleComponent)

  //const rendererState = useMutableState(RendererState)

  // useEffect(() => {
  //   if (!rendererComponent) return
  //   if (!rendererComponent.csm.value || !rendererState.nodeHelperVisibility.value) return

  //   const helper = new CSMHelper()
  //   rendererComponent.csmHelper.set(helper)
  //   return () => {
  //     helper.remove()
  //     rendererComponent.csmHelper.set(null)
  //   }
  // }, [rendererComponent, renderSettingsComponent.csm, rendererState.nodeHelperVisibility])

  useEffect(() => {
    if (rendererEntity === getState(ReferenceSpaceState).viewerEntity && xrLightProbeEntity.value) {
      activeLightEntityState.set(xrLightProbeEntity.value)
      return
    }

    if (renderSettingsComponent.primaryLight.value && primaryLightVisibleComponent) {
      activeLightEntityState.set(
        UUIDComponent.getEntityFromSameSourceByID(renderSettingsEntity, renderSettingsComponent.primaryLight.value)
      )
      return
    }

    activeLightEntityState.set(UndefinedEntity)
  }, [xrLightProbeEntity.value, renderSettingsComponent.primaryLight, primaryLightVisibleComponent])

  if (!renderSettingsComponent.csm.value || !activeLightEntityState.value || !directionalLightComponent) return null

  return (
    <ShadowSystemReactors.EntityCSMReactor
      key={activeLightEntityState.value}
      entity={activeLightEntityState.value}
      rendererEntity={rendererEntity}
      renderSettingsEntity={renderSettingsEntity}
    />
  )
}

const _shadowGeometry = new PlaneGeometry(1, 1, 1, 1).rotateX(-Math.PI)
const _shadowMaterial = new MeshBasicMaterial({
  side: DoubleSide,
  transparent: true,
  opacity: 1,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  polygonOffsetUnits: 0.01
})

const dropShadowComponentQuery = defineQuery([DropShadowComponent])

const _minRadius = 0.15
const _maxRadius = 5
const _sphere = new Sphere()
const _box3 = new Box3()
const _vec3 = new Vector3()

const DropShadowReactor = () => {
  const entity = useEntityContext()
  const hasMeshOrModel = useHasModelOrIndependentMesh(entity)
  const shadow = useComponent(entity, ShadowComponent)

  useEffect(() => {
    if (!shadow.cast.value || !hasMeshOrModel || hasComponent(entity, DropShadowComponent)) return

    _box3.makeEmpty()

    let foundMesh = false

    iterateEntityNode(entity, (child) => {
      const mesh = getOptionalComponent(child, MeshComponent)
      if (mesh) {
        _box3.expandByObject(mesh)
        foundMesh = true
      }
    })

    if (!foundMesh) return

    _box3.getBoundingSphere(_sphere)

    if (_sphere.radius > _maxRadius) return

    const radius = Math.max(_sphere.radius * 2, _minRadius)
    const center = _sphere.center.sub(TransformComponent.getWorldPosition(entity, _vec3))
    const shadowEntity = createEntity()
    setComponent(shadowEntity, MeshComponent, new Mesh(_shadowGeometry.clone(), _shadowMaterial.clone()))
    ObjectLayerMaskComponent.setLayer(shadowEntity, ObjectLayers.Avatar)
    setComponent(shadowEntity, EntityTreeComponent, { parentEntity: Engine.instance.originEntity })
    setComponent(
      shadowEntity,
      NameComponent,
      'Shadow for ' + getComponent(entity, NameComponent) + '_' + getComponent(entity, UUIDComponent)
    )
    setComponent(shadowEntity, VisibleComponent)
    setComponent(entity, DropShadowComponent, { radius, center, entity: shadowEntity })

    return () => {
      removeComponent(entity, DropShadowComponent)
      removeEntity(shadowEntity)
    }
  }, [hasMeshOrModel, shadow])

  return null
}

const _shadowOffset = new Vector3(0, 0.01, 0)

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(dropShadowComponentQuery, compareDistanceToCamera)
const _sortedEntityTransforms = [] as Entity[]

const cameraLayerQuery = defineQuery([ObjectLayerComponents[ObjectLayers.Scene], MeshComponent])

function updateDropShadowTransforms() {
  const { deltaSeconds } = getState(ECSState)
  const { priorityQueue } = getState(ShadowSystemState)

  ShadowSystemFunctions.sortAndApplyPriorityQueue(priorityQueue, _sortedEntityTransforms, deltaSeconds)

  const sceneObjects = cameraLayerQuery().flatMap((entity) => getComponent(entity, MeshComponent))

  for (const entity of priorityQueue.priorityEntities) {
    const dropShadow = getComponent(entity, DropShadowComponent)
    const dropShadowTransform = getComponent(dropShadow.entity, TransformComponent)

    TransformComponent.getWorldPosition(entity, _raycasterPosition)
    _raycaster.set(_raycasterPosition, shadowDirection)

    const intersected = _raycaster.intersectObjects(sceneObjects, false)[0]
    if (!intersected || !intersected.face) {
      dropShadowTransform.scale.setScalar(0)
      continue
    }

    const centerCorrectedDist = Math.max(intersected.distance - dropShadow.center.y, 0.0001)

    //arbitrary bias to make it a bit smaller
    const sizeBias = 0.3
    const finalRadius = sizeBias * dropShadow.radius + dropShadow.radius * centerCorrectedDist * 0.5

    const shadowMaterial = (getComponent(dropShadow.entity, ObjectComponent) as Mesh).material as Material
    shadowMaterial.opacity = Math.min(1 / (1 + centerCorrectedDist), 1) * 1.2
    _shadowRotation.setFromUnitVectors(intersected.face.normal, Vector3_Back)
    dropShadowTransform.rotation.copy(_shadowRotation)
    dropShadowTransform.scale.setScalar(finalRadius * 2)
    dropShadowTransform.position.copy(intersected.point).add(_shadowOffset)
  }
}

const rendererQuery = defineQuery([RendererComponent])

const execute = () => {
  const useShadows = getShadowsEnabled()
  if (!useShadows) return

  for (const entity of rendererQuery()) {
    const { csm, csmHelper } = getComponent(entity, RendererComponent)
    if (csm) {
      csm.update()
      //if (csmHelper) csmHelper.update(csm)
    }
  }
}

const RendererShadowReactor = () => {
  const entity = useEntityContext()
  const useShadows = useShadowsEnabled()
  const rendererComponent = useComponent(entity, RendererComponent)

  useEffect(() => {
    const renderer = getComponent(entity, RendererComponent).renderer
    if (!renderer) return
    renderer.shadowMap.enabled = renderer.shadowMap.autoUpdate = useShadows
  }, [useShadows, rendererComponent.renderer])

  return null
}

const reactor = () => {
  const useShadows = useShadowsEnabled()

  const [shadowTexture] = useTexture(
    `${getState(DomainConfigState).cloudDomain}/projects/ir-engine/default-project/assets/drop-shadow.png`
  )

  useEffect(() => {
    if (!shadowTexture) return
    _shadowMaterial.map = shadowTexture
    _shadowMaterial.needsUpdate = true
  }, [shadowTexture])

  return (
    <>
      {useShadows ? (
        <QueryReactor
          key={'renderSettingsQueryReactor'}
          Components={[RenderSettingsComponent]}
          ChildEntityReactor={ShadowSystemReactors.RenderSettingsQueryReactor}
        />
      ) : shadowTexture ? (
        <QueryReactor
          key={'dropShadowReactor'}
          Components={[VisibleComponent, ShadowComponent]}
          ChildEntityReactor={ShadowSystemReactors.DropShadowReactor}
        />
      ) : null}
      <QueryReactor Components={[RendererComponent]} ChildEntityReactor={ShadowSystemReactors.RendererShadowReactor} />
    </>
  )
}

export const ShadowSystem = defineSystem({
  uuid: 'ee.engine.ShadowSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})

export const DropShadowSystem = defineSystem({
  uuid: 'ee.engine.DropShadowSystem',
  insert: { after: TransformSystem },
  execute: () => {
    const useShadows = getShadowsEnabled()
    if (!useShadows) ShadowSystemFunctions.updateDropShadowTransforms()
  }
})

export const ShadowSystemFunctions = {
  updateDropShadowTransforms,
  sortAndApplyPriorityQueue
}

export const ShadowSystemReactors = {
  EntityChildCSMReactor,
  EntityCSMReactor,
  CSMReactor,
  RenderSettingsQueryReactor,
  DropShadowReactor,
  RendererShadowReactor
}

export const ShadowSystemData = {
  shadowDirection,
  _shadowGeometry,
  _shadowMaterial
}

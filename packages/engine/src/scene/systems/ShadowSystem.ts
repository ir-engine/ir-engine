import React, { useEffect } from 'react'
import {
  Box3,
  BoxGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  InstancedMesh,
  Material,
  Matrix4,
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
import { getMutableState, hookstate, startReactor, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CSM } from '../../assets/csm/CSM'
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
  removeQuery,
  setComponent,
  useComponent,
  useOptionalComponent,
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists, removeEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '../../ecs/functions/EntityTree'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { getShadowsEnabled, useShadowsEnabled } from '../../renderer/functions/RenderSettingsFunction'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer, getRendererSceneMetadataState } from '../../renderer/WebGLRendererSystem'
import { setLocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { addObjectToGroup, GroupComponent } from '../components/GroupComponent'
import { NameComponent } from '../components/NameComponent'
import { ShadowComponent } from '../components/ShadowComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { enableObjectLayer } from '../functions/setObjectLayers'

export const shadowDirection = new Vector3(0, -1, 0)
const shadowMatrix = new Matrix4()
const defaultShadowMatrix = new Matrix4().multiplyScalar(0)
const shadowRotation = new Quaternion()
const shadowSize = new Vector3()
const raycaster = new Raycaster()
const raycasterPosition = new Vector3()

export default async function ShadowSystem() {
  const xrState = getMutableState(XRState)
  const renderState = getMutableState(RendererState)

  const csmGroup = new Group()
  csmGroup.name = 'CSM-group'
  Engine.instance.scene.add(csmGroup)

  const UpdateCSMFromActiveDirectionalLight = (props: {
    activeLightEntity: Entity
    activeLight?: DirectionalLight
  }) => {
    let activeLight = props.activeLight
    const activeLightEntity = props.activeLightEntity

    // track visibility and light properties for CSM updates
    useOptionalComponent(activeLightEntity, VisibleComponent)?.value
    useOptionalComponent(activeLightEntity, DirectionalLightComponent)?.useInCSM.value

    const activeLightFromEntity = useOptionalComponent(activeLightEntity, DirectionalLightComponent)?.value.light
    if (!activeLight) activeLight = activeLightFromEntity

    const csmEnabled = useHookstate(getRendererSceneMetadataState().csm).value

    const shadowsEnabled = useShadowsEnabled()
    const useCSM = shadowsEnabled && csmEnabled

    useEffect(() => {
      if (!activeLight || !useCSM) {
        EngineRenderer.instance.csm?.remove()
        EngineRenderer.instance.csm?.dispose()
        EngineRenderer.instance.csm = undefined!
        return
      }

      if (!EngineRenderer.instance.csm) {
        EngineRenderer.instance.csm = new CSM({
          camera: Engine.instance.camera as PerspectiveCamera,
          parent: csmGroup,
          light: activeLight
        })
        // helper = new CSMHelper(EngineRenderer.instance.csm)
        // Engine.instance.scene.add(helper)
      }

      const activeLightParent = activeLight.parent
      if (activeLightParent) activeLightParent.remove(activeLight)

      for (const light of EngineRenderer.instance.csm.lights) {
        light.color = activeLight.color
        light.intensity = activeLight.intensity
        light.shadow.bias = activeLight.shadow.bias
        light.shadow.radius = activeLight.shadow.radius
        light.shadow.mapSize = activeLight.shadow.mapSize
        light.shadow.camera.far = activeLight.shadow.camera.far
      }

      return () => {
        activeLightParent?.add(activeLight!)
      }
    }, [useCSM, activeLight])

    return null
  }

  const csmReactor = startReactor(function CSMReactor() {
    const lightEstimator = useHookstate(xrState.isEstimatingLight)
    const directionalLights = useQuery([DirectionalLightComponent])

    let activeLight: DirectionalLight | undefined

    // TODO: convert light estimator to an entity to simplify all this logic
    let activeLightEntity = UndefinedEntity
    if (lightEstimator.value) activeLight = xrState.lightEstimator.value!.directionalLight
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
  })

  const shadowGeometry = new PlaneGeometry(1, 1, 1, 1)
  const shadowMaterial = new MeshBasicMaterial({
    side: DoubleSide,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: false
  })

  const shadowState = hookstate(null as MeshBasicMaterial | null)

  AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/public/drop-shadow.png`).then(
    (texture: Texture) => {
      shadowMaterial.map = texture
      shadowMaterial.needsUpdate = true
      shadowState.set(shadowMaterial)
    }
  )

  const castShadowFilter = (entity: Entity) => getComponent(entity, ShadowComponent).cast

  const dropShadowComponentQuery = defineQuery([DropShadowComponent, GroupComponent])

  let sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Camera] || [])

  const minRadius = 0.15
  const sphere = new Sphere()
  const box3 = new Box3()

  const dropShadowReactor = startQueryReactor([ShadowComponent], function DropShadowReactor(props) {
    const entity = props.root.entity
    const useShadows = useShadowsEnabled()
    const shadowMaterial = useHookstate(shadowState)
    const groupComponent = useOptionalComponent(entity, GroupComponent)
    const shadow = useComponent(entity, ShadowComponent)

    useEffect(() => {
      if (
        getMutableState(EngineState).isEditor.value ||
        !shadow.cast.value ||
        !shadowMaterial.value ||
        useShadows ||
        !groupComponent ||
        groupComponent.value.length === 0
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
    sceneObjects = Array.from(Engine.instance.objectLayerList[ObjectLayers.Camera] || [])

    const useShadows = getShadowsEnabled()
    if (!useShadows && !getMutableState(EngineState).isEditor.value) {
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

    if (!EngineRenderer.instance.csm) return
    EngineRenderer.instance.csm.sourceLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    if (renderState.qualityLevel.value > 0) EngineRenderer.instance.csm.update()
    // if (helper) helper.update()
  }

  const cleanup = async () => {
    await csmReactor.stop()
    await dropShadowReactor.stop()
  }

  return { execute, cleanup }
}

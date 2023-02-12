import { useEffect } from 'react'
import {
  Box3,
  DirectionalLight,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Sphere,
  Texture,
  TextureLoader,
  Vector3
} from 'three'

import config from '@xrengine/common/src/config'
import { getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CSM } from '../../assets/csm/CSM'
import { V_001 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import {
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
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { getShadowsEnabled, useShadowsEnabled } from '../../renderer/functions/RenderSettingsFunction'
import { RendererState } from '../../renderer/RendererState'
import { EngineRenderer, getRendererSceneMetadataState } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isHeadset, XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { GroupComponent } from '../components/GroupComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'

export const shadowDirection = new Vector3(0, -1, 0)

const defaultShadowMatrix = new Matrix4().multiplyScalar(0)

export default async function ShadowSystem(world: World) {
  const xrState = getState(XRState)
  const renderState = getState(RendererState)

  const csmGroup = new Group()
  csmGroup.name = 'CSM-group'
  Engine.instance.currentWorld.scene.add(csmGroup)

  const csmReactor = startReactor(() => {
    const lightEstimator = useHookstate(xrState.isEstimatingLight)
    const directionalLights = useQuery([DirectionalLightComponent])
    const shadowsEnabled = useShadowsEnabled()

    let activeLight: DirectionalLight | undefined

    // TODO: convert light estimator to an entity to simplify all this logic
    let activeDirectionalLightEntity = UndefinedEntity
    if (lightEstimator.value) activeLight = xrState.lightEstimator.value!.directionalLight
    else
      for (const entity of directionalLights) {
        const component = getComponent(entity, DirectionalLightComponent)
        const visible = hasComponent(entity, VisibleComponent)
        // TODO: source of truth for which light to use for CSM should be in renderer state, not DirectionalLightComponent
        if (component.useInCSM && visible) {
          activeDirectionalLightEntity = entity
          activeLight = component.light
          break
        }
      }

    // track visibility and light properties for CSM updates
    useOptionalComponent(activeDirectionalLightEntity, VisibleComponent)?.value
    useOptionalComponent(activeDirectionalLightEntity, DirectionalLightComponent)?.useInCSM.value

    const activeLightFromEntity = useOptionalComponent(activeDirectionalLightEntity, DirectionalLightComponent)?.value
      .light
    if (!activeLight) activeLight = activeLightFromEntity

    const csmEnabled = useHookstate(getRendererSceneMetadataState(Engine.instance.currentWorld).csm).value

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
          camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
          parent: csmGroup,
          light: activeLight
        })
        // helper = new CSMHelper(EngineRenderer.instance.csm)
        // Engine.instance.currentWorld.scene.add(helper)
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
  })

  const shadowComponentQuery = defineQuery([DropShadowComponent, GroupComponent])

  const shadowOffset = new Vector3(0, 0.01, 0)
  const shadowGeometry = new PlaneGeometry(1, 1, 1, 1)
  const shadowMaterial = new MeshBasicMaterial({
    side: DoubleSide,
    transparent: true,
    depthTest: true,
    depthWrite: false
  })

  AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/public/drop-shadow.png`).then(
    (texture: Texture) => {
      shadowMaterial.map = texture
      shadowMaterial.needsUpdate = true
    }
  )

  let dropShadows = new InstancedMesh(shadowGeometry, shadowMaterial, 0)
  dropShadows.matrixAutoUpdate = false

  const dropShadowReactor = startQueryReactor([DropShadowComponent, GroupComponent], function modifyShadowCount() {
    world.scene.remove(dropShadows)
    dropShadows = new InstancedMesh(shadowGeometry, shadowMaterial, shadowComponentQuery().length)
    dropShadows.matrixAutoUpdate = false
    dropShadows.layers.disable(ObjectLayers.Camera)
    world.scene.add(dropShadows)
    return null
  })

  let sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

  const CreateDropShadows = () => {
    let index = 0
    sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

    for (const entity of shadowComponentQuery()) {
      const setDropShadowMatrix = (matrix: Matrix4) => {
        dropShadows.setMatrixAt(index, matrix)
        index++
      }

      const group = getComponent(entity, GroupComponent)

      const transform = getComponent(entity, TransformComponent)

      const raycaster = new Raycaster()
      raycaster.firstHitOnly = true
      raycaster.set(transform.position, shadowDirection)

      const intersects = raycaster.intersectObjects(sceneObjects)
      if (!intersects.length || !intersects[0].face) {
        setDropShadowMatrix(defaultShadowMatrix)
        continue
      }

      const sphere = new Sphere()
      new Box3().setFromObject(group[0], false).getBoundingSphere(sphere)
      const distanceShrinkBias = 3
      const sizeBias = 1.5
      const finalSize = sphere.radius * Math.min(distanceShrinkBias / intersects[0].distance, 1) * sizeBias

      let shadowMatrix = new Matrix4()
      const shadowRotation = new Quaternion().setFromUnitVectors(intersects[0].face.normal, V_001)

      shadowMatrix.makeRotationFromQuaternion(shadowRotation)
      shadowMatrix.scale(new Vector3(finalSize, finalSize, finalSize))
      shadowMatrix.setPosition(intersects[0].point.add(shadowOffset))
      setDropShadowMatrix(shadowMatrix)
    }
    dropShadows.instanceMatrix.needsUpdate = true
  }

  const execute = () => {
    const useShadows = getShadowsEnabled()
    if (!useShadows) {
      CreateDropShadows()
      return
    }

    if (!EngineRenderer.instance.csm) return
    EngineRenderer.instance.csm.sourceLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    if (renderState.qualityLevel.value > 0) EngineRenderer.instance.csm.update()
    // if (helper) helper.update()
  }

  const cleanup = async () => {
    removeQuery(world, shadowComponentQuery)
    csmReactor.stop()
    dropShadowReactor.stop()
  }

  return { execute, cleanup }
}

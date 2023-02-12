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
  Vector3
} from 'three'

import config from '@xrengine/common/src/config'
import { getState, startReactor, useHookstate } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CSM } from '../../assets/csm/CSM'
import { V_000, V_001 } from '../../common/constants/MathConstants'
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
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { getShadowsEnabled, useShadowsEnabled } from '../../renderer/functions/RenderSettingsFunction'
import { EngineRendererState } from '../../renderer/WebGLRendererSystem'
import { EngineRenderer, getRendererSceneMetadataState } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isHeadset, XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { GroupComponent } from '../components/GroupComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'

export const shadowDirection = new Vector3(0, -1, 0)
const shadowMatrix = new Matrix4()
const defaultShadowMatrix = new Matrix4().multiplyScalar(0)
const shadowRotation = new Quaternion()
const shadowSize = new Vector3()
const raycaster = new Raycaster()
const raycasterPosition = new Vector3()

export default async function ShadowSystem(world: World) {
  const directionalLightQuery = defineQuery([DirectionalLightComponent])

  let lastActiveDirectionLight = null as DirectionalLight | null

  const xrState = getState(XRState)
  const renderState = getState(EngineRendererState)
  // let helper

  const csmGroup = new Group()
  csmGroup.name = 'CSM-group'
  Engine.instance.currentWorld.scene.add(csmGroup)

  const csmReactor = startReactor(() => {
    const lightEstimator = useHookstate(xrState.isEstimatingLight)
    const directionalLights = useQuery(directionalLightQuery)

    useEffect(() => {
      let activeDirectionalLight = null as DirectionalLight | null
      let activeDirectionalLightEntity = UndefinedEntity as Entity

      if (lightEstimator.value) activeDirectionalLight = xrState.lightEstimator.value!.directionalLight
      else
        for (const entity of directionalLights) {
          const component = getComponent(entity, DirectionalLightComponent)
          if (component.useInCSM) {
            activeDirectionalLightEntity = entity
            activeDirectionalLight = component.light
          }
        }

      const useCSM = getShadowsEnabled() && getRendererSceneMetadataState(Engine.instance.currentWorld).csm.value

      if (useCSM && activeDirectionalLight) {
        if (!EngineRenderer.instance.csm) {
          EngineRenderer.instance.csm = new CSM({
            camera: Engine.instance.currentWorld.camera as PerspectiveCamera,
            parent: csmGroup,
            light: activeDirectionalLight
          })
          // helper = new CSMHelper(EngineRenderer.instance.csm)
          // Engine.instance.currentWorld.scene.add(helper)
        }

        if (activeDirectionalLightEntity && hasComponent(activeDirectionalLightEntity, VisibleComponent))
          removeComponent(activeDirectionalLightEntity, VisibleComponent)
        activeDirectionalLight.visible = false

        lastActiveDirectionLight = activeDirectionalLight

        for (const light of EngineRenderer.instance.csm.lights) {
          light.color = activeDirectionalLight.color
          light.intensity = activeDirectionalLight.intensity
          light.shadow.bias = activeDirectionalLight.shadow.bias
          light.shadow.radius = activeDirectionalLight.shadow.radius
          light.shadow.mapSize = activeDirectionalLight.shadow.mapSize
          light.shadow.camera.far = activeDirectionalLight.shadow.camera.far
        }
      } else if (EngineRenderer.instance.csm) {
        if (lastActiveDirectionLight) lastActiveDirectionLight.visible = true
        lastActiveDirectionLight = null

        EngineRenderer.instance.csm.remove()
        EngineRenderer.instance.csm.dispose()
        EngineRenderer.instance.csm = undefined!
      }
    }, [lightEstimator, directionalLights])

    return null
  })

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

  const shadowComponentQuery = defineQuery([DropShadowComponent, GroupComponent])

  let sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

  const dropShadowReactor = startQueryReactor([DropShadowComponent, GroupComponent], function (props) {
    const dropShadowComponent = useComponent(props.root.entity, DropShadowComponent)
    const groupComponent = useComponent(props.root.entity, GroupComponent)
    const useShadows = useShadowsEnabled()

    useEffect(() => {
      world.scene.remove(dropShadows)
      const getShadows = useShadows
      if (getShadows) {
        return
      }

      const reinitDropShadows = () => {
        dropShadows.dispose()
        dropShadows = new InstancedMesh(shadowGeometry, shadowMaterial, shadowComponentQuery().length)
        dropShadows.matrixAutoUpdate = false
        dropShadows.layers.disable(ObjectLayers.Camera)
        world.scene.add(dropShadows)
      }

      reinitDropShadows()

      //only calculate if center is not manually set
      if (!dropShadowComponent.center.value) {
        const minRadius = 0.15
        const sphere = new Sphere()
        new Box3().setFromObject(groupComponent.value[0]).getBoundingSphere(sphere)
        dropShadowComponent.radius.set(Math.max(sphere.radius * 2, minRadius))
        dropShadowComponent.center.set(groupComponent.value[0].worldToLocal(sphere.center))
      }

      return function cleanup() {
        world.scene.remove(dropShadows)
        reinitDropShadows()
      }
    }, [groupComponent, useShadows])

    return null
  })

  const shadowOffset = new Vector3(0, 0.01, 0)

  const execute = () => {
    let index = 0
    const setDropShadowMatrix = (matrix: Matrix4) => {
      dropShadows.setMatrixAt(index, matrix)
      index++
    }

    sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

    const useShadows = getShadowsEnabled()
    if (!useShadows) {
      for (const entity of shadowComponentQuery()) {
        const dropShadowComponent = getComponent(entity, DropShadowComponent)

        if (!dropShadowComponent.center) continue

        const groupComponent = getComponent(entity, GroupComponent)

        raycaster.firstHitOnly = true
        raycasterPosition.copy(dropShadowComponent.center!)
        groupComponent[0].localToWorld(raycasterPosition)
        raycaster.set(raycasterPosition, shadowDirection)

        const intersected = raycaster.intersectObjects(sceneObjects)[0]
        if (!intersected || !intersected.face) {
          setDropShadowMatrix(defaultShadowMatrix)
          continue
        }

        const sizeBias = 1
        const finalSize =
          dropShadowComponent.radius * Math.min(dropShadowComponent.bias / intersected.distance, 1) * sizeBias

        shadowRotation.setFromUnitVectors(intersected.face.normal, V_001)

        shadowMatrix.makeRotationFromQuaternion(shadowRotation)
        shadowSize.setScalar(finalSize)
        shadowMatrix.scale(shadowSize)
        shadowMatrix.setPosition(intersected.point.add(shadowOffset))
        setDropShadowMatrix(shadowMatrix)
      }
      dropShadows.instanceMatrix.needsUpdate = true
      return
    }

    if (!EngineRenderer.instance.csm) return
    EngineRenderer.instance.csm.sourceLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    if (renderState.qualityLevel.value > 0) EngineRenderer.instance.csm.update()
    // if (helper) helper.update()
  }

  const cleanup = async () => {
    removeQuery(world, directionalLightQuery)
    removeQuery(world, shadowComponentQuery)
    csmReactor.stop()
    dropShadowReactor.stop()
  }

  return { execute, cleanup }
}

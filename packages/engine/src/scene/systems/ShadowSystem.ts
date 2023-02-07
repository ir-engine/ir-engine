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
  TextureLoader,
  Vector3
} from 'three'

import { getState, startReactor, useHookstate } from '@xrengine/hyperflux'

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
  useQuery
} from '../../ecs/functions/ComponentFunctions'
import { startQueryReactor } from '../../ecs/functions/SystemFunctions'
import { EngineRendererState } from '../../renderer/EngineRendererState'
import { EngineRenderer, getRendererSceneMetadataState } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isHeadset, XRState } from '../../xr/XRState'
import { DirectionalLightComponent } from '../components/DirectionalLightComponent'
import { DropShadowComponent } from '../components/DropShadowComponent'
import { GroupComponent } from '../components/GroupComponent'
import { VisibleComponent } from '../components/VisibleComponent'
import { ObjectLayers } from '../constants/ObjectLayers'

export const shadowDirection = new Vector3(0, -1, 0)

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

      const useCSM =
        !isHeadset() &&
        EngineRenderer.instance.renderer.shadowMap.enabled &&
        getRendererSceneMetadataState(Engine.instance.currentWorld).csm.value

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

  const shadowComponentQuery = defineQuery([DropShadowComponent, GroupComponent])

  const shadowOffset = new Vector3(0, 0.01, 0)
  const shadowGeometry = new PlaneGeometry(1, 1, 1, 1)
  const loader = new TextureLoader()
  const texture = loader.load(
    (process.env['VITE_FILE_SERVER'] ?? 'https://localhost:8642') + '/projects/default-project/public/drop-shadow.png'
  )
  const shadowMaterial = new MeshBasicMaterial({
    map: texture,
    side: DoubleSide,
    transparent: true,
    depthTest: true,
    depthWrite: false
  })

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
        setDropShadowMatrix(new Matrix4())
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
    CreateDropShadows()

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

import { useEffect } from 'react'
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

import config from '@xrengine/common/src/config'
import { getState, hookstate, startReactor, useHookstate } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { CSM } from '../../assets/csm/CSM'
import { V_001 } from '../../common/constants/MathConstants'
import { Engine } from '../../ecs/classes/Engine'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
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
import { addEntityNodeChild, createEntityNode } from '../../ecs/functions/EntityTree'
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

  let sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

  const dropShadowReactor = startReactor(function (props) {
    const shadowComponents = useQuery([ShadowComponent, GroupComponent])
    const dropShadowComponents = useQuery([DropShadowComponent])
    const useShadows = useShadowsEnabled()
    const shadowMaterial = useHookstate(shadowState)

    useEffect(() => {
      if (!shadowMaterial.value) return

      if (useShadows) {
        for (const entity of dropShadowComponentQuery()) {
          const dropShadowComponent = getComponent(entity, DropShadowComponent)
          const shadowEntity = dropShadowComponent.entity
          if (entityExists(shadowEntity)) removeEntity(shadowEntity)
          removeComponent(entity, DropShadowComponent)
        }
        return
      }

      const castShadowEntities = shadowComponents.filter(castShadowFilter)

      for (const entity of castShadowEntities) {
        const groupComponent = getComponent(entity, GroupComponent)
        if (!hasComponent(entity, DropShadowComponent) && groupComponent.length) {
          const minRadius = 0.15
          const sphere = new Sphere()
          const box3 = new Box3()
          for (const obj of groupComponent) box3.setFromObject(obj)
          box3.getBoundingSphere(sphere)
          const radius = Math.max(sphere.radius * 2, minRadius)
          const center = groupComponent[0].worldToLocal(sphere.center)

          const e = createEntity()
          const node = createEntityNode(e)
          addEntityNodeChild(node, Engine.instance.currentWorld.entityTree.rootNode)
          const shadowObject = new Mesh(shadowGeometry, shadowMaterial.value.clone())
          Engine.instance.currentWorld.scene.add(shadowObject)
          addObjectToGroup(e, shadowObject)
          addComponent(e, NameComponent, 'Shadow for ' + getComponent(entity, NameComponent))
          addComponent(e, VisibleComponent)

          setComponent(entity, DropShadowComponent, { radius, center, entity: e })
        }
      }

      return function cleanup() {}
    }, [shadowComponents, useShadows, shadowMaterial])

    return null
  })

  const shadowOffset = new Vector3(0, 0.01, 0)

  const execute = () => {
    const setDropShadowMatrix = (matrix: Matrix4, entity: Entity, caster: Entity) => {
      const transformComponent = getComponent(entity, TransformComponent)
      transformComponent.matrix.copy(matrix)
    }

    sceneObjects = Array.from(Engine.instance.currentWorld.objectLayerList[ObjectLayers.Camera] || [])

    const useShadows = getShadowsEnabled()
    if (!useShadows) {
      for (const entity of dropShadowComponentQuery()) {
        const dropShadowComponent = getComponent(entity, DropShadowComponent)

        if (!entityExists(dropShadowComponent.entity)) {
          removeComponent(entity, DropShadowComponent)
        }

        raycaster.firstHitOnly = true
        raycasterPosition.copy(dropShadowComponent.center)
        getComponent(entity, GroupComponent)[0].localToWorld(raycasterPosition)
        raycaster.set(raycasterPosition, shadowDirection)

        const intersected = raycaster.intersectObjects(sceneObjects)[0]
        if (!intersected || !intersected.face) {
          setDropShadowMatrix(defaultShadowMatrix, dropShadowComponent.entity, entity)
          continue
        }

        const halfPoint = 0.5
        const centerCorrectedDist = Math.max(intersected.distance - dropShadowComponent.center.y * halfPoint, 0)

        const opacityBias = 1
        const shadowMaterial = (getComponent(dropShadowComponent.entity, GroupComponent)[0] as any).material as Material
        shadowMaterial.opacity = Math.max(Math.min(opacityBias / centerCorrectedDist, 1), 0)

        const sizeBias = 1
        const finalSize = dropShadowComponent.radius * Math.min(centerCorrectedDist * sizeBias, 2)

        shadowRotation.setFromUnitVectors(intersected.face.normal, V_001)
        shadowMatrix.makeRotationFromQuaternion(shadowRotation)
        shadowSize.setScalar(finalSize)
        shadowMatrix.scale(shadowSize)
        shadowMatrix.setPosition(intersected.point.add(shadowOffset))
        setDropShadowMatrix(shadowMatrix, dropShadowComponent.entity, entity)
      }
      return
    }

    if (!EngineRenderer.instance.csm) return
    EngineRenderer.instance.csm.sourceLight.getWorldDirection(EngineRenderer.instance.csm.lightDirection)
    if (renderState.qualityLevel.value > 0) EngineRenderer.instance.csm.update()
    // if (helper) helper.update()
  }

  const cleanup = async () => {
    csmReactor.stop()
    dropShadowReactor.stop()
  }

  return { execute, cleanup }
}

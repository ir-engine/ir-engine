import {
  ArrowHelper,
  Box3Helper,
  BoxBufferGeometry,
  BoxHelper,
  Camera,
  CameraHelper,
  Color,
  ConeBufferGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Quaternion,
  SphereGeometry,
  Vector3
} from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AudioComponent } from '../../audio/components/AudioComponent'
import { AudioElementNodes } from '../../audio/systems/AudioSystem'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { createGraphHelper } from '../../navigation/GraphHelper'
import { createConvexRegionHelper } from '../../navigation/NavMeshHelper'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import {
  accessEngineRendererState,
  EngineRendererAction,
  EngineRendererState
} from '../../renderer/EngineRendererState'
import EditorDirectionalLightHelper from '../../scene/classes/EditorDirectionalLightHelper'
import InfiniteGridHelper from '../../scene/classes/InfiniteGridHelper'
import { DirectionalLightComponent } from '../../scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '../../scene/components/EnvMapBakeComponent'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { MountPointComponent } from '../../scene/components/MountPointComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PointLightComponent } from '../../scene/components/PointLightComponent'
import { ScenePreviewCameraTagComponent } from '../../scene/components/ScenePreviewCamera'
import { SelectTagComponent } from '../../scene/components/SelectTagComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { AUDIO_TEXTURE_PATH } from '../../scene/functions/loaders/AudioFunctions'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../../xr/XRComponents'
import { DebugArrowComponent } from '../DebugArrowComponent'
import { DebugNavMeshComponent } from '../DebugNavMeshComponent'
import { PositionalAudioHelper } from '../PositionalAudioHelper'
import { DebugRenderer } from './DebugRenderer'

const vector3 = new Vector3()
const quat = new Quaternion()

const cubeGeometry = new ConeBufferGeometry(0.05, 0.25, 4)
cubeGeometry.rotateX(-Math.PI * 0.5)

export default async function DebugHelpersSystem(world: World) {
  InfiniteGridHelper.instance = new InfiniteGridHelper()
  Engine.instance.currentWorld.scene.add(InfiniteGridHelper.instance)

  const AUDIO_HELPER_TEXTURE = await AssetLoader.loadAsync(AUDIO_TEXTURE_PATH)

  const physicsDebugRenderer = DebugRenderer()

  const editorHelpers = new Map<Entity, Object3D>()

  const helpersByEntity = {
    viewVector: new Map(),
    ikExtents: new Map(),
    box: new Map<Entity, Box3Helper>(),
    helperArrow: new Map(),
    velocityArrow: new Map(),
    navmesh: new Map(),
    navpath: new Map(),
    positionalAudioHelper: new Map(),
    interactorFrustum: new Map()
  }
  const directionalLightQuery = defineQuery([DirectionalLightComponent])
  const pointLightQuery = defineQuery([PointLightComponent])
  const mountPointQuery = defineQuery([MountPointComponent])
  const envMapBakeQuery = defineQuery([EnvMapBakeComponent])
  const directionalLightSelectQuery = defineQuery([DirectionalLightComponent, SelectTagComponent])
  const scenePreviewCameraSelectQuery = defineQuery([ScenePreviewCameraTagComponent, SelectTagComponent])

  const boundingBoxQuery = defineQuery([Object3DComponent, BoundingBoxComponent])
  const ikAvatarQuery = defineQuery([XRInputSourceComponent])
  const navmeshQuery = defineQuery([DebugNavMeshComponent, NavMeshComponent])
  const audioHelper = defineQuery([AudioComponent])
  // const navpathQuery = defineQuery([AutoPilotComponent])
  // const navpathAddQuery = enterQuery(navpathQuery)
  // const navpathRemoveQuery = exitQuery(navpathQuery)

  function avatarDebugUpdate(avatarDebugEnable: boolean) {
    helpersByEntity.viewVector.forEach((obj: Object3D) => {
      obj.visible = avatarDebugEnable
    })
    helpersByEntity.velocityArrow.forEach((obj: Object3D) => {
      obj.visible = avatarDebugEnable
    })
    helpersByEntity.interactorFrustum.forEach((obj: Object3D) => {
      obj.visible = avatarDebugEnable
    })
    helpersByEntity.ikExtents.forEach((entry: Object3D[]) => {
      entry.forEach((obj) => (obj.visible = avatarDebugEnable))
    })
  }

  function physicsDebugUpdate(physicsDebugEnable: boolean) {
    helpersByEntity.helperArrow.forEach((obj: Object3D) => {
      obj.visible = physicsDebugEnable
    })

    for (const [_entity, helper] of helpersByEntity.box) {
      helper.visible = physicsDebugEnable
    }
  }

  const physicsDebugActionQueue = createActionQueue(EngineRendererAction.setPhysicsDebug.matches)
  const avatarDebugActionQueue = createActionQueue(EngineRendererAction.setAvatarDebug.matches)

  return () => {
    for (const action of physicsDebugActionQueue()) physicsDebugUpdate(action.physicsDebugEnable)
    for (const action of avatarDebugActionQueue()) avatarDebugUpdate(action.avatarDebugEnable)
    const debugEnabled = getState(EngineRendererState).avatarDebugEnable.value

    /**
     * EDITOR GIZMOS
     * @todo refactor this modularly (these queries should be in the system that loads the associated component)
     */
    if (Engine.instance.isEditor) {
      /**
       * Directional Light
       */
      for (const entity of directionalLightQuery.enter()) {
        const helper = new EditorDirectionalLightHelper(
          getComponent(entity, Object3DComponent).value as DirectionalLight
        )
        helper.matrixAutoUpdate = false
        helper.visible = true
        helper.userData.isHelper = true
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)

        // const cameraHelper = new CameraHelper(light.shadow.camera)
        // cameraHelper.visible = false
        // light.userData.cameraHelper = cameraHelper
        // cameraHelper.userData.isHelper = true
        // setObjectLayers(cameraHelper, ObjectLayers.NodeHelper)
      }

      for (const entity of directionalLightQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      for (const entity of directionalLightSelectQuery.exit()) {
        const light = getComponent(entity, Object3DComponent)?.value as DirectionalLight
        if (light) light.userData.cameraHelper.visible = false
      }

      for (const entity of directionalLightSelectQuery()) {
        const helper = editorHelpers.get(entity)! as EditorDirectionalLightHelper
        helper.update()
        // light.userData.cameraHelper.update()
      }

      /**
       * Point Light
       */
      for (const entity of pointLightQuery.enter()) {
        const helper = new Object3D()
        helper.matrixAutoUpdate = false

        const ball = new Mesh(new IcosahedronGeometry(0.15), new MeshBasicMaterial({ fog: false }))
        const rangeBall = new Mesh(
          new IcosahedronGeometry(0.25),
          new MeshBasicMaterial({ fog: false, transparent: true, opacity: 0.5 })
        )
        helper.add(rangeBall, ball)
        rangeBall.userData.isHelper = true
        ball.userData.isHelper = true

        setObjectLayers(helper, ObjectLayers.NodeHelper)

        editorHelpers.set(entity, helper)
        Engine.instance.currentWorld.scene.add(helper)
      }

      for (const entity of pointLightQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      /**
       * Scene Preview Camera
       */

      for (const entity of scenePreviewCameraSelectQuery.enter()) {
        const camera = getComponent(entity, Object3DComponent)?.value as Camera
        const helper = new CameraHelper(camera)
        helper.matrixAutoUpdate = false
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        editorHelpers.set(entity, helper)
        Engine.instance.currentWorld.scene.add(helper)
      }

      for (const entity of scenePreviewCameraSelectQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      /**
       * Audio Helper
       */

      for (const entity of audioHelper.enter()) {
        const helper = new Mesh(
          new PlaneBufferGeometry(),
          new MeshBasicMaterial({ transparent: true, side: DoubleSide })
        )
        helper.matrixAutoUpdate = false
        helper.userData.disableOutline = true
        helper.userData.isHelper = true
        helper.material.map = AUDIO_HELPER_TEXTURE
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)
      }

      for (const entity of audioHelper.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      /**
       * Env Map Bake
       */

      for (const entity of envMapBakeQuery.enter()) {
        const helper = new Object3D()
        helper.matrixAutoUpdate = false

        helper.userData.centerBall = new Mesh(
          new SphereGeometry(0.75),
          new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })
        )
        helper.userData.centerBall.userData.disableOutline = true
        helper.add(helper.userData.centerBall)

        helper.userData.gizmo = new BoxHelper(new Mesh(new BoxBufferGeometry()), 0xff0000)
        helper.userData.gizmo.userData.disableOutline = true
        helper.add(helper.userData.gizmo)

        setObjectLayers(helper, ObjectLayers.NodeHelper)

        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)
      }

      for (const entity of envMapBakeQuery()) {
        const helper = editorHelpers.get(entity)!
        const bakeComponent = getComponent(entity, EnvMapBakeComponent)
        if (helper.userData.gizmo)
          helper.userData.gizmo.matrix.compose(
            bakeComponent.options.bakePositionOffset,
            quat,
            bakeComponent.options.bakeScale
          )
      }

      for (const entity of envMapBakeQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      for (const entity of mountPointQuery.enter()) {
        const helper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0xffffff)
        helper.matrixAutoUpdate = false
        helper.userData.isHelper = true
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)
      }

      for (const entity of mountPointQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      /**
       * Update helper positions
       */
      for (const [entity, helper] of editorHelpers) {
        const transform = getComponent(entity, TransformComponent)
        if (!transform) continue
        helper.position.copy(transform.position)
        helper.quaternion.copy(transform.rotation)
        helper.updateMatrixWorld()
      }
    }

    /**
     * AVATAR HELPERS
     */

    for (const entity of ikAvatarQuery.enter()) {
      const engineRendererState = accessEngineRendererState()
      const debugHead = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('red'), side: DoubleSide }))
      const debugLeft = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('yellow') }))
      const debugRight = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('blue') }))
      debugHead.visible = engineRendererState.avatarDebugEnable.value
      debugLeft.visible = engineRendererState.avatarDebugEnable.value
      debugRight.visible = engineRendererState.avatarDebugEnable.value
      Engine.instance.currentWorld.scene.add(debugHead)
      Engine.instance.currentWorld.scene.add(debugLeft)
      Engine.instance.currentWorld.scene.add(debugRight)
      helpersByEntity.ikExtents.set(entity, [debugHead, debugLeft, debugRight])
    }

    if (debugEnabled)
      for (const entity of ikAvatarQuery()) {
        const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
        const [debugHead, debugLeft, debugRight] = helpersByEntity.ikExtents.get(entity) as Object3D[]
        debugHead.position.copy(xrInputSourceComponent.head.getWorldPosition(vector3))
        debugHead.quaternion.copy(xrInputSourceComponent.head.getWorldQuaternion(quat))
        debugLeft.position.copy(xrInputSourceComponent.controllerLeft.getWorldPosition(vector3))
        debugLeft.quaternion.copy(xrInputSourceComponent.controllerLeft.getWorldQuaternion(quat))
        debugRight.position.copy(xrInputSourceComponent.controllerRight.getWorldPosition(vector3))
        debugRight.quaternion.copy(xrInputSourceComponent.controllerRight.getWorldQuaternion(quat))
      }

    for (const entity of ikAvatarQuery.exit()) {
      ;(helpersByEntity.ikExtents.get(entity) as Object3D[]).forEach((obj: Object3D) => {
        obj.removeFromParent()
      })
      helpersByEntity.ikExtents.delete(entity)
    }

    /**
     * DEBUG HELPERS
     */

    for (const entity of boundingBoxQuery.exit()) {
      const boxHelper = helpersByEntity.box.get(entity) as Box3Helper
      boxHelper.removeFromParent()
      helpersByEntity.box.delete(entity)
    }

    for (const entity of boundingBoxQuery.enter()) {
      const boundingBox = getComponent(entity, BoundingBoxComponent)
      const helper = new Box3Helper(boundingBox.box)
      helpersByEntity.box.set(entity, helper)
      Engine.instance.currentWorld.scene.add(helper)
      helper.visible = accessEngineRendererState().physicsDebugEnable.value
    }

    // ===== CUSTOM ===== //

    // for (const entity of arrowHelperQuery.enter()) {
    //   const arrow = getComponent(entity, DebugArrowComponent)
    //   const arrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, arrow.color)
    //   arrowHelper.visible = accessEngineRendererState().physicsDebugEnable.value
    //   Engine.instance.currentWorld.scene.add(arrowHelper)
    //   helpersByEntity.helperArrow.set(entity, arrowHelper)
    // }

    // for (const entity of arrowHelperQuery.exit()) {
    //   const arrowHelper = helpersByEntity.helperArrow.get(entity) as Object3D
    //   Engine.instance.currentWorld.scene.remove(arrowHelper)
    //   helpersByEntity.helperArrow.delete(entity)
    // }

    // if(debugEnabled)
    //   for (const entity of arrowHelperQuery()) {
    //     const arrow = getComponent(entity, DebugArrowComponent)
    //     const arrowHelper = helpersByEntity.helperArrow.get(entity) as ArrowHelper
    //     if (arrowHelper != null) {
    //       arrowHelper.setDirection(arrow.direction.clone().normalize())
    //       arrowHelper.position.copy(arrow.position)
    //     }
    //   }

    // ===== NAVMESH Helper ===== //
    for (const entity of navmeshQuery.enter()) {
      console.log('add navmesh helper!')
      const navMesh = getComponent(entity, NavMeshComponent)?.yukaNavMesh
      const convexHelper = createConvexRegionHelper(navMesh)
      const graphHelper = createGraphHelper(navMesh!.graph, 0.2)
      const helper = new Group()
      helper.add(convexHelper)
      helper.add(graphHelper)
      console.log('navhelper', helper)
      Engine.instance.currentWorld.scene.add(helper)
      helpersByEntity.navmesh.set(entity, helper)
    }

    for (const entity of navmeshQuery.exit()) {
      const helper = helpersByEntity.navmesh.get(entity) as Object3D
      Engine.instance.currentWorld.scene.remove(helper)
      helpersByEntity.navmesh.delete(entity)
    }

    if (debugEnabled)
      for (const entity of navmeshQuery()) {
        // update
        const helper = helpersByEntity.navmesh.get(entity) as Object3D
        const transform = getComponent(entity, TransformComponent)
        helper.position.copy(transform.position)
        // helper.quaternion.copy(transform.rotation)
      }
    // ===== Autopilot Helper ===== //
    // TODO add createPathHelper for navpathQuery

    // todo refactor this
    if (Engine.instance.isEditor) {
      for (const entity of audioHelper.exit()) {
        const obj3d = getComponent(entity, Object3DComponent, true)
        const helper = helpersByEntity.positionalAudioHelper.get(entity)
        helper.dispose()
        obj3d.value.remove(helper)
        helpersByEntity.positionalAudioHelper.delete(entity)
      }

      if (debugEnabled)
        for (const entity of audioHelper()) {
          const obj3d = getComponent(entity, Object3DComponent)
          const mediaComponent = getComponent(entity, MediaElementComponent)
          const audioEl = AudioElementNodes.get(mediaComponent)
          if (!audioEl) continue

          if (!helpersByEntity.positionalAudioHelper.has(entity)) {
            const helper = new PositionalAudioHelper(audioEl)
            // helper.visible = false
            helpersByEntity.positionalAudioHelper.set(entity, helper)
            obj3d.value.add(helper)
            helper.userData.isHelper = true
          }

          const helper = helpersByEntity.positionalAudioHelper.get(entity)
          audioEl.panner && helper?.update()
        }
    }

    physicsDebugRenderer(world, accessEngineRendererState().physicsDebugEnable.value)
  }
}

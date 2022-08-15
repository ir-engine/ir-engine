import {
  ArrowHelper,
  Box3Helper,
  CameraHelper,
  Color,
  ConeBufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Vector3
} from 'three'

import { createActionQueue, getState } from '@xrengine/hyperflux'

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
import InfiniteGridHelper from '../../scene/classes/InfiniteGridHelper'
import { MediaElementComponent } from '../../scene/components/MediaElementComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
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

  let physicsDebugRenderer = DebugRenderer()

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

  const avatarDebugQuery = defineQuery([AvatarComponent, VelocityComponent, TransformComponent])
  const boundingBoxQuery = defineQuery([Object3DComponent, BoundingBoxComponent])
  const arrowHelperQuery = defineQuery([DebugArrowComponent])
  const ikAvatarQuery = defineQuery([XRInputSourceComponent])
  const navmeshQuery = defineQuery([DebugNavMeshComponent, NavMeshComponent])
  // const navpathQuery = defineQuery([AutoPilotComponent])
  const audioHelper = defineQuery([AudioComponent])
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

    // ===== AVATAR ===== //

    for (const entity of avatarDebugQuery.enter()) {
      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = accessEngineRendererState().avatarDebugEnable.value
      Engine.instance.currentWorld.scene.add(velocityArrowHelper)
      helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of avatarDebugQuery.exit()) {
      // velocity
      const velocityArrowHelper = helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.instance.currentWorld.scene.remove(velocityArrowHelper)
      helpersByEntity.velocityArrow.delete(entity)
    }

    if (debugEnabled)
      for (const entity of avatarDebugQuery()) {
        const avatar = getComponent(entity, AvatarComponent)
        const velocity = getComponent(entity, VelocityComponent)
        const transform = getComponent(entity, TransformComponent)

        // velocity
        const velocityArrowHelper = helpersByEntity.velocityArrow.get(entity) as ArrowHelper
        if (velocityArrowHelper != null) {
          velocityArrowHelper.setDirection(vector3.copy(velocity.linear).normalize())
          velocityArrowHelper.setLength(velocity.linear.length() * 20)
          velocityArrowHelper.position.copy(transform.position).y += avatar.avatarHalfHeight
        }
      }

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

    // ===== BOUNDING BOX ===== //

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

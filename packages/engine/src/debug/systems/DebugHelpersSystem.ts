import { removeComponent } from 'bitecs'
import {
  ArrowHelper,
  Box3Helper,
  BoxGeometry,
  BoxHelper,
  Camera,
  CameraHelper,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  RingGeometry,
  SkeletonHelper,
  SphereGeometry,
  TorusGeometry,
  Vector3
} from 'three'

import { createActionQueue, getState, removeActionQueue } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { PositionalAudioComponent } from '../../audio/components/PositionalAudioComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarPendingComponent } from '../../avatar/components/AvatarPendingComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { EngineRendererAction, EngineRendererState } from '../../renderer/EngineRendererState'
import EditorDirectionalLightHelper from '../../scene/classes/EditorDirectionalLightHelper'
import InfiniteGridHelper from '../../scene/classes/InfiniteGridHelper'
import Spline from '../../scene/classes/Spline'
import { DirectionalLightComponent } from '../../scene/components/DirectionalLightComponent'
import { EnvMapBakeComponent } from '../../scene/components/EnvMapBakeComponent'
import { AudioNodeGroups, MediaElementComponent } from '../../scene/components/MediaComponent'
import { MountPointComponent } from '../../scene/components/MountPointComponent'
import { PointLightComponent } from '../../scene/components/PointLightComponent'
import { PortalComponent } from '../../scene/components/PortalComponent'
import { ScenePreviewCameraComponent } from '../../scene/components/ScenePreviewCamera'
import { SelectTagComponent } from '../../scene/components/SelectTagComponent'
import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'
import { SplineComponent } from '../../scene/components/SplineComponent'
import { SpotLightComponent } from '../../scene/components/SpotLightComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { PositionalAudioHelper } from '../PositionalAudioHelper'

const quat = new Quaternion()

const cubeGeometry = new ConeGeometry(0.05, 0.25, 4)
cubeGeometry.rotateX(-Math.PI * 0.5)

const GLTF_PATH = '/static/editor/spawn-point.glb'

export default async function DebugHelpersSystem(world: World) {
  InfiniteGridHelper.instance = new InfiniteGridHelper()
  Engine.instance.currentWorld.scene.add(InfiniteGridHelper.instance)

  const [{ scene: spawnPointHelperModel }] = await Promise.all([AssetLoader.loadAsync(GLTF_PATH)])

  spawnPointHelperModel.traverse((obj) => (obj.castShadow = true))

  const editorHelpers = new Map<Entity, Object3D>()
  const editorStaticHelpers = new Map<Entity, Object3D>()

  const helpersByEntity = {
    skeletonHelpers: new Map(),
    ikExtents: new Map(),
    box: new Map<Entity, Box3Helper>(),
    navpath: new Map()
  }
  const portalQuery = defineQuery([TransformComponent, PortalComponent])
  const splineQuery = defineQuery([TransformComponent, SplineComponent])
  const spawnPointQuery = defineQuery([TransformComponent, SpawnPointComponent])
  const mountPointQuery = defineQuery([TransformComponent, MountPointComponent])
  const envMapBakeQuery = defineQuery([TransformComponent, EnvMapBakeComponent])

  const boundingBoxQuery = defineQuery([TransformComponent, BoundingBoxComponent])
  const avatarAnimationQuery = defineQuery([AvatarRigComponent])
  // const navpathQuery = defineQuery([AutoPilotComponent])
  // const navpathAddQuery = enterQuery(navpathQuery)
  // const navpathRemoveQuery = exitQuery(navpathQuery)

  function physicsDebugUpdate(physicsDebugEnable: boolean) {
    for (const [_entity, helper] of helpersByEntity.box) {
      helper.visible = physicsDebugEnable
    }
  }

  const debugActionQueue = createActionQueue(EngineRendererAction.setDebug.matches)

  const execute = () => {
    for (const action of debugActionQueue()) physicsDebugUpdate(action.debugEnable)
    const physicsDebugEnabled = getState(EngineRendererState).debugEnable.value
    const componentDebugEnabled = getState(EngineRendererState).nodeHelperVisibility.value

    /**
     * EDITOR GIZMOS
     * @todo refactor this modularly (these queries should be in the system that loads the associated component) #7265
     */
    if (Engine.instance.isEditor) {
      /**
       * Env Map Bake
       */

      for (const entity of envMapBakeQuery.enter()) {
        const helper = new Object3D()
        helper.name = `envmap-bake-helper-${entity}`

        helper.userData.centerBall = new Mesh(
          new SphereGeometry(0.75),
          new MeshPhysicalMaterial({ roughness: 0, metalness: 1 })
        )
        helper.add(helper.userData.centerBall)

        helper.userData.gizmo = new BoxHelper(new Mesh(new BoxGeometry()), 0xff0000)
        helper.add(helper.userData.gizmo)

        setObjectLayers(helper, ObjectLayers.NodeHelper)

        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)
      }

      for (const entity of envMapBakeQuery()) {
        const helper = editorHelpers.get(entity)!
        const bakeComponent = getComponent(entity, EnvMapBakeComponent)
        if (helper.userData.gizmo)
          helper.userData.gizmo.matrix.compose(bakeComponent.bakePositionOffset, quat, bakeComponent.bakeScale)
      }

      for (const entity of envMapBakeQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      /**
       * Mount Point
       */

      for (const entity of mountPointQuery.enter()) {
        const helper = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 0), 0.5, 0xffffff)
        helper.name = `mount-point-helper-${entity}`
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
       * Portals
       */

      for (const entity of portalQuery.enter()) {
        const helper = new Mesh(
          new CylinderGeometry(0.25, 0.25, 0.1, 6, 1, false, (30 * Math.PI) / 180),
          new MeshBasicMaterial({ color: 0x2b59c3 })
        )
        helper.name = `portal-helper-${entity}`

        const spawnDirection = new Mesh(
          new ConeGeometry(0.05, 0.5, 4, 1, false, Math.PI / 4),
          new MeshBasicMaterial({ color: 0xd36582 })
        )
        spawnDirection.position.set(0, 0, 1.25)
        spawnDirection.rotateX(Math.PI / 2)
        helper.add(spawnDirection)

        setObjectLayers(helper, ObjectLayers.NodeHelper)

        Engine.instance.currentWorld.scene.add(helper)
        editorStaticHelpers.set(entity, helper)
      }

      for (const entity of portalQuery.exit()) {
        const helper = editorStaticHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorStaticHelpers.delete(entity)
      }

      for (const entity of portalQuery()) {
        const portalComponent = getComponent(entity, PortalComponent)
        const helper = editorStaticHelpers.get(entity)!
        helper.position.copy(portalComponent.spawnPosition)
        helper.quaternion.copy(portalComponent.spawnRotation)
      }

      /**
       * Spawn Point
       */

      for (const entity of spawnPointQuery.enter()) {
        const helper = spawnPointHelperModel.clone()
        helper.name = `spawn-point-helper-${entity}`
        const helperBox = new BoxHelper(new Mesh(new BoxGeometry(1, 0, 1)), 0xffffff)
        helper.userData.helperBox = helperBox
        helper.add(helperBox)
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)
      }

      for (const entity of spawnPointQuery.exit()) {
        const helper = editorHelpers.get(entity)!
        Engine.instance.currentWorld.scene.remove(helper)
        editorHelpers.delete(entity)
      }

      for (const entity of spawnPointQuery()) {
        const helper = editorHelpers.get(entity)!
        const transform = getComponent(entity, TransformComponent)
        helper.userData.helperBox.object.scale.copy(transform.scale)
        helper.userData.helperBox.update()
      }

      /**
       * Spline
       */

      for (const entity of splineQuery.enter()) {
        const spline = getComponent(entity, SplineComponent)
        const helper = new Spline()
        helper.name = `spline-helper-${entity}`
        helper.init(spline.splinePositions)
        setObjectLayers(helper, ObjectLayers.NodeHelper)
        Engine.instance.currentWorld.scene.add(helper)
        editorHelpers.set(entity, helper)
      }

      for (const entity of splineQuery.exit()) {
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
      }
    }

    /**
     * AVATAR HELPERS
     */
    for (const entity of avatarAnimationQuery()) {
      const anim = getComponent(entity, AvatarRigComponent)
      if (
        !helpersByEntity.skeletonHelpers.has(entity) &&
        physicsDebugEnabled &&
        !hasComponent(entity, AvatarPendingComponent) &&
        anim.rig.Hips
      ) {
        const helper = new SkeletonHelper(anim.rig.Hips)
        helper.name = `skeleton-helper-${entity}`
        Engine.instance.currentWorld.scene.add(helper)
        helpersByEntity.skeletonHelpers.set(entity, helper)
      }
      if (
        helpersByEntity.skeletonHelpers.has(entity) &&
        (!physicsDebugEnabled || hasComponent(entity, AvatarPendingComponent))
      ) {
        const helper = helpersByEntity.skeletonHelpers.get(entity) as SkeletonHelper
        Engine.instance.currentWorld.scene.remove(helper)
        helpersByEntity.skeletonHelpers.delete(entity)
      }
    }

    for (const entity of avatarAnimationQuery.exit()) {
      const helper = helpersByEntity.skeletonHelpers.get(entity) as SkeletonHelper
      if (helper) {
        Engine.instance.currentWorld.scene.remove(helper)
        helpersByEntity.skeletonHelpers.delete(entity)
      }
    }

    /**
     * DEBUG HELPERS
     */

    for (const entity of boundingBoxQuery.exit()) {
      const boxHelper = helpersByEntity.box.get(entity) as Box3Helper
      if (boxHelper) {
        boxHelper.removeFromParent()
        helpersByEntity.box.delete(entity)
      }
    }

    for (const entity of boundingBoxQuery()) {
      if (!physicsDebugEnabled && helpersByEntity.box.has(entity)) {
        const boxHelper = helpersByEntity.box.get(entity) as Box3Helper
        boxHelper.removeFromParent()
        helpersByEntity.box.delete(entity)
      }
    }

    for (const entity of boundingBoxQuery.enter()) {
      const boundingBox = getComponent(entity, BoundingBoxComponent)
      const helper = new Box3Helper(boundingBox.box)
      helper.name = `bounding-box-helper-${entity}`
      setObjectLayers(helper, ObjectLayers.NodeHelper)
      helpersByEntity.box.set(entity, helper)
      Engine.instance.currentWorld.scene.add(helper)
      helper.visible = physicsDebugEnabled
    }

    if (physicsDebugEnabled || componentDebugEnabled) {
      for (const [entity, helper] of editorHelpers) {
        helper.updateMatrixWorld(true)
      }
      for (const helpers of Object.values(helpersByEntity)) {
        for (const [entity, helper] of helpers) {
          helper.updateMatrixWorld(true)
        }
      }
    }
  }

  const cleanup = async () => {
    Engine.instance.currentWorld.scene.remove(InfiniteGridHelper.instance)
    InfiniteGridHelper.instance = null!

    removeQuery(world, portalQuery)
    removeQuery(world, splineQuery)
    removeQuery(world, spawnPointQuery)
    removeQuery(world, mountPointQuery)
    removeQuery(world, envMapBakeQuery)
    removeQuery(world, boundingBoxQuery)
    removeQuery(world, avatarAnimationQuery)

    removeActionQueue(debugActionQueue)
  }

  return { execute, cleanup }
}

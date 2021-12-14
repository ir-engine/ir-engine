import {
  ArrowHelper,
  Box3,
  Box3Helper,
  Color,
  ConeBufferGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  SkeletonHelper,
  Vector3
} from 'three'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponent'
import { NavMeshComponent } from '../../navigation/component/NavMeshComponent'
import { createConvexRegionHelper } from '../../navigation/NavMeshHelper'
import { createGraphHelper } from '../../navigation/GraphHelper'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { DebugArrowComponent } from '../DebugArrowComponent'
import { DebugRenderer } from './DebugRenderer'
import { DebugNavMeshComponent } from '../DebugNavMeshComponent'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { isStaticBody } from '../../physics/classes/Physics'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { IKObj } from '../../ikrig/components/IKObj'

type ComponentHelpers = 'viewVector' | 'ikExtents' | 'helperArrow' | 'velocityArrow' | 'box' | 'navmesh' | 'navpath'

const vector3 = new Vector3()
const quat = new Quaternion()

const cubeGeometry = new ConeBufferGeometry(0.05, 0.25, 4)
cubeGeometry.rotateX(-Math.PI * 0.5)

export default async function DebugHelpersSystem(world: World): Promise<System> {
  const helpersByEntity: Record<ComponentHelpers, Map<Entity, any>> = {
    viewVector: new Map(),
    ikExtents: new Map(),
    box: new Map(),
    helperArrow: new Map(),
    velocityArrow: new Map(),
    navmesh: new Map(),
    navpath: new Map()
  }

  let physicsDebugRenderer = DebugRenderer()

  let physicsDebugEnabled = false
  let avatarDebugEnabled = false

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.AVATAR_DEBUG, ({ enabled }) => {
    avatarDebugEnabled = typeof enabled === 'undefined' ? !avatarDebugEnabled : enabled
    helpersByEntity.viewVector.forEach((obj: Object3D) => {
      obj.visible = enabled
    })
    helpersByEntity.velocityArrow.forEach((obj: Object3D) => {
      obj.visible = enabled
    })
    helpersByEntity.ikExtents.forEach((entry: Object3D[]) => {
      entry.forEach((obj) => (obj.visible = enabled))
    })
  })

  EngineEvents.instance.addEventListener(EngineEvents.EVENTS.PHYSICS_DEBUG, ({ enabled }) => {
    physicsDebugEnabled = typeof enabled === 'undefined' ? !physicsDebugEnabled : enabled
    helpersByEntity.helperArrow.forEach((obj: Object3D) => {
      obj.visible = enabled
    })
    helpersByEntity.box.forEach((entry: Object3D[]) => {
      entry.forEach((obj) => (obj.visible = enabled))
    })
  })

  const avatarDebugQuery = defineQuery([AvatarComponent])
  const ikDebugQuery = defineQuery([IKObj])
  const boundingBoxQuery = defineQuery([BoundingBoxComponent])
  const colliderQuery = defineQuery([ColliderComponent])
  const arrowHelperQuery = defineQuery([DebugArrowComponent])
  const ikAvatarQuery = defineQuery([XRInputSourceComponent])
  const navmeshQuery = defineQuery([DebugNavMeshComponent, NavMeshComponent])
  // const navpathQuery = defineQuery([AutoPilotComponent])
  // const navpathAddQuery = enterQuery(navpathQuery)
  // const navpathRemoveQuery = exitQuery(navpathQuery)

  return () => {
    // ===== AVATAR ===== //

    for (const entity of ikDebugQuery.enter()) {
      const ikobj = getComponent(entity, IKObj)
      const helper = new SkeletonHelper(ikobj.ref)
      ;(ikobj.ref as any).helper = helper
      ikobj.ref.add(helper)
      console.log(helper)
    }
    for (const entity of ikDebugQuery.exit()) {
      const ikobj = getComponent(entity, IKObj)
      const helper = (ikobj.ref as any).helper
      ikobj.ref.remove(helper)
    }
    for (const entity of avatarDebugQuery.enter()) {
      const avatar = getComponent(entity, AvatarComponent)

      // view vector
      const origin = new Vector3(0, 2, 0)
      const length = 0.5
      const hex = 0xffff00
      if (!avatar || !avatar.viewVector) {
        console.warn('avatar.viewVector is null')
        continue
      }
      // const arrowHelper = new ArrowHelper(avatar.viewVector.clone().normalize(), origin, length, hex)
      // arrowHelper.visible = avatarDebugEnabled
      // Engine.scene.add(arrowHelper)
      // helpersByEntity.viewVector.set(entity, arrowHelper)

      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = avatarDebugEnabled
      Engine.scene.add(velocityArrowHelper)
      helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of avatarDebugQuery.exit()) {
      // view vector
      // const arrowHelper = helpersByEntity.viewVector.get(entity) as Object3D
      // Engine.scene.remove(arrowHelper)
      // helpersByEntity.viewVector.delete(entity)

      // velocity
      const velocityArrowHelper = helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.scene.remove(velocityArrowHelper)
      helpersByEntity.velocityArrow.delete(entity)
    }

    for (const entity of avatarDebugQuery()) {
      // view vector
      const avatar = getComponent(entity, AvatarComponent)
      const velocity = getComponent(entity, VelocityComponent)
      const transform = getComponent(entity, TransformComponent)
      // const arrowHelper = helpersByEntity.viewVector.get(entity) as ArrowHelper

      // if (arrowHelper != null) {
      //   arrowHelper.setDirection(vector3.copy(avatar.viewVector).setY(0).normalize())
      //   arrowHelper.position.copy(transform.position).y += avatar.avatarHalfHeight
      // }

      // velocity
      const velocityArrowHelper = helpersByEntity.velocityArrow.get(entity) as ArrowHelper
      if (velocityArrowHelper != null) {
        velocityArrowHelper.setDirection(vector3.copy(velocity.velocity).normalize())
        velocityArrowHelper.setLength(velocity.velocity.length() * 20)
        velocityArrowHelper.position.copy(transform.position).y += avatar.avatarHalfHeight
      }
    }

    for (const entity of ikAvatarQuery.enter()) {
      const debugHead = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('red'), side: DoubleSide }))
      const debugLeft = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('yellow') }))
      const debugRight = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('blue') }))
      debugHead.visible = avatarDebugEnabled
      debugLeft.visible = avatarDebugEnabled
      debugRight.visible = avatarDebugEnabled
      Engine.scene.add(debugHead)
      Engine.scene.add(debugLeft)
      Engine.scene.add(debugRight)
      helpersByEntity.ikExtents.set(entity, [debugHead, debugLeft, debugRight])
    }

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

    // ===== COLLIDERS ===== //

    for (const entity of colliderQuery.exit()) {
      // view vector
      const arrowHelper = helpersByEntity.viewVector.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      helpersByEntity.viewVector.delete(entity)

      // velocity
      const velocityArrowHelper = helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.scene.remove(velocityArrowHelper)
      helpersByEntity.velocityArrow.delete(entity)
    }

    for (const entity of colliderQuery.enter()) {
      const collider = getComponent(entity, ColliderComponent)
      if (isStaticBody(collider.body)) continue

      // view vector
      const origin = new Vector3(0, 2, 0)
      const length = 0.5
      const hex = 0xffff00

      const arrowHelper = new ArrowHelper(
        vector3.copy(collider.body.getGlobalPose().translation as Vector3).normalize(),
        origin,
        length,
        hex
      )
      arrowHelper.visible = avatarDebugEnabled
      Engine.scene.add(arrowHelper)
      helpersByEntity.viewVector.set(entity, arrowHelper)

      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = avatarDebugEnabled
      Engine.scene.add(velocityArrowHelper)
      helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of colliderQuery()) {
      // view vector
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      const arrowHelper = helpersByEntity.viewVector.get(entity) as ArrowHelper

      if (arrowHelper != null) {
        arrowHelper.setDirection(
          new Vector3()
            .copy(collider.body.getGlobalPose().translation as Vector3)
            .setY(0)
            .normalize()
        )
        arrowHelper.position.copy(transform.position)
      }

      // velocity
      const velocityArrowHelper = helpersByEntity.velocityArrow.get(entity) as ArrowHelper
      if (velocityArrowHelper != null) {
        const vel = new Vector3().copy(collider.body.getLinearVelocity() as Vector3)
        velocityArrowHelper.setLength(vel.length() * 60)
        velocityArrowHelper.setDirection(vel.normalize())
        velocityArrowHelper.position.copy(transform.position)
      }
    }

    // ===== INTERACTABLES ===== //

    // bounding box
    for (const entity of boundingBoxQuery.enter()) {
      helpersByEntity.box.set(entity, [])
      const boundingBox = getComponent(entity, BoundingBoxComponent)
      const box3 = new Box3()
      box3.copy(boundingBox.box)
      if (boundingBox.dynamic) {
        const object3D = getComponent(entity, Object3DComponent)
        box3.applyMatrix4(object3D.value.matrixWorld)
      }
      const helper = new Box3Helper(box3)
      helper.visible = physicsDebugEnabled
      Engine.scene.add(helper)
      ;(helpersByEntity.box.get(entity) as Object3D[]).push(helper)
    }

    for (const entity of boundingBoxQuery.exit()) {
      const boxes = helpersByEntity.box.get(entity) as Object3D[]
      boxes.forEach((box) => {
        Engine.scene.remove(box)
      })
      helpersByEntity.box.delete(entity)
    }

    // ===== CUSTOM ===== //

    for (const entity of arrowHelperQuery.enter()) {
      const arrow = getComponent(entity, DebugArrowComponent)
      const arrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, arrow.color)
      arrowHelper.visible = physicsDebugEnabled
      Engine.scene.add(arrowHelper)
      helpersByEntity.helperArrow.set(entity, arrowHelper)
    }

    for (const entity of arrowHelperQuery.exit()) {
      const arrowHelper = helpersByEntity.helperArrow.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      helpersByEntity.helperArrow.delete(entity)
    }

    for (const entity of arrowHelperQuery()) {
      const arrow = getComponent(entity, DebugArrowComponent)
      const arrowHelper = helpersByEntity.helperArrow.get(entity) as ArrowHelper
      if (arrowHelper != null) {
        arrowHelper.setDirection(arrow.direction.clone().normalize())
        arrowHelper.setLength(arrow.direction.length())
        arrowHelper.position.copy(arrow.position)
      }
    }

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
      Engine.scene.add(helper)
      helpersByEntity.navmesh.set(entity, helper)
    }
    for (const entity of navmeshQuery()) {
      // update
      const helper = helpersByEntity.navmesh.get(entity) as Object3D
      const transform = getComponent(entity, TransformComponent)
      helper.position.copy(transform.position)
      // helper.quaternion.copy(transform.rotation)
    }
    for (const entity of navmeshQuery.exit()) {
      const helper = helpersByEntity.navmesh.get(entity) as Object3D
      Engine.scene.remove(helper)
      helpersByEntity.navmesh.delete(entity)
    }
    // ===== Autopilot Helper ===== //
    // TODO add createPathHelper for navpathQuery

    physicsDebugRenderer(world, physicsDebugEnabled)
  }
}

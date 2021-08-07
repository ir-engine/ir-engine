import { System } from '../../ecs/classes/System'
import {
  ArrowHelper,
  Box3,
  Box3Helper,
  BoxHelper,
  Color,
  ConeBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Vector3
} from 'three'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBox'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { DebugArrowComponent } from '../DebugArrowComponent'
import { DebugRenderer } from './DebugRenderer'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'

type ComponentHelpers = 'viewVector' | 'ikExtents' | 'helperArrow' | 'velocityArrow' | 'box'

const vector3 = new Vector3()
const quat = new Quaternion()

const cubeGeometry = new ConeBufferGeometry(0.05, 0.25, 4)
cubeGeometry.rotateX(-Math.PI * 0.5)

export class DebugHelpers {
  static helpersByEntity: Record<ComponentHelpers, Map<Entity, any>> = {
    viewVector: new Map(),
    ikExtents: new Map(),
    box: new Map(),
    helperArrow: new Map(),
    velocityArrow: new Map()
  }

  static physicsDebugRenderer: DebugRenderer

  static physicsDebugEnabled = false
  static avatarDebugEnabled = false

  static toggleDebugPhysics = (enabled) => {
    DebugHelpers.physicsDebugEnabled = enabled
    DebugHelpers.physicsDebugRenderer.setEnabled(enabled)
    DebugHelpers.helpersByEntity.helperArrow.forEach((obj: Object3D) => {
      obj.visible = enabled
    })
    DebugHelpers.helpersByEntity.box.forEach((entry: Object3D[]) => {
      entry.forEach((obj) => (obj.visible = enabled))
    })
  }

  static toggleDebugAvatar = (enabled) => {
    DebugHelpers.avatarDebugEnabled = enabled
    DebugHelpers.helpersByEntity.viewVector.forEach((obj: Object3D) => {
      obj.visible = enabled
    })
    DebugHelpers.helpersByEntity.velocityArrow.forEach((obj: Object3D) => {
      obj.visible = enabled
    })
    DebugHelpers.helpersByEntity.ikExtents.forEach((entry: Object3D[]) => {
      entry.forEach((obj) => (obj.visible = enabled))
    })
  }
}
export class DebugHelpersSystem extends System {
  constructor() {
    super()
    DebugHelpers.physicsDebugRenderer = new DebugRenderer(Engine.scene)
  }
  execute(delta: number, time: number): void {
    // ===== AVATAR ===== //

    for (const entity of this.queryResults.avatarDebug?.added) {
      const avatar = getComponent(entity, AvatarComponent)

      // view vector
      const origin = new Vector3(0, 2, 0)
      const length = 0.5
      const hex = 0xffff00
      if (!avatar || !avatar.viewVector) {
        console.warn('avatar.viewVector is null')
        continue
      }
      const arrowHelper = new ArrowHelper(avatar.viewVector.clone().normalize(), origin, length, hex)
      arrowHelper.visible = DebugHelpers.avatarDebugEnabled
      Engine.scene.add(arrowHelper)
      DebugHelpers.helpersByEntity.viewVector.set(entity, arrowHelper)

      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = DebugHelpers.avatarDebugEnabled
      Engine.scene.add(velocityArrowHelper)
      DebugHelpers.helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of this.queryResults.avatarDebug?.removed) {
      // view vector
      const arrowHelper = DebugHelpers.helpersByEntity.viewVector.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      DebugHelpers.helpersByEntity.viewVector.delete(entity)

      // velocity
      const velocityArrowHelper = DebugHelpers.helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.scene.remove(velocityArrowHelper)
      DebugHelpers.helpersByEntity.velocityArrow.delete(entity)
    }

    for (const entity of this.queryResults.avatarDebug?.all) {
      // view vector
      const avatar = getComponent(entity, AvatarComponent)
      const velocity = getComponent(entity, VelocityComponent)
      const transform = getComponent(entity, TransformComponent)
      const arrowHelper = DebugHelpers.helpersByEntity.viewVector.get(entity) as ArrowHelper

      if (arrowHelper != null) {
        arrowHelper.setDirection(vector3.copy(avatar.viewVector).setY(0).normalize())
        arrowHelper.position.copy(transform.position).y += avatar.avatarHalfHeight
      }

      // velocity
      const velocityArrowHelper = DebugHelpers.helpersByEntity.velocityArrow.get(entity) as ArrowHelper
      if (velocityArrowHelper != null) {
        velocityArrowHelper.setDirection(vector3.copy(velocity.velocity).normalize())
        velocityArrowHelper.setLength(velocity.velocity.length() * 20)
        velocityArrowHelper.position.copy(transform.position).y += avatar.avatarHalfHeight
      }
    }

    for (const entity of this.queryResults.ikAvatar.added) {
      const debugHead = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('red') }))
      const debugLeft = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('yellow') }))
      const debugRight = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('blue') }))
      debugHead.visible = DebugHelpers.avatarDebugEnabled
      debugLeft.visible = DebugHelpers.avatarDebugEnabled
      debugRight.visible = DebugHelpers.avatarDebugEnabled
      Engine.scene.add(debugHead)
      Engine.scene.add(debugLeft)
      Engine.scene.add(debugRight)
      DebugHelpers.helpersByEntity.ikExtents.set(entity, [debugHead, debugLeft, debugRight])
    }

    for (const entity of this.queryResults.ikAvatar.all) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const [debugHead, debugLeft, debugRight] = DebugHelpers.helpersByEntity.ikExtents.get(entity) as Object3D[]
      debugHead.position.copy(xrInputSourceComponent.head.getWorldPosition(vector3))
      debugHead.quaternion.copy(xrInputSourceComponent.head.getWorldQuaternion(quat))
      debugLeft.position.copy(xrInputSourceComponent.controllerLeft.getWorldPosition(vector3))
      debugLeft.quaternion.copy(xrInputSourceComponent.controllerLeft.getWorldQuaternion(quat))
      debugRight.position.copy(xrInputSourceComponent.controllerRight.getWorldPosition(vector3))
      debugRight.quaternion.copy(xrInputSourceComponent.controllerRight.getWorldQuaternion(quat))
    }

    for (const entity of this.queryResults.ikAvatar.removed) {
      ;(DebugHelpers.helpersByEntity.ikExtents.get(entity) as Object3D[]).forEach((obj: Object3D) => {
        obj.removeFromParent()
      })
      DebugHelpers.helpersByEntity.ikExtents.delete(entity)
    }

    // ===== COLLIDERS ===== //

    for (const entity of this.queryResults.colliderComponent.removed) {
      // view vector
      const arrowHelper = DebugHelpers.helpersByEntity.viewVector.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      DebugHelpers.helpersByEntity.viewVector.delete(entity)

      // velocity
      const velocityArrowHelper = DebugHelpers.helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.scene.remove(velocityArrowHelper)
      DebugHelpers.helpersByEntity.velocityArrow.delete(entity)
    }

    for (const entity of this.queryResults.colliderComponent.added) {
      const collider = getComponent(entity, ColliderComponent)

      // view vector
      const origin = new Vector3(0, 2, 0)
      const length = 0.5
      const hex = 0xffff00

      const arrowHelper = new ArrowHelper(
        vector3.copy(collider.body.transform.translation).normalize(),
        origin,
        length,
        hex
      )
      arrowHelper.visible = DebugHelpers.avatarDebugEnabled
      Engine.scene.add(arrowHelper)
      DebugHelpers.helpersByEntity.viewVector.set(entity, arrowHelper)

      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = DebugHelpers.avatarDebugEnabled
      Engine.scene.add(velocityArrowHelper)
      DebugHelpers.helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of this.queryResults.colliderComponent.all) {
      // view vector
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      const arrowHelper = DebugHelpers.helpersByEntity.viewVector.get(entity) as ArrowHelper

      if (arrowHelper != null) {
        arrowHelper.setDirection(collider.body.transform.translation.clone().setY(0).normalize())
        arrowHelper.position.copy(transform.position)
      }

      // velocity
      const velocityArrowHelper = DebugHelpers.helpersByEntity.velocityArrow.get(entity) as ArrowHelper
      if (velocityArrowHelper != null) {
        velocityArrowHelper.setDirection(collider.body.transform.linearVelocity.clone().normalize())
        velocityArrowHelper.setLength(collider.body.transform.linearVelocity.length() * 60)
        velocityArrowHelper.position.copy(transform.position)
      }
    }

    // ===== INTERACTABLES ===== //

    // bounding box
    for (const entity of this.queryResults.boundingBoxComponent?.added) {
      DebugHelpers.helpersByEntity.box.set(entity, [])
      const boundingBox = getComponent(entity, BoundingBoxComponent)
      const box3 = new Box3()
      box3.copy(boundingBox.box)
      if (boundingBox.dynamic) {
        const object3D = getComponent(entity, Object3DComponent)
        box3.applyMatrix4(object3D.value.matrixWorld)
      }
      const helper = new Box3Helper(box3)
      helper.visible = DebugHelpers.physicsDebugEnabled
      Engine.scene.add(helper)
      ;(DebugHelpers.helpersByEntity.box.get(entity) as Object3D[]).push(helper)
    }

    for (const entity of this.queryResults.boundingBoxComponent?.removed) {
      const boxes = DebugHelpers.helpersByEntity.box.get(entity) as Object3D[]
      boxes.forEach((box) => {
        Engine.scene.remove(box)
      })
      DebugHelpers.helpersByEntity.box.delete(entity)
    }

    // ===== CUSTOM ===== //

    for (const entity of this.queryResults.arrowHelper?.added) {
      const arrow = getComponent(entity, DebugArrowComponent)
      const arrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, arrow.color)
      arrowHelper.visible = DebugHelpers.physicsDebugEnabled
      Engine.scene.add(arrowHelper)
      DebugHelpers.helpersByEntity.helperArrow.set(entity, arrowHelper)
    }

    for (const entity of this.queryResults.arrowHelper?.removed) {
      const arrowHelper = DebugHelpers.helpersByEntity.helperArrow.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      DebugHelpers.helpersByEntity.helperArrow.delete(entity)
    }

    for (const entity of this.queryResults.arrowHelper?.all) {
      const arrow = getComponent(entity, DebugArrowComponent)
      const arrowHelper = DebugHelpers.helpersByEntity.helperArrow.get(entity) as ArrowHelper
      if (arrowHelper != null) {
        arrowHelper.setDirection(arrow.direction.clone().normalize())
        arrowHelper.setLength(arrow.direction.length())
        arrowHelper.position.copy(arrow.position)
      }
    }

    DebugHelpers.physicsDebugRenderer.update()
  }
}

DebugHelpersSystem.queries = {
  avatarDebug: {
    components: [AvatarComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  boundingBoxComponent: {
    components: [BoundingBoxComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  colliderComponent: {
    components: [ColliderComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  arrowHelper: {
    components: [DebugArrowComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  ikAvatar: {
    components: [XRInputSourceComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

import { System } from '../../ecs/classes/System'
import { CharacterComponent } from '../../character/components/CharacterComponent'
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
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { DebugArrowComponent } from '../DebugArrowComponent'
import { DebugRenderer } from './DebugRenderer'
import { XRInputSourceComponent } from '../../character/components/XRInputSourceComponent'
import { VelocityComponent } from '../../physics/components/VelocityComponent'

type ComponentHelpers = 'viewVector' | 'ikExtents' | 'helperArrow' | 'velocityArrow' | 'box'

const vector3 = new Vector3()
const quat = new Quaternion()

const cubeGeometry = new ConeBufferGeometry(0.05, 0.25, 4)
cubeGeometry.rotateX(-Math.PI * 0.5)

export class DebugHelpersSystem extends System {
  private helpersByEntity: Record<ComponentHelpers, Map<Entity, any>>

  physicsDebugRenderer: DebugRenderer
  static EVENTS = {
    TOGGLE_PHYSICS: 'DEBUG_HELPERS_SYSTEM_TOGGLE_PHYSICS',
    TOGGLE_AVATAR: 'DEBUG_HELPERS_SYSTEM_TOGGLE_AVATAR'
  }
  physicsDebugEnabled = false
  avatarDebugEnabled = false

  constructor() {
    super()
    this.physicsDebugRenderer = new DebugRenderer(Engine.scene)

    this.helpersByEntity = {
      viewVector: new Map(),
      ikExtents: new Map(),
      box: new Map(),
      helperArrow: new Map(),
      velocityArrow: new Map()
    }

    EngineEvents.instance.addEventListener(DebugHelpersSystem.EVENTS.TOGGLE_AVATAR, ({ enabled }) => {
      this.avatarDebugEnabled = enabled
      this.helpersByEntity.viewVector.forEach((obj: Object3D) => {
        obj.visible = enabled
      })
      this.helpersByEntity.velocityArrow.forEach((obj: Object3D) => {
        obj.visible = enabled
      })
      this.helpersByEntity.ikExtents.forEach((entry: Object3D[]) => {
        entry.forEach((obj) => (obj.visible = enabled))
      })
    })

    EngineEvents.instance.addEventListener(DebugHelpersSystem.EVENTS.TOGGLE_PHYSICS, ({ enabled }) => {
      this.physicsDebugEnabled = enabled
      this.physicsDebugRenderer.setEnabled(enabled)
      this.helpersByEntity.helperArrow.forEach((obj: Object3D) => {
        obj.visible = enabled
      })
      this.helpersByEntity.box.forEach((entry: Object3D[]) => {
        entry.forEach((obj) => (obj.visible = enabled))
      })
    })
  }

  dispose() {
    EngineEvents.instance.removeAllListenersForEvent(DebugHelpersSystem.EVENTS.TOGGLE_AVATAR)
    EngineEvents.instance.removeAllListenersForEvent(DebugHelpersSystem.EVENTS.TOGGLE_PHYSICS)
  }

  execute(delta: number, time: number): void {
    // ===== AVATAR ===== //

    for (const entity of this.queryResults.characterDebug?.added) {
      const actor = getComponent(entity, CharacterComponent)

      // view vector
      const origin = new Vector3(0, 2, 0)
      const length = 0.5
      const hex = 0xffff00
      if (!actor || !actor.viewVector) {
        console.warn('actor.viewVector is null')
        continue
      }
      const arrowHelper = new ArrowHelper(actor.viewVector.clone().normalize(), origin, length, hex)
      arrowHelper.visible = this.avatarDebugEnabled
      Engine.scene.add(arrowHelper)
      this.helpersByEntity.viewVector.set(entity, arrowHelper)

      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = this.avatarDebugEnabled
      Engine.scene.add(velocityArrowHelper)
      this.helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of this.queryResults.characterDebug?.removed) {
      // view vector
      const arrowHelper = this.helpersByEntity.viewVector.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      this.helpersByEntity.viewVector.delete(entity)

      // velocity
      const velocityArrowHelper = this.helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.scene.remove(velocityArrowHelper)
      this.helpersByEntity.velocityArrow.delete(entity)
    }

    for (const entity of this.queryResults.characterDebug?.all) {
      // view vector
      const actor = getComponent(entity, CharacterComponent)
      const velocity = getComponent(entity, VelocityComponent)
      const transform = getComponent(entity, TransformComponent)
      const arrowHelper = this.helpersByEntity.viewVector.get(entity) as ArrowHelper

      if (arrowHelper != null) {
        arrowHelper.setDirection(vector3.copy(actor.viewVector).setY(0).normalize())
        arrowHelper.position.copy(transform.position).y += actor.actorHalfHeight
      }

      // velocity
      const velocityArrowHelper = this.helpersByEntity.velocityArrow.get(entity) as ArrowHelper
      if (velocityArrowHelper != null) {
        velocityArrowHelper.setDirection(vector3.copy(velocity.velocity).normalize())
        velocityArrowHelper.setLength(velocity.velocity.length() * 20)
        velocityArrowHelper.position.copy(transform.position).y += actor.actorHalfHeight
      }
    }

    for (const entity of this.queryResults.ikAvatar.added) {
      const debugHead = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('red') }))
      const debugLeft = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('yellow') }))
      const debugRight = new Mesh(cubeGeometry, new MeshBasicMaterial({ color: new Color('blue') }))
      debugHead.visible = this.avatarDebugEnabled
      debugLeft.visible = this.avatarDebugEnabled
      debugRight.visible = this.avatarDebugEnabled
      Engine.scene.add(debugHead)
      Engine.scene.add(debugLeft)
      Engine.scene.add(debugRight)
      this.helpersByEntity.ikExtents.set(entity, [debugHead, debugLeft, debugRight])
    }

    for (const entity of this.queryResults.ikAvatar.all) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const [debugHead, debugLeft, debugRight] = this.helpersByEntity.ikExtents.get(entity) as Object3D[]
      debugHead.position.copy(xrInputSourceComponent.head.getWorldPosition(vector3))
      debugHead.quaternion.copy(xrInputSourceComponent.head.getWorldQuaternion(quat))
      debugLeft.position.copy(xrInputSourceComponent.controllerLeft.getWorldPosition(vector3))
      debugLeft.quaternion.copy(xrInputSourceComponent.controllerLeft.getWorldQuaternion(quat))
      debugRight.position.copy(xrInputSourceComponent.controllerRight.getWorldPosition(vector3))
      debugRight.quaternion.copy(xrInputSourceComponent.controllerRight.getWorldQuaternion(quat))
    }

    for (const entity of this.queryResults.ikAvatar.removed) {
      ;(this.helpersByEntity.ikExtents.get(entity) as Object3D[]).forEach((obj: Object3D) => {
        obj.removeFromParent()
      })
      this.helpersByEntity.ikExtents.delete(entity)
    }

    // ===== COLLIDERS ===== //

    for (const entity of this.queryResults.colliderComponent.removed) {
      // view vector
      const arrowHelper = this.helpersByEntity.viewVector.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      this.helpersByEntity.viewVector.delete(entity)

      // velocity
      const velocityArrowHelper = this.helpersByEntity.velocityArrow.get(entity) as Object3D
      Engine.scene.remove(velocityArrowHelper)
      this.helpersByEntity.velocityArrow.delete(entity)
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
      arrowHelper.visible = this.avatarDebugEnabled
      Engine.scene.add(arrowHelper)
      this.helpersByEntity.viewVector.set(entity, arrowHelper)

      // velocity
      const velocityColor = 0x0000ff
      const velocityArrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, velocityColor)
      velocityArrowHelper.visible = this.avatarDebugEnabled
      Engine.scene.add(velocityArrowHelper)
      this.helpersByEntity.velocityArrow.set(entity, velocityArrowHelper)
    }

    for (const entity of this.queryResults.colliderComponent.all) {
      // view vector
      const collider = getComponent(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)
      const arrowHelper = this.helpersByEntity.viewVector.get(entity) as ArrowHelper

      if (arrowHelper != null) {
        arrowHelper.setDirection(collider.body.transform.translation.clone().setY(0).normalize())
        arrowHelper.position.copy(transform.position)
      }

      // velocity
      const velocityArrowHelper = this.helpersByEntity.velocityArrow.get(entity) as ArrowHelper
      if (velocityArrowHelper != null) {
        velocityArrowHelper.setDirection(collider.body.transform.linearVelocity.clone().normalize())
        velocityArrowHelper.setLength(collider.body.transform.linearVelocity.length() * 60)
        velocityArrowHelper.position.copy(transform.position)
      }
    }

    // ===== INTERACTABLES ===== //

    // bounding box
    for (const entity of this.queryResults.boundingBoxComponent?.added) {
      this.helpersByEntity.box.set(entity, [])
      const boundingBox = getComponent(entity, BoundingBoxComponent)
      if (boundingBox.boxArray.length) {
        if (boundingBox.dynamic) {
          boundingBox.boxArray.forEach((object3D, index) => {
            const helper = new BoxHelper(object3D)
            helper.visible = this.physicsDebugEnabled
            Engine.scene.add(helper)
            ;(this.helpersByEntity.box.get(entity) as Object3D[]).push(helper)
          })
        }
      } else {
        const box3 = new Box3()
        box3.copy(boundingBox.box)
        if (boundingBox.dynamic) {
          const object3D = getComponent(entity, Object3DComponent)
          box3.applyMatrix4(object3D.value.matrixWorld)
        }
        const helper = new Box3Helper(box3)
        helper.visible = this.physicsDebugEnabled
        Engine.scene.add(helper)
        ;(this.helpersByEntity.box.get(entity) as Object3D[]).push(helper)
      }
    }

    for (const entity of this.queryResults.boundingBoxComponent?.removed) {
      const boxes = this.helpersByEntity.box.get(entity) as Object3D[]
      boxes.forEach((box) => {
        Engine.scene.remove(box)
      })
      this.helpersByEntity.box.delete(entity)
    }

    // ===== CUSTOM ===== //

    for (const entity of this.queryResults.arrowHelper?.added) {
      const arrow = getComponent(entity, DebugArrowComponent)
      const arrowHelper = new ArrowHelper(new Vector3(), new Vector3(0, 0, 0), 0.5, arrow.color)
      arrowHelper.visible = this.physicsDebugEnabled
      Engine.scene.add(arrowHelper)
      this.helpersByEntity.helperArrow.set(entity, arrowHelper)
    }

    for (const entity of this.queryResults.arrowHelper?.removed) {
      const arrowHelper = this.helpersByEntity.helperArrow.get(entity) as Object3D
      Engine.scene.remove(arrowHelper)
      this.helpersByEntity.helperArrow.delete(entity)
    }

    for (const entity of this.queryResults.arrowHelper?.all) {
      const arrow = getComponent(entity, DebugArrowComponent)
      const arrowHelper = this.helpersByEntity.helperArrow.get(entity) as ArrowHelper
      if (arrowHelper != null) {
        arrowHelper.setDirection(arrow.direction.clone().normalize())
        arrowHelper.setLength(arrow.direction.length())
        arrowHelper.position.copy(arrow.position)
      }
    }

    this.physicsDebugRenderer.update()
  }
}

DebugHelpersSystem.queries = {
  characterDebug: {
    components: [CharacterComponent],
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

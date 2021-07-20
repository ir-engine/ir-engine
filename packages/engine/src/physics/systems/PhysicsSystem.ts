import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { System, SystemAttributes } from '../../ecs/classes/System'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { BodyType, PhysXConfig, PhysXInstance } from 'three-physx'
import { Vector3 } from 'three'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const vec3 = new Vector3()

export class PhysicsSystem extends System {
  static EVENTS = {
    PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT'
  }
  static instance: PhysicsSystem
  updateType = SystemUpdateType.Fixed

  physicsWorldConfig: PhysXConfig
  worker: Worker

  simulationEnabled: boolean

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
    PhysicsSystem.instance = this
    this.physicsWorldConfig = Object.assign({}, attributes.physicsWorldConfig)
    this.worker = attributes.worker

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      if (typeof ev.physics !== 'undefined') {
        this.simulationEnabled = ev.physics
      }
    })

    if (!PhysXInstance.instance) {
      PhysXInstance.instance = new PhysXInstance()
    }

    this.simulationEnabled = attributes.simulationEnabled ?? true
  }

  async initialize() {
    super.initialize()
    await PhysXInstance.instance.initPhysX(this.worker, this.physicsWorldConfig)
  }

  reset(): void {
    // TODO: PhysXInstance.instance.reset();
  }

  dispose(): void {
    super.dispose()
    this.reset()
    PhysXInstance.instance.dispose()
    EngineEvents.instance.removeAllListenersForEvent(PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT)
  }

  execute(delta: number): void {
    this.queryResults.collider.removed?.forEach((entity) => {
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent, true)
      if (colliderComponent) {
        this.removeBody(colliderComponent.body)
      }
    })

    this.queryResults.collider.all?.forEach((entity) => {
      const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent)
      const transform = getComponent(entity, TransformComponent)

      if (collider.body.type === BodyType.KINEMATIC) {
        collider.velocity.subVectors(collider.body.transform.translation, transform.position)
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation })
      } else if (collider.body.type === BodyType.DYNAMIC) {
        collider.velocity.subVectors(transform.position, collider.body.transform.translation)

        transform.position.set(
          collider.body.transform.translation.x,
          collider.body.transform.translation.y,
          collider.body.transform.translation.z
        )
        collider.position.copy(transform.position)

        transform.rotation.set(
          collider.body.transform.rotation.x,
          collider.body.transform.rotation.y,
          collider.body.transform.rotation.z,
          collider.body.transform.rotation.w
        )
        collider.quaternion.copy(transform.rotation)
      }
    })

    PhysXInstance.instance.update()
  }

  get gravity() {
    return { x: 0, y: -9.81, z: 0 }
  }

  set gravity(value: { x: number; y: number; z: number }) {
    // todo
  }

  addRaycastQuery(query) {
    return PhysXInstance.instance.addRaycastQuery(query)
  }
  removeRaycastQuery(query) {
    return PhysXInstance.instance.removeRaycastQuery(query)
  }
  addBody(args) {
    return PhysXInstance.instance.addBody(args)
  }
  removeBody(body) {
    return PhysXInstance.instance.removeBody(body)
  }
  createController(options) {
    return PhysXInstance.instance.createController(options)
  }
  removeController(id) {
    return PhysXInstance.instance.removeController(id)
  }
}

PhysicsSystem.queries = {
  collider: {
    components: [ColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

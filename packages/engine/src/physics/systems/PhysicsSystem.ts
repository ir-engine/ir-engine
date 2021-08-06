import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { System } from '../../ecs/classes/System'
import { addComponent, getComponent, getMutableComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { BodyType, PhysXInstance } from 'three-physx'
import { NetworkObject } from '../../networking/components/NetworkObject'
import { Network } from '../../networking/classes/Network'
import { Engine } from '../../ecs/classes/Engine'
import { VelocityComponent } from '../components/VelocityComponent'
import { RaycastComponent } from '../components/RaycastComponent'
import { SpawnNetworkObjectComponent } from '../../scene/components/SpawnNetworkObjectComponent'
import { RigidBodyTagComponent } from '../components/RigidBodyTagComponent'
import { Quaternion, Vector3 } from 'three'
import { InterpolationComponent } from '../components/InterpolationComponent'
import { isClient } from '../../common/functions/isClient'
import { PrefabType } from '../../networking/templates/PrefabType'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

export class PhysicsSystem extends System {
  static EVENTS = {
    PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT'
  }

  simulationEnabled: boolean

  constructor(attributes: { worker?: Worker; simulationEnabled?: boolean } = {}) {
    super(attributes)
    Engine.physxWorker = attributes.worker

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
    await PhysXInstance.instance.initPhysX(Engine.physxWorker, Engine.initOptions.physics.settings)
    Engine.workers.push(Engine.physxWorker)
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
    for (const entity of this.queryResults.spawnNetworkObject.added) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)

      addComponent(entity, TransformComponent, {
        position: new Vector3().copy(parameters.position),
        rotation: new Quaternion().copy(parameters.rotation)
      })

      addComponent(entity, ColliderComponent)

      if (isClient) {
        addComponent(entity, InterpolationComponent)
      } else {
        Network.instance.worldState.createObjects.push({
          networkId: networkId,
          ownerId: uniqueId,
          prefabType: PrefabType.RigidBody,
          uniqueId,
          parameters: parameters
        })
      }
    }

    for (const entity of this.queryResults.collider.removed) {
      const colliderComponent = getComponent(entity, ColliderComponent, true)
      if (colliderComponent) {
        PhysXInstance.instance.removeBody(colliderComponent.body)
      }
    }

    for (const entity of this.queryResults.raycast.removed) {
      const raycastComponent = getComponent(entity, RaycastComponent, true)
      if (raycastComponent) {
        PhysXInstance.instance.removeRaycastQuery(raycastComponent.raycastQuery)
      }
    }

    for (const entity of this.queryResults.collider.all) {
      const collider = getMutableComponent(entity, ColliderComponent)
      const velocity = getMutableComponent(entity, VelocityComponent)
      const transform = getComponent(entity, TransformComponent)

      if (collider.body.type === BodyType.KINEMATIC) {
        velocity.velocity.subVectors(collider.body.transform.translation, transform.position)
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation })
      } else if (collider.body.type === BodyType.DYNAMIC) {
        velocity.velocity.subVectors(transform.position, collider.body.transform.translation)

        transform.position.set(
          collider.body.transform.translation.x,
          collider.body.transform.translation.y,
          collider.body.transform.translation.z
        )

        transform.rotation.set(
          collider.body.transform.rotation.x,
          collider.body.transform.rotation.y,
          collider.body.transform.rotation.z,
          collider.body.transform.rotation.w
        )
      }
    }

    // TODO: this is temporary - we should refactor all our network entity handling to be on the ECS
    for (const entity of this.queryResults.networkObject.removed) {
      const networkObject = getComponent(entity, NetworkObject, true)
      delete Network.instance.networkObjects[networkObject.networkId]
      console.log('removed prefab with id', networkObject.networkId)
    }

    PhysXInstance.instance.update()
  }
}

PhysicsSystem.queries = {
  spawnNetworkObject: {
    components: [SpawnNetworkObjectComponent, RigidBodyTagComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  collider: {
    components: [ColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  raycast: {
    components: [RaycastComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  networkObject: {
    components: [NetworkObject],
    listen: {
      added: true,
      removed: true
    }
  }
}

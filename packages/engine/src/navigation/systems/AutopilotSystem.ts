import { System, SystemAttributes } from '../../ecs/classes/System'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { Entity } from '../../ecs/classes/Entity'
import { EntityManager, FollowPathBehavior, NavMesh, Vector3 as YukaVector3, Vehicle } from 'yuka'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NavMeshComponent } from '../component/NavMeshComponent'
import { Vector3 } from 'three'

const createVehicle = (): Vehicle => {
  const vehicle = new Vehicle()
  // vehicle.navMesh = navMesh
  // TODO: use Actor speed
  vehicle.maxSpeed = 1.5
  // TODO: check this out
  vehicle.maxForce = 10

  const followPathBehavior = new FollowPathBehavior()
  followPathBehavior.active = false
  followPathBehavior.path.clear()

  vehicle.steering.add(followPathBehavior)

  return vehicle
}

const runVehicleByPath = (vehicle: Vehicle, navMesh: NavMesh, from: Vector3, to: Vector3): void => {
  const yukaFrom = new YukaVector3(from.x, from.y, from.z)
  const yukaTo = new YukaVector3(to.x, to.y, to.z)
  const path = navMesh.findPath(yukaFrom, yukaTo)

  // TODO: search by FollowPathBehavior class?
  const followPathBehavior = vehicle.steering[0]
  followPathBehavior.clear()

  for (const point of path) {
    followPathBehavior.path.add(point)
  }

  followPathBehavior.active = true
}

export class AutopilotSystem extends System {
  updateType = SystemUpdateType.Free
  entityManager: EntityManager

  constructor(attributes: SystemAttributes = {}) {
    super(attributes)
    this.entityManager = new EntityManager()
    this.reset()
  }

  reset(): void {}

  dispose(): void {
    super.dispose()
    this.reset()
  }

  execute(delta: number, time: number): void {
    // ongoing

    // register new "vehicle"s
    for (const entity of this.queryResults.ongoing.added) {
      const autopilot = getComponent(entity, AutoPilotComponent)

      this.entityManager.add(autopilot.yukaVehicle)
    }

    // cleanup removed "vehicle"s from manager
    for (const entity of this.queryResults.ongoing.removed) {
      const autopilot = getComponent(entity, AutoPilotComponent, true)

      this.entityManager.remove(autopilot.yukaVehicle)
    }

    // update Yuka.EntityManager
    if (this.queryResults.ongoing.all.length) {
      // TODO: update vehicle transform from our entity transforms?

      this.entityManager.update(delta)

      // update our entity transform from vehicle

      // TODO: handle followPath is finished
    }

    // requests
    // generate path from target.graph and create new AutoPilotComponent (or reuse existing)
    for (const entity of this.queryResults.requests.added) {
      const request = getComponent(entity, AutoPilotRequestComponent)
      const navMeshComponent = getComponent(request.navEntity, NavMeshComponent)
      if (!navMeshComponent) {
        console.error('AutopilotSystem unable to process request - navigation entity does not have NavMeshComponent')
      }

      let autopilotComponent: AutoPilotComponent
      if (hasComponent(entity, AutoPilotComponent)) {
        // reuse component
        autopilotComponent = getComponent(entity, AutoPilotComponent)
      } else {
        autopilotComponent = addComponent(entity, AutoPilotComponent, {
          yukaVehicle: createVehicle()
        })
      }
      autopilotComponent.navEntity = request.navEntity

      const { position } = getComponent(entity, TransformComponent)
      runVehicleByPath(autopilotComponent.yukaVehicle, navMeshComponent.yukaNavMesh, position, request.point)

      // TODO: "mount" player? disable movement, etc.

      removeComponent(entity, AutoPilotRequestComponent)
    }
  }

  static queries: any = {
    requests: {
      components: [AutoPilotRequestComponent],
      listen: {
        added: true
      }
    },
    ongoing: {
      components: [AutoPilotComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}

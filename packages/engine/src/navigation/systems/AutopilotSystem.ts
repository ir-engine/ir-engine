import { System, SystemAttributes } from '../../ecs/classes/System'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { Entity } from '../../ecs/classes/Entity'
import { EntityManager, FollowPathBehavior, NavMesh, Vector3 as YukaVector3, Vehicle } from 'yuka'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import {
  addComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from '../../transform/components/TransformComponent'
import { NavMeshComponent } from '../component/NavMeshComponent'
import { ConeBufferGeometry, Mesh, MeshNormalMaterial, Vector3 } from "three";
import { Object3DComponent } from "../../scene/components/Object3DComponent";
import { Engine } from "../../ecs/classes/Engine";
import { Input } from "../../input/components/Input";
import { InputType } from "../../input/enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { GamepadAxis } from "../../input/enums/InputEnums";
import { NumericalType } from "../../common/types/NumericalTypes";

const createVehicle = (): Vehicle => {
  const vehicle = new Vehicle()
  // vehicle.navMesh = navMesh
  // TODO: use Actor speed
  vehicle.maxSpeed = 1.5
  // TODO: check this out
  vehicle.maxForce = 10

  const vehicleGeometry = new ConeBufferGeometry( 0.25, 1, 16 );
  vehicleGeometry.rotateX( Math.PI * 0.5 );
  vehicleGeometry.translate( 0, 0.25, 0 );
  const vehicleMaterial = new MeshNormalMaterial();

  const vehicleMesh = new Mesh( vehicleGeometry, vehicleMaterial );
  vehicleMesh.matrixAutoUpdate = false;
  Engine.scene.add( vehicleMesh );
  vehicle.setRenderComponent( vehicleMesh, ( entity, renderComponent ) => {

    // @ts-ignore
    renderComponent.matrix.copy( entity.worldMatrix );

  } );

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
  console.log('vehicle.steering', vehicle.steering)
  const followPathBehavior = vehicle.steering.behaviors[0] as FollowPathBehavior
  followPathBehavior.path.clear()

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
        autopilotComponent = getMutableComponent(entity, AutoPilotComponent)
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

    // ongoing
    // register new "vehicle"s
    for (const entity of this.queryResults.ongoing.added) {
      console.log('REGISTER Vehicle!')
      const autopilot = getComponent(entity, AutoPilotComponent)

      this.entityManager.add(autopilot.yukaVehicle)
    }

    // cleanup removed "vehicle"s from manager
    for (const entity of this.queryResults.ongoing.removed) {
      console.log('Remove Vehicle!')
      const autopilot = getComponent(entity, AutoPilotComponent, true)

      this.entityManager.remove(autopilot.yukaVehicle)
    }

    // update Yuka.EntityManager
    if (this.queryResults.ongoing.all.length) {
      // TODO: update vehicle transform from our entity transforms?

      this.entityManager.update(delta)

      // update our entity transform from vehicle
      // this.queryResults.ongoing.all.forEach(entity => {
      //   const autopilot = getComponent(entity, AutoPilotComponent)
      //   const stick = GamepadAxis.Left;
      //   const input = getComponent(entity, Input)
      //   const velocity = autopilot.yukaVehicle.velocity.clone().normalize()
      //   const stickPosition:NumericalType = [
      //     velocity.x,
      //     velocity.z,
      //     Math.atan2(velocity.x, velocity.z)
      //   ]
      //   console.log('upd!', JSON.stringify(stickPosition))
      //   // If position not set, set it with lifecycle started
      //   if (!Engine.inputState.has(stick)) {
      //     Engine.inputState.set(stick, {
      //       type: InputType.TWODIM,
      //       value: stickPosition,
      //       lifecycleState: LifecycleValue.STARTED
      //     })
      //   } else {
      //     // If position set, check it's value
      //     const oldStickPosition = Engine.inputState.get(stick)
      //     // If it's not the same, set it and update the lifecycle value to changed
      //     if (JSON.stringify(oldStickPosition) !== JSON.stringify(stickPosition)) {
      //       // console.log('---changed');
      //       // Set type to TWODIM (two-dimensional axis) and value to a normalized -1, 1 on X and Y
      //       Engine.inputState.set(stick, {
      //         type: InputType.TWODIM,
      //         value: stickPosition,
      //         lifecycleState: LifecycleValue.CHANGED
      //       })
      //     } else {
      //       // console.log('---not changed');
      //       // Otherwise, remove it
      //       //Engine.inputState.delete(mappedKey)
      //     }
      //   }
      // })

      // TODO: handle followPath is finished
    }
  }

  static queries: any = {
    navmeshes: {
      components: [ NavMeshComponent, Object3DComponent ]
    },
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

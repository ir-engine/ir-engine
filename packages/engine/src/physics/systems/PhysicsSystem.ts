// import CANNON, { Body, ContactMaterial, Material, SAPBroadphase, Shape, Vec3, World } from 'cannon-es';
import { Mesh, Quaternion, Vector3 } from 'three';
import { isServer } from '../../common/functions/isServer';
import { Not } from '../../ecs/functions/ComponentFunctions';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { System } from '../../ecs/classes/System';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Network } from '../../networking/classes/Network';
import { Vault } from '../../networking/classes/Vault';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { serverCorrectionInterpolationBehavior, serverCorrectionBehavior, createNewCorrection } from '../behaviors/serverCorrectionBehavior';
import { interpolationBehavior, findOne } from '../behaviors/interpolationBehavior';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { onAddedInCar } from '../../templates/vehicle/behaviors/onAddedInCar';
import { onAddEndingInCar } from '../../templates/vehicle/behaviors/onAddEndingInCar';
import { onRemovedFromCar } from '../../templates/vehicle/behaviors/onRemovedFromCar';
import { onStartRemoveFromCar } from '../../templates/vehicle/behaviors/onStartRemoveFromCar';
import { onUpdatePlayerInCar } from '../../templates/vehicle/behaviors/onUpdatePlayerInCar';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { ControllerColliderComponent } from "../components/ControllerColliderComponent";
import { ColliderComponent } from '../components/ColliderComponent';
import { PlayerInCar } from '../components/PlayerInCar';
import { RigidBody } from "../components/RigidBody";
import { VehicleComponent } from "../../templates/vehicle/components/VehicleComponent";
import { InterpolationComponent } from "../components/InterpolationComponent";
import { PhysicsLifecycleState } from '../enums/PhysicsStates';
import { isClient } from '../../common/functions/isClient';
import { BodyConfig, PhysXInstance, RigidBodyProxy, SceneQuery } from "@xr3ngine/three-physx";
import { addColliderWithEntity } from '../behaviors/colliderCreateFunctions';

/**
 * @author HydraFire <github.com/HydraFire>
 */


const vec3 = new Vector3();
const lastRightGamePad = null;
const DEBUG_PHYSICS = false;
/*
const cannonDebugger = isClient ? import('cannon-es-debugger').then((module) => {
  module.default;
  console.log(module.default);
}) : null;
*/
export class PhysicsSystem extends System {
  static EVENTS = {
    PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT',
  };
  updateType = SystemUpdateType.Fixed;
  static frame: number
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate;

  static isSimulating: boolean
  static serverCorrectionForRigidBodyTick = 1000

  freezeTimes = 0
  clientSnapshotFreezeTime = 0
  serverSnapshotFreezeTime = 0

  physicsFrameRate: number;
  physicsFrameTime: number;

  constructor() {
    super();
    PhysicsSystem.instance = this;
    this.physicsFrameRate = Engine.physicsFrameRate;
    this.physicsFrameTime = 1 / this.physicsFrameRate;

    PhysicsSystem.isSimulating = isServer;
    PhysicsSystem.frame = 0;

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      PhysicsSystem.isSimulating = ev.enable;
    });
  }

  dispose(): void {
    super.dispose();
    PhysicsSystem.frame = 0;
    PhysicsSystem.instance.broadphase = null;
    // PhysicsSystem.instance = null;
  }

  execute(delta: number): void {
    this.queryResults.collider.added?.forEach(entity => {
      addColliderWithEntity(entity)
    });

    this.queryResults.collider.removed?.forEach(entity => {
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent, true);
      if (colliderComponent) {
        this.removeBody(colliderComponent.body);
      }
    });

    // Update velocity vector for Animations
    this.queryResults.character.all?.forEach(entity => {
      const lastPos = { x:0, y:0, z:0 };
      if (!hasComponent(entity, ControllerColliderComponent)) return;
      const capsule = getComponent<ControllerColliderComponent>(entity, ControllerColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent);
      if (!actor.initialized) return;
  
      const x = capsule.body.transform.translation.x - lastPos.x;
      const y = capsule.body.transform.translation.y - lastPos.y;
      const z = capsule.body.transform.translation.z - lastPos.z;
  
      if(isNaN(x)) {
        actor.animationVelocity = new Vector3(0,1,0);
        return;
      }
  
      lastPos.x = capsule.body.transform.translation.x;
      lastPos.y = capsule.body.transform.translation.y;
      lastPos.z = capsule.body.transform.translation.z;
  
      const q = new Quaternion().copy(transform.rotation).invert();
      actor.animationVelocity = new Vector3(x,y,z).applyQuaternion(q);
    });

    // RigidBody
    this.queryResults.rigidBody.added?.forEach(entity => { });

    this.queryResults.rigidBody.all?.forEach(entity => {
      if (!hasComponent(entity, ColliderComponent)) return;
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      transform.position.set(
        colliderComponent.body.transform.translation.x,
        colliderComponent.body.transform.translation.y,
        colliderComponent.body.transform.translation.z
      );
      transform.rotation.set(
        colliderComponent.body.transform.rotation.x,
        colliderComponent.body.transform.rotation.y,
        colliderComponent.body.transform.rotation.z,
        colliderComponent.body.transform.rotation.w
        );
    });

    this.queryResults.VehicleComponent.added?.forEach(entity => {
      VehicleBehavior(entity, { phase: PhysicsLifecycleState.onAdded });
    });


    this.queryResults.VehicleComponent.all?.forEach(entityCar => {
      const networkCarId = getComponent(entityCar, NetworkObject).networkId;
      VehicleBehavior(entityCar, { phase: PhysicsLifecycleState.onUpdate });

        this.queryResults.playerInCar.added?.forEach(entity => {
          const component = getComponent(entity, PlayerInCar);
          if (component.networkCarId == networkCarId)
            onAddedInCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed);
        });

        this.queryResults.playerInCar.all?.forEach(entity => {
          const component = getComponent(entity, PlayerInCar);
          if (component.networkCarId == networkCarId) {
            switch (component.state) {
              case PhysicsLifecycleState.onAddEnding:
                onAddEndingInCar(entity,  entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
              case PhysicsLifecycleState.onUpdate:
                onUpdatePlayerInCar(entity,  entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
              case PhysicsLifecycleState.onStartRemove:
                onStartRemoveFromCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
          }}
        });

        this.queryResults.playerInCar.removed?.forEach(entity => {
          let networkPlayerId
          const vehicle = getComponent(entityCar, VehicleComponent);
          if(!hasComponent(entity, NetworkObject)) {
            for (let i = 0; i < vehicle.seatPlane.length; i++) {
              if (vehicle[vehicle.seatPlane[i]] != null && !Network.instance.networkObjects[vehicle[vehicle.seatPlane[i]]]) {
                networkPlayerId = vehicle[vehicle.seatPlane[i]];
              }
            }
          } else {
            networkPlayerId = getComponent(entity, NetworkObject).networkId;
          }
          for (let i = 0; i < vehicle.seatPlane.length; i++) {
            if (networkPlayerId == vehicle[vehicle.seatPlane[i]]) {
              onRemovedFromCar(entity, entityCar, i, this.diffSpeed);
            }
          }
        });
    });

    this.queryResults.VehicleComponent.removed?.forEach(entity => {
      VehicleBehavior(entity, { phase: PhysicsLifecycleState.onRemoved });
    });

    // All about interpolation and server correction in one plase
    if (this.queryResults.serverInterpolatedCorrection.all.length > 0 && Network.instance.snapshot != undefined) {
      const snapshots = {
        interpolation: calculateInterpolation('x y z quat velocity'),
        correction: Vault.instance?.get((Network.instance.snapshot as any).timeCorrection, true),
        new: []
      }
      // console.warn(snapshots.correction);
      this.queryResults.serverInterpolatedCorrection.all?.forEach(entity => {
        // Creatr new snapshot position for next frame server correction
        createNewCorrection(entity, {
          state: snapshots.new,
          networkId: findOne(entity, null) // if dont have second pamam just return networkId
        });
        // apply previos correction values
        serverCorrectionInterpolationBehavior(entity, {
          correction: findOne(entity, snapshots.correction),
          interpolation: findOne(entity, snapshots.interpolation),
          snapshot: findOne(entity, Network.instance.snapshot),
        });
      });
      // Creatr new snapshot position for next frame server correction
      Vault.instance.add(createSnapshot(snapshots.new));
      // apply networkInterpolation values
      this.queryResults.networkInterpolation.all?.forEach(entity => {
        interpolationBehavior(entity, {
          snapshot: findOne(entity, snapshots.interpolation )
        });
      })
    }
    if(isClient && this.queryResults.serverCorrection.all.length > 0 && Network.instance.snapshot != undefined) {
      this.queryResults.serverCorrection.all?.forEach(entity => {
        serverCorrectionBehavior(entity, {
          snapshot: findOne(entity, Network.instance.snapshot),
        });
      });
    }
  }

  get gravity() {
    return { x: 0, y: -9.81, z: 0 };
  }

  set gravity(value: { x: 0, y: -9.81, z: 0 }){
    // todo
  }

  addRaycastQuery(query) { return PhysXInstance.instance.addRaycastQuery(query); };
  removeRaycastQuery(query) { return PhysXInstance.instance.removeRaycastQuery(query); };
  addBody(args) { return PhysXInstance.instance.addBody(args); };
  updateBody(body, options) { return PhysXInstance.instance.updateBody(body, options); };
  removeBody(body) { return PhysXInstance.instance.removeBody(body); };
  createController(options) { return PhysXInstance.instance.createController(options); };
  updateController(body, config) { return PhysXInstance.instance.updateController(body, config); };
  removeController(id) { return PhysXInstance.instance.removeController(id); };
}

PhysicsSystem.queries = {
  character: {
    components: [LocalInputReceiver, ControllerColliderComponent, CharacterComponent, NetworkObject],
  },
  serverInterpolatedCorrection: {
    components: [LocalInputReceiver, InterpolationComponent, NetworkObject],
  },
  serverCorrection: {
    components: [Not(InterpolationComponent), NetworkObject],
  },
  networkInterpolation: {
    components: [Not(LocalInputReceiver), InterpolationComponent, NetworkObject],
  },
  collider: {
    components: [ColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  rigidBody: {
    components: [RigidBody, TransformComponent],
    listen: {
      added: true
    }
  },
  VehicleComponent: {
    components: [VehicleComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  playerInCar: {
    components: [PlayerInCar],
    listen: {
      added: true,
      removed: true
    }
  }
};

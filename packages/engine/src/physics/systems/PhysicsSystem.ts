import CANNON, { Body, ContactMaterial, Material, SAPBroadphase, Shape, Vec3, World } from 'cannon-es';
import { Mesh, Vector3 } from 'three';
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
import { serverCorrectionBehavior, createNewCorrection } from '../behaviors/serverCorrectionBehavior';
import { interpolationBehavior, findOne } from '../behaviors/interpolationBehavior';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { onAddedInCar } from '../../templates/vehicle/behaviors/onAddedInCar';
import { onAddEndingInCar } from '../../templates/vehicle/behaviors/onAddEndingInCar';
import { onRemovedFromCar } from '../../templates/vehicle/behaviors/onRemovedFromCar';
import { onStartRemoveFromCar } from '../../templates/vehicle/behaviors/onStartRemoveFromCar';
import { onUpdatePlayerInCar } from '../../templates/vehicle/behaviors/onUpdatePlayerInCar';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { capsuleColliderBehavior, updateVelocityVector } from '../behaviors/capsuleColliderBehavior';
import { handleCollider } from '../behaviors/ColliderBehavior';
import { RigidBodyBehavior } from '../behaviors/RigidBodyBehavior';
import { VehicleBehavior } from '../behaviors/VehicleBehavior';
import { CapsuleCollider } from "../components/CapsuleCollider";
import { ColliderComponent } from '../components/ColliderComponent';
import { PlayerInCar } from '../components/PlayerInCar';
import { RigidBody } from "../components/RigidBody";
import { VehicleBody } from "../components/VehicleBody";
import { InterpolationComponent } from "../components/InterpolationComponent";


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

  static physicsWorld: World
  static simulate: boolean
  static serverOnlyRigidBodyCollides: boolean
  static serverCorrectionForRigidBodyTick = 1000

  freezeTimes = 0
  clientSnapshotFreezeTime = 0
  serverSnapshotFreezeTime = 0

  groundMaterial = new Material('groundMaterial')
  wheelMaterial = new Material('wheelMaterial')
  trimMeshMaterial = new Material('trimMeshMaterial')

  wheelGroundContactMaterial = new ContactMaterial(this.wheelMaterial, this.groundMaterial, {
    friction: 0.3,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8
  })

  parallelPairs: any[];
  physicsFrameRate: number;
  physicsFrameTime: number;
  physicsMaxPrediction: number;
  constructor() {
    super();
    this.physicsFrameRate = Engine.physicsFrameRate;
    this.physicsFrameTime = 1 / this.physicsFrameRate;
    this.physicsMaxPrediction = this.physicsFrameRate;
    PhysicsSystem.serverOnlyRigidBodyCollides = false;
    // Physics
    PhysicsSystem.simulate = isServer;
    PhysicsSystem.frame = 0;
    PhysicsSystem.physicsWorld = new World();
    PhysicsSystem.physicsWorld.allowSleep = false;
    PhysicsSystem.physicsWorld.gravity.set(0, -9.81, 0);
    PhysicsSystem.physicsWorld.broadphase = new SAPBroadphase(PhysicsSystem.physicsWorld);

    this.parallelPairs = [];

    const DebugOptions = {
      onInit: (body: Body, mesh: Mesh, shape: Shape) => {
        // console.log("PH INIT: body: ", body, " | mesh: ", mesh, " | shape: ", shape)
      },
      onUpdate: (body: Body, mesh: Mesh, shape: Shape) => {
        //console.log("PH  UPD: body position: ", body.position, " | body: ", body, " | mesh: ", mesh, " | shape: ", shape) }
      }
    };

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      PhysicsSystem.simulate = ev.enable;
    });

    // window["physicsDebugView"] = () => {
    //   debug(Engine.scene, PhysicsSystem.physicsWorld.bodies, DebugOptions);
    // };
    // if (DEBUG_PHYSICS) {
    //   debug(Engine.scene, PhysicsSystem.physicsWorld.bodies, DebugOptions);
    // }
  }

  dispose(): void {
    super.dispose();
    this.groundMaterial = null;
    this.wheelMaterial = null;
    this.trimMeshMaterial = null;
    this.wheelGroundContactMaterial = null;
    PhysicsSystem.frame = 0;
    PhysicsSystem.physicsWorld.broadphase = null;
    // PhysicsSystem.physicsWorld = null;
  }

  execute(delta: number): void {

    // Collider

    this.queryResults.collider.added?.forEach(entity => {
      handleCollider(entity, { phase: 'onAdded' });
    });

    this.queryResults.collider.removed?.forEach(entity => {
      handleCollider(entity, { phase: 'onRemoved' });
    });

    // Capsule

    this.queryResults.capsuleCollider.all?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.capsuleCollider.all?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onUpdate' });
    });

    this.queryResults.capsuleCollider.removed?.forEach(entity => {
      capsuleColliderBehavior(entity, { phase: 'onRemoved' });
    });

    // Update velocity vector for Animations
    this.queryResults.character.all?.forEach(entity => {
      updateVelocityVector(entity, { phase: 'onUpdate' });
    });

    // RigidBody
    this.queryResults.rigidBody.added?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onAdded' });
    });

    this.queryResults.rigidBody.all?.forEach(entity => {
      RigidBodyBehavior(entity, { phase: 'onUpdate' });
    });

    // Vehicle

    this.queryResults.vehicleBody.added?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onAdded' });
    });


    this.queryResults.vehicleBody.all?.forEach(entityCar => {
      const networkCarId = getComponent(entityCar, NetworkObject).networkId;
      VehicleBehavior(entityCar, { phase: 'onUpdate' });

        this.queryResults.playerInCar.added?.forEach(entity => {
          const component = getComponent(entity, PlayerInCar);
          if (component.networkCarId == networkCarId)
            onAddedInCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed);
        });

        this.queryResults.playerInCar.all?.forEach(entity => {
          const component = getComponent(entity, PlayerInCar);
          if (component.networkCarId == networkCarId) {
            switch (component.state) {
              case 'onAddEnding':
                onAddEndingInCar(entity,  entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
              case 'onUpdate':
                onUpdatePlayerInCar(entity,  entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
              case 'onStartRemove':
                onStartRemoveFromCar(entity, entityCar, component.currentFocusedPart, this.diffSpeed);
                break;
          }}
        });

        this.queryResults.playerInCar.removed?.forEach(entity => {
          let networkPlayerId
          const vehicle = getComponent(entityCar, VehicleBody);
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

    this.queryResults.vehicleBody.removed?.forEach(entity => {
      VehicleBehavior(entity, { phase: 'onRemoved' });
    });

    // All about interpolation and server correction in one plase
    if (this.queryResults.serverCorrection.all.length > 0 && Network.instance.snapshot != undefined) {
      const snapshots = {
        interpolation: calculateInterpolation('x y z quat velocity'),
        correction: Vault.instance?.get((Network.instance.snapshot as any).timeCorrection, true),
        new: []
      }
      // console.warn(snapshots.correction);
      this.queryResults.serverCorrection.all?.forEach(entity => {
        // Creatr new snapshot position for next frame server correction
        createNewCorrection(entity, {
          state: snapshots.new,
          networkId: findOne(entity, null) // if dont have second pamam just return networkId
        });
        // apply previos correction values
        serverCorrectionBehavior(entity, {
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

    if (PhysicsSystem.simulate) { // pause physics until loading all component scene
      PhysicsSystem.frame++;
      PhysicsSystem.physicsWorld.step(this.physicsFrameTime);
    }
  }
}

PhysicsSystem.queries = {
  character: {
    components: [LocalInputReceiver, CapsuleCollider, CharacterComponent, NetworkObject],
  },
  serverCorrection: {
    components: [LocalInputReceiver, InterpolationComponent, NetworkObject],
  },
  networkInterpolation: {
    components: [Not(LocalInputReceiver), InterpolationComponent, NetworkObject],
  },
  capsuleCollider: {
    components: [CapsuleCollider, TransformComponent],
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
  rigidBody: {
    components: [RigidBody, TransformComponent],
    listen: {
      added: true
    }
  },
  vehicleBody: {
    components: [VehicleBody, TransformComponent],
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
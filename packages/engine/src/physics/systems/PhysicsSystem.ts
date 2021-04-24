import { Quaternion, Vector3 } from 'three';
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
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ControllerColliderComponent } from "../components/ControllerColliderComponent";
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBodyComponent } from "../components/RigidBody";
import { InterpolationComponent } from "../components/InterpolationComponent";
import { isClient } from '../../common/functions/isClient';
import { PhysXInstance } from "@xr3ngine/three-physx";
import { addColliderWithEntity } from '../behaviors/colliderCreateFunctions';
import { findInterpolationSnapshot } from '../behaviors/findInterpolationSnapshot';

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
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
    PhysXInstance.instance.startPhysX(isServer);
    PhysicsSystem.frame = 0;

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      PhysicsSystem.isSimulating = ev.enable;
      PhysXInstance.instance.startPhysX(ev.enable);
    });
  }

  dispose(): void {
    super.dispose();
    PhysicsSystem.frame = 0;
    PhysicsSystem.instance.broadphase = null;
  }

  execute(delta: number): void {
    this.queryResults.collider.added?.forEach(entity => {
      addColliderWithEntity(entity)
    });

    this.queryResults.collider.all?.forEach(entity => { });

    this.queryResults.collider.removed?.forEach(entity => {
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent, true);
      if (colliderComponent) {
        this.removeBody(colliderComponent.body);
      }
    });

    // RigidBody
    this.queryResults.rigidBody.added?.forEach(entity => { 
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
      console.log(colliderComponent.body)
    });

    this.queryResults.rigidBody.all?.forEach(entity => {
      if (!hasComponent(entity, ColliderComponent)) return;
      const collider = getComponent<ColliderComponent>(entity, ColliderComponent);
      const transform = getComponent<TransformComponent>(entity, TransformComponent);
      transform.position.set(
        collider.body.transform.translation.x,
        collider.body.transform.translation.y,
        collider.body.transform.translation.z
      );
      transform.rotation.set(
        collider.body.transform.rotation.x,
        collider.body.transform.rotation.y,
        collider.body.transform.rotation.z,
        collider.body.transform.rotation.w
        );
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
        const interpolationComponent = getComponent<InterpolationComponent>(entity, InterpolationComponent);
        interpolationComponent.schema.serverCorrectionBehavior(entity, {
          state: snapshots.new,
          networkId: findInterpolationSnapshot(entity, null),
          correction: findInterpolationSnapshot(entity, snapshots.correction),
          interpolation: findInterpolationSnapshot(entity, snapshots.interpolation),
          snapshot: findInterpolationSnapshot(entity, Network.instance.snapshot),
        })
      });
      // Creatr new snapshot position for next frame server correction
      Vault.instance.add(createSnapshot(snapshots.new));
      // apply networkInterpolation values
      this.queryResults.networkInterpolation.all?.forEach(entity => {
        const interpolation = getComponent(entity, InterpolationComponent);
        interpolation.schema.interpolationBehavior(entity, {
          snapshot: findInterpolationSnapshot(entity, snapshots.interpolation )
        });
      })
    }
    if(isClient && this.queryResults.serverCorrection.all.length > 0 && Network.instance.snapshot != undefined) {
      this.queryResults.serverCorrection.all?.forEach(entity => {
        const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot);
        if (snapshot == null) return;
        const collider = getMutableComponent(entity, ColliderComponent)
        if (collider) {
          collider.body.updateTransform({
            translation: {
              x: snapshot.x,
              y: snapshot.y,
              z: snapshot.z,
            },
            rotation: {
              x: snapshot.qX,
              y: snapshot.qY,
              z: snapshot.qZ,
              w: snapshot.qW,
            }
          });
        }
      });
    }
    PhysXInstance.instance.update();
  }

  get gravity() {
    return { x: 0, y: -9.81, z: 0 };
  }

  set gravity(value: { x: number, y: number, z: number }){
    // todo
  }

  addRaycastQuery(query) { return PhysXInstance.instance.addRaycastQuery(query); }
  removeRaycastQuery(query) { return PhysXInstance.instance.removeRaycastQuery(query); }
  addBody(args) { return PhysXInstance.instance.addBody(args); }
  removeBody(body) { return PhysXInstance.instance.removeBody(body); }
  createController(options) { return PhysXInstance.instance.createController(options); }
  removeController(id) { return PhysXInstance.instance.removeController(id); }
}

PhysicsSystem.queries = {
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
    components: [RigidBodyComponent, TransformComponent],
    listen: {
      added: true
    }
  },
};

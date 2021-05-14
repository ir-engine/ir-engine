import { Not } from '../../ecs/functions/ComponentFunctions';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { System, SystemAttributes } from '../../ecs/classes/System';
import { getComponent, getMutableComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType';
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Network } from '../../networking/classes/Network';
import { Vault } from '../../networking/classes/Vault';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { calculateInterpolation, createSnapshot, snapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { RigidBodyComponent } from "../components/RigidBody";
import { InterpolationComponent } from "../components/InterpolationComponent";
import { isClient } from '../../common/functions/isClient';
import { ColliderHitEvent, CollisionEvents, PhysXConfig, PhysXInstance } from "three-physx";
import { addColliderWithEntity } from '../behaviors/colliderCreateFunctions';
import { findInterpolationSnapshot } from '../behaviors/findInterpolationSnapshot';
import { HaveBeenCollision } from "../../game/actions/HaveBeenCollision";
import { GameObject } from "../../game/components/GameObject";
import { addActionComponent } from '../../game/functions/functionsActions';
/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */
export class PhysicsSystem extends System {
  static EVENTS = {
    PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT',
  };
  instance: PhysicsSystem;
  updateType = SystemUpdateType.Fixed;
  frame: number
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate;

  isSimulating: boolean
  serverCorrectionForRigidBodyTick = 1000

  freezeTimes = 0
  clientSnapshotFreezeTime = 0
  serverSnapshotFreezeTime = 0

  physicsFrameRate: number;
  physicsFrameTime: number;
  physicsWorldConfig: PhysXConfig;
  worker: Worker;

  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    PhysicsSystem.instance = this;
    this.physicsFrameRate = Engine.physicsFrameRate;
    this.physicsFrameTime = 1 / this.physicsFrameRate;
    this.physicsWorldConfig = attributes.physicsWorldConfig ?? {
      tps: 120,
      lengthScale: 1000,
      start: false
    }
    this.worker = attributes.worker;

    this.isSimulating = false;
    this.frame = 0;

    this.physicsWorldConfig = attributes.physicsWorldConfig ?? {
      tps: 120,
      lengthScale: 1000,
      start: false
    }
    this.worker = attributes.worker;

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      this.isSimulating = ev.enable;
      PhysXInstance.instance.startPhysX(ev.enable);
    });
  }

  async initialize() {
    await PhysXInstance.instance.initPhysX(this.worker, this.physicsWorldConfig);
  }

  dispose(): void {
    super.dispose();
    this.frame = 0;
    this.broadphase = null;
    EngineEvents.instance.removeAllListenersForEvent(PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT);
  }

  execute(delta: number): void {
    this.queryResults.collider.added?.forEach(entity => {
      const collider = getComponent(entity, ColliderComponent);
      if(!collider.body) {
        addColliderWithEntity(entity)
      }
      collider.body.addEventListener(CollisionEvents.COLLISION_START, (ev: ColliderHitEvent) => {
        collider.collisions.push(ev);
      })
      collider.body.addEventListener(CollisionEvents.COLLISION_PERSIST, (ev: ColliderHitEvent) => {
        collider.collisions.push(ev);
      })
      collider.body.addEventListener(CollisionEvents.COLLISION_END, (ev: ColliderHitEvent) => {
        collider.collisions.push(ev);
      })

    });

    this.queryResults.collider.all?.forEach(entity => {

      const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
      // iterate on all collisions since the last update
      collider.collisions.forEach((event) => {
        const { type, bodySelf, bodyOther, shapeSelf, shapeOther } = event;
        console.warn(type, bodySelf, bodyOther, shapeSelf, shapeOther);
        if (hasComponent(entity, GameObject)) {
          addActionComponent(entity, HaveBeenCollision);
          console.warn(event, entity);
        }
        // TODO: figure out how we expose specific behaviors like this
      })
      collider.collisions = []; // clear for next loop

    });

    this.queryResults.collider.removed?.forEach(entity => {
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent, true);
      if (colliderComponent) {
        this.removeBody(colliderComponent.body);
      }
    });

    // RigidBody
    // this.queryResults.rigidBody.added?.forEach(entity => {
    //   const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent);
      // console.log(colliderComponent.body)
    // });

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

    if (isClient && Network.instance?.snapshot) {
      // Interpolate between the current client's data with what the server has sent via snapshots
      const snapshots = {
        interpolation: calculateInterpolation('x y z quat velocity'),
        correction: Vault.instance?.get((Network.instance.snapshot as any).timeCorrection, true),
        new: []
      }
      // console.warn(snapshots.correction);
      this.queryResults.localClientInterpolation.all?.forEach(entity => {
        // Creatr new snapshot position for next frame server correction
        const interpolationComponent = getComponent<InterpolationComponent>(entity, InterpolationComponent);
        interpolationComponent.schema.serverCorrectionBehavior(entity, snapshots, delta);
      });
      // Create new snapshot position for next frame server correction
      Vault.instance.add(createSnapshot(snapshots.new));
      // apply networkInterpolation values
      this.queryResults.networkInterpolation.all?.forEach(entity => {
        const interpolation = getComponent(entity, InterpolationComponent);
        interpolation.schema.interpolationBehavior(entity, snapshots);
      })

      // If a networked entity does not have an interpolation component, just copy the data
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

  set gravity(value: { x: number, y: number, z: number }) {
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
  localClientInterpolation: {
    components: [LocalInputReceiver, InterpolationComponent, NetworkObject],
  },
  networkInterpolation: {
    components: [Not(LocalInputReceiver), InterpolationComponent, NetworkObject],
  },
  serverCorrection: {
    components: [Not(InterpolationComponent), NetworkObject],
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

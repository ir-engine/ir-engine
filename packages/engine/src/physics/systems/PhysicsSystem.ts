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
import { calculateInterpolation, createSnapshot } from '../../networking/functions/NetworkInterpolationFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { InterpolationComponent } from "../components/InterpolationComponent";
import { isClient } from '../../common/functions/isClient';
import { BodyType, ColliderHitEvent, CollisionEvents, PhysXConfig, PhysXInstance } from "three-physx";
import { findInterpolationSnapshot } from '../behaviors/findInterpolationSnapshot';
import { UserControlledColliderComponent } from '../components/UserControllerObjectComponent';
import { GameObjectCollisionTag } from "../../game/actions/GameObjectCollisionTag";
import { GameObject } from "../../game/components/GameObject";
import { addActionComponent } from '../../game/functions/functionsActions';
import { Vector3 } from 'three';

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

const vec3 = new Vector3();


export class PhysicsSystem extends System {
  static EVENTS = {
    PORTAL_REDIRECT_EVENT: 'PHYSICS_SYSTEM_PORTAL_REDIRECT',
  };
  static instance: PhysicsSystem;
  updateType = SystemUpdateType.Fixed;
  frame: number
  diffSpeed: number = Engine.physicsFrameRate / Engine.networkFramerate;

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
      // lengthScale: 1,
      start: false
    }
    this.worker = attributes.worker;
    this.frame = 0;

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.ENABLE_SCENE, (ev: any) => {
      PhysXInstance.instance.startPhysX(ev.physics);
    });

    if (!PhysXInstance.instance) {
      PhysXInstance.instance = new PhysXInstance();
    }
  }

  async initialize() {
    await PhysXInstance.instance.initPhysX(this.worker, this.physicsWorldConfig);
  }

  dispose(): void {
    super.dispose();
    this.frame = 0;
    EngineEvents.instance.removeAllListenersForEvent(PhysicsSystem.EVENTS.PORTAL_REDIRECT_EVENT);
    PhysXInstance.instance.dispose();
  }

  execute(delta: number): void {

    this.queryResults.collider.all?.forEach(entity => {
      const collider = getMutableComponent<ColliderComponent>(entity, ColliderComponent);
      // iterate on all collisions since the last update
      // collider.body.collisionEvents.forEach((event) => {

        // if (hasComponent(entity, GameObject)) {
          //  const { type, bodySelf, bodyOther, shapeSelf, shapeOther } = event;
          //  isClient ? console.warn(type, bodySelf, bodyOther, shapeSelf, shapeOther):'';
          // addActionComponent(entity, HasHadCollision);
          //    console.warn(event, entity);
        // }
        // TODO: figure out how we expose specific behaviors like this
      // })

      const transform = getComponent(entity, TransformComponent);
      if (collider.body.type === BodyType.KINEMATIC) {
        collider.velocity.subVectors(collider.body.transform.translation, transform.position);
        collider.body.updateTransform({ translation: transform.position, rotation: transform.rotation });
      } else {
        collider.velocity.subVectors(transform.position, collider.body.transform.translation);
        transform.position.set(
          collider.body.transform.translation.x,
          collider.body.transform.translation.y,
          collider.body.transform.translation.z
        );
        collider.position.copy(transform.position)
        transform.rotation.set(
          collider.body.transform.rotation.x,
          collider.body.transform.rotation.y,
          collider.body.transform.rotation.z,
          collider.body.transform.rotation.w
        );
        collider.quaternion.copy(transform.rotation)
      }
    });

    this.queryResults.collider.removed?.forEach(entity => {
      const colliderComponent = getComponent<ColliderComponent>(entity, ColliderComponent, true);
      if (colliderComponent) {
        this.removeBody(colliderComponent.body);
      }
    });

    if (isClient) {
      if (!Network.instance.snapshot) return;
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
      // apply networkObjectInterpolation values
      this.queryResults.networkObjectInterpolation.all?.forEach(entity => {
        const interpolation = getComponent(entity, InterpolationComponent);
        interpolation.schema.interpolationBehavior(entity, snapshots);
      })

      // If a networked entity does not have an interpolation component, just copy the data
      this.queryResults.correctionFromServer.all?.forEach(entity => {
        // ignore interpolation on client for objects we are the primary simulator of
        const userControlled = getComponent(entity, UserControlledColliderComponent)
        if (userControlled && userControlled.ownerNetworkId === Network.instance.localAvatarNetworkId) {
          const ownerNetworkId = userControlled.ownerNetworkId;
          const networkObject = getMutableComponent(entity, NetworkObject);
          if (Network.instance.localAvatarNetworkId === ownerNetworkId) {
            const collider = getMutableComponent(entity, ColliderComponent);
            Network.instance.clientInputState.transforms.push({
              networkId: networkObject.networkId,
              x: collider.body.transform.translation.x,
              y: collider.body.transform.translation.y,
              z: collider.body.transform.translation.z,
              qX: collider.body.transform.rotation.x,
              qY: collider.body.transform.rotation.y,
              qZ: collider.body.transform.rotation.z,
              qW: collider.body.transform.rotation.w,
              snapShotTime: networkObject.snapShotTime,
            });
            return;
          }
        }
        const snapshot = findInterpolationSnapshot(entity, Network.instance.snapshot);
        if (snapshot == null) return;
        const collider = getMutableComponent(entity, ColliderComponent)
        // dynamic objects should be interpolated, kinematic objects should not
        if (collider && collider.body.type !== BodyType.KINEMATIC) {
          collider.velocity.subVectors(collider.body.transform.translation, vec3.set(snapshot.x, snapshot.y, snapshot.z));
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
  networkObjectInterpolation: {
    components: [Not(LocalInputReceiver), InterpolationComponent, NetworkObject],
  },
  correctionFromServer: {
    components: [Not(InterpolationComponent), NetworkObject],
  },
  collider: {
    components: [ColliderComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};

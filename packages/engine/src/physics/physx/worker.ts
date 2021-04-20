///<reference path="./types/PhysX.d.ts"/>

import { Matrix4, Vector3, Quaternion } from 'three';
import { getShape } from './getShape';
import { PhysXConfig, PhysXBodyType, BodyConfig, Transform, RigidBodyProxy, ShapeConfig, PhysXShapeConfig, ControllerConfig, Vec3, SceneQuery, SceneQueryType, RaycastHit, CollisionEvents, ControllerEvents } from './types/ThreePhysX';
import { MessageQueue } from './utils/MessageQueue';
import * as BufferConfig from './BufferConfig';

const mat4 = new Matrix4();
const pos = new Vector3();
const quat = new Quaternion();
const scale = new Vector3();

let lastTick = 0;

export class PhysXManager {
  static instance: PhysXManager;

  physxVersion: number;
  defaultErrorCallback: PhysX.PxDefaultErrorCallback;
  allocator: PhysX.PxDefaultAllocator;
  foundation: PhysX.PxFoundation;
  cookingParamas: PhysX.PxCookingParams;
  cooking: PhysX.PxCooking;
  physics: PhysX.PxPhysics;
  scale: PhysX.PxTolerancesScale;
  sceneDesc: PhysX.PxSceneDesc;
  scene: PhysX.PxScene;
  controllerManager: PhysX.PxControllerManager;

  updateInterval: any;
  tps = 60;
  onUpdate: any;
  onEvent: any;
  transformArray: Float32Array;

  bodies: Map<number, PhysX.PxRigidActor> = new Map<number, PhysX.PxRigidActor>();
  dynamic: Map<number, PhysX.PxRigidActor> = new Map<number, PhysX.PxRigidActor>();
  shapes: Map<number, PhysX.PxShape> = new Map<number, PhysX.PxShape>();
  shapeIDByPointer: Map<number, number> = new Map<number, number>();
  controllerIDByPointer: Map<number, number> = new Map<number, number>();
  bodyShapes: Map<number, PhysX.PxShape[]> = new Map<number, PhysX.PxShape[]>();
  matrices: Map<number, Matrix4> = new Map<number, Matrix4>();
  indices: Map<number, number> = new Map<number, number>();
  controllers: Map<number, PhysX.PxController> = new Map<number, PhysX.PxController>();
  raycasts: Map<number, SceneQuery> = new Map<number, SceneQuery>();
  // constraints: // TODO

  initPhysX = async (config: PhysXConfig): Promise<void> => {
    //@ts-ignore
    importScripts(config.jsPath);
    if (config?.tps) {
      this.tps = config.tps;
    }
    (globalThis as any).PhysX = await new (globalThis as any).PHYSX({
      locateFile: () => {
        return config.wasmPath;
      },
    });
    this.physxVersion = PhysX.PX_PHYSICS_VERSION;
    this.defaultErrorCallback = new PhysX.PxDefaultErrorCallback();
    this.allocator = new PhysX.PxDefaultAllocator();
    const tolerance = new PhysX.PxTolerancesScale();
    tolerance.length = 0.01;
    this.foundation = PhysX.PxCreateFoundation(this.physxVersion, this.allocator, this.defaultErrorCallback);
    this.cookingParamas = new PhysX.PxCookingParams(tolerance);
    this.cooking = PhysX.PxCreateCooking(this.physxVersion, this.foundation, this.cookingParamas);
    this.physics = PhysX.PxCreatePhysics(this.physxVersion, this.foundation, tolerance, false, null);

    const triggerCallback = {
      onContactBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_START,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onContactEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_END,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onContactPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_PERSIST,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onTriggerBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.TRIGGER_START,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
      onTriggerEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.TRIGGER_END,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
        });
      },
    };

    this.scale = this.physics.getTolerancesScale();
    if (config.lengthScale) {
      this.scale.length = config.lengthScale;
    }
    this.sceneDesc = PhysX.getDefaultSceneDesc(this.scale, 0, PhysX.PxSimulationEventCallback.implement(triggerCallback as any));
    this.sceneDesc.bounceThresholdVelocity = 0.001;

    this.scene = this.physics.createScene(this.sceneDesc);
    this.controllerManager = PhysX.PxCreateControllerManager(this.scene, false);

    if (config.start) {
      this.startPhysX(true);
    }
  };

  simulate = async () => {
    const now = Date.now();
    const delta = now - lastTick;
    this.scene.simulate(delta / 1000, true);
    this.scene.fetchResults(true);
    const bodyArray = new Float32Array(new ArrayBuffer(4 * BufferConfig.BODY_DATA_SIZE * this.bodies.size));
    let offset = 0;
    this.bodies.forEach((body: PhysX.PxRigidActor, id: number) => {
      bodyArray.set([id], offset);
      if (isDynamicBody(body)) {
        bodyArray.set([...getBodyData(body)], offset + 1);
      } else if (isControllerBody(body)) {
        const controller = this.controllers.get(id);
        const { x, y, z } = controller.getPosition();
        bodyArray.set([x, y, z, ...(controller as any)._collisions], offset + 1);
      }
      offset += BufferConfig.BODY_DATA_SIZE;
    });
    const raycastResults = {};
    this.raycasts.forEach((raycastQuery, id) => {
      const hits = this._getRaycastResults(raycastQuery);
      raycastResults[id] = hits;
    });
    this.onUpdate({ raycastResults, bodyArray }); //, shapeArray);
    lastTick = now;
  };

  update = async (kinematicBodiesArray: Float32Array, controllerBodiesArray: Float32Array, raycastQueryArray: Float32Array) => {
    let offset = 0;
    while (offset < kinematicBodiesArray.length) {
      const id = kinematicBodiesArray[offset];
      const body = this.bodies.get(id) as PhysX.PxRigidDynamic;
      if (!body) return;

      const currentPose = body.getGlobalPose();
      currentPose.translation.x = kinematicBodiesArray[offset + 1];
      currentPose.translation.y = kinematicBodiesArray[offset + 2];
      currentPose.translation.z = kinematicBodiesArray[offset + 3];
      currentPose.rotation.x = kinematicBodiesArray[offset + 4];
      currentPose.rotation.y = kinematicBodiesArray[offset + 5];
      currentPose.rotation.z = kinematicBodiesArray[offset + 6];
      currentPose.rotation.w = kinematicBodiesArray[offset + 7];
      body.setKinematicTarget(currentPose);
      body.setGlobalPose(currentPose, true);
      offset += BufferConfig.KINEMATIC_DATA_SIZE;
    }
    offset = 0;
    while (offset < controllerBodiesArray.length) {
      const id = controllerBodiesArray[offset];
      const controller = this.controllers.get(id) as PhysX.PxController;
      if (!controller) return;
      const deltaPos = {
        x: controllerBodiesArray[offset + 1],
        y: controllerBodiesArray[offset + 2],
        z: controllerBodiesArray[offset + 3],
      };
      const deltaTime = controllerBodiesArray[offset + 4];
      const filters = new PhysX.PxControllerFilters((controller as any)._filterData, (controller as any)._queryCallback, null);
      const collisionFlags = controller.move(deltaPos, 0.01, deltaTime, filters, null);
      const collisions = {
        down: collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_DOWN) ? 1 : 0,
        sides: collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_SIDES) ? 1 : 0,
        up: collisionFlags.isSet(PhysX.PxControllerCollisionFlag.eCOLLISION_UP) ? 1 : 0,
      };
      (controller as any)._collisions = [collisions.down, collisions.sides, collisions.up];
      offset += BufferConfig.CONTROLLER_DATA_SIZE;
    }
    offset = 0;
    while (offset < raycastQueryArray.length) {
      const id = raycastQueryArray[offset];
      const raycast = this.raycasts.get(id);
      if (!raycast) return;
      const newOriginPos = {
        x: raycastQueryArray[offset + 1],
        y: raycastQueryArray[offset + 2],
        z: raycastQueryArray[offset + 3],
      };
      raycast.origin = newOriginPos;
      offset += BufferConfig.RAYCAST_DATA_SIZE;
    }
  };

  startPhysX = async (start = true) => {
    if (start) {
      lastTick = Date.now();
      this.updateInterval = setInterval(this.simulate, 1000 / this.tps);
    } else {
      clearInterval(this.updateInterval);
    }
  };

  addBody = async ({ id, transform, shapes, options }: RigidBodyProxy) => {
    const { type } = options;

    let rigidBody: PhysX.PxRigidStatic | PhysX.PxRigidDynamic;

    if (type === PhysXBodyType.STATIC) {
      rigidBody = this.physics.createRigidStatic(transform);
    } else {
      rigidBody = this.physics.createRigidDynamic(transform);
    }
    (rigidBody as any)._type = type;

    const bodyShapes: PhysX.PxShape[] = [];
    shapes.forEach(({ id: shapeID, shape, transform, options, config }: PhysXShapeConfig) => {
      const bodyShape = getShape({
        shape,
        transform,
        options,
      });
      if (!bodyShape) return;
      bodyShape.setContactOffset(config.contactOffset ?? 0.0000001);
      let collisionLayer = defaultMask;
      let collisionMask = defaultMask;
      if (typeof config.collisionLayer !== 'undefined') {
        collisionLayer = config.collisionLayer;
        (shape as any)._collisionLayer = collisionLayer;
      }
      if (typeof config.collisionMask !== 'undefined') {
        collisionMask = config.collisionMask;
        (shape as any)._collisionMask = collisionMask;
      }
      bodyShape.setSimulationFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0));
      bodyShapes.push(bodyShape);
      rigidBody.attachShape(bodyShape);
      this.shapeIDByPointer.set(bodyShape.$$.ptr, shapeID);
      this.shapes.set(shapeID, bodyShape);
      this._updateShape(config);
    });

    this.bodyShapes.set(id, bodyShapes);
    this.bodies.set(id, rigidBody);
    this.scene.addActor(rigidBody, null);

    delete options.type;
    this.updateBody({ id, options });
  };

  updateBody = async ({ id, options }: { id: number; options: BodyConfig }) => {
    const body = this.bodies.get(id);
    if (!isStaticBody(body)) {
      if (typeof options.type !== 'undefined') {
        const transform = body.getGlobalPose();
        if (options.type === PhysXBodyType.KINEMATIC) {
          (body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, true);
          (body as any)._type = PhysXBodyType.KINEMATIC;
        } else {
          (body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, false);
          (body as any)._type = PhysXBodyType.DYNAMIC;
        }
        body.setGlobalPose(transform, true);
      }
      if (options.mass) {
        (body as PhysX.PxRigidDynamic).setMass(options.mass);
      }
      if (options.linearDamping) {
        (body as PhysX.PxRigidDynamic).setLinearDamping(options.linearDamping);
      }
      if (options.angularDamping) {
        (body as PhysX.PxRigidDynamic).setAngularDamping(options.angularDamping);
      }
    }
    if (options.linearVelocity) {
      const linearVelocity = body.getLinearVelocity();
      body.setLinearVelocity({ x: options.linearVelocity.x ?? linearVelocity.x, y: options.linearVelocity.y ?? linearVelocity.x, z: options.linearVelocity.z ?? linearVelocity.z }, true);
    }
    if (options.angularVelocity) {
      const angularVelocity = body.getAngularVelocity();
      body.setAngularVelocity({ x: options.angularVelocity.x ?? angularVelocity.x, y: options.angularVelocity.y ?? angularVelocity.x, z: options.angularVelocity.z ?? angularVelocity.z }, true);
    }
    if (options.transform) {
      const transform = body.getGlobalPose();
      transform.translation.x = options.transform.translation.x ?? transform.translation.x;
      transform.translation.y = options.transform.translation.y ?? transform.translation.y;
      transform.translation.z = options.transform.translation.z ?? transform.translation.z;
      transform.rotation.x = options.transform.rotation.x ?? transform.rotation.x;
      transform.rotation.y = options.transform.rotation.y ?? transform.rotation.y;
      transform.rotation.z = options.transform.rotation.z ?? transform.rotation.z;
      transform.rotation.w = options.transform.rotation.w ?? transform.rotation.w;
      body.setGlobalPose(transform, true);
    }
    options.shapes?.forEach(this._updateShape);
  };

  _updateShape({ id, isTrigger, contactOffset, collisionLayer, collisionMask, material }: ShapeConfig) {
    const shape = this.shapes.get(id);
    if (!shape) return;
    if (typeof isTrigger !== 'undefined') {
      shape.setFlag(PhysX.PxShapeFlag.eSIMULATION_SHAPE, !isTrigger);
      shape.setFlag(PhysX.PxShapeFlag.eTRIGGER_SHAPE, isTrigger);
    }
    if (typeof collisionLayer !== 'undefined') {
      (shape as any)._collisionLayer = collisionLayer;
      shape.setSimulationFilterData(new PhysX.PxFilterData((shape as any)._collisionLayer, (shape as any)._collisionMask, 0, 0));
    }
    if (typeof collisionMask !== 'undefined') {
      (shape as any)._collisionMask = collisionMask;
      shape.setSimulationFilterData(new PhysX.PxFilterData((shape as any)._collisionLayer, (shape as any)._collisionMask, 0, 0));
    }
    if (typeof material !== 'undefined') {
      // TODO
      // shape.setMaterial
      // config.material?.staticFriction ?? 0.5, config.material?.dynamicFriction ?? 0.5, config.material?.restitution ?? 0.5
    }
    if (typeof contactOffset !== 'undefined') {
      shape.setContactOffset(contactOffset);
    }
  }

  removeBody = async ({ id }) => {
    const body = this.bodies.get(id);
    if (!body) return;
    try {
      this.scene.removeActor(body, false);
      this.bodies.delete(id);
      return true;
    } catch (e) {
      console.log(e, id, body);
    }
  };

  createController = async ({ id, config }: { id: number; config: ControllerConfig }) => {
    const controllerDesc = config.isCapsule ? new PhysX.PxCapsuleControllerDesc() : new PhysX.PxBoxControllerDesc();
    controllerDesc.position = { x: config.position?.x ?? 0, y: config.position?.y ?? 0, z: config.position?.z ?? 0 };
    if (config.isCapsule) {
      (controllerDesc as PhysX.PxCapsuleControllerDesc).height = config.height;
      (controllerDesc as PhysX.PxCapsuleControllerDesc).radius = config.radius;
      (controllerDesc as PhysX.PxCapsuleControllerDesc).climbingMode = config.climbingMode ?? PhysX.PxCapsuleClimbingMode.eEASY;
    } else {
      (controllerDesc as PhysX.PxBoxControllerDesc).halfForwardExtent = config.halfForwardExtent;
      (controllerDesc as PhysX.PxBoxControllerDesc).halfHeight = config.halfHeight;
      (controllerDesc as PhysX.PxBoxControllerDesc).halfSideExtent = config.halfSideExtent;
    }
    controllerDesc.stepOffset = config.stepOffset ?? 0.1;
    controllerDesc.maxJumpHeight = config.maxJumpHeight ?? 0.1;
    controllerDesc.contactOffset = config.contactOffset ?? 0.01;
    controllerDesc.invisibleWallHeight = config.invisibleWallHeight ?? 0;
    controllerDesc.slopeLimit = config.slopeLimit ?? Math.cos((45 * Math.PI) / 180);
    controllerDesc.setReportCallback(
      PhysX.PxUserControllerHitReport.implement({
        onShapeHit: (event: PhysX.PxControllerShapeHit) => {
          // TODO: make, get and return shape ID
          const shape = event.getShape();
          const shapeID = this.shapeIDByPointer.get(shape.$$.ptr);
          const position = event.getWorldPos();
          const normal = event.getWorldNormal();
          const length = event.getLength();
          this.onEvent({ event: ControllerEvents.CONTROLLER_SHAPE_HIT, controllerID: id, shapeID, position, normal, length });
        },
        onControllerHit: (event: PhysX.PxControllersHit) => {
          // TODO
          const other = event.getOther();
          const otherID = this.controllerIDByPointer.get(other.$$.ptr);
          const position = event.getWorldPos();
          const normal = event.getWorldNormal();
          const length = event.getLength();
          this.onEvent({ event: ControllerEvents.CONTROLLER_CONTROLLER_HIT, controllerID: id, otherID, position, normal, length });
        },
        onObstacleHit: (event) => {
          // TODO
          // notes for future reference: use userData as an id to callback to main thread
          //
          // const obstacle = event.getObstacle();
          // const obstacleID = this.obstaclesIDByPointer.get(obstacle.$$.ptr);
          // const position = event.getWorldPos();
          // const normal = event.getWorldNormal();
          // const length = event.getLength();
          // this.onEvent({ event: PhysXEvents.CONTROLLER_OBSTACLE_HIT, controllerID: id, obstacleID, position, normal, length });
          console.warn('three-physx: onObstacleHit event not implemented');
        },
      }),
    );
    controllerDesc.setMaterial(this.physics.createMaterial(config.material?.staticFriction ?? 0.5, config.material?.dynamicFriction ?? 0.5, config.material?.restitution ?? 0.5));
    if (!controllerDesc.isValid()) {
      console.warn('[WARN] Controller Description invalid!');
    }
    const controller = config.isCapsule ? this.controllerManager.createCapsuleController(controllerDesc) : this.controllerManager.createBoxController(controllerDesc);
    this.controllers.set(id, controller);
    this.controllerIDByPointer.set(controller.$$.ptr, id);
    const actor = controller.getActor();
    this.bodies.set(id, actor as any);
    const shapes = actor.getShapes() as PhysX.PxShape;
    this.shapeIDByPointer.set(shapes.$$.ptr, config.id);
    (controller as any)._collisions = [];
    (actor as any)._type = PhysXBodyType.CONTROLLER;
    // todo
    (controller as any)._filterData = null; //new PhysX.PxFilterData(config.collisionLayer ?? defaultMask, config.collisionMask ?? defaultMask, 0, 0);
    (controller as any)._queryCallback = null; //PhysX.PxQueryFilterCallback.implement({ preFilter: () => {}, postFilter: () => {} });
  };

  updateController = async ({ id, config }: { id: number; config: ControllerConfig }) => {
    const controller = this.controllers.get(id);
    if (!controller) return;
    if (typeof config.position !== 'undefined') {
      controller.setPosition(config.position as Vec3);
    }
    if (typeof config.positionDelta !== 'undefined') {
      const currentPos = controller.getPosition();
      controller.setPosition({
        x: currentPos.x + (config.positionDelta.x ?? 0),
        y: currentPos.y + (config.positionDelta.y ?? 0),
        z: currentPos.z + (config.positionDelta.z ?? 0),
      });
    }
    if (typeof config.position !== 'undefined') {
      const currentPos = controller.getPosition();
      controller.setPosition({
        x: config.position.x ?? currentPos.x,
        y: config.position.y ?? currentPos.y,
        z: config.position.z ?? currentPos.z,
      });
    }
    if (typeof config.height !== 'undefined') {
      (controller as PhysX.PxCapsuleController).setHeight(config.height);
    }
    if (typeof config.resize !== 'undefined') {
      (controller as PhysX.PxController).resize(config.resize);
    }
    if (typeof config.radius !== 'undefined') {
      (controller as PhysX.PxCapsuleController).setRadius(config.radius);
    }
    if (typeof config.climbingMode !== 'undefined') {
      (controller as PhysX.PxCapsuleController).setClimbingMode(config.climbingMode);
    }
    if (typeof config.halfForwardExtent !== 'undefined') {
      (controller as PhysX.PxBoxController).setHalfForwardExtent(config.halfForwardExtent);
    }
    if (typeof config.halfHeight !== 'undefined') {
      (controller as PhysX.PxBoxController).setHalfHeight(config.halfHeight);
    }
    if (typeof config.halfSideExtent !== 'undefined') {
      (controller as PhysX.PxBoxController).setHalfSideExtent(config.halfSideExtent);
    }
  };

  removeController = async ({ id }) => {
    const controller = this.controllers.get(id);
    if (!controller) return;
    const actor = controller.getActor();
    const shapes = actor.getShapes() as PhysX.PxShape;
    this.controllerIDByPointer.delete(controller.$$.ptr);
    this.shapeIDByPointer.delete(shapes.$$.ptr);
    this.controllers.delete(id);
    this.bodies.delete(id);
    controller.release();
    // todo
  };

  addRaycastQuery = async (query: SceneQuery) => {
    this.raycasts.set(query.id, query);
  };

  updateRaycastQuery = async (id: number) => {
    // todo
  };

  removeRaycastQuery = async (id: number) => {
    this.raycasts.delete(id);
  };

  addConstraint = async () => {
    // todo
  };

  removeConstraint = async () => {
    // todo
  };

  _getRaycastResults = (raycastQuery: SceneQuery) => {
    const hits: RaycastHit[] = [];
    if (raycastQuery.type === SceneQueryType.Closest) {
      const buffer: PhysX.PxRaycastHit = new PhysX.PxRaycastHit();
      const filterData = new PhysX.PxQueryFilterData();
      // todo
      const queryCallback = PhysX.PxQueryFilterCallback.implement({ preFilter: () => {}, postFilter: () => {} });
      const hasHit = this.scene.raycastSingle(raycastQuery.origin, raycastQuery.direction, raycastQuery.maxDistance, raycastQuery.flags, buffer, filterData, queryCallback, null);
      if (hasHit) {
        hits.push({
          distance: buffer.distance,
          normal: buffer.normal,
          position: buffer.position,
        });
      }
    }
    // const buffer: PhysX.PxRaycastBuffer = PhysX.allocateRaycastHitBuffers(raycastQuery.maxHits);
    // const hasHit = this.scene.raycast(raycastQuery.origin, raycastQuery.direction, raycastQuery.maxDistance, buffer);
    // if (hasHit) {

    // if(raycastQuery.flags) {
    //   for (let index = 0; index < buffer.getNbTouches(); index++) {

    //   }
    // } else {
    //   for (let index = 0; index < buffer.getNbAnyHits(); index++) {
    //     const touch = buffer.getAnyHit(index);
    //     const shape = this.shapeIDByPointer.get(touch.getShape().$$.ptr);
    //     hits.push({
    //       shape,
    //     });
    //   }
    // }
    // }
    return hits;
  };
}
function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}
const isKinematicBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === PhysXBodyType.KINEMATIC;
};

const isControllerBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === PhysXBodyType.CONTROLLER;
};

const isDynamicBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === PhysXBodyType.DYNAMIC;
};

const isStaticBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === PhysXBodyType.STATIC;
};

const getBodyData = (body: PhysX.PxRigidActor) => {
  const transform = body.getGlobalPose();
  const linVel = body.getLinearVelocity();
  const angVel = body.getAngularVelocity();
  return [transform.translation.x, transform.translation.y, transform.translation.z, transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w, linVel.x, linVel.y, linVel.z, angVel.x, angVel.y, angVel.z];
};

const defaultMask = 1 << 0;

export const receiveWorker = async (): Promise<void> => {
  const messageQueue = new MessageQueue(globalThis as any);
  let latestCollisions = [];
  PhysXManager.instance = new PhysXManager();
  PhysXManager.instance.onUpdate = ({ raycastResults, bodyArray }) => {
    messageQueue.sendEvent('data', { raycastResults, bodyArray }, [bodyArray.buffer]);
    messageQueue.sendEvent('colliderEvent', [...latestCollisions]);
    latestCollisions = [];
  };
  PhysXManager.instance.onEvent = (data) => {
    latestCollisions.push(data);
  };
  const addFunctionListener = (eventLabel) => {
    messageQueue.addEventListener(eventLabel, async ({ detail }) => {
      PhysXManager.instance[eventLabel](...detail.args).then((returnValue) => {
        messageQueue.sendEvent(detail.uuid, { returnValue });
      });
    });
  };
  Object.keys(PhysXManager.instance).forEach((key) => {
    if (typeof PhysXManager.instance[key] === 'function') {
      addFunctionListener(key);
    }
  });
  messageQueue.sendEvent('init', {});
};

receiveWorker();

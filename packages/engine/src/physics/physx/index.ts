import * as BufferConfig from './BufferConfig';
import { MessageQueue } from './utils/MessageQueue';

import { PhysXConfig, PhysXBodyType, RigidBodyProxy, PhysXShapeConfig, BodyConfig, ControllerConfig, SceneQuery, CollisionEvents, ControllerEvents, Transform, Quat, QuatFragment, Vec3, Vec3Fragment } from './types/ThreePhysX';
import { createNewTransform } from './threeToPhysX';
import { proxyEventListener } from './utils/proxyEventListener';
import { clone } from './utils/misc';

let nextAvailableBodyIndex = 0;
let nextAvailableShapeID = 0;
let nextAvailableRaycastID = 0;

export class PhysXInstance {
  static instance: PhysXInstance = new PhysXInstance();
  physicsProxy: any;

  bodies: Map<number, RigidBodyProxy> = new Map<number, RigidBodyProxy>();
  shapes: Map<number, PhysXShapeConfig> = new Map<number, PhysXShapeConfig>();
  kinematicBodies: Map<number, RigidBodyProxy> = new Map<number, RigidBodyProxy>();
  controllerBodies: Map<number, RigidBodyProxy> = new Map<number, RigidBodyProxy>();
  raycasts: Map<number, SceneQuery> = new Map<number, SceneQuery>();

  initPhysX = async (worker: Worker, config: PhysXConfig): Promise<void> => {
    const messageQueue = new MessageQueue(worker);
    await new Promise((resolve) => {
      messageQueue.addEventListener('init', () => {
        resolve(true);
      });
    });
    messageQueue.addEventListener('data', (ev) => {
      let offset = 0;
      const { raycastResults, bodyArray } = ev.detail;
      while (offset < bodyArray.length) {
        const body = this.bodies.get(bodyArray[offset]);
        if (body) {
          if (body.options.type === PhysXBodyType.CONTROLLER) {
            body.transform.translation.x = bodyArray[offset + 1];
            body.transform.translation.y = bodyArray[offset + 2];
            body.transform.translation.z = bodyArray[offset + 3];
            body.controller.collisions = {
              down: Boolean(bodyArray[offset + 4]),
              sides: Boolean(bodyArray[offset + 5]),
              up: Boolean(bodyArray[offset + 6]),
            };
          } else if (body.options.type === PhysXBodyType.DYNAMIC) {
            body.transform.translation.x = bodyArray[offset + 1];
            body.transform.translation.y = bodyArray[offset + 2];
            body.transform.translation.z = bodyArray[offset + 3];
            body.transform.rotation.x = bodyArray[offset + 4];
            body.transform.rotation.y = bodyArray[offset + 5];
            body.transform.rotation.z = bodyArray[offset + 6];
            body.transform.rotation.w = bodyArray[offset + 7];
            body.transform.linearVelocity.x = bodyArray[offset + 8];
            body.transform.linearVelocity.y = bodyArray[offset + 9];
            body.transform.linearVelocity.z = bodyArray[offset + 10];
            body.transform.angularVelocity.x = bodyArray[offset + 11];
            body.transform.angularVelocity.y = bodyArray[offset + 12];
            body.transform.angularVelocity.z = bodyArray[offset + 13];
          }
        }
        offset += BufferConfig.BODY_DATA_SIZE;
      }
      this.raycasts.forEach((raycastQuery) => {
        raycastQuery.hits = raycastResults[raycastQuery.id] ?? [];
      });
    });
    messageQueue.addEventListener('colliderEvent', ({ detail }) => {
      detail.forEach((collision) => {
        switch (collision.event) {
          case CollisionEvents.COLLISION_START:
          case CollisionEvents.COLLISION_PERSIST:
          case CollisionEvents.COLLISION_END:
          case CollisionEvents.TRIGGER_START:
          case CollisionEvents.TRIGGER_END:
            {
              try {
                const { event, idA, idB } = collision;
                const shapeA = this.shapes.get(idA);
                const shapeB = this.shapes.get(idB);
                const bodyA = (shapeA as any).body;
                const bodyB = (shapeB as any).body;
                if (!bodyA || !bodyB) return; // TODO this is a hack
                bodyA.dispatchEvent({
                  type: event,
                  bodySelf: bodyA,
                  bodyOther: bodyB,
                  shapeSelf: shapeA,
                  shapeOther: shapeB,
                });
                bodyB.dispatchEvent({
                  type: event,
                  bodySelf: bodyB,
                  bodyOther: bodyA,
                  shapeSelf: shapeB,
                  shapeOther: shapeA,
                });
              } catch (e) {
                console.log(collision, e);
              }
            }
            break;
          case ControllerEvents.CONTROLLER_SHAPE_HIT:
          case ControllerEvents.CONTROLLER_CONTROLLER_HIT:
          case ControllerEvents.CONTROLLER_OBSTACLE_HIT:
            {
              const { event, controllerID, shapeID, position, normal, length } = collision;
              const controllerBody: RigidBodyProxy = this.bodies.get(controllerID);
              const shape = this.shapes.get(shapeID);
              controllerBody.dispatchEvent({
                type: event,
                shape,
                position,
                normal,
                length,
              });
            }
            break;
        }
      });
    });

    this.physicsProxy = {
      initPhysX: pipeRemoteFunction(messageQueue, 'initPhysX'),
      update: pipeRemoteFunction(messageQueue, 'update'),
      startPhysX: pipeRemoteFunction(messageQueue, 'startPhysX'),
      addBody: pipeRemoteFunction(messageQueue, 'addBody'),
      updateBody: pipeRemoteFunction(messageQueue, 'updateBody'),
      removeBody: pipeRemoteFunction(messageQueue, 'removeBody'),
      createController: pipeRemoteFunction(messageQueue, 'createController'),
      updateController: pipeRemoteFunction(messageQueue, 'updateController'),
      removeController: pipeRemoteFunction(messageQueue, 'removeController'),
      addRaycastQuery: pipeRemoteFunction(messageQueue, 'addRaycastQuery'),
      updateRaycastQuery: pipeRemoteFunction(messageQueue, 'updateRaycastQuery'),
      removeRaycastQuery: pipeRemoteFunction(messageQueue, 'removeRaycastQuery'),
    };

    await this.physicsProxy.initPhysX([clone(config)]);
  };

  // update kinematic bodies
  update(delta: number) {
    // TODO: make this rely on kinematicBodies.size instead of bodies.size
    let offset = 0;
    const kinematicArray = new Float32Array(new ArrayBuffer(4 * BufferConfig.KINEMATIC_DATA_SIZE * this.kinematicBodies.size));
    this.kinematicBodies.forEach((body, id) => {
      const { translation, rotation } = body.transform;
      kinematicArray.set([id, translation.x, translation.y, translation.z, rotation.x, rotation.y, rotation.z, rotation.w], offset);
      offset += BufferConfig.KINEMATIC_DATA_SIZE;
    });
    offset = 0;
    const controllerArray = new Float32Array(new ArrayBuffer(4 * BufferConfig.CONTROLLER_DATA_SIZE * this.controllerBodies.size));
    this.controllerBodies.forEach((body, id) => {
      const { x, y, z } = body.controller.delta;
      controllerArray.set([id, x, y, z, delta], offset);
      body.controller.delta = { x: 0, y: 0, z: 0 };
      offset += BufferConfig.CONTROLLER_DATA_SIZE;
    });
    offset = 0;
    const raycastArray = new Float32Array(new ArrayBuffer(4 * BufferConfig.RAYCAST_DATA_SIZE * this.raycasts.size));
    this.raycasts.forEach((raycast, id) => {
      const ori = raycast.origin;
      const dir = raycast.direction;
      raycastArray.set([id, ori.x, ori.y, ori.z, dir.x, dir.y, dir.z]);
      offset += BufferConfig.RAYCAST_DATA_SIZE;
    });
    this.physicsProxy.update([kinematicArray, controllerArray, raycastArray], [kinematicArray.buffer, controllerArray.buffer, raycastArray.buffer]);
  }

  startPhysX(start: boolean) {
    return this.physicsProxy.startPhysX([start]);
  }

  addBody({ shapes, type, transform }: { shapes?: any; type?: PhysXBodyType; transform?: Transform } = {}) {
    const id = this._getNextAvailableBodyID();
    shapes?.forEach((shape) => {
      shape.id = this._getNextAvailableShapeID();
      this.shapes.set(shape.id, shape);
    });
    const body: RigidBodyProxy = {
      id,
      transform: transform ?? createNewTransform(),
      shapes: shapes ?? [],
      options: {
        type: type ?? PhysXBodyType.DYNAMIC,
      },
    };
    this.physicsProxy.addBody([clone(body)]);
    body.shapes.forEach((shape) => {
      (shape as any).body = body;
    });
    proxyEventListener(body);
    body.updateTransform = (newTransform) => {
      if(this.controllerBodies.has(id)) {
        this.updateController(body, { position: newTransform.translation })
      } else {
        this.updateBody(body, mergeTransformFragments(body.transform, newTransform))
      }
    }
    this.bodies.set(body.id, body);
    if (body.options.type === PhysXBodyType.KINEMATIC) {
      this.kinematicBodies.set(body.id, body);
    }
    return body;
  }

  updateBody(body: RigidBodyProxy | any, options: BodyConfig) {
    if (typeof body === 'undefined') {
      throw new Error('three-physx! Tried to update a body that does not exist.');
    }
    if (body.options.type === PhysXBodyType.STATIC && typeof options.type !== 'undefined') {
      throw new Error('three-physx! Tried to change the type of a static object. This is not allowed, instead remove the body and create a new one.');
    }
    if (body.options.type === PhysXBodyType.DYNAMIC && options.type === PhysXBodyType.KINEMATIC) {
      this.kinematicBodies.set(body.id, body);
      body.options.type = PhysXBodyType.KINEMATIC;
    } else if (body.options.type === PhysXBodyType.KINEMATIC && options.type === PhysXBodyType.DYNAMIC) {
      this.kinematicBodies.delete(body.id);
      body.options.type = PhysXBodyType.DYNAMIC;
    }
    const id = body.id;
    body.shapes.forEach((shape) => {
      shape._debugNeedsUpdate = true;
    });
    this.physicsProxy.updateBody([clone({ id, options })]);
  }

  removeBody = async (body: RigidBodyProxy) => {
    this.bodies.delete(body.id);
    if (body.options.type === PhysXBodyType.KINEMATIC) {
      this.kinematicBodies.delete(body.id);
    }
    body.shapes.forEach((shape) => {
      this.shapes.delete(shape.id);
    });
    const id = body.id;
    return this.physicsProxy.removeBody([{ id }]);
  };

  createController(options?: ControllerConfig) {
    const id = this._getNextAvailableBodyID();
    const body: RigidBodyProxy = {
      id,
      transform: createNewTransform(),
      shapes: [],
      options: {
        type: PhysXBodyType.CONTROLLER,
      },
    };
    const shape = options ?? {};
    if (typeof options !== 'undefined') {
      if (options.isCapsule) {
        shape.height = options.height ?? 1;
        shape.radius = options.radius ?? 0.5;
      } else {
        shape.halfForwardExtent = options.halfForwardExtent ?? 0.5;
        shape.halfHeight = options.halfHeight ?? 0.5;
        shape.halfSideExtent = options.halfSideExtent ?? 0.5;
      }
    }
    shape.id = this._getNextAvailableShapeID();
    this.physicsProxy.createController([
      clone({
        id: body.id,
        config: shape,
      }),
    ]);
    shape.body = body;
    body.controller = {
      config: shape,
      collisions: { down: false, sides: false, up: false },
      delta: { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
    };
    this.shapes.set(shape.id, shape as any);
    this.controllerBodies.set(id, body);
    proxyEventListener(body);
    this.bodies.set(id, body);
    return body;
  }

  updateController(body: RigidBodyProxy, config: ControllerConfig) {
    if (typeof body?.id === 'undefined') return;
    if (!this.controllerBodies.has(body.id)) return;
    body.controller._debugNeedsUpdate = true;
    if (typeof config.height !== 'undefined') {
      body.controller.config.height = config.height;
    }
    if (typeof config.resize !== 'undefined') {
      if (typeof body.controller.config.height !== 'undefined') {
        body.controller.config.height = config.resize;
      }
      if (typeof body.controller.config.halfHeight !== 'undefined') {
        body.controller.config.halfHeight = config.resize * 2;
      }
    }
    if (typeof config.radius !== 'undefined') {
      body.controller.config.radius = config.radius;
    }
    if (typeof config.climbingMode !== 'undefined') {
      body.controller.config.climbingMode = config.climbingMode;
    }
    if (typeof config.halfForwardExtent !== 'undefined') {
      body.controller.config.halfForwardExtent = config.halfForwardExtent;
    }
    if (typeof config.halfHeight !== 'undefined') {
      body.controller.config.halfHeight = config.halfHeight;
    }
    if (typeof config.halfSideExtent !== 'undefined') {
      body.controller.config.halfSideExtent = config.halfSideExtent;
    }
    return this.physicsProxy.updateController([
      clone({
        id: body.id,
        config,
      }),
    ]);
  }

  removeController(id) {
    this.physicsProxy.removeController([{ id }]);
    const body = this.controllerBodies.get(id);
    this.shapes.delete(body.controller.config.id);
    this.controllerBodies.delete(id);
    this.bodies.delete(id);
  }

  addRaycastQuery(raycastQuery: SceneQuery) {
    if (typeof raycastQuery.type === 'undefined') throw new Error('Scene raycast query must have a type!');
    if (typeof raycastQuery.origin === 'undefined') throw new Error('Scene raycast query must include origin!');
    if (typeof raycastQuery.direction === 'undefined') throw new Error('Scene raycast query must include direction!');

    raycastQuery.maxDistance = raycastQuery.maxDistance ?? 1;
    raycastQuery.maxHits = raycastQuery.maxHits ?? 1;

    const id = this._getNextAvailableRaycastID();
    this.raycasts.set(id, raycastQuery);
    raycastQuery.id = id;
    raycastQuery.hits = []; // init
    this.physicsProxy.addRaycastQuery([clone(raycastQuery)]);
    return raycastQuery;
  }

  updateRaycastQuery(id, newArgs: any) {
    const raycast = this.raycasts.get(id);
    if(!raycast) return;
    if(typeof newArgs.flags !== 'undefined') {
      raycast.flags = newArgs.flags;
    }
    if(typeof newArgs.maxDistance !== 'undefined') {
      raycast.maxDistance = newArgs.maxDistance;
    }
    if(typeof newArgs.maxHits !== 'undefined') {
      raycast.maxHits = newArgs.maxHits;
    }
    if(typeof newArgs.collisionMask !== 'undefined') {
      raycast.collisionMask = newArgs.collisionMask;
    }
    this.physicsProxy.updateRaycastQuery([ clone({ id, ...newArgs }) ]);
  }

  removeRaycastQuery(raycastQuery: SceneQuery) {
    if (!this.raycasts.has(raycastQuery.id)) return;
    this.raycasts.delete(raycastQuery.id);
    this.physicsProxy.removeRaycastQuery([raycastQuery.id]);
  }

  addConstraint = async () => {
    // todo
  };

  removeConstraint = async () => {
    // todo
  };

  private _getNextAvailableBodyID = () => {
    // todo, make this smart
    return nextAvailableBodyIndex++;
  };

  _getNextAvailableShapeID = () => {
    // todo, make this smart
    return nextAvailableShapeID++;
  };

  private _getNextAvailableRaycastID = () => {
    // todo, make this smart
    return nextAvailableRaycastID++;
  };
}

const mergeTransformFragments = (original: Transform, fragments: any): Transform => {
  return {
    translation: fragments.translation ? mergeTranslationFragments(original.translation, fragments.translation) : original.translation,
    rotation: fragments.rotation ? mergeRotationFragments(original.rotation, fragments.rotation) : original.rotation,
    scale: original.scale
  }
}

const mergeTranslationFragments = (original: Vec3, fragments: Vec3Fragment): Vec3 => {
  return {
    x: fragments.x ?? original.x,
    y: fragments.y ?? original.y,
    z: fragments.z ?? original.z,
  }
}

const mergeRotationFragments = (original: Quat, fragments: QuatFragment): Quat => {
  return {
    x: fragments.x ?? original.x,
    y: fragments.y ?? original.y,
    z: fragments.z ?? original.z,
    w: fragments.w ?? original.w,
  }
}

const pipeRemoteFunction = (messageQueue: MessageQueue, id: string) => {
  return (args, transferables) => {
    return new Promise<any>((resolve) => {
      const uuid = generateUUID();
      const callback = ({ detail }) => {
        messageQueue.removeEventListener(uuid, callback);
        resolve(detail.returnValue);
      };
      messageQueue.addEventListener(uuid, callback);
      messageQueue.sendEvent(id, { args, uuid }, transferables);
    });
  };
};

const generateUUID = (): string => {
  return new Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
    .join('-');
};

export { CapsuleBufferGeometry } from './utils/CapsuleBufferGeometry';
export { DebugRenderer } from './utils/DebugRenderer';
export * from './types/ThreePhysX';
export * from './threeToPhysX';

import * as BufferConfig from './BufferConfig'
import { MessageQueue } from './utils/MessageQueue'

import {
  PhysXConfig,
  BodyType,
  RigidBody,
  ShapeType,
  SceneQuery,
  CollisionEvents,
  ControllerEvents,
  TransformType,
  Quat,
  Vec3,
  ControllerRigidBody,
  MaterialConfigType,
  ControllerConfig,
  SHAPES,
  ObstacleType,
  ShapeConfigType,
  SceneQueryType,
  RaycastHit
} from './types/ThreePhysX'
import { clone } from './utils/misc'
import { Vector3, Quaternion } from 'three'
import { PhysXManager } from './worker'
import { isClient } from '../../common/functions/isClient'

let nextAvailableBodyIndex = 0
let nextAvailableShapeID = 0
let nextAvailableRaycastID = 0
let nextAvailableObstacleID = 0

export class PhysXInstance {
  static instance: PhysXInstance = new PhysXInstance()
  _physicsProxy: PhysXManager

  _bodies: Map<number, Body> = new Map<number, Body>()
  _shapes: Map<number, ShapeType> = new Map<number, ShapeType>()
  _kinematicBodies: Map<number, Body> = new Map<number, Body>()
  _controllerBodies: Map<number, Controller> = new Map<number, Controller>()
  _raycasts: Map<number, SceneQuery> = new Map<number, SceneQuery>()
  _obstacles: Map<number, Obstacle> = new Map<number, Obstacle>()

  initPhysX = async (config: PhysXConfig = {}): Promise<void> => {
    const { default: PHYSX } = (await (isClient
      ? import('./physx.release.cjs.js')
      : import('./physx.release.node.js'))) as any
    let pathLib = isClient ? undefined : await import('path')
    const physx = await PHYSX({
      locateFile(path) {
        if (path.endsWith('.wasm')) {
          if (!isClient) {
            return pathLib.resolve(__dirname, './physx.release.wasm')
          }
          return '/workers/physx.release.wasm'
        }
        return path
      }
    })

    this._physicsProxy = new PhysXManager(physx)
    await this._physicsProxy.initPhysX(config)

    this._physicsProxy.addEventListener('data', (ev) => {
      let offset = 0
      const { raycastResults, bodyArray } = ev.detail
      while (offset < bodyArray.length) {
        const body = this._bodies.get(bodyArray[offset]) as Body | Controller
        if (body) {
          if (body.type === BodyType.CONTROLLER) {
            // console.log(bodyArray[offset + 1] - body.transform.translation.x);
            body.transform.translation.x = bodyArray[offset + 1]
            body.transform.translation.y = bodyArray[offset + 2]
            body.transform.translation.z = bodyArray[offset + 3]
            ;(body as Controller).collisions = {
              down: Boolean(bodyArray[offset + 4]),
              sides: Boolean(bodyArray[offset + 5]),
              up: Boolean(bodyArray[offset + 6])
            }
          } else if (body.type === BodyType.DYNAMIC || body.type === BodyType.KINEMATIC) {
            body.transform.translation.x = bodyArray[offset + 1]
            body.transform.translation.y = bodyArray[offset + 2]
            body.transform.translation.z = bodyArray[offset + 3]
            body.transform.rotation.x = bodyArray[offset + 4]
            body.transform.rotation.y = bodyArray[offset + 5]
            body.transform.rotation.z = bodyArray[offset + 6]
            body.transform.rotation.w = bodyArray[offset + 7]
            body.transform.linearVelocity.x = bodyArray[offset + 8]
            body.transform.linearVelocity.y = bodyArray[offset + 9]
            body.transform.linearVelocity.z = bodyArray[offset + 10]
            body.transform.angularVelocity.x = bodyArray[offset + 11]
            body.transform.angularVelocity.y = bodyArray[offset + 12]
            body.transform.angularVelocity.z = bodyArray[offset + 13]
          }
        }
        offset += BufferConfig.BODY_DATA_SIZE
      }
      this._raycasts.forEach((raycastQuery: RaycastQuery) => {
        raycastQuery.hits = raycastResults[raycastQuery.id] ?? []
        raycastQuery.hits.forEach((hit) => {
          hit.body = this._bodies.get(hit._bodyID)
          delete hit._bodyID
        })
      })
    })
    this._physicsProxy.addEventListener('colliderEvent', ({ detail }) => {
      this._bodies.forEach((body) => {
        body.collisionEvents.splice(0, body.collisionEvents.length)
      })
      this._controllerBodies.forEach((body) => {
        body.controllerCollisionEvents.splice(0, body.controllerCollisionEvents.length)
      })
      detail.forEach((collision) => {
        switch (collision.event) {
          case CollisionEvents.COLLISION_START:
          case CollisionEvents.COLLISION_PERSIST:
          case CollisionEvents.COLLISION_END:
          case CollisionEvents.TRIGGER_START:
          case CollisionEvents.TRIGGER_END:
            {
              try {
                const { event, idA, idB, contacts } = collision
                const shapeA = this._shapes.get(idA)
                const shapeB = this._shapes.get(idB)
                if (!shapeA || !shapeB) return
                const bodyA: Body = (shapeA as any).body
                const bodyB: Body = (shapeB as any).body
                if (!bodyA || !bodyB) return
                bodyA.collisionEvents.push({
                  type: event,
                  bodySelf: bodyA,
                  bodyOther: bodyB,
                  shapeSelf: shapeA,
                  shapeOther: shapeB,
                  contacts
                } as ColliderHitEvent)
                bodyB.collisionEvents.push({
                  type: event,
                  bodySelf: bodyB,
                  bodyOther: bodyA,
                  shapeSelf: shapeB,
                  shapeOther: shapeA,
                  contacts
                } as ColliderHitEvent)
              } catch (e) {}
            }
            break
          case ControllerEvents.CONTROLLER_SHAPE_HIT:
          case ControllerEvents.CONTROLLER_CONTROLLER_HIT:
            {
              const { event, controllerID, shapeID, bodyID, position, normal, length } = collision
              const controllerBody: Controller = this._controllerBodies.get(controllerID)
              if (!controllerBody) return
              const shape = this._shapes.get(shapeID)
              const body = this._bodies.get(bodyID)
              controllerBody.controllerCollisionEvents.push({
                type: event,
                body,
                shape,
                position,
                normal,
                length
              } as ControllerHitEvent)
            }
            break
          case ControllerEvents.CONTROLLER_OBSTACLE_HIT:
            {
              const { event, controllerID, obstacleID, position, normal, length } = collision
              const controllerBody: Controller = this._controllerBodies.get(controllerID)
              if (!controllerBody) return
              const obstacle = this._obstacles.get(obstacleID)
              controllerBody.controllerCollisionEvents.push({
                type: event,
                obstacle,
                position,
                normal,
                length
              } as ControllerObstacleHitEvent)
            }
            break
        }
      })
    })
  }

  // update kinematic bodies
  update() {
    let offset = 0
    const kinematicArray = new Float32Array(
      new ArrayBuffer(4 * BufferConfig.KINEMATIC_DATA_SIZE * this._kinematicBodies.size)
    )
    this._kinematicBodies.forEach((body, id) => {
      const { translation, rotation } = body.transform
      kinematicArray.set(
        [id, translation.x, translation.y, translation.z, rotation.x, rotation.y, rotation.z, rotation.w],
        offset
      )
      offset += BufferConfig.KINEMATIC_DATA_SIZE
    })
    offset = 0
    const controllerArray = new Float32Array(
      new ArrayBuffer(4 * BufferConfig.CONTROLLER_DATA_SIZE * this._controllerBodies.size)
    )
    this._controllerBodies.forEach((body, id) => {
      const { x, y, z } = body.delta
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        controllerArray.set([id, x, y, z], offset)
      }
      // @ts-ignore
      body.delta = { x: 0, y: 0, z: 0 }
      offset += BufferConfig.CONTROLLER_DATA_SIZE
    })
    offset = 0
    const raycastArray = new Float32Array(new ArrayBuffer(4 * BufferConfig.RAYCAST_DATA_SIZE * this._raycasts.size))
    this._raycasts.forEach((raycast, id) => {
      raycastArray.set(
        [
          id,
          raycast.origin.x,
          raycast.origin.y,
          raycast.origin.z,
          raycast.direction.x,
          raycast.direction.y,
          raycast.direction.z
        ],
        offset
      )
      offset += BufferConfig.RAYCAST_DATA_SIZE
    })
    this._physicsProxy.update(kinematicArray, controllerArray, raycastArray)
  }

  addBody(body: Body) {
    this._bodies.set(body.id, body)
    if (body.type === BodyType.KINEMATIC) {
      this._kinematicBodies.set(body.id, body)
    }
    body.shapes.forEach((shape) => {
      this._shapes.set(shape.id, shape)
    })
    this._physicsProxy.addBody({
      id: body.id,
      transform: body.transform,
      shapes: body.shapes,
      type: body.type,
      useCCD: body.useCCD
    })
    return body
  }

  removeBody(body: Body) {
    this._bodies.delete(body.id)
    if (body.type === BodyType.KINEMATIC) {
      this._kinematicBodies.delete(body.id)
    }
    body.shapes.forEach((shape) => {
      this._shapes.delete(shape.id)
    })
    const id = body.id
    this._physicsProxy.removeBody({ id })
  }

  createController(controller: Controller) {
    this._controllerBodies.set(controller.id, controller)
    this._bodies.set(controller.id, controller)
    this._shapes.set(controller._shape.id, controller._shape as any)
    this._physicsProxy.createController({
      id: controller.id,
      config: controller._shape
    })
    return controller
  }

  removeController(body: Controller) {
    if (typeof body?.id === 'undefined') return
    const id = body.id
    this._physicsProxy.removeController({ id })
    this._shapes.delete(body._shape.id)
    this._controllerBodies.delete(id)
    this._bodies.delete(id)
  }

  addRaycastQuery(raycastQuery: RaycastQuery) {
    this._raycasts.set(raycastQuery.id, raycastQuery)
    this._physicsProxy.addRaycastQuery(raycastQuery)
    return raycastQuery
  }

  updateRaycastQuery(id, newArgs: any) {
    const raycast = this._raycasts.get(id)
    if (!raycast) return
    if (typeof newArgs.flags !== 'undefined') {
      raycast.flags = newArgs.flags
    }
    if (typeof newArgs.maxDistance !== 'undefined') {
      raycast.maxDistance = newArgs.maxDistance
    }
    if (typeof newArgs.maxHits !== 'undefined') {
      raycast.maxHits = newArgs.maxHits
    }
    if (typeof newArgs.collisionMask !== 'undefined') {
      raycast.collisionMask = newArgs.collisionMask
    }
    this._physicsProxy.updateRaycastQuery({ id, ...newArgs })
  }

  removeRaycastQuery(raycastQuery: SceneQuery) {
    if (!this._raycasts.has(raycastQuery.id)) return
    this._raycasts.delete(raycastQuery.id)
    this._physicsProxy.removeRaycastQuery(raycastQuery.id)
  }

  addObstacle(obstacle: Obstacle) {
    this._obstacles.set(obstacle.id, obstacle)
    this._physicsProxy.addObstacle({
      id: obstacle.id,
      isCapsule: obstacle.isCapsule,
      position: obstacle.position,
      rotation: { x: obstacle.rotation.x, y: obstacle.rotation.y, z: obstacle.rotation.z, w: obstacle.rotation.w },
      halfExtents: (obstacle as BoxObstacle).halfExtents,
      halfHeight: (obstacle as CapsuleObstacle).halfHeight,
      radius: (obstacle as CapsuleObstacle).radius
    })
    return obstacle
  }

  removeObstacle(obstacle: Obstacle) {
    if (!this._obstacles.has(obstacle.id)) return
    this._obstacles.delete(obstacle.id)
    const id = obstacle.id
    this._physicsProxy.removeObstacle(id)
  }

  addConstraint = async () => {
    // todo
  }

  removeConstraint = async () => {
    // todo
  }

  _getNextAvailableBodyID = () => {
    // todo, make this smart
    return nextAvailableBodyIndex++
  }

  _getNextAvailableShapeID = () => {
    // todo, make this smart
    return nextAvailableShapeID++
  }

  _getNextAvailableRaycastID = () => {
    // todo, make this smart
    return nextAvailableRaycastID++
  }

  _getNextAvailableObstacleID = () => {
    // todo, make this smart
    return nextAvailableObstacleID++
  }

  dispose = () => {
    nextAvailableBodyIndex = 0
    nextAvailableShapeID = 0
    nextAvailableRaycastID = 0
    nextAvailableObstacleID = 0
    this._bodies.clear()
    this._shapes.clear()
    this._kinematicBodies.clear()
    this._controllerBodies.clear()
    this._raycasts.clear()
    this._obstacles.clear()
    PhysXInstance.instance = undefined
  }
}

export class Transform implements TransformType {
  translation: Vector3 = new Vector3()
  rotation: Quaternion = new Quaternion()
  scale: Vector3 = new Vector3(1, 1, 1)
  linearVelocity: Vector3 = new Vector3()
  angularVelocity: Vector3 = new Vector3()
  constructor(args?: TransformType) {
    this.set(args)
  }
  set(args: TransformType = {}) {
    if (args.translation) {
      this.translation.x = args.translation.x ?? this.translation.x
      this.translation.y = args.translation.y ?? this.translation.y
      this.translation.z = args.translation.z ?? this.translation.z
    }
    if (args.rotation) {
      this.rotation.x = args.rotation.x ?? this.rotation.x
      this.rotation.y = args.rotation.y ?? this.rotation.y
      this.rotation.z = args.rotation.z ?? this.rotation.z
      this.rotation.w = args.rotation.w ?? this.rotation.w
    }
    if (args.scale) {
      this.scale.x = args.scale.x ?? this.scale.x
      this.scale.y = args.scale.y ?? this.scale.y
      this.scale.z = args.scale.z ?? this.scale.z
    }
    if (args.linearVelocity) {
      this.linearVelocity.x = args.linearVelocity.x ?? this.linearVelocity.x
      this.linearVelocity.y = args.linearVelocity.y ?? this.linearVelocity.y
      this.linearVelocity.z = args.linearVelocity.z ?? this.linearVelocity.z
    }
    if (args.angularVelocity) {
      this.angularVelocity.x = args.angularVelocity.x ?? this.angularVelocity.x
      this.angularVelocity.y = args.angularVelocity.y ?? this.angularVelocity.y
      this.angularVelocity.z = args.angularVelocity.z ?? this.angularVelocity.z
    }
  }
  toJSON() {
    return {
      translation: { x: this.translation.x, y: this.translation.y, z: this.translation.z },
      rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z, w: this.rotation.w },
      scale: { x: this.scale.x, y: this.scale.y, z: this.scale.z },
      linearVelocity: { x: this.linearVelocity.x, y: this.linearVelocity.y, z: this.linearVelocity.z },
      angularVelocity: { x: this.angularVelocity.x, y: this.angularVelocity.y, z: this.angularVelocity.z }
    }
  }
}

class MaterialConfig implements MaterialConfigType {
  private readonly id: number
  private _staticFriction: number
  private _dynamicFriction: number
  private _restitution: number
  constructor(id: number, config: MaterialConfigType = {}) {
    this.id = id
    this._staticFriction = config.staticFriction ?? 0
    this._dynamicFriction = config.dynamicFriction ?? 0
    this._restitution = config.restitution ?? 0
  }
  get staticFriction() {
    return this._staticFriction
  }
  set staticFriction(val: number) {
    this._staticFriction = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { material: { staticFriction: val } } })
  }
  get dynamicFriction() {
    return this._dynamicFriction
  }
  set dynamicFriction(val: number) {
    this._dynamicFriction = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { material: { dynamicFriction: val } } })
  }
  get restitution() {
    return this._restitution
  }
  set restitution(val: number) {
    this._restitution = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { material: { restitution: val } } })
  }
  toJSON() {
    return {
      staticFriction: this.staticFriction,
      dynamicFriction: this.dynamicFriction,
      restitution: this.restitution
    }
  }
}

class ShapeConfig implements ShapeConfigType {
  private readonly id: number
  private _contactOffset: number
  private _restOffset: number
  private _isTrigger: boolean
  private _collisionLayer: number
  private _collisionMask: number
  private _material: MaterialConfigType
  constructor(id: number, config: ShapeConfigType = {}) {
    this.id = id
    this._contactOffset = config.contactOffset
    this._restOffset = config.restOffset
    this._isTrigger = config.isTrigger
    this._collisionLayer = config.collisionLayer
    this._collisionMask = config.collisionMask
    this._material = new MaterialConfig(id, config.material)
  }
  get contactOffset() {
    return this._contactOffset
  }
  set contactOffset(val: number) {
    this._contactOffset = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { contactOffset: val } })
  }
  get restOffset() {
    return this._restOffset
  }
  set restOffset(val: number) {
    this._restOffset = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { restOffset: val } })
  }
  get isTrigger() {
    return this._isTrigger
  }
  set isTrigger(val: boolean) {
    this._isTrigger = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { isTrigger: val } })
  }
  get collisionLayer() {
    return this._collisionLayer
  }
  set collisionLayer(val: number) {
    this._collisionLayer = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { collisionLayer: val } })
  }
  get collisionMask() {
    return this._collisionMask
  }
  set collisionMask(val: number) {
    this._collisionMask = val
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { collisionMask: val } })
  }
  get material() {
    return this._material
  }
  set material(val: MaterialConfigType) {
    this._material = new MaterialConfig(this.id, val)
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: { material: val } })
  }
  toJSON() {
    return {
      restOffset: this.restOffset,
      contactOffset: this.contactOffset,
      isTrigger: this.isTrigger,
      collisionLayer: this.collisionLayer,
      collisionMask: this.collisionMask,
      material: this.material
    }
  }
}

export class Shape implements ShapeType {
  _debugNeedsUpdate: any = false

  // ref to body for collisions
  readonly body: Body
  readonly id: number
  shape?: SHAPES
  private _transform?: Transform
  private _config?: ShapeConfig
  options?: {
    vertices?: number[]
    indices?: number[]
    boxExtents?: Vec3
    radius?: number
    halfHeight?: number
  }
  userData?: any
  constructor(body: Body, config: ShapeType = {}) {
    this.body = body
    this.id = config.id ?? PhysXInstance.instance._getNextAvailableShapeID()
    this.shape = config.shape ?? SHAPES.Box
    this._transform = new Transform(config.transform)
    this._config = new ShapeConfig(this.id, config.config)
    this.options = Object.assign({}, { ...config.options })
    this.userData = config.userData ?? {}
  }
  get config() {
    return this._config
  }
  set config(val: ShapeConfigType) {
    this._config = new ShapeConfig(this.id, val)
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, config: this._config })
  }
  get transform() {
    return this._transform
  }
  set transform(val: TransformType) {
    this._transform.set(val)
    PhysXInstance.instance._physicsProxy.updateShape({ id: this.id, transform: this._transform })
  }
  toJSON() {
    return {
      id: this.id,
      shape: this.shape,
      transform: this.transform,
      options: this.options,
      userData: this.userData,
      config: this._config
    }
  }
}

// const bodyGetterFunctions = ['getAngularDamping', 'getLinearDamping', 'getAngularVelocity', 'getLinearDamping', 'getMass', 'getRigidBodyFlags'];

const bodySetterFunctions = [
  'setAngularDamping',
  'setLinearDamping',
  'setAngularVelocity',
  'setLinearVelocity',
  'setMass',
  'setCMassLocalPose',
  'clearForce',
  'clearTorque',
  'addForce',
  'addForceAtPos',
  'addForceAtLocalPos',
  'addLocalForceAtLocalPos',
  'addImpulseAtPos',
  'addImpulseAtLocalPos',
  'addLocalImpulseAtLocalPos',
  'applyImpulse',
  'applyLocalImpulse',
  'applyForce',
  'applyLocalForce',
  'addTorque',
  'setRigidBodyFlags',
  'setRigidBodyFlag',
  'setMassandUpdateInertia',
  'setMassSpaceInertiaTensor',
  'setStabilizationThreshold',
  'setWakeCounter',
  'wakeUp',
  'putToSleep',
  'setSleepThreshold',
  'updateMassAndInertia'
]

const assignSetterFunction = (type, assignee, id, func) => {
  assignee[func] = (...args) => {
    PhysXInstance.instance._physicsProxy._classFunc(type, func, id, ...args)
  }
}

export class Body implements RigidBody {
  readonly id: number
  transform: Transform
  shapes: Shape[]
  userData: any
  private _type: BodyType
  useCCD: boolean
  collisionEvents: ColliderHitEvent[];
  [x: string]: any

  constructor({
    shapes,
    type,
    transform,
    userData,
    useCCD
  }: { shapes?: ShapeType[]; type?: BodyType; transform?: TransformType; userData?: any; useCCD?: boolean } = {}) {
    this.id = PhysXInstance.instance._getNextAvailableBodyID()
    this._type = type
    this.transform = new Transform(transform)
    this.userData = userData
    this.useCCD = Boolean(useCCD)

    this.collisionEvents = []

    bodySetterFunctions.forEach((func) => {
      assignSetterFunction('body', this, this.id, func)
    })

    // bodyGetterFunctions.forEach((func) => {
    //   assignGetterFunction('body', this, this.id, func);
    // });

    this.shapes = (shapes ?? []).map((shape) => {
      if (!shape.options) shape.options = {}
      switch (shape.shape) {
        case SHAPES.Box:
          if (!shape.options?.boxExtents) shape.options.boxExtents = { x: 1, y: 1, z: 1 }
          break
        case SHAPES.Capsule:
          if (!shape.options?.halfHeight) shape.options.halfHeight = 1 // yes, dont break here
        case SHAPES.Sphere:
          if (!shape.options?.radius) shape.options.radius = 0.5
          break
      }
      return new Shape(this, shape)
    })
  }

  set type(value: BodyType) {
    if (this._type === BodyType.STATIC || this._type === BodyType.CONTROLLER) {
      throw new Error(
        '../../physics/physx! Tried to change the type of a static or controller object. This is not allowed, instead remove the body and create a new one.'
      )
    }
    if (this._type === BodyType.DYNAMIC && value === BodyType.KINEMATIC) {
      PhysXInstance.instance._kinematicBodies.set(this.id, this)
      this._type = BodyType.KINEMATIC
    } else if (this._type === BodyType.KINEMATIC && value === BodyType.DYNAMIC) {
      PhysXInstance.instance._kinematicBodies.delete(this.id)
      this._type = BodyType.DYNAMIC
    }

    this.shapes.forEach((shape) => {
      shape._debugNeedsUpdate = true
    })

    PhysXInstance.instance._physicsProxy.updateBody({ id: this.id, type: value } as any)
  }

  get type(): BodyType {
    return this._type
  }

  updateTransform(newTransform: TransformType) {
    this.transform.set(newTransform)
    if (this._type === BodyType.KINEMATIC) {
      return
    }
    PhysXInstance.instance._physicsProxy.updateBody({ id: this.id, transform: newTransform } as any)
  }
}

const DefaultControllerConfig: ControllerConfig = {
  userData: {},
  height: 1,
  radius: 0.25,
  stepOffset: 0.1,
  contactOffset: 0.01,
  slopeLimit: 0,
  invisibleWallHeight: 1
}

const controllerSetterFunctions = [
  'setPosition',
  'setFootPosition',
  'setStepOffset',
  'setContactOffset',
  'setNonWalkableMode',
  'setUpDirection',
  'setSlopeLimit',
  'setUserData'
]

const controllerGetterFunctions = [
  'getPosition',
  'getFootPosition',
  'getActor',
  'getStepOffset',
  'getContactOffset',
  'getNonWalkableMode',
  'getUpDirection',
  'getSlopeLimit',
  'getScene',
  'getUserData',
  'getState',
  'getStats'
]

// TODO: refactor ControllerConfig to have a ShapeType
export class Controller extends Body implements ControllerRigidBody {
  // internal
  _debugNeedsUpdate?: any
  _shape: ControllerConfig
  collisions: { down: boolean; sides: boolean; up: boolean }
  controllerCollisionEvents: (ControllerHitEvent | ControllerObstacleHitEvent)[]
  delta: Vector3
  velocity: Vector3

  constructor(config: ControllerConfig) {
    super({ type: BodyType.CONTROLLER, transform: { translation: config.position }, userData: config.userData })
    this.controllerCollisionEvents = []
    controllerSetterFunctions.forEach((func) => {
      assignSetterFunction('body', this, this.id, func)
    })

    // controllerGetterFunctions.forEach((func) => {
    //   assignGetterFunction('body', this, this.id, func);
    // });

    this._shape = {
      ...DefaultControllerConfig,
      ...config,
      id: PhysXInstance.instance._getNextAvailableShapeID()
    }

    this.shapes = []
    const shape = new Shape(this, {
      id: this._shape.id,
      shape: config.isCapsule ? SHAPES.Capsule : SHAPES.Box,
      options: {
        boxExtents: {
          x: config.halfSideExtent,
          y: config.halfHeight,
          z: config.halfForwardExtent
        },
        radius: config.radius,
        halfHeight: config.halfHeight
      },
      config: {
        collisionLayer: config.collisionLayer,
        collisionMask: config.collisionMask,
        contactOffset: config.contactOffset,
        material: config.material
      }
    })
    this.shapes.push(shape)

    this.collisions = { down: false, sides: false, up: false }
    // @ts-ignore
    this.delta = config.delta ?? new Vector3()
    // @ts-ignore
    this.velocity = config.velocity ?? new Vector3()
  }
  updateTransform = (newTransform) => {
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, position: newTransform.translation } as any)
  }
  set type(value: BodyType) {}
  get type() {
    return BodyType.CONTROLLER
  }

  resize(value: number) {
    this._shape.isCapsule ? (this._shape.height = value) : (this._shape.halfHeight = value)
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, resize: value })
    this._debugNeedsUpdate = true
  }

  get height() {
    return this._shape.height
  }
  set height(value: number) {
    this._shape.height = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, height: value })
    this._debugNeedsUpdate = true
  }
  get radius() {
    return this._shape.radius
  }
  set radius(value: number) {
    this._shape.radius = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, radius: value })
    this._debugNeedsUpdate = true
  }
  get climbingMode() {
    return this._shape.climbingMode
  }
  set climbingMode(value: number) {
    this._shape.climbingMode = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, climbingMode: value })
    this._debugNeedsUpdate = true
  }
  get halfForwardExtent() {
    return this._shape.halfForwardExtent
  }
  set halfForwardExtent(value: number) {
    this._shape.halfForwardExtent = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, halfForwardExtent: value })
    this._debugNeedsUpdate = true
  }
  get halfHeight() {
    return this._shape.halfHeight
  }
  set halfHeight(value: number) {
    this._shape.halfHeight = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, halfHeight: value })
    this._debugNeedsUpdate = true
  }
  get collisionLayer() {
    return this._shape.collisionLayer
  }
  set collisionLayer(value: number) {
    this._shape.collisionLayer = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, collisionLayer: value })
  }
  get collisionMask() {
    return this._shape.collisionMask
  }
  set collisionMask(value: number) {
    this._shape.collisionMask = value
    PhysXInstance.instance._physicsProxy.updateController({ id: this.id, collisionMask: value })
  }
}

export class Obstacle implements ObstacleType {
  id: number
  readonly isCapsule: boolean
  private _position: Vector3 = new Vector3()
  private _rotation: Quaternion = new Quaternion()
  constructor(args: { isCapsule: boolean; position?: Vec3; rotation?: Quat }) {
    const { isCapsule } = args
    this.isCapsule = isCapsule
    this.id = PhysXInstance.instance._getNextAvailableObstacleID()
    this._position.x = args.position.x
    this._position.y = args.position.y
    this._position.z = args.position.z
    this._rotation.x = args.rotation.x
    this._rotation.y = args.rotation.y
    this._rotation.z = args.rotation.z
    this._rotation.w = args.rotation.w
  }
  get position(): Vector3 {
    return this._position
  }
  set position(val: Vector3) {
    this._position.x = val.x
    this._position.y = val.y
    this._position.z = val.z
    PhysXInstance.instance._physicsProxy._classFunc('obstacle', 'setPosition', this.id, val)
  }
  get rotation(): Quaternion {
    return this._rotation
  }
  set rotation(val: Quaternion) {
    this._rotation.x = val.x
    this._rotation.y = val.y
    this._rotation.z = val.z
    this._rotation.w = val.w
    PhysXInstance.instance._physicsProxy._classFunc('obstacle', 'setPosition', this.id, {
      x: val.x,
      y: val.y,
      z: val.z,
      w: val.w
    })
  }
}

export class CapsuleObstacle extends Obstacle {
  private _halfHeight?: number = 0
  private _radius?: number = 0
  constructor(args: { isCapsule: boolean; position?: Vec3; rotation?: Quat; halfHeight?: number; radius?: number }) {
    super(args)
  }
  get halfHeight() {
    return this._halfHeight
  }
  set halfHeight(val: number) {
    this._halfHeight = val
    PhysXInstance.instance._physicsProxy._classFunc('obstacle', 'setHalfHeight', this.id, val)
  }
  get radius() {
    return this._radius
  }
  set radius(val: number) {
    this._radius = val
    PhysXInstance.instance._physicsProxy._classFunc('obstacle', 'setRadius', this.id, val)
  }
}

export class BoxObstacle extends Obstacle {
  private _halfExtents?: Vector3 = new Vector3()
  constructor(args: { isCapsule: boolean; position?: Vec3; rotation?: Quat; halfExtents?: Vec3 }) {
    super(args)
    this._halfExtents.x = args.halfExtents.x
    this._halfExtents.y = args.halfExtents.y
    this._halfExtents.z = args.halfExtents.z
  }
  get halfExtents(): Vector3 {
    return this._halfExtents
  }
  set halfExtents(val: Vector3) {
    this._halfExtents.x = val.x
    this._halfExtents.y = val.y
    this._halfExtents.z = val.z
    PhysXInstance.instance._physicsProxy._classFunc('obstacle', 'setHalfExtents', this.id, {
      x: val.x,
      y: val.y,
      z: val.z
    })
  }
}

export class RaycastQuery implements SceneQuery {
  readonly id: number
  readonly type: SceneQueryType
  // flags: number; // PxQueryFlag
  collisionMask: number
  origin: Vector3
  direction: Vector3
  maxDistance: number
  maxHits: number
  hits: RaycastHit[]

  constructor(args: {
    type: SceneQueryType
    origin: Vector3
    direction: Vector3
    maxDistance?: number
    maxHits?: number
    collisionMask?: number
  }) {
    const id = PhysXInstance.instance._getNextAvailableRaycastID()
    this.id = id
    this.type = args.type
    // this.flags = args.flags ?? 0;
    this.collisionMask = args.collisionMask ?? 0
    // @ts-ignore
    this.origin = args.origin ?? new Vector3()
    // @ts-ignore
    this.direction = args.direction ?? new Vector3()
    this.maxDistance = args.maxDistance ?? 1
    this.maxHits = args.maxHits ?? 1
    this.hits = []
  }
}

export type ControllerHitEvent = {
  type: ControllerEvents
  shape: ShapeType
  body: RigidBody
  position: Vec3
  normal: Vec3
  length: number
}

export type ControllerObstacleHitEvent = {
  type: ControllerEvents
  obstacle: ObstacleType
  position: Vec3
  normal: Vec3
  length: number
}

type ContactData = {
  points: Vec3
  normal: Vec3
  impulse: number
}

export type ColliderHitEvent = {
  type: CollisionEvents
  bodySelf: RigidBody
  bodyOther: RigidBody
  shapeSelf: ShapeType
  shapeOther: ShapeType
  contacts: ContactData[]
}

export * from './types/ThreePhysX'
export { PhysXManager, receiveWorker } from './worker'

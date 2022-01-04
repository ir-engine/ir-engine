import { loadPhysX } from '../physx/loadPhysX'
import {
  PhysXConfig,
  BodyType,
  RigidBody,
  ShapeOptions,
  CollisionEvents,
  ControllerEvents,
  SceneQueryType,
  CapsuleControllerConfig,
  BoxControllerConfig,
  ObstacleConfig
} from '../types/PhysicsTypes'
import { putIntoPhysXHeap } from '../functions/physxHelpers'
import { Quaternion, Vector3 } from 'three'
import { RaycastComponent } from '../components/RaycastComponent'
import { ComponentType } from '../../ecs/functions/ComponentFunctions'

const defaultMask = 0

let nextAvailableBodyIndex = 0
let nextAvailableShapeID = 0
let nextAvailableObstacleID = 0

export class Physics {
  physxVersion: number
  defaultErrorCallback: PhysX.PxDefaultErrorCallback
  allocator: PhysX.PxDefaultAllocator
  foundation: PhysX.PxFoundation
  cookingParamas: PhysX.PxCookingParams
  cooking: PhysX.PxCooking
  physics: PhysX.PxPhysics
  sceneDesc: PhysX.PxSceneDesc
  scene: PhysX.PxScene
  controllerManager: PhysX.PxControllerManager
  obstacleContext: PhysX.PxObstacleContext
  defaultCCTQueryCallback: PhysX.PxQueryFilterCallback

  timeScale: number = 1
  substeps: number = 1
  collisionEventQueue = [] as any[]

  bodies = new Map<number, PhysX.PxRigidActor>()
  shapes = new Map<number, PhysX.PxShape>()
  shapeIDByPointer = new Map<number, number>()
  controllerIDByPointer = new Map<number, number>()
  bodyIDByShapeID = new Map<number, number>()
  controllers = new Map<number, PhysX.PxController>()
  obstacles = new Map<number, PhysX.PxObstacle>()

  /**
   * Destroys the physics world
   */
  dispose() {
    throw new Error('Function not implemented')
  }

  /**
   * Clears all the actors in a scene, but does not destroy the world
   */
  clear() {
    this.bodies.forEach((body) => {
      this.scene.removeActor(body, true)
    })
  }

  onEvent(ev) {
    this.collisionEventQueue.push(ev)
  }

  getOriginalShapeObject(shapes: PhysX.PxShape | PhysX.PxShape[]) {
    const shape: PhysX.PxShape = (shapes as any).length ? shapes[0] : shapes
    return this.shapes.get(this.shapeIDByPointer.get(shape.$$.ptr)!)
  }

  async createScene(config: PhysXConfig = {}) {
    await loadPhysX()

    this.physxVersion = PhysX.PX_PHYSICS_VERSION
    this.defaultErrorCallback = new PhysX.PxDefaultErrorCallback()
    this.allocator = new PhysX.PxDefaultAllocator()
    const tolerance = new PhysX.PxTolerancesScale()
    tolerance.length = config.lengthScale ?? 1
    this.foundation = PhysX.PxCreateFoundation(this.physxVersion, this.allocator, this.defaultErrorCallback)
    this.cookingParamas = new PhysX.PxCookingParams(tolerance)
    this.cooking = PhysX.PxCreateCooking(this.physxVersion, this.foundation, this.cookingParamas)
    this.physics = PhysX.PxCreatePhysics(this.physxVersion, this.foundation, tolerance, false, null!)

    const triggerCallback = {
      onContactBegin: (
        shapeA: PhysX.PxShape,
        shapeB: PhysX.PxShape,
        contactPoints: PhysX.PxVec3Vector,
        contactNormals: PhysX.PxVec3Vector,
        impulses: PhysX.PxRealVector
      ) => {
        const contacts = [] as any
        for (let i = 0; i < contactPoints.size(); i++) {
          if (impulses.get(i) > 0) {
            contacts.push({
              point: contactPoints.get(i),
              normal: contactNormals.get(i),
              impulse: impulses.get(i)
            })
          }
        }
        this.collisionEventQueue.push({
          type: CollisionEvents.COLLISION_START,
          // we have to get our original object ref
          shapeA: this.getOriginalShapeObject(shapeA),
          shapeB: this.getOriginalShapeObject(shapeB),
          contacts
        })
      },
      onContactEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.collisionEventQueue.push({
          type: CollisionEvents.COLLISION_END,
          shapeA: this.getOriginalShapeObject(shapeA),
          shapeB: this.getOriginalShapeObject(shapeB)
        })
      },
      onContactPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.collisionEventQueue.push({
          type: CollisionEvents.COLLISION_PERSIST,
          shapeA: this.getOriginalShapeObject(shapeA),
          shapeB: this.getOriginalShapeObject(shapeB)
        })
      },
      onTriggerBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        // console.log('onTriggerBegin', shapeA, shapeB)
        this.collisionEventQueue.push({
          type: CollisionEvents.TRIGGER_START,
          shapeA: this.getOriginalShapeObject(shapeA),
          shapeB: this.getOriginalShapeObject(shapeB)
        })
      },
      // onTriggerPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
      //   this.collisionEventQueue.push({
      //     event: CollisionEvents.TRIGGER_PERSIST,
      // bodyA,
      // bodyB,
      // shapeA,
      // shapeB,
      //   });
      // },
      onTriggerEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        // console.log('onTriggerEnd', shapeA, shapeB)
        this.collisionEventQueue.push({
          event: CollisionEvents.TRIGGER_END,
          shapeA: this.getOriginalShapeObject(shapeA),
          shapeB: this.getOriginalShapeObject(shapeB)
        })
      }
    }

    this.sceneDesc = PhysX.getDefaultSceneDesc(
      tolerance,
      0,
      PhysX.PxSimulationEventCallback.implement(triggerCallback as any)
    )

    this.scene = this.physics.createScene(this.sceneDesc)
    this.scene.setBounceThresholdVelocity(config.bounceThresholdVelocity ?? 0.001)

    this.controllerManager = PhysX.PxCreateControllerManager(this.scene, false)
    this.obstacleContext = this.controllerManager.createObstacleContext()

    this.defaultCCTQueryCallback = PhysX.getDefaultCCTQueryFilter()

    // TODO: expose functions here as an API
    // PhysX.PxQueryFilterCallback.implement({
    //   preFilter: (filterData, shape, actor) => {
    //     if (!(filterData.word0 & shape.getQueryFilterData().word1) && !(shape.getQueryFilterData().word0 & filterData.word1))
    //     {
    //       return PhysX.PxQueryHitType.eNONE;
    //     }
    //     return PhysX.PxQueryHitType.eBLOCK;
    //   },
    //   postFilter: (filterData, hit) => {
    //     // console.log('postFilter', filterData, hit);
    //     return PhysX.PxQueryHitType.eBLOCK;
    //   }
    // });

    if (config.gravity) {
      this.scene.setGravity(config.gravity)
    }
  }

  addBody(config: RigidBody) {
    const { transform, shapes, type } = config
    const id = this._getNextAvailableBodyID()

    const rigidBody =
      type === BodyType.STATIC
        ? this.physics.createRigidStatic(transform)
        : (this.physics.createRigidDynamic(transform) as PhysX.PxRigidStatic | PhysX.PxRigidDynamic)

    ;(rigidBody as any)._type = type
    ;(rigidBody as any)._id = id
    ;(rigidBody as any)._shapes = shapes

    for (const shape of shapes as PhysX.PxShape[]) {
      rigidBody.attachShape(shape)
      this.bodyIDByShapeID.set(shape._id, id)
    }

    this.bodies.set(id, rigidBody)
    this.scene.addActor(rigidBody, null)

    if (!isStaticBody(rigidBody)) {
      if (typeof config.useCCD !== 'undefined') {
        ;(rigidBody as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eENABLE_CCD, config.useCCD)
      }
      if (typeof config.type !== 'undefined') {
        const transform = rigidBody.getGlobalPose()
        if (config.type === BodyType.KINEMATIC) {
          ;(rigidBody as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, true)
          ;(rigidBody as any)._type = BodyType.KINEMATIC
        } else {
          ;(rigidBody as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, false)
          ;(rigidBody as any)._type = BodyType.DYNAMIC
        }
        rigidBody.setGlobalPose(transform, true)
      }
      if (config.mass) {
        ;(rigidBody as PhysX.PxRigidDynamic).setMass(config.mass)
      }
      if (config.linearDamping) {
        ;(rigidBody as PhysX.PxRigidDynamic).setLinearDamping(config.linearDamping)
      }
      if (config.angularDamping) {
        ;(rigidBody as PhysX.PxRigidDynamic).setAngularDamping(config.angularDamping)
      }
    }
    ;(rigidBody as any).userData = config.userData
    return rigidBody
  }

  createMaterial(staticFriction: number = 0, dynamicFriction: number = 0, restitution: number = 0) {
    return this.physics.createMaterial(staticFriction, dynamicFriction, restitution)
  }

  createShape(geometry: PhysX.PxGeometry, material = this.createMaterial(), options: ShapeOptions = {}): PhysX.PxShape {
    if (!geometry) throw new Error('Expcted geometry')

    const id = this._getNextAvailableShapeID()

    const flags = new PhysX.PxShapeFlags(
      PhysX.PxShapeFlag.eSCENE_QUERY_SHAPE.value |
        (options?.isTrigger ? PhysX.PxShapeFlag.eTRIGGER_SHAPE.value : PhysX.PxShapeFlag.eSIMULATION_SHAPE.value)
    )
    const shape = this.physics.createShape(geometry, material, false, flags)

    let collisionLayer = options.collisionLayer ?? defaultMask
    let collisionMask = options.collisionMask ?? defaultMask

    shape._collisionLayer = collisionLayer
    shape._collisionMask = collisionMask

    shape.setSimulationFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0))
    shape.setQueryFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0))
    shape._id = id

    this.shapeIDByPointer.set(shape.$$.ptr, id)
    this.shapes.set(id, shape)

    if (typeof options.contactOffset !== 'undefined') {
      shape.setContactOffset(options.contactOffset)
    }
    if (typeof options.restOffset !== 'undefined') {
      shape.setRestOffset(options.restOffset)
    }

    shape._debugNeedsUpdate = true
    return shape
  }

  createTrimesh(scale: Vector3, vertices: ArrayLike<number>, indices: ArrayLike<number>): PhysX.PxTriangleMeshGeometry {
    const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)
    const indicesPtr = putIntoPhysXHeap(PhysX.HEAPF32, indices)
    const trimesh = this.cooking.createTriMesh(
      verticesPtr,
      vertices.length,
      indicesPtr,
      indices.length / 3,
      false,
      this.physics
    )

    if (trimesh === null) throw new Error('Unable to create trimesh')

    const meshScale = new PhysX.PxMeshScale(scale, new Quaternion())
    const geometry = new PhysX.PxTriangleMeshGeometry(
      trimesh,
      meshScale,
      new PhysX.PxMeshGeometryFlags(PhysX.PxMeshGeometryFlag.eDOUBLE_SIDED.value)
    )

    PhysX._free(verticesPtr)
    PhysX._free(indicesPtr)

    return geometry
  }

  createConvexMesh(scale: Vector3, vertices: ArrayLike<number>): PhysX.PxConvexMeshGeometry {
    const verticesPtr = putIntoPhysXHeap(PhysX.HEAPF32, vertices)

    const convexMesh = this.cooking.createConvexMesh(verticesPtr, vertices.length, this.physics)

    const meshScale = new PhysX.PxMeshScale(scale, new Quaternion())
    const geometry = new PhysX.PxConvexMeshGeometry(convexMesh, meshScale, new PhysX.PxConvexMeshGeometryFlags(0))

    PhysX._free(verticesPtr)

    return geometry
  }

  removeBody(body) {
    const id = body._id
    const shapes = body.getShapes()
    const shapesArray = ((shapes as PhysX.PxShape[]).length ? shapes : [shapes]) as PhysX.PxShape[]
    shapesArray.forEach((shape) => {
      const shapeID = this.shapeIDByPointer.get(shape.$$.ptr)!
      this.shapes.delete(shapeID)
      this.shapeIDByPointer.delete(shape.$$.ptr)
      // TODO: properly clean up shape
    })

    if (!body) return
    try {
      this.scene.removeActor(body, false)
      this.bodies.delete(id)
      return true
    } catch (e) {
      console.log(e, id, body)
    }
  }

  changeRigidbodyType(body: PhysX.PxRigidBody, type: BodyType) {
    ;(body as any)._type = type
    if (type === BodyType.KINEMATIC) {
      body.setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, true)
    } else if (type === BodyType.DYNAMIC) {
      body.setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, false)
    }
  }

  createController(config: CapsuleControllerConfig | BoxControllerConfig) {
    const id = this._getNextAvailableBodyID()
    const controllerDesc = config.isCapsule ? new PhysX.PxCapsuleControllerDesc() : new PhysX.PxBoxControllerDesc()
    controllerDesc.setMaterial(config.material)
    controllerDesc.position = { x: config.position?.x ?? 0, y: config.position?.y ?? 0, z: config.position?.z ?? 0 }
    if (config.isCapsule) {
      ;(controllerDesc as PhysX.PxCapsuleControllerDesc).height = (config as CapsuleControllerConfig).height
      ;(controllerDesc as PhysX.PxCapsuleControllerDesc).radius = (config as CapsuleControllerConfig).radius
      ;(controllerDesc as PhysX.PxCapsuleControllerDesc).climbingMode =
        (config as CapsuleControllerConfig).climbingMode ?? PhysX.PxCapsuleClimbingMode.eEASY
    } else {
      ;(controllerDesc as PhysX.PxBoxControllerDesc).halfForwardExtent = (
        config as BoxControllerConfig
      ).halfForwardExtent
      ;(controllerDesc as PhysX.PxBoxControllerDesc).halfHeight = (config as BoxControllerConfig).halfHeight
      ;(controllerDesc as PhysX.PxBoxControllerDesc).halfSideExtent = (config as BoxControllerConfig).halfSideExtent
    }
    controllerDesc.stepOffset = config.stepOffset ?? 0.1
    controllerDesc.maxJumpHeight = config.maxJumpHeight ?? 0.1
    controllerDesc.contactOffset = config.contactOffset ?? 0.01
    controllerDesc.invisibleWallHeight = config.invisibleWallHeight ?? 0.25
    controllerDesc.slopeLimit = config.slopeLimit ?? Math.cos((45 * Math.PI) / 180)
    controllerDesc.setReportCallback(
      PhysX.PxUserControllerHitReport.implement({
        onShapeHit: (event: PhysX.PxControllerShapeHit) => {
          const shape = event.getShape()
          const shapeID = this.shapeIDByPointer.get(shape.$$.ptr)!
          const bodyID = this.bodyIDByShapeID.get(shapeID)
          const position = event.getWorldPos()
          const normal = event.getWorldNormal()
          const length = event.getLength()
          this.collisionEventQueue.push({
            type: ControllerEvents.CONTROLLER_SHAPE_HIT,
            controller,
            bodyID,
            shapeID,
            position,
            normal,
            length
          })
        },
        onControllerHit: (event: PhysX.PxControllersHit) => {
          const other = event.getOther()
          const bodyID = this.controllerIDByPointer.get(other.$$.ptr)
          const shapeID = this.shapeIDByPointer.get((other.getActor().getShapes() as PhysX.PxShape).$$.ptr)
          const position = event.getWorldPos()
          const normal = event.getWorldNormal()
          const length = event.getLength()
          this.collisionEventQueue.push({
            type: ControllerEvents.CONTROLLER_CONTROLLER_HIT,
            controller,
            bodyID,
            shapeID,
            position,
            normal,
            length
          })
        },
        onObstacleHit: (event: PhysX.PxControllerObstacleHit) => {
          const obstacleID = event.getUserData()
          // TODO
          // const data = getFromPhysXHeap(PhysX.HEAPU32, ptr, 1);
          const position = event.getWorldPos()
          const normal = event.getWorldNormal()
          const length = event.getLength()
          this.collisionEventQueue.push({
            type: ControllerEvents.CONTROLLER_OBSTACLE_HIT,
            controller,
            obstacleID,
            position,
            normal,
            length
          })
        }
      })
    )
    if (!controllerDesc.isValid()) {
      console.warn('[WARN] Controller Description invalid!')
    }
    const controller = config.isCapsule
      ? this.controllerManager.createCapsuleController(controllerDesc)
      : this.controllerManager.createBoxController(controllerDesc)
    this.controllers.set(id, controller)
    this.controllerIDByPointer.set(controller.$$.ptr, id)
    const actor = controller.getActor()
    this.bodies.set(id, actor)
    const shapes = actor.getShapes() as PhysX.PxShape
    const shapeid = this._getNextAvailableShapeID()
    ;(actor as any)._shapes = [shapes]
    this.shapeIDByPointer.set(shapes.$$.ptr, id)
    this.shapes.set(shapeid, shapes)
    ;(shapes as any)._id = shapeid
    ;(actor as any)._type = BodyType.CONTROLLER
    ;(actor as any)._debugNeedsUpdate = true
    ;(controller as any)._id = id
    return controller
  }

  removeController(controller: PhysX.PxController) {
    const id = (controller as any)._id
    console.log('controller id: ' + id)
    const actor = controller.getActor()
    const shapes = actor.getShapes() as PhysX.PxShape
    this.controllerIDByPointer.delete(controller.$$.ptr)
    this.shapeIDByPointer.delete(shapes.$$.ptr)
    this.controllers.delete(id)
    this.bodies.delete(id)
    controller.release()
    // todo
  }

  createObstacle(position: Vector3, rotation: Quaternion, config: ObstacleConfig) {
    const { isCapsule, halfExtents, halfHeight, radius } = config
    const id = this._getNextAvailableObstacleID()
    const obstacle = new (isCapsule ? PhysX.PxCapsuleObstacle : PhysX.PxBoxObstacle)()
    ;(obstacle as any)._id = id
    ;(obstacle as any)._isCapsule = isCapsule
    // todo: allow for more than a single int in memory for userData
    obstacle.setUserData(putIntoPhysXHeap(PhysX.HEAPU32, [id]))
    obstacle.setPosition(position)
    obstacle.setRotation(rotation)
    if (isCapsule) {
      ;(obstacle as PhysX.PxCapsuleObstacle).setHalfHeight(halfHeight)
      ;(obstacle as PhysX.PxCapsuleObstacle).setRadius(radius)
    } else {
      ;(obstacle as PhysX.PxBoxObstacle).setHalfExtents(halfExtents)
    }
    const handle = this.obstacleContext.addObstacle(obstacle)
    ;(obstacle as any)._handle = handle
    this.obstacles.set(id, obstacle)
  }

  removeObstacle(obstacle: PhysX.PxObstacle) {
    const handle = (obstacle as any)._handle
    const id = (obstacle as any)._id
    this.obstacleContext.removeObstacle(handle)
    this.obstacles.delete(id)
  }

  getRigidbodyShapes(body: PhysX.PxRigidActor) {
    const shapesResult = body.getShapes()
    const shapes = ((shapesResult as PhysX.PxShape[]).length ? shapesResult : [shapesResult]) as PhysX.PxShape[]
    return shapes.map((shape) => this.shapes.get(this.shapeIDByPointer.get(shape.$$.ptr)!)!) // get original ref
  }

  doRaycast(raycastQuery: ComponentType<typeof RaycastComponent>) {
    raycastQuery.hits = []
    if (raycastQuery.type === SceneQueryType.Closest) {
      const buffer = new PhysX.PxRaycastHit()
      // todo - implement query filter bindings
      // const queryCallback = PhysX.PxQueryFilterCallback.implement({
      //   preFilter: (filterData, shape, actor) => { return PhysX.PxQueryHitType.eBLOCK },
      //   postFilter: (filterData, hit) => { return PhysX.PxQueryHitType.eBLOCK  }
      // });
      const hasHit = this.scene.raycastSingle(
        raycastQuery.origin,
        raycastQuery.direction,
        raycastQuery.maxDistance,
        raycastQuery.flags,
        buffer,
        raycastQuery.filterData
      )
      if (hasHit) {
        const shape = buffer.getShape()
        if (shape) {
          raycastQuery.hits.push({
            distance: buffer.distance,
            normal: buffer.normal,
            position: buffer.position,
            _bodyID: this.bodyIDByShapeID.get(this.shapeIDByPointer.get(shape.$$.ptr)!)!
          })
        }
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
  }
  private _getNextAvailableBodyID() {
    // todo, make this smart
    return nextAvailableBodyIndex++
  }

  private _getNextAvailableShapeID() {
    // todo, make this smart
    return nextAvailableShapeID++
  }

  private _getNextAvailableObstacleID() {
    // todo, make this smart
    return nextAvailableObstacleID++
  }
}

// TODO double check this
export const isTriggerShape = (shape: PhysX.PxShape) => {
  return shape.getFlags().isSet(PhysX.PxShapeFlag.eTRIGGER_SHAPE)
}

// TODO double check this
export const getGeometryType = (shape: PhysX.PxShape) => {
  return (shape.getGeometry().getType() as any).value
}

export const getGeometryScale = (shape: PhysX.PxShape) => {
  let geometryType = getGeometryType(shape)
  if (geometryType === PhysX.PxGeometryType.eTRIANGLEMESH.value) {
    let geometry = new PhysX.PxTriangleMeshGeometry()
    shape.getTriangleMeshGeometry(geometry as PhysX.PxTriangleMeshGeometry)
    const meshScale = (geometry as any).getScale() as any
    return meshScale.getScale()
  } else if (geometryType === PhysX.PxGeometryType.eBOX.value) {
    let geometry = new PhysX.PxBoxGeometry(0, 0, 0)
    shape.getBoxGeometry(geometry as PhysX.PxBoxGeometry)
    let meshScale = geometry.halfExtents
    return meshScale
  } else {
    console.warn('getGeometryScale does not work currently for the geometry type', geometryType)
    return new PhysX.PxMeshScale(0, 0)
  }
}

export const isKinematicBody = (body: PhysX.PxRigidActor) => {
  return body._type === BodyType.KINEMATIC
}

export const isControllerBody = (body: PhysX.PxRigidActor) => {
  return body._type === BodyType.CONTROLLER
}

export const isDynamicBody = (body: PhysX.PxRigidActor) => {
  return body._type === BodyType.DYNAMIC
}

export const isStaticBody = (body: PhysX.PxRigidActor) => {
  return body._type === BodyType.STATIC
}

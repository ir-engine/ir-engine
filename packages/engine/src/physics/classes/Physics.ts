import { loadPhysX } from '../physx/loadPhysX'
import {
  PhysXConfig,
  BodyType,
  RigidBody,
  ShapeType,
  ControllerConfig,
  SceneQuery,
  CollisionEvents,
  ControllerEvents
} from '../types/PhysicsTypes'
import { putIntoPhysXHeap } from '../functions/physxHelpers'
import { getShape } from './getShape'

const defaultMask = 0

export class Physics {
  instance: Physics = null

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

  private bodies: Map<number, PhysX.PxRigidActor> = new Map<number, PhysX.PxRigidActor>()
  private dynamic: Map<number, PhysX.PxRigidActor> = new Map<number, PhysX.PxRigidActor>()
  private shapes: Map<number, PhysX.PxShape> = new Map<number, PhysX.PxShape>()
  private shapeIDByPointer: Map<number, number> = new Map<number, number>()
  private controllerIDByPointer: Map<number, number> = new Map<number, number>()
  private bodyIDByShapeID: Map<number, number> = new Map<number, number>()
  private indices: Map<number, number> = new Map<number, number>()
  private controllers: Map<number, PhysX.PxController> = new Map<number, PhysX.PxController>()
  private raycasts: Map<number, SceneQuery> = new Map<number, SceneQuery>()
  private obstacles: Map<number, number> = new Map<number, number>()

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
    this.physics = PhysX.PxCreatePhysics(this.physxVersion, this.foundation, tolerance, false, null)

    const triggerCallback = {
      onContactBegin: (
        shapeA: PhysX.PxShape,
        shapeB: PhysX.PxShape,
        contactPoints: PhysX.PxVec3Vector,
        contactNormals: PhysX.PxVec3Vector,
        impulses: PhysX.PxRealVector
      ) => {
        const contacts = []
        for (let i = 0; i < contactPoints.size(); i++) {
          if (impulses.get(i) > 0) {
            contacts.push({
              point: contactPoints.get(i),
              normal: contactNormals.get(i),
              impulse: impulses.get(i)
            })
          }
        }
        this.onEvent({
          event: CollisionEvents.COLLISION_START,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
          contacts
        })
      },
      onContactEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_END,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr)
        })
      },
      onContactPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        this.onEvent({
          event: CollisionEvents.COLLISION_PERSIST,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr)
        })
      },
      onTriggerBegin: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        // console.log('onTriggerBegin', shapeA, shapeB)
        this.onEvent({
          event: CollisionEvents.TRIGGER_START,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr)
        })
      },
      // onTriggerPersist: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
      //   this.onEvent({
      //     event: CollisionEvents.TRIGGER_PERSIST,
      //     idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
      //     idB: this.shapeIDByPointer.get(shapeB.$$.ptr),
      //   });
      // },
      onTriggerEnd: (shapeA: PhysX.PxShape, shapeB: PhysX.PxShape) => {
        // console.log('onTriggerEnd', shapeA, shapeB)
        this.onEvent({
          event: CollisionEvents.TRIGGER_END,
          idA: this.shapeIDByPointer.get(shapeA.$$.ptr),
          idB: this.shapeIDByPointer.get(shapeB.$$.ptr)
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

  addBody = (config: RigidBody) => {
    const { id, transform, shapes, type } = config

    let rigidBody: PhysX.PxRigidStatic | PhysX.PxRigidDynamic

    if (type === BodyType.STATIC) {
      rigidBody = this.physics.createRigidStatic(transform)
    } else {
      rigidBody = this.physics.createRigidDynamic(transform)
    }
    ;(rigidBody as any)._type = type

    shapes.forEach(({ id: shapeID, shape, transform, options, config }: ShapeType) => {
      const bodyShape = getShape(this, {
        shape,
        transform,
        options,
        config
      })
      if (!bodyShape) return
      let collisionLayer = defaultMask
      let collisionMask = defaultMask
      if (typeof config?.collisionLayer !== 'undefined') {
        collisionLayer = config.collisionLayer
      }
      if (typeof config?.collisionMask !== 'undefined') {
        collisionMask = config.collisionMask
      }
      ;(bodyShape as any)._collisionLayer = collisionLayer
      ;(bodyShape as any)._collisionMask = collisionMask
      bodyShape.setSimulationFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0))
      bodyShape.setQueryFilterData(new PhysX.PxFilterData(collisionLayer, collisionMask, 0, 0))
      rigidBody.attachShape(bodyShape)
      this.shapeIDByPointer.set(bodyShape.$$.ptr, shapeID)
      this.shapes.set(shapeID, bodyShape)
      this.bodyIDByShapeID.set(shapeID, id)
    })
    this.bodies.set(id, rigidBody)
    this.scene.addActor(rigidBody, null)

    delete config.type
    this.updateBody(config)
  }

  updateBody = (config: RigidBody) => {
    const body = this.bodies.get(config.id)
    if (!isStaticBody(body)) {
      if (typeof config.useCCD !== 'undefined') {
        ;(body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eENABLE_CCD, config.useCCD)
      }
      if (typeof config.type !== 'undefined') {
        const transform = body.getGlobalPose()
        if (config.type === BodyType.KINEMATIC) {
          ;(body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, true)
          ;(body as any)._type = BodyType.KINEMATIC
        } else {
          ;(body as PhysX.PxRigidDynamic).setRigidBodyFlag(PhysX.PxRigidBodyFlag.eKINEMATIC, false)
          ;(body as any)._type = BodyType.DYNAMIC
        }
        body.setGlobalPose(transform, true)
      }
      if (config.mass) {
        ;(body as PhysX.PxRigidDynamic).setMass(config.mass)
      }
      if (config.linearDamping) {
        ;(body as PhysX.PxRigidDynamic).setLinearDamping(config.linearDamping)
      }
      if (config.angularDamping) {
        ;(body as PhysX.PxRigidDynamic).setAngularDamping(config.angularDamping)
      }
    }
    if (config.linearVelocity) {
      const linearVelocity = body.getLinearVelocity()
      body.setLinearVelocity(
        {
          x: config.linearVelocity.x ?? linearVelocity.x,
          y: config.linearVelocity.y ?? linearVelocity.x,
          z: config.linearVelocity.z ?? linearVelocity.z
        },
        true
      )
    }
    if (config.angularVelocity) {
      const angularVelocity = body.getAngularVelocity()
      body.setAngularVelocity(
        {
          x: config.angularVelocity.x ?? angularVelocity.x,
          y: config.angularVelocity.y ?? angularVelocity.x,
          z: config.angularVelocity.z ?? angularVelocity.z
        },
        true
      )
    }
    if (config.transform) {
      const transform = body.getGlobalPose()
      if (config.transform.translation) {
        transform.translation.x = config.transform.translation.x ?? transform.translation.x
        transform.translation.y = config.transform.translation.y ?? transform.translation.y
        transform.translation.z = config.transform.translation.z ?? transform.translation.z
      }
      if (config.transform.rotation) {
        transform.rotation.x = config.transform.rotation.x ?? transform.rotation.x
        transform.rotation.y = config.transform.rotation.y ?? transform.rotation.y
        transform.rotation.z = config.transform.rotation.z ?? transform.rotation.z
        transform.rotation.w = config.transform.rotation.w ?? transform.rotation.w
      }
      body.setGlobalPose(transform, true)
    }
    config.shapes?.forEach((shape) => this.updateShape(shape))
  }

  updateShape = ({ id, config, options, shape, transform }: ShapeType) => {
    if (!config) config = {}
    const shapePx = this.shapes.get(id)
    if (!shapePx) return
    if (typeof config.collisionLayer !== 'undefined') {
      ;(shapePx as any)._collisionLayer = config.collisionLayer
    }
    if (typeof config.collisionMask !== 'undefined') {
      ;(shapePx as any)._collisionMask = config.collisionMask
    }
    if (typeof config.collisionLayer !== 'undefined' || typeof config.collisionMask !== 'undefined') {
      shapePx.setSimulationFilterData(
        new PhysX.PxFilterData((shapePx as any)._collisionLayer, (shapePx as any)._collisionMask, 0, 0)
      )
      shapePx.setQueryFilterData(
        new PhysX.PxFilterData((shapePx as any)._collisionLayer, (shapePx as any)._collisionMask, 0, 0)
      )
    }
    if (typeof config.material !== 'undefined') {
      const materials = shapePx.getMaterials() as PhysX.PxMaterial
      if (typeof config.material.staticFriction !== 'undefined') {
        materials.setStaticFriction(config.material.staticFriction)
      }
      if (typeof config.material.dynamicFriction !== 'undefined') {
        materials.setDynamicFriction(config.material.dynamicFriction)
      }
      if (typeof config.material.restitution !== 'undefined') {
        materials.setRestitution(config.material.restitution)
      }
    }
    if (typeof config.contactOffset !== 'undefined') {
      shapePx.setContactOffset(config.contactOffset)
    }
    if (typeof config.restOffset !== 'undefined') {
      shapePx.setRestOffset(config.restOffset)
    }
    if (typeof transform !== 'undefined') {
      if (transform) {
        const localPose = shapePx.getLocalPose()
        if (localPose.translation) {
          localPose.translation.x = transform.translation.x ?? localPose.translation.x
          localPose.translation.y = transform.translation.y ?? localPose.translation.y
          localPose.translation.z = transform.translation.z ?? localPose.translation.z
        }
        if (transform.rotation) {
          localPose.rotation.x = transform.rotation.x ?? localPose.rotation.x
          localPose.rotation.y = transform.rotation.y ?? localPose.rotation.y
          localPose.rotation.z = transform.rotation.z ?? localPose.rotation.z
          localPose.rotation.w = transform.rotation.w ?? localPose.rotation.w
        }
        shapePx.setLocalPose(localPose)
      }
    }
  }

  removeBody = ({ id }) => {
    const body = this.bodies.get(id)
    const shapes = body.getShapes()
    const shapesArray = ((shapes as PhysX.PxShape[]).length ? shapes : [shapes]) as PhysX.PxShape[]
    shapesArray.forEach((shape) => {
      const shapeID = this.shapeIDByPointer.get(shape.$$.ptr)
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

  createController = ({ id, config }: { id: number; config: ControllerConfig }) => {
    const controllerDesc = config.isCapsule ? new PhysX.PxCapsuleControllerDesc() : new PhysX.PxBoxControllerDesc()
    controllerDesc.position = { x: config.position?.x ?? 0, y: config.position?.y ?? 0, z: config.position?.z ?? 0 }
    if (config.isCapsule) {
      ;(controllerDesc as PhysX.PxCapsuleControllerDesc).height = config.height
      ;(controllerDesc as PhysX.PxCapsuleControllerDesc).radius = config.radius
      ;(controllerDesc as PhysX.PxCapsuleControllerDesc).climbingMode =
        config.climbingMode ?? PhysX.PxCapsuleClimbingMode.eEASY
    } else {
      ;(controllerDesc as PhysX.PxBoxControllerDesc).halfForwardExtent = config.halfForwardExtent
      ;(controllerDesc as PhysX.PxBoxControllerDesc).halfHeight = config.halfHeight
      ;(controllerDesc as PhysX.PxBoxControllerDesc).halfSideExtent = config.halfSideExtent
    }
    controllerDesc.stepOffset = config.stepOffset ?? 0.1
    controllerDesc.maxJumpHeight = config.maxJumpHeight ?? 0.1
    controllerDesc.contactOffset = config.contactOffset ?? 0.01
    controllerDesc.invisibleWallHeight = config.invisibleWallHeight ?? 0
    controllerDesc.slopeLimit = config.slopeLimit ?? Math.cos((45 * Math.PI) / 180)
    controllerDesc.setReportCallback(
      PhysX.PxUserControllerHitReport.implement({
        onShapeHit: (event: PhysX.PxControllerShapeHit) => {
          const shape = event.getShape()
          const shapeID = this.shapeIDByPointer.get(shape.$$.ptr)
          const bodyID = this.bodyIDByShapeID.get(shapeID)
          const position = event.getWorldPos()
          const normal = event.getWorldNormal()
          const length = event.getLength()
          this.onEvent({
            event: ControllerEvents.CONTROLLER_SHAPE_HIT,
            controllerID: id,
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
          this.onEvent({
            event: ControllerEvents.CONTROLLER_CONTROLLER_HIT,
            controllerID: id,
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
          this.onEvent({
            event: ControllerEvents.CONTROLLER_OBSTACLE_HIT,
            controllerID: id,
            obstacleID,
            position,
            normal,
            length
          })
        }
      })
    )
    controllerDesc.setMaterial(
      this.physics.createMaterial(
        config.material?.staticFriction ?? 0,
        config.material?.dynamicFriction ?? 0,
        config.material?.restitution ?? 0
      )
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
    this.bodies.set(id, actor as any)
    const shapes = actor.getShapes() as PhysX.PxShape
    this.shapeIDByPointer.set(shapes.$$.ptr, config.id)
    ;(controller as any)._collisions = []
    ;(actor as any)._type = BodyType.CONTROLLER
    ;(controller as any)._filterData = new PhysX.PxFilterData(
      config.collisionLayer ?? defaultMask,
      config.collisionMask ?? defaultMask,
      0,
      0
    )
    ;(controller as any)._delta = { x: 0, y: 0, z: 0 }
    this.updateController(config)
  }

  updateController = (config: ControllerConfig) => {
    const controller = this.controllers.get(config.id)
    if (!controller) return
    if (typeof config.positionDelta !== 'undefined') {
      const currentPos = controller.getPosition()
      controller.setPosition({
        x: currentPos.x + (config.positionDelta.x ?? 0),
        y: currentPos.y + (config.positionDelta.y ?? 0),
        z: currentPos.z + (config.positionDelta.z ?? 0)
      })
    }
    if (typeof config.position !== 'undefined') {
      const currentPos = controller.getPosition()
      controller.setPosition({
        x: config.position.x ?? currentPos.x,
        y: config.position.y ?? currentPos.y,
        z: config.position.z ?? currentPos.z
      })
    }
    if (typeof config.height !== 'undefined') {
      ;(controller as PhysX.PxCapsuleController).setHeight(config.height)
    }
    if (typeof config.resize !== 'undefined') {
      ;(controller as PhysX.PxController).resize(config.resize)
    }
    if (typeof config.radius !== 'undefined') {
      ;(controller as PhysX.PxCapsuleController).setRadius(config.radius)
    }
    if (typeof config.climbingMode !== 'undefined') {
      ;(controller as PhysX.PxCapsuleController).setClimbingMode(config.climbingMode)
    }
    if (typeof config.halfForwardExtent !== 'undefined') {
      ;(controller as PhysX.PxBoxController).setHalfForwardExtent(config.halfForwardExtent)
    }
    if (typeof config.halfHeight !== 'undefined') {
      ;(controller as PhysX.PxBoxController).setHalfHeight(config.halfHeight)
    }
    if (typeof config.halfSideExtent !== 'undefined') {
      ;(controller as PhysX.PxBoxController).setHalfSideExtent(config.halfSideExtent)
    }
    if (typeof config.collisionLayer !== 'undefined') {
      ;(controller as any)._filterData.word0 = config.collisionLayer
    }
    if (typeof config.collisionMask !== 'undefined') {
      ;(controller as any)._filterData.word1 = config.collisionMask
    }
  }

  removeController = ({ id }) => {
    const controller = this.controllers.get(id)
    if (!controller) return
    const actor = controller.getActor()
    const shapes = actor.getShapes() as PhysX.PxShape
    this.controllerIDByPointer.delete(controller.$$.ptr)
    this.shapeIDByPointer.delete(shapes.$$.ptr)
    this.controllers.delete(id)
    this.bodies.delete(id)
    controller.release()
    // todo
  }

  addRaycastQuery = (query: SceneQuery) => {
    ;(query as any)._filterData = new PhysX.PxQueryFilterData()
    ;(query as any)._filterData.setWords(query.collisionMask ?? 1, 0)
    if (typeof query.flags === 'undefined') {
      query.flags =
        PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
    }
    ;(query as any)._filterData.setFlags(query.flags)
    this.raycasts.set(query.id, query)
  }

  updateRaycastQuery = (newArgs: SceneQuery) => {
    const { id, flags, maxDistance, maxHits, collisionMask } = newArgs
    const raycast = this.raycasts.get(id)
    if (!raycast) return
    if (typeof flags !== 'undefined') {
      raycast.flags = flags
    }
    if (typeof maxDistance !== 'undefined') {
      raycast.maxDistance = maxDistance
    }
    if (typeof maxHits !== 'undefined') {
      raycast.maxHits = maxHits
    }
    if (typeof collisionMask !== 'undefined') {
      raycast.collisionMask = collisionMask
      ;(raycast as any)._filterData.setWords(raycast.collisionMask ?? 1, 0)
    }
  }

  removeRaycastQuery = (id: number) => {
    this.raycasts.delete(id)
  }

  addObstacle = ({ id, isCapsule, position, rotation, halfExtents, halfHeight, radius }) => {
    const obstacle = new (isCapsule ? PhysX.PxCapsuleObstacle : PhysX.PxBoxObstacle)()
    // todo: allow for more than a single int in memory for userData
    obstacle.setUserData(putIntoPhysXHeap(PhysX.HEAPU32, [id]))
    obstacle.setPosition(position)
    obstacle.setRotation(rotation)
    halfExtents && (obstacle as PhysX.PxBoxObstacle).setHalfExtents(halfExtents)
    halfHeight && (obstacle as PhysX.PxCapsuleObstacle).setHalfHeight(halfHeight)
    radius && (obstacle as PhysX.PxCapsuleObstacle).setRadius(radius)
    const handle = this.obstacleContext.addObstacle(obstacle)
    this.obstacles.set(id, handle)
  }

  removeObstacle = (id: number) => {
    const handle = this.obstacles.get(id)
    this.obstacleContext.removeObstacle(handle)
    this.obstacles.delete(id)
  }
}

const isKinematicBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.KINEMATIC
}

const isControllerBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.CONTROLLER
}

const isDynamicBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.DYNAMIC
}

const isStaticBody = (body: PhysX.PxRigidActor) => {
  return (body as any)._type === BodyType.STATIC
}

const getBodyData = (body: PhysX.PxRigidActor) => {
  const transform = body.getGlobalPose()
  const linVel = body.getLinearVelocity()
  const angVel = body.getAngularVelocity()
  return [
    transform.translation.x,
    transform.translation.y,
    transform.translation.z,
    transform.rotation.x,
    transform.rotation.y,
    transform.rotation.z,
    transform.rotation.w,
    linVel.x,
    linVel.y,
    linVel.z,
    angVel.x,
    angVel.y,
    angVel.z
  ]
}

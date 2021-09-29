import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { GolfCollisionGroups, GolfColours } from '../GolfGameConstants'
import {
  BoxBufferGeometry,
  DoubleSide,
  Euler,
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  Quaternion
} from 'three'
import { CollisionGroups } from '@xrengine/engine/src/physics/enums/CollisionGroups'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { GolfClubComponent } from '../components/GolfClubComponent'
import { getHandTransform } from '@xrengine/engine/src/xr/functions/WebXRFunctions'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'
import { DebugArrowComponent } from '@xrengine/engine/src/debug/DebugArrowComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { isEntityLocalClient } from '@xrengine/engine/src/networking/functions/isEntityLocalClient'
import { GolfAction } from '../GolfAction'
import { getGolfPlayerNumber } from '../functions/golfFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { BodyType, SceneQueryType } from '@xrengine/engine/src/physics/types/PhysicsTypes'
import { RaycastComponentType } from '@xrengine/engine/src/physics/components/RaycastComponent'
import { CollisionComponent } from '@xrengine/engine/src/physics/components/CollisionComponent'

const vector0 = new Vector3()
const vector1 = new Vector3()
const vector2 = new Vector3()
const eulerX90 = new Euler(Math.PI * 0.5, 0, 0)

/**
 * @author Josh Field <github.com/HexaField>
 */

// export const spawnClub = (entityPlayer: Entity): void => {
//   const networkId = Network.getNetworkId()
//   const uuid = MathUtils.generateUUID()

//   const parameters: GolfClubSpawnParameters = {
//     playerNumber: getGolfPlayerNumber(entityPlayer)
//   }

//   dispatchFromServer(NetworkWorldAction.createObject(networkId, uuid, GolfPrefabTypes.Club, parameters))
// }

export const setClubOpacity = (golfClubComponent: ReturnType<typeof GolfClubComponent.get>, opacity: number): void => {
  golfClubComponent?.meshGroup?.traverse((obj: Mesh) => {
    if (obj.material) {
      ;(obj.material as Material).opacity = opacity
    }
  })
}

// export const enableClub = (entityClub: Entity, enable: boolean): void => {
//   const golfClubComponent = getComponent(entityClub, GolfClubComponent)
//   if (golfClubComponent.canHitBall === enable) return
//   golfClubComponent.canHitBall = enable
//   setClubOpacity(golfClubComponent, enable ? 1 : golfClubComponent.disabledOpacity)
// }

export const hideClub = (entityClub: Entity, hide: boolean): void => {
  const golfClubComponent = getComponent(entityClub, GolfClubComponent)
  // const maxOpacity = yourTurn ? 1 : golfClubComponent.disabledOpacity
  setClubOpacity(golfClubComponent, hide ? 0 : 1)
}

/**
 * @author Josh Field <github.com/HexaField>
 */

export const updateClub = (entityClub: Entity): void => {
  const world = useWorld()
  const { networkId, userId: ownerId } = getComponent(entityClub, NetworkObjectComponent)
  const ownerEntity = world.getUserAvatarEntity(ownerId)
  if (typeof ownerEntity === 'undefined') return

  const golfClubComponent = getComponent(entityClub, GolfClubComponent)

  const transformClub = getComponent(entityClub, TransformComponent)
  const collider = getComponent(entityClub, ColliderComponent)

  const handTransform = getHandTransform(ownerEntity)
  const { position, rotation } = handTransform

  transformClub.position.copy(position)
  transformClub.rotation.copy(rotation)

  golfClubComponent.raycast.origin.copy(position)
  golfClubComponent.raycast.direction.set(0, 0, -1).applyQuaternion(rotation)
  world.physics.doRaycast(golfClubComponent.raycast)

  const hit = golfClubComponent.raycast.hits[0]

  const headDistance = clubLength //!hit?.distance ? clubLength : Math.min(hit.distance, clubLength)

  // update position of club
  golfClubComponent.headGroup.position.setZ(-(headDistance - clubPutterLength * 0.5))
  golfClubComponent.neckObject.position.setZ(-headDistance * 0.5)
  golfClubComponent.neckObject.scale.setZ(headDistance * 0.5)

  golfClubComponent.headGroup.quaternion.setFromEuler(eulerX90)
  golfClubComponent.headGroup.getWorldDirection(vector2)
  golfClubComponent.raycast1.origin.copy(position.addScaledVector(vector2, -clubHalfWidth * 2))
  golfClubComponent.raycast1.direction.set(0, 0, -1).applyQuaternion(rotation)
  world.physics.doRaycast(golfClubComponent.raycast1)

  const hit1 = golfClubComponent.raycast1.hits[0]

  // if (hit && hit1) {
  //   // Update the head's up direction using ground normal
  //   // We can use interpolated normals between two ray hits for more accurate result
  //   vector0.set(hit.normal.x, hit.normal.y, hit.normal.z)

  //   // Only apply the rotation on nearly horizontal surfaces
  //   if (vector0.dot(vector1.set(0, 1, 0)) >= 0.75) {
  //     golfClubComponent.headGroup.up.copy(vector0)

  //     vector2.set(hit1.position.x - hit.position.x, hit1.position.y - hit.position.y, hit1.position.z - hit.position.z)

  //     golfClubComponent.headGroup.getWorldPosition(vector1)
  //     vector1.addScaledVector(vector2, -1)
  //     golfClubComponent.headGroup.lookAt(vector1)
  //   }
  // }

  if (isEntityLocalClient(ownerEntity)) {
    collider.body.setGlobalPose(
      {
        translation: position,
        rotation
      },
      true
    )

    // calculate velocity of the head of the golf club
    // average over multiple frames
    golfClubComponent.headGroup.getWorldPosition(vector1)
    vector0.subVectors(vector1, golfClubComponent.lastPositions[0])
    for (let i = 0; i < golfClubComponent.velocityPositionsToCalculate - 1; i++) {
      vector0.add(vector1.subVectors(golfClubComponent.lastPositions[i], golfClubComponent.lastPositions[i + 1]))
    }
    vector0.multiplyScalar(1 / (golfClubComponent.velocityPositionsToCalculate + 1))

    golfClubComponent.velocity.copy(vector0)

    // now shift all previous positions down the list
    for (let i = golfClubComponent.velocityPositionsToCalculate - 1; i > 0; i--) {
      golfClubComponent.lastPositions[i].copy(golfClubComponent.lastPositions[i - 1])
    }
    // add latest position to list
    golfClubComponent.headGroup.getWorldPosition(vector1)
    golfClubComponent.lastPositions[0].copy(vector1)

    // calculate relative rotation of club head
    vector0.copy(golfClubComponent.headGroup.position)
    vector1.copy(golfClubComponent.headGroup.children[0].position)
    vector1.applyQuaternion(golfClubComponent.headGroup.quaternion)
    vector0.add(vector1)

    const shape = useWorld().physics.getOriginalShapeObject(collider.body.getShapes())!

    // get club velocity in local space
    golfClubComponent.headGroup.getWorldPosition(vector1)
    golfClubComponent.headGroup.worldToLocal(vector1.add(golfClubComponent.velocity))

    const length = vector1.x * 2
    const newBoxGeometry = new PhysX.PxBoxGeometry(
      Math.abs(length) + clubHalfWidth * 0.5,
      clubHalfWidth * 0.5,
      clubPutterLength
    )
    shape.setGeometry(newBoxGeometry)
    shape.setLocalPose({
      translation: {
        x: vector0.x - length,
        y: vector0.y,
        z: vector0.z
      },
      rotation: golfClubComponent.headGroup.quaternion
    })

    shape._debugNeedsUpdate = true
  }
}

/**
 * @author Josh Field <github.com/HexaField>
 */

const clubHalfWidth = 0.03
const clubPutterLength = 0.1
const clubLength = 1.05
const rayLength = clubLength * 1.1

type GolfClubSpawnParameters = {
  playerNumber: number
}

export const initializeGolfClub = (action: typeof GolfAction.spawnBall.matches._TYPE) => {
  const world = useWorld()
  const ownerEntity = world.getUserAvatarEntity(action.userId)
  const entityClub = world.getNetworkObject(action.networkId)
  const playerNumber = getGolfPlayerNumber(action.userId)

  const transform = addComponent(entityClub, TransformComponent, {
    position: new Vector3(),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  addComponent(entityClub, VelocityComponent, { velocity: new Vector3() })
  addComponent(entityClub, NameComponent, { name: `GolfClub-${playerNumber}` })

  const color = GolfColours[playerNumber].clone()

  const filterData = new PhysX.PxQueryFilterData()
  filterData.setWords(CollisionGroups.Default | CollisionGroups.Ground | GolfCollisionGroups.Course, 0)
  const flags = PhysX.PxQueryFlag.eSTATIC.value | PhysX.PxQueryFlag.eDYNAMIC.value | PhysX.PxQueryFlag.eANY_HIT.value
  filterData.setFlags(flags)

  const raycast: RaycastComponentType = {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: new Vector3(),
    direction: new Vector3(0, -1, 0),
    maxDistance: rayLength,
    flags
  }

  const raycast1: RaycastComponentType = {
    filterData,
    type: SceneQueryType.Closest,
    hits: [],
    origin: new Vector3(),
    direction: new Vector3(0, -1, 0),
    maxDistance: rayLength,
    flags
  }

  const handleObject = new Mesh(
    new BoxBufferGeometry(clubHalfWidth, clubHalfWidth, 0.15),
    new MeshStandardMaterial({ color, transparent: true })
  )

  const headGroup = new Group()
  const headObject = new Mesh(
    new BoxBufferGeometry(clubHalfWidth, clubHalfWidth, clubPutterLength * 2),
    new MeshStandardMaterial({ color: 0x736e63, transparent: true })
  )
  // raise the club by half it's height and move it out by half it's length so it's flush to ground and attached at end
  headObject.position.set(0, clubHalfWidth, -(clubPutterLength * 0.5))
  headGroup.add(headObject)

  const neckObject = new Mesh(
    new BoxBufferGeometry(clubHalfWidth * 0.5, clubHalfWidth * 0.5, -1.75),
    new MeshStandardMaterial({ color: 0x736e63, transparent: true, side: DoubleSide })
  )

  const meshGroup = new Group()
  meshGroup.add(handleObject, headGroup, neckObject)

  meshGroup.traverse((obj) => {
    obj.castShadow = true
    obj.receiveShadow = true
  })
  addComponent(entityClub, Object3DComponent, { value: meshGroup })

  // since hitting balls are client authored, we only need the club collider on the local client
  if (isEntityLocalClient(ownerEntity)) {
    const shapeHead = world.physics.createShape(
      new PhysX.PxBoxGeometry(clubHalfWidth * 0.5, clubHalfWidth * 0.5, clubPutterLength),
      world.physics.physics.createMaterial(0, 0, 0),
      {
        isTrigger: true,
        collisionLayer: GolfCollisionGroups.Club,
        collisionMask: GolfCollisionGroups.Ball
      }
    )
    const body = world.physics.addBody({
      shapes: [shapeHead],
      type: BodyType.STATIC,
      transform: {
        translation: transform.position,
        rotation: new Quaternion()
      },
      userData: { entity: entityClub }
    })
    addComponent(entityClub, ColliderComponent, { body })
    addComponent(entityClub, CollisionComponent, { collisions: [] })
  }

  addComponent(entityClub, DebugArrowComponent, {
    color: 0xff00ff,
    direction: new Vector3(),
    position: new Vector3()
  })

  const golfClubComponent = addComponent(entityClub, GolfClubComponent, {
    canDoChipShots: false,
    neckObject,
    handleObject,
    headGroup,
    meshGroup,
    raycast,
    raycast1,
    canHitBall: false,
    hasHitBall: false,
    velocityPositionsToCalculate: 4,
    lastPositions: [],
    velocity: new Vector3(),
    velocityServer: new Vector3(),
    swingVelocity: 0,
    hidden: false,
    disabledOpacity: 0.3,
    number: playerNumber
  })

  for (let i = 0; i < golfClubComponent.velocityPositionsToCalculate; i++) {
    golfClubComponent.lastPositions[i] = new Vector3()
  }

  // enableClub(entityClub, false)
}

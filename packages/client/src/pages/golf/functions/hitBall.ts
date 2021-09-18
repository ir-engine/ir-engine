import { Vector3 } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { GolfClubComponent } from '../components/GolfClubComponent'
import { teleportRigidbody } from '@xrengine/engine/src/physics/functions/teleportRigidbody'

/**
 * @author Josh Field <github.com/HexaField>
 * @author HydraFire <github.com/HydraFire>
 */

const vector0 = new Vector3()
const clubPowerMultiplier = 3
// force is in kg, we need it in grams, so x1000
const velocityMultiplier = clubPowerMultiplier * 1000
const hitAdvanceFactor = 4

export const hitBall = (entityClub: Entity, entityBall?: Entity): void => {
  console.log('hitBall')
  const golfClubComponent = getComponent(entityClub, GolfClubComponent)
  const collider = getComponent(entityBall, ColliderComponent)
  const golfBallComponent = getComponent(entityBall, GolfBallComponent)

  //golfClubComponent.velocity.set(-0.000016128,0,-0.02352940744240586)
  // TODO: fix this - use normal and velocity magnitude to determine hits
  /*
  // get velocity in local space
  golfClubComponent.headGroup.getWorldQuaternion(quat).invert()
  vector0.copy(golfClubComponent.velocity).setY(0).applyQuaternion(quat);
  const clubMoveDirection = Math.sign(vector0.x);
  // club normal following whichever direction it's moving
  golfClubComponent.headGroup.getWorldDirection(vec3).setY(0).applyAxisAngle(upVector, clubMoveDirection * HALF_PI);
  // get the angle of incidence which is the angle from the normal to the angle of the velocity
  const angleOfIncidence = vector1.copy(vec3).applyQuaternion(quat).angleTo(vector0) * -Math.sign(vector0.z);
  // take the angle of incidence, and get the same angle on the other side of the normal, the angle of reflection
  vec3.applyAxisAngle(upVector, clubMoveDirection * angleOfIncidence).normalize().multiplyScalar(golfClubComponent.velocity.length());
*/

  vector0.copy(golfClubComponent.velocity).multiplyScalar(hitAdvanceFactor)
  // vector0.copy(vec3).multiplyScalar(hitAdvanceFactor);
  // lock to XZ plane if we disable chip shots
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }

  // block teleport ball if distance to wall less length of what we want to teleport
  golfBallComponent.wallRaycast.origin.copy(collider.body.getGlobalPose().translation as Vector3)
  golfBallComponent.wallRaycast.direction.copy(golfClubComponent.velocity).normalize()
  const hit = golfBallComponent.wallRaycast.hits[0]

  if (!hit || hit.distance * hit.distance > vector0.lengthSq()) {
    // teleport ball in front of club a little bit
    teleportRigidbody(collider.body, vector0.add(collider.body.getGlobalPose().translation as Vector3))
  }

  vector0.copy(golfClubComponent.velocity).multiplyScalar(velocityMultiplier)
  // vector1.copy(vec3).multiplyScalar(velocityMultiplier);
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }
  console.log('HIT FORCE:', vector0)
  ;(collider.body as PhysX.PxRigidDynamic).addForce(vector0)
}

import { Vector3 } from 'three'
import { isClient } from '../../../../common/functions/isClient'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { sendVelocity } from '../../../functions/functionsState'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { GolfClubComponent } from '../components/GolfClubComponent'

/**
 * @author Josh Field <github.com/HexaField>
 * @author HydraFire <github.com/HydraFire>
 */

const vector0 = new Vector3()

export const hitBall: Behavior = (
  entityClub: Entity,
  args?: any,
  delta?: number,
  entityBall?: Entity,
  time?: number,
  checks?: any
): void => {
  if (!hasComponent(entityClub, GolfClubComponent)) return

  const golfClubComponent = getMutableComponent(entityClub, GolfClubComponent)
  const collider = getMutableComponent(entityBall, ColliderComponent)
  const golfBallComponent = getMutableComponent(entityBall, GolfBallComponent)
  collider.body.setLinearDamping(0.1)
  collider.body.setAngularDamping(0.1)
  // force is in kg, we need it in grams, so x1000
  const velocityMultiplier = args.clubPowerMultiplier * 1000
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

  if (isClient) {
    vector0.copy(golfClubComponent.velocity).multiplyScalar(args.hitAdvanceFactor)
  } else {
    vector0.copy(golfClubComponent.velocityServer).multiplyScalar(args.hitAdvanceFactor)
  }
  // vector0.copy(vec3).multiplyScalar(hitAdvanceFactor);
  // lock to XZ plane if we disable chip shots
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }

  // block teleport ball if distance to wall less length of what we want to teleport
  golfBallComponent.wallRaycast.origin.copy(collider.body.transform.translation)
  if (isClient) {
    golfBallComponent.wallRaycast.direction.copy(golfClubComponent.velocity).normalize()
  } else {
    golfBallComponent.wallRaycast.direction.copy(golfClubComponent.velocityServer).normalize()
  }
  const hit = golfBallComponent.wallRaycast.hits[0]

  if (!hit || hit.distance * hit.distance > vector0.lengthSq()) {
    // teleport ball in front of club a little bit
    collider.body.updateTransform({
      translation: {
        x: collider.body.transform.translation.x + vector0.x,
        y: collider.body.transform.translation.y + vector0.y,
        z: collider.body.transform.translation.z + vector0.z
      }
    })
  }

  if (isClient) {
    vector0.copy(golfClubComponent.velocity).multiplyScalar(velocityMultiplier)
  } else {
    vector0.copy(golfClubComponent.velocityServer).multiplyScalar(velocityMultiplier)
  }
  // vector1.copy(vec3).multiplyScalar(velocityMultiplier);
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }
  console.log('HIT FORCE:', vector0.x, vector0.z)
  collider.body.addForce(vector0)
}

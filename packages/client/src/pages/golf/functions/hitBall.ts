import { Vector3 } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ColliderComponent } from '@xrengine/engine/src/physics/components/ColliderComponent'
import { GolfBallComponent } from '../components/GolfBallComponent'
import { GolfClubComponent } from '../components/GolfClubComponent'

/**
 * @author Josh Field <github.com/HexaField>
 * @author HydraFire <github.com/HydraFire>
 */

const vector0 = new Vector3()
const clubPowerMultiplier = 3
const hitAdvanceFactor = 4

export const hitBall = (entityClub: Entity, entityBall?: Entity): void => {
  console.log('hitBall')
  const golfClubComponent = getComponent(entityClub, GolfClubComponent)
  const collider = getComponent(entityBall, ColliderComponent)
  const golfBallComponent = getComponent(entityBall, GolfBallComponent)
  // collider.body.setLinearDamping(0.1)
  // collider.body.setAngularDamping(0.1)
  // force is in kg, we need it in grams, so x1000
  const velocityMultiplier = clubPowerMultiplier * 1000
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

  console.log(golfClubComponent.velocity)

  vector0.copy(golfClubComponent.velocity).multiplyScalar(hitAdvanceFactor)
  // vector0.copy(vec3).multiplyScalar(hitAdvanceFactor);
  // lock to XZ plane if we disable chip shots
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }

  // block teleport ball if distance to wall less length of what we want to teleport
  golfBallComponent.wallRaycast.origin.copy(collider.body.transform.translation)
  golfBallComponent.wallRaycast.direction.copy(golfClubComponent.velocity).normalize()
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

  vector0.copy(golfClubComponent.velocity).multiplyScalar(velocityMultiplier)
  // vector1.copy(vec3).multiplyScalar(velocityMultiplier);
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }
  console.log('HIT FORCE:', vector0)
  collider.body.addForce(vector0)
}

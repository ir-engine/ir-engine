import { Vector3 } from 'three'
import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getMutableComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../../../physics/components/ColliderComponent'
import { GolfClubComponent } from '../components/GolfClubComponent'

/**
 * @author Josh Field <github.com/HexaField>
 * @author HydraFire <github.com/HydraFire>
 */

const vector0 = new Vector3()
const vector1 = new Vector3()

export const hitBall: Behavior = (
  entityClub: Entity,
  args?: any,
  delta?: number,
  entityBall?: Entity,
  time?: number,
  checks?: any
): void => {
  // const game = getComponent(playerEntity, GamePlayer).game;
  // const gameSchema = GamesSchema[game.gameMode];
  console.warn('hitBall')

  if (!hasComponent(entityClub, GolfClubComponent)) return

  const golfClubComponent = getMutableComponent(entityClub, GolfClubComponent)
  const collider = getMutableComponent(entityBall, ColliderComponent)
  collider.body.setLinearDamping(0.1)
  collider.body.setAngularDamping(0.1)
  // force is in kg, we need it in grams, so x1000
  const velocityMultiplier = args.clubPowerMultiplier * 1000

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

  vector0.copy(golfClubComponent.velocity).multiplyScalar(args.hitAdvanceFactor).multiplyScalar(0.5)
  // vector0.copy(vec3).multiplyScalar(hitAdvanceFactor);
  // lock to XZ plane if we disable chip shots
  if (!golfClubComponent.canDoChipShots) {
    vector0.y = 0
  }
  // block teleport ball if distance to wall less length of what we want to teleport
  const dir = golfClubComponent.velocity.clone().normalize()
  const ballPosition = collider.body.transform.translation
  collider.raycastQuery2.origin.copy(ballPosition)
  collider.raycastQuery2.direction.copy(dir)
  // console.warn(collider.raycastQuery2.hits[0]?.distance, vector0.length());
  if (
    collider.raycastQuery2.hits[0]?.distance != undefined &&
    collider.raycastQuery2.hits[0].distance < vector0.length()
  ) {
    vector0.x = 0
    vector0.y = 0
    vector0.z = 0
  }

  // teleport ball in front of club a little bit
  collider.body.updateTransform({
    translation: {
      x: collider.body.transform.translation.x + vector0.x,
      y: collider.body.transform.translation.y + vector0.y,
      z: collider.body.transform.translation.z + vector0.z
    }
  })
  vector1.copy(golfClubComponent.velocity).multiplyScalar(velocityMultiplier).multiplyScalar(0.5)
  // vector1.copy(vec3).multiplyScalar(velocityMultiplier);
  if (!golfClubComponent.canDoChipShots) {
    vector1.y = 0
  }
  console.log(vector1)

  collider.body.addForce(vector1)
}

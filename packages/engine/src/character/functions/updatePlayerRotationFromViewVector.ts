import { Vector3 } from 'three'
import { applyVectorMatrixXZ } from '../../common/functions/applyVectorMatrixXZ'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CharacterComponent } from '../components/CharacterComponent'

const forwardVector = new Vector3(0, 0, 1)
const vector3 = new Vector3()

/**
 * Sets the player's rotation from the view vector, constrained to the XZ plane
 * @param {Entity} entity
 * @author Josh Field <github.com/HexaField>
 */

export const updatePlayerRotationFromViewVector = (entity: Entity, viewVector: Vector3): void => {
  const actor = getComponent(entity, CharacterComponent)
  actor.viewVector.copy(viewVector)
  const transform = getComponent(entity, TransformComponent)
  vector3.copy(actor.viewVector).setY(0).normalize()
  applyVectorMatrixXZ(vector3, forwardVector)
  transform.rotation.setFromUnitVectors(forwardVector, vector3)
}

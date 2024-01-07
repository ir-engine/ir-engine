import { Matrix4, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

export const getArmIKHint = (
  entity: Entity,
  handPosition: Vector3,
  handRotation: Quaternion,
  shoulderWorldPosition: Vector3,
  side: 'left' | 'right',
  hint: Vector3
) => {
  const transform = getComponent(entity, TransformComponent)
  // make a line pointing in the oppopsite direction the fingers are pointing
  // traverse the line back by the length of the forearm

  const avatarInverseMatrix = mat4.copy(transform.matrixWorld).invert()
  handLocalPosition.copy(handPosition).applyMatrix4(avatarInverseMatrix)

  const handLocalQuat = _quat.copy(transform.rotation).invert().multiply(handRotation)
  hint
    .set(side === 'left' ? 0.25 : -0.25, -0.25, 0)
    .applyQuaternion(handLocalQuat)
    .add(handLocalPosition)

  // ensure hint stays out of body
  const shoulderLocalPosition = _vector3.copy(shoulderWorldPosition).applyMatrix4(avatarInverseMatrix)
  hint.x =
    side === 'left'
      ? Math.max(hint.x, shoulderLocalPosition.x + 0.05)
      : Math.min(hint.x, shoulderLocalPosition.x - 0.05)
  hint.applyMatrix4(transform.matrixWorld)
}

const mat4 = new Matrix4()
const _quat = new Quaternion()
const _vector3 = new Vector3()
const handLocalPosition = new Vector3()

import { Vector3, Quaternion, Matrix4 } from 'three'
import { Behavior } from '../../common/interfaces/Behavior'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

function applyTransformToMesh(entity, mesh) {
  const transform = getComponent(entity, TransformComponent)

  const [position, quaternion, scale] = applyTransform(
    mesh.position,
    mesh.quaternion,
    mesh.scale,
    transform.position,
    transform.rotation,
    transform.scale
  )

  mesh.position.set(position.x, position.y, position.z)
  mesh.quaternion.copy(quaternion)
  mesh.scale.set(scale.x, scale.y, scale.z)
}

export function applyTransform(posM, queM, scaM, posE, queE, scaE): [Vector3, Quaternion, any] {
  const quaternionM = new Quaternion(queM.x, queM.y, queM.z, queM.w)
  const quaternionE = new Quaternion(queE.x, queE.y, queE.z, queE.w)
  const position = new Vector3().set(posM.x, posM.y, posM.z).applyQuaternion(quaternionE)
  const quaternion = new Quaternion()
  const scale = { x: 0, y: 0, z: 0 }
  position.x = position.x * scaE.x + posE.x
  position.y = position.y * scaE.y + posE.y
  position.z = position.z * scaE.z + posE.z
  quaternion.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(quaternionE),
      new Matrix4().makeRotationFromQuaternion(quaternionM)
    )
  )
  scale.x = scaM.x * scaE.x
  scale.y = scaM.y * scaE.y
  scale.z = scaM.z * scaE.z
  return [position, quaternion, scale]
}

/**
 * Disables rendering for models that have a physics type attached to userData
 * @param asset
 */

export const makeCollidersInvisible = (asset: any) => {
  const parseColliders = (mesh) => {
    if (mesh.userData.data === 'physics') {
      mesh.visible = false
      // if(mesh.material) {
      //   mesh.material.wireframe = true
      //   mesh.material.opacity = 0.2
      //   mesh.material.transparent = true
      // }
    }
  }
  asset.scene ? asset.scene.traverse(parseColliders) : asset.traverse(parseColliders)
}
/**
 * Removes physics objects from a model
 * @param entity
 * @param args
 */

export const removeCollidersFromModel: Behavior = (entity: Entity, asset: any) => {
  const arr = []
  asset?.traverse((mesh) => {
    if (mesh.userData.data === 'physics') {
      // add position from editor to mesh
      applyTransformToMesh(entity, mesh)
      arr.push(mesh)
    }
  })
  arr.forEach((mesh) => mesh.removeFromParent())
}

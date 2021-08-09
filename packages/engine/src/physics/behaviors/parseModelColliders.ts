import { Vector3, Quaternion, Matrix4, Mesh, Object3D } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createCollider } from './createCollider'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

/**
 * Applies an entity's transform component to a base mesh
 * @param {Entity} entity
 * @param {Mesh} mesh
 */

export function applyTransformToMesh(entity: Entity, mesh: Mesh) {
  const transform = getComponent(entity, TransformComponent)
  const position = new Vector3()
    .copy(mesh.position)
    .applyQuaternion(transform.rotation)
    .multiply(transform.scale)
    .add(transform.position)
  const quaternion = new Quaternion().setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transform.rotation),
      new Matrix4().makeRotationFromQuaternion(mesh.quaternion)
    )
  )
  const scale = new Vector3().copy(mesh.scale).multiply(transform.scale)

  mesh.position.copy(position)
  mesh.quaternion.copy(quaternion)
  mesh.scale.copy(scale)
}

/**
 * Returns the result of applying a transform to another transform
 * @param {Entity} entity
 * @param {Mesh} mesh
 * @returns {[Vector3, Quaternion, Vector3]}
 */

export function getTransform(posM, queM, scaM, posE, queE, scaE): [Vector3, Quaternion, Vector3] {
  const quaternionM = new Quaternion(queM.x, queM.y, queM.z, queM.w)
  const quaternionE = new Quaternion(queE.x, queE.y, queE.z, queE.w)
  const position = new Vector3().set(posM.x, posM.y, posM.z).applyQuaternion(quaternionE)
  const quaternion = new Quaternion()
  const scale = new Vector3()
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

const EPSILON = 1e-6

export const createCollidersFromModel = (entity: Entity, asset: any) => {
  const colliders = []
  const transform = getComponent(entity, TransformComponent)

  asset.traverse((mesh) => {
    if (mesh.userData.data === 'physics') {
      colliders.push(mesh)
    }
  })

  // remove physics assets so their models aren't added to the world
  colliders.forEach((mesh: Object3D) => {
    mesh.updateMatrixWorld(true)

    if (mesh.scale) {
      if (mesh.scale.x === 0) mesh.scale.x = EPSILON
      if (mesh.scale.y === 0) mesh.scale.y = EPSILON
      if (mesh.scale.z === 0) mesh.scale.z = EPSILON
    }
    const [position, quaternion, scale] = getTransform(
      mesh.getWorldPosition(new Vector3()),
      mesh.getWorldQuaternion(new Quaternion()),
      mesh.getWorldScale(new Vector3()),
      transform.position,
      transform.rotation,
      transform.scale
    )
    // console.log('IS NAN', mesh.scale)
    createCollider(mesh, position, quaternion, scale)
    mesh.removeFromParent()
  })
}

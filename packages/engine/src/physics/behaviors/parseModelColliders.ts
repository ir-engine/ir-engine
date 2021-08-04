import { Vector3, Quaternion, Matrix4, Mesh } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { getGeometry } from '../../scene/functions/getGeometry'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createCollider } from './createCollider'

/**
 * @author HydraFire <github.com/HydraFire>
 * @author Josh Field <github.com/HexaField>
 */

/**
 * Applies an entity's transform component to a mesh's local space transform
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

export const createCollidersFromModel = (entity: Entity, asset: any) => {
  const colliders = []

  asset?.traverse((mesh) => {
    if (mesh.userData.data === 'physics') {
      // apply component transform
      applyTransformToMesh(entity, mesh)

      // extract vertices and indices from trimesh
      if (mesh.userData.type == 'trimesh') {
        const geometry = getGeometry(mesh)
        mesh.userData.vertices = Array.from(geometry.attributes.position.array)
        mesh.userData.indices = Array.from(geometry.index.array)
      }

      // create collider and add to world
      createCollider(mesh.userData, mesh.position, mesh.quaternion, mesh.scale)
      colliders.push(mesh)
    }
  })

  // remove physics assets so their models aren't added to the world
  colliders.forEach((mesh) => {
    mesh.removeFromParent()
  })
}

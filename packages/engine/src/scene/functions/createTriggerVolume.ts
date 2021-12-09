import { BoxBufferGeometry, BoxHelper, Material, Mesh } from 'three'
import { ObjectLayers } from '../constants/ObjectLayers'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { createCollider } from '../../physics/functions/createCollider'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { Object3DComponent } from '../components/Object3DComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

export const createTriggerVolume = async function (entity, args): Promise<Mesh> {
  console.log('args are', args)

  const transform = getComponent(entity, TransformComponent)
  const pos = transform.position ?? { x: 0, y: 0, z: 0 }
  const rot = transform.rotation ?? { x: 0, y: 0, z: 0, w: 1 }
  const scale = transform.scale ?? { x: 1, y: 1, z: 1 }

  const geometry = new BoxBufferGeometry()
  const material = new Material()
  const boxMesh = new Mesh(geometry, material)
  boxMesh.position.set(pos.x, pos.y, pos.z)
  boxMesh.scale.set(scale.x, scale.y, scale.z)
  boxMesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)

  boxMesh.userData = {
    type: 'box',
    isTrigger: true,
    collisionLayer: CollisionGroups.Trigger,
    collisionMask: CollisionGroups.Default
  }

  createCollider(entity, boxMesh)

  addComponent(entity, TriggerVolumeComponent, {
    args: args,
    target: args.target,
    active: true
  })

  if (args.showHelper) {
    // A visual representation for the trigger
    boxMesh.scale.multiplyScalar(2) // engine uses half-extents for box size, to be compatible with gltf and threejs
    const box = new BoxHelper(boxMesh, 0xffff00)
    box.layers.set(ObjectLayers.Gizmos)
    addComponent(entity, Object3DComponent, { value: box })
  }

  return boxMesh
}

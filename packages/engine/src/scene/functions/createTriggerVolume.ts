import { BoxBufferGeometry, BoxHelper, Material, Mesh, Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { createCollider } from '../../physics/functions/createCollider'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'
import { addObject3DComponent } from './addObject3DComponent'

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

  if (args.showHelper) {
    // A visual representation for the trigger
    const box = new BoxHelper(boxMesh, 0xffff00)
    box.layers.set(1)
    addObject3DComponent(entity, box, {})
  }

  boxMesh.userData = {
    type: 'box',
    collisionLayer: CollisionGroups.Trigger,
    collisionMask: CollisionGroups.Default
  }

  createCollider(entity, boxMesh)

  addComponent(entity, TriggerVolumeComponent, {
    args: args,
    target: args.target,
    active: false
  })

  return boxMesh
}

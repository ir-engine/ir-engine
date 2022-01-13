import { createEntity } from '../../ecs/functions/EntityFunctions'
import { VelocityComponent } from '../components/VelocityComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import {
  BoxBufferGeometry,
  CylinderBufferGeometry,
  Mesh,
  MeshNormalMaterial,
  Quaternion,
  SphereBufferGeometry,
  Vector3
} from 'three'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { BodyType } from '../types/PhysicsTypes'
import { CapsuleBufferGeometry } from '../../common/classes/CapsuleBufferGeometry'

export const createRigidbody = (world, type) => {
  const entity = createEntity(world)
  let geom
  switch (type) {
    case 'box':
      geom = new BoxBufferGeometry(2, 2, 2)
      break
    case 'sphere':
      geom = new SphereBufferGeometry()
      break
    case 'capsule':
      geom = new CapsuleBufferGeometry(1, 1, 2)
      break
    case 'cylinder':
      geom = new CylinderBufferGeometry()
      break
  }
  const mesh = new Mesh(geom, new MeshNormalMaterial())
  mesh.userData = {
    type,
    bodyType: BodyType.DYNAMIC
  }

  addComponent(entity, VelocityComponent, {
    velocity: new Vector3()
  })

  addComponent(entity, Object3DComponent, {
    value: mesh
  })

  addComponent(entity, TransformComponent, {
    position: new Vector3().random().multiplyScalar(5).add(new Vector3(0, 5, 0)),
    rotation: new Quaternion(),
    scale: new Vector3(0.5, 0.5, 0.5)
  })

  // createCollider(entity, mesh)
}

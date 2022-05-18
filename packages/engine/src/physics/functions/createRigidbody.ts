import {
  BoxBufferGeometry,
  CylinderBufferGeometry,
  Mesh,
  MeshNormalMaterial,
  Quaternion,
  SphereBufferGeometry,
  Vector3
} from 'three'

import { CapsuleBufferGeometry } from '../../common/classes/CapsuleBufferGeometry'
import { createVector3Proxy } from '../../common/proxies/three'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VelocityComponent } from '../components/VelocityComponent'
import { BodyType } from '../types/PhysicsTypes'

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

  const linearVelocity = createVector3Proxy(VelocityComponent.linear, entity)
  const angularVelocity = createVector3Proxy(VelocityComponent.angular, entity)
  addComponent(entity, VelocityComponent, { linear: linearVelocity, angular: angularVelocity })

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

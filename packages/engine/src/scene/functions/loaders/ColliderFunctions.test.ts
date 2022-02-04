import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Mesh, MeshNormalMaterial, Quaternion, SphereBufferGeometry, Vector3 } from 'three'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { addComponent, getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { getGeometryScale } from '../../../physics/classes/Physics'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { CollisionComponent } from '../../../physics/components/CollisionComponent'
import { BodyType } from '../../../physics/types/PhysicsTypes'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { deserializeCollider } from './ColliderFunctions'

describe('ColliderFunctions', () => {
  it('deserializeCollider', async () => {
    const world = createWorld()
    Engine.currentWorld = world
    await Engine.currentWorld.physics.createScene({ verbose: true })

    const entity = createEntity(world)
    const type = 'trimesh'
    let geom = new SphereBufferGeometry()

    const scale = new Vector3(2, 2, 2)
    const mesh = new Mesh(geom, new MeshNormalMaterial())
    mesh.scale.x = scale.x
    mesh.scale.y = scale.y
    mesh.scale.z = scale.z
    const bodyOptions = {
      type,
      bodyType: BodyType.DYNAMIC
    }
    mesh.userData = bodyOptions

    addComponent(entity, Object3DComponent, {
      value: mesh
    })

    addComponent(entity, TransformComponent, {
      position: new Vector3(0, 2, 0),
      rotation: new Quaternion(),
      scale: new Vector3(1, 1, 1)
    })

    const sceneComponentData = bodyOptions
    const sceneComponent: ComponentJson = {
      name: 'collider',
      props: sceneComponentData
    }

    deserializeCollider(entity, sceneComponent)

    assert(hasComponent(entity, ColliderComponent))
    const body = getComponent(entity, ColliderComponent).body
    assert.deepEqual(body._type, bodyOptions.bodyType)
    const shapes = Engine.currentWorld.physics.getRigidbodyShapes(body)
    for (let shape of shapes) {
      const shapeScale = getGeometryScale(shape)
      assert.equal(shapeScale.x, scale.x)
      assert.equal(shapeScale.y, scale.y)
      assert.equal(shapeScale.z, scale.z)
    }
    assert(hasComponent(entity, CollisionComponent))

    // clean up physx
    delete (globalThis as any).PhysX
  })
})

import { createEntity, destroyEngine, getComponent, removeComponent, setComponent } from '@etherealengine/ecs'
import { getMutableState } from '@etherealengine/hyperflux'
import assert from 'assert'
import { TransformComponent } from '../../SpatialModule'
import { createEngine } from '../../initializeEngine'
import { Physics } from '../classes/Physics'
import { PhysicsState } from '../state/PhysicsState'
import { ColliderComponent } from './ColliderComponent'
import { RigidBodyComponent } from './RigidBodyComponent'
import { TriggerComponent } from './TriggerComponent'

describe('ColliderComponent', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    getMutableState(PhysicsState).physicsWorld.set(Physics.createWorld())
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('should add collider to rigidbody', () => {
    const entity = createEntity()

    setComponent(entity, TransformComponent)

    setComponent(entity, RigidBodyComponent, { type: 'fixed' })
    setComponent(entity, ColliderComponent)

    const rigidbody = getComponent(entity, RigidBodyComponent)
    const collider = getComponent(entity, ColliderComponent)

    assert.equal(rigidbody.body.numColliders(), 1)
    assert(collider.collider)
    assert.equal(collider.collider, rigidbody.body.collider(0))
  })

  it('should remove collider from rigidbody', async () => {
    const entity = createEntity()

    setComponent(entity, TransformComponent)

    setComponent(entity, RigidBodyComponent, { type: 'fixed' })
    setComponent(entity, ColliderComponent)

    const rigidbody = getComponent(entity, RigidBodyComponent)
    const collider = getComponent(entity, ColliderComponent)

    assert.equal(rigidbody.body.numColliders(), 1)
    assert(collider.collider)
    assert.equal(collider.collider, rigidbody.body.collider(0))

    const promise = removeComponent(entity, ColliderComponent)
    assert.equal(rigidbody.body.numColliders(), 0)

    await promise
    assert.equal(collider.collider, null)
  })

  it('should add trigger collider', () => {
    const entity = createEntity()

    setComponent(entity, TransformComponent)

    setComponent(entity, RigidBodyComponent, { type: 'fixed' })
    setComponent(entity, TriggerComponent)
    setComponent(entity, ColliderComponent)

    const collider = getComponent(entity, ColliderComponent)

    assert.equal(collider.collider!.isSensor(), true)
  })
})

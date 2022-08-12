import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Object3D } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NavMesh } from '../../scene/classes/NavMesh'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'

describe('NavigationSystem', async () => {
  let updateNavMesh = sinon.spy()
  let sceneObjectUpdateAction: { entities: Entity[] }
  const createActionQueue = () => () => [sceneObjectUpdateAction]

  let navigationSystem: () => void
  const { default: NavigationSystem } = proxyquire('./NavigationSystem', {
    '../../scene/functions/loaders/NavMeshFunctions': { updateNavMesh },
    '@xrengine/hyperflux': { createActionQueue }
  })

  beforeEach(async () => {
    createEngine()
    navigationSystem = await NavigationSystem(Engine.instance.currentWorld)
    updateNavMesh.resetHistory()
  })

  it('updates navMeshes on modifyProperty command', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    sceneObjectUpdateAction = { entities: [entity] }

    addComponent(entity, NavMeshComponent, { value: new NavMesh() })

    navigationSystem()

    assert(updateNavMesh.calledWith(entity))
  })

  it('updates navMeshes when an Object3D is added', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    addComponent(entity, NavMeshComponent, { value: new NavMesh() })
    addComponent(entity, Object3DComponent, { value: new Object3D() })

    navigationSystem()

    assert(updateNavMesh.calledWith(entity))

    navigationSystem()

    assert(updateNavMesh.calledOnce)
  })
})

import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Object3D } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NavMesh } from '../../scene/classes/NavMesh'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'

describe('NavigationSystem', async () => {
  let shouldCreateObject3D = false
  let updateNavMesh = sinon.spy((entity) => {
    if (shouldCreateObject3D) {
      removeComponent(entity, Object3DComponent)
      addComponent(entity, Object3DComponent, { value: new Object3D() })
    }
  })
  let sceneObjectUpdateAction: { entities: Entity[] }
  const createActionQueue = (matches: any) => () =>
    matches === EngineActions.sceneObjectUpdate.matches ? [sceneObjectUpdateAction] : []

  let navigationSystem: () => void
  const { default: NavigationSystem } = proxyquire('./NavigationSystem', {
    '../../scene/functions/loaders/NavMeshFunctions': { updateNavMesh },
    '@xrengine/hyperflux': { createActionQueue }
  })

  beforeEach(async () => {
    createEngine()
    navigationSystem = await NavigationSystem(Engine.instance.currentWorld)
    updateNavMesh.resetHistory()
    sceneObjectUpdateAction = { entities: [] }
  })

  it('updates navMeshes on modifyProperty command', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    sceneObjectUpdateAction = { entities: [entity] }

    addComponent(entity, NavMeshComponent, { value: new NavMesh(), debugMode: false })

    navigationSystem()

    assert(updateNavMesh.calledWith(entity))
  })

  it('updates navMeshes when an Object3D is added', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)

    addComponent(entity, NavMeshComponent, { value: new NavMesh(), debugMode: false })
    addComponent(entity, Object3DComponent, { value: new Object3D() })

    navigationSystem()

    assert(updateNavMesh.calledWith(entity))

    navigationSystem()

    assert(updateNavMesh.calledOnce)
  })

  it('ignores Object3Ds that have been seen by NavigationSystem', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const o3d = new Object3D()

    addComponent(entity, NavMeshComponent, { value: new NavMesh(), debugMode: false })
    addComponent(entity, Object3DComponent, { value: o3d })

    navigationSystem()

    assert(updateNavMesh.calledOnce)
    assert(o3d.userData.seenByNavigationSystem)

    navigationSystem()

    assert(updateNavMesh.calledOnce)
  })

  it.only('ignores Object3Ds that have been created by NavigationSystem', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const o3d = new Object3D()

    shouldCreateObject3D = true

    addComponent(entity, NavMeshComponent, { value: new NavMesh(), debugMode: false })
    addComponent(entity, Object3DComponent, { value: o3d })

    navigationSystem()

    assert(updateNavMesh.calledOnce)
    assert(getComponent(entity, Object3DComponent).value.userData.seenByNavigationSystem)

    navigationSystem()

    assert(updateNavMesh.calledOnce)
  })
})

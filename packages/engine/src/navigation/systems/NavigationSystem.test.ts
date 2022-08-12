import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'

import { applyIncomingActions, dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { SystemUpdateType } from '../../ecs/functions/SystemUpdateType'
import { createEngine } from '../../initializeEngine'
import { NavMesh } from '../../scene/classes/NavMesh'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'

describe('NavigationSystem', async () => {
  let updateNavMesh = sinon.spy()
  let navigationSystem: () => void
  const { default: NavigationSystem } = proxyquire('./NavigationSystem', {
    '../../scene/functions/loaders/NavMeshFunctions': { updateNavMesh }
  })

  beforeEach(async () => {
    createEngine()
    navigationSystem = await NavigationSystem(Engine.instance.currentWorld)
  })

  it('updates navMeshes on modifyProperty command', () => {
    const world = Engine.instance.currentWorld
    const entity = createEntity(world)
    const action = EngineActions.sceneObjectUpdate({ entities: [entity] })

    addComponent(entity, NavMeshComponent, { value: new NavMesh() })

    world.pipelines[SystemUpdateType.PRE_RENDER] = NavigationSystem

    action.$time = 0 // TODO: what's the right way to test handling actions?
    dispatchAction(action)
    applyIncomingActions(Engine.instance.store)

    navigationSystem()

    assert(updateNavMesh.calledWith(entity))
  })
})

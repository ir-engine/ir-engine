import assert from 'assert'
import { afterEach, beforeEach, describe } from 'mocha'
import { createSandbox, SinonSandbox } from 'sinon'

import { initializeCoreSystems } from '@xrengine/engine/src/initializeCoreSystems'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, EntityTreeNode } from '../../../ecs/functions/EntityTree'
import { createEntityNode } from '../../../ecs/functions/EntityTree'
import { initSystems } from '../../../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { createEngine, setupEngineActionSystems } from '../../../initializeEngine'

describe('ParticleEmitterFunctions', async () => {
  let entity: Entity
  let node: EntityTreeNode
  let world: World
  let sandbox: SinonSandbox

  let nextFixedStep: Promise<void>
  const initEntity = () => {
    entity = createEntity()
    node = createEntityNode(entity)
    world = Engine.instance.currentWorld
  }
  beforeEach(async () => {
    sandbox = createSandbox()
    createEngine()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
    setupEngineActionSystems()
    initEntity()
    Engine.instance.engineTimer.start()
    Engine.instance.publicPath = ''
    await initializeCoreSystems()

    await initSystems(world, [
      {
        uuid: 'Particle',
        type: SystemUpdateType.FIXED_LATE,
        systemLoader: () =>
          Promise.resolve({
            default: async () => {
              let resolve: () => void
              nextFixedStep = new Promise<void>((r) => (resolve = r))
              return {
                execute: () => {
                  resolve()
                  nextFixedStep = new Promise<void>((r) => (resolve = r))
                },
                cleanup: async () => {}
              }
            }
          })
      }
    ])
  })
  afterEach(async () => {
    sandbox.restore()
  })
})

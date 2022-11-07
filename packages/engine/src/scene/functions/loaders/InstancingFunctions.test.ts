import assert from 'assert'
import { afterEach, beforeEach, describe } from 'mocha'
import { createSandbox, SinonSandbox } from 'sinon'
import { Color } from 'three'

import { initializeCoreSystems } from '@xrengine/engine/src/initializeCoreSystems'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { World } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EntityTreeNode } from '../../../ecs/functions/EntityTree'
import { createEntityNode } from '../../../ecs/functions/EntityTree'
import { initSystems } from '../../../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { createEngine, setupEngineActionSystems } from '../../../initializeEngine'
import {
  GrassProperties,
  InstancingComponent,
  SampleMode,
  ScatterMode,
  ScatterProperties,
  ScatterState
} from '../../components/InstancingComponent'
import {
  deserializeInstancing,
  GRASS_PROPERTIES_DEFAULT_VALUES,
  SCATTER_PROPERTIES_DEFAULT_VALUES
} from './InstancingFunctions'

describe('InstancingFunctions', async () => {
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
    setupEngineActionSystems()
    initEntity()
    Engine.instance.engineTimer.start()

    Engine.instance.publicPath = ''
    await initializeCoreSystems()

    await initSystems(world, [
      {
        uuid: 'Instance',
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

  const scatterProps: ScatterProperties = {
    ...SCATTER_PROPERTIES_DEFAULT_VALUES,
    densityMap: '',
    heightMap: ''
  }

  const grassProps: GrassProperties = {
    ...GRASS_PROPERTIES_DEFAULT_VALUES,
    grassTexture: '',
    alphaMap: '',
    sunColor: new Color(1, 1, 1)
  }

  const emptyInstancingCmp = {
    count: 0,
    surface: '',
    sampling: SampleMode.SCATTER,
    mode: ScatterMode.GRASS,
    state: ScatterState.UNSTAGED,
    sampleProperties: scatterProps,
    sourceProperties: grassProps
  }

  describe('deserializeInstancing', () => {
    it('Correctly deserializes empty component', async () => {
      deserializeInstancing(entity, emptyInstancingCmp)
      assert(hasComponent(entity, InstancingComponent))
      const instancing = getComponent(entity, InstancingComponent)
      assert.deepEqual(instancing.count, 0)
      assert.deepEqual(instancing.mode, ScatterMode.GRASS)
      Object.entries(scatterProps).map(([k, v]) => {
        assert.equal(instancing.sampleProperties[k], v)
      })
      Object.entries(grassProps).map(([k, v]) => {
        assert.equal((instancing.sourceProperties as GrassProperties)[k], v)
      })
    })
  })

  describe('stageInstancing', () => {})

  describe('unstageInstancing', () => {})

  describe('serializeInstancing', () => {})
})

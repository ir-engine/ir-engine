import assert from 'assert'
import { afterEach, beforeEach, describe } from 'mocha'
import { createSandbox, SinonSandbox } from 'sinon'
import { Color } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { EntityTreeNode } from '../../../ecs/classes/EntityTree'
import { World } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeInTree, createEntityNode } from '../../../ecs/functions/EntityTreeFunctions'
import { initSystems } from '../../../ecs/functions/SystemFunctions'
import { SystemUpdateType } from '../../../ecs/functions/SystemUpdateType'
import { createEngine, initializeCoreSystems, setupEngineActionSystems } from '../../../initializeEngine'
import {
  GrassProperties,
  InstancingComponent,
  InstancingComponentType,
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

    addEntityNodeInTree(node)
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
        type: SystemUpdateType.FIXED_LATE,
        systemModulePromise: Promise.resolve({
          default: async () => {
            let resolve: () => void
            nextFixedStep = new Promise<void>((r) => (resolve = r))
            return () => {
              resolve()
              nextFixedStep = new Promise<void>((r) => (resolve = r))
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

  const emptyInstancingCmp: ComponentJson = {
    name: 'instancing',
    props: {
      count: 0,
      surface: '',
      sampling: SampleMode.SCATTER,
      mode: ScatterMode.GRASS,
      state: ScatterState.UNSTAGED,
      sampleProperties: scatterProps,
      sourceProperties: grassProps
    }
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

import { afterEach, beforeEach, describe } from 'mocha'
import { createSandbox, SinonSandbox } from 'sinon'
import { Color } from 'three'

import { getMutableState } from '@etherealengine/hyperflux'

import { destroyEngine, Engine } from '../../../ecs/classes/Engine'
import { EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { SimulationSystemGroup } from '../../../ecs/functions/EngineFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { defineSystem, startSystem, SystemDefinitions, SystemUUID } from '../../../ecs/functions/SystemFunctions'
import { createEngine } from '../../../initializeEngine'
import {
  GrassProperties,
  SampleMode,
  ScatterMode,
  ScatterProperties,
  ScatterState
} from '../../components/InstancingComponent'
import { GRASS_PROPERTIES_DEFAULT_VALUES, SCATTER_PROPERTIES_DEFAULT_VALUES } from './InstancingFunctions'

describe('InstancingFunctions', async () => {
  let entity: Entity
  let sandbox: SinonSandbox
  let nextFixedStep: Promise<void>
  const initEntity = () => {
    entity = createEntity()
  }
  beforeEach(async () => {
    sandbox = createSandbox()
    createEngine()
    initEntity()
    Engine.instance.engineTimer.start()

    getMutableState(EngineState).publicPath.set('')
    await Promise.all([])

    let resolve: () => void
    nextFixedStep = new Promise<void>((r) => (resolve = r))

    SystemDefinitions.delete('test.system' as SystemUUID)
    const system = defineSystem({
      uuid: 'test.system',
      execute: () => {
        resolve()
        nextFixedStep = new Promise<void>((r) => (resolve = r))
      }
    })
    startSystem(system, { after: SimulationSystemGroup })
  })
  afterEach(async () => {
    sandbox.restore()
    return destroyEngine()
  })

  const scatterProps: ScatterProperties = {
    ...SCATTER_PROPERTIES_DEFAULT_VALUES,
    densityMap: {
      src: '',
      texture: null
    },
    heightMap: {
      src: '',
      texture: null
    }
  }

  const grassProps: GrassProperties = {
    ...GRASS_PROPERTIES_DEFAULT_VALUES,
    grassTexture: {
      src: '',
      texture: null
    },
    alphaMap: {
      src: '',
      texture: null
    },
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

  describe('deserializeInstancing', () => {})

  describe('stageInstancing', () => {})

  describe('unstageInstancing', () => {})

  describe('serializeInstancing', () => {})
})

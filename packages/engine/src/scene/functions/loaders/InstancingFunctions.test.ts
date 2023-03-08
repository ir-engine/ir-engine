import assert from 'assert'
import { afterEach, beforeEach, describe } from 'mocha'
import { createSandbox, SinonSandbox } from 'sinon'
import { Color } from 'three'

import { getMutableState } from '@etherealengine/hyperflux'

import { Engine } from '../../../ecs/classes/Engine'
import { EngineState } from '../../../ecs/classes/EngineState'
import { Entity } from '../../../ecs/classes/Entity'
import { Scene } from '../../../ecs/classes/Scene'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
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
    setupEngineActionSystems()
    initEntity()
    Engine.instance.engineTimer.start()

    getMutableState(EngineState).publicPath.set('')
    await Promise.all([])

    await initSystems([
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

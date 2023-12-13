import assert from 'assert'
import { addClientInputListeners } from '../../../../src/input/systems/ClientInputSystem'
import { before } from 'mocha'
import { destroyEngine, Engine } from '../../../../src/ecs/classes/Engine'
import { createEngine } from '../../../../src/initializeEngine'
import { loadEmptyScene } from '../../../util/loadEmptyScene'
import { MockEngineRenderer } from '../../../util/MockEngineRenderer'
import { EngineRenderer } from '../../../../src/renderer/WebGLRendererSystem'


EngineRenderer.instance = new MockEngineRenderer({})

describe('addClientInputListeners', () => {

  beforeEach(() => {
    createEngine()
    loadEmptyScene()
  })
  
  it('should add client input listeners', () => {
    console.log(EngineRenderer.instance)
    addClientInputListeners()
  })

  afterEach(() => {
    destroyEngine()
  })
})

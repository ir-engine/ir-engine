import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer'
import { EngineRenderer } from '../../src/renderer/WebGLRendererSystem'
import { MockEventListener } from './MockEventListener'

export class MockEngineRenderer extends EngineRenderer {
  static instance: EngineRenderer

  constructor() {
    super()
    this.renderer = {
      domElement: new MockEventListener()
    } as unknown as WebGLRenderer
  }
}

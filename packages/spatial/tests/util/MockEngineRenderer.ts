/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import './patchNodeForWebXREmulator'

import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer'

import { Entity, getMutableComponent, setComponent } from '@etherealengine/ecs'
import { EffectComposer, Pass } from 'postprocessing'
import { WebGLRenderTarget } from 'three'
import { RendererComponent } from '../../src/renderer/WebGLRendererSystem'
import { createWebXRManager } from '../../src/xr/WebXRManager'
import { MockEventListener } from './MockEventListener'

class MockCanvas extends MockEventListener {
  #context = {
    getContextAttributes: () => {
      return {
        xrCompatible: true
      }
    },
    viewport: () => {}
  }
  getContext = () => this.#context
}

class MockRenderer {
  cancelAnimationFrame = () => {}
  setAnimationLoop = () => {}
  animation = {
    start: () => {},
    stop: () => {},
    setAnimationLoop: () => {},
    setContext: () => {}
  }
  domElement = new MockCanvas()
  setPixelRatio = () => {}
  getRenderTarget = () => {}
  getSize = () => 0
  getContext = () => this.domElement.getContext()
  getPixelRatio = () => 1
  dispose = () => {}
}

class MockEffectComposer extends EffectComposer {
  constructor(renderer?: MockRenderer) {
    super(renderer as unknown as WebGLRenderer)
  }
  addPass(pass: Pass, index?: number | undefined): void {
    const passes = this.passes
    if (index !== undefined) {
      passes.splice(index, 0, pass)
    } else {
      passes.push(pass)
    }
  }
  render = () => {}
  setSize = () => {}
  getSize = () => 0
  setRenderer = () => {}
  replaceRenderer = () => this.getRenderer()
  createDepthTexture = () => {}
  createBuffer = () => new WebGLRenderTarget()
}

export const mockEngineRenderer = (entity: Entity) => {
  const renderer = new MockRenderer() as unknown as WebGLRenderer
  setComponent(entity, RendererComponent)
  const effectComposer = new MockEffectComposer()
  getMutableComponent(entity, RendererComponent).merge({
    supportWebGL2: true,
    canvas: renderer.domElement,
    renderer,
    effectComposer,
    xrManager: createWebXRManager(renderer)
  })
  // run reactor
  setComponent(entity, RendererComponent)
}

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import './patchNodeForWebXREmulator'

import { Entity, getComponent, setComponent } from '@ir-engine/ecs'
import { EffectComposer, Pass, RenderPass } from 'postprocessing'
import { WebGLRenderTarget, WebGLRenderer } from 'three'
import { RendererComponent } from '../../src/renderer/WebGLRendererSystem'
import { createWebXRManager } from '../../src/xr/WebXRManager'
import { MockEventListener } from './MockEventListener'

const mockCanvas = new MockEventListener() as any
mockCanvas.parentElement = new MockEventListener()
mockCanvas.getContext = () => null! // null will tell the renderer to not initialize, allowing our mock to work

const mockContext = {
  getExtension: () => {},
  getParameter: () => {},
  getContextAttributes: () => {
    return {
      xrCompatible: true
    }
  },
  canvas: mockCanvas,
  viewport: () => {}
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
  domElement = mockCanvas
  setPixelRatio = () => {}
  getRenderTarget = () => {}
  getSize = () => 0
  getContext = () => mockContext
  getPixelRatio = () => 1
  dispose = () => {}
  capabilities = {
    isWebGL2: true
  }
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
  const effectComposer = new MockEffectComposer()
  const renderPass = new RenderPass()
  effectComposer.addPass(renderPass)
  const xrManager = createWebXRManager(renderer)
  xrManager.cameraAutoUpdate = false
  xrManager.enabled = true
  setComponent(entity, RendererComponent, { canvas: renderer.domElement })
  const renderComponent = getComponent(entity, RendererComponent)
  renderComponent.renderer = renderer
  renderComponent.effectComposer = effectComposer
  renderComponent.renderPass = renderPass
  renderComponent.xrManager = xrManager
}

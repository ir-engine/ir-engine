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

import { Entity, setComponent } from '@ir-engine/ecs'
import { Bounds, Edges, WebContainer3D, WebLayerManager } from '@ir-engine/xrui'
import { XRUIComponent } from '../../src/xrui/components/XRUIComponent'

/**
 * @why
 * Required for mocking XRUI.
 * Mocking will fail without it, since NodeJS doesn't have a declaration for the type.  */
class MockMutationObserver {
  constructor(callback) {}
  observe() {}
  disconnect() {}
  takeRecords() {}
}

/**
 * @description
 * - Sets {@link globalThis.MutationObserver} to {@link MockMutationObserver}, because NodeJS doesn't declare the type.
 * - Creates a Mock WebLayerManager and WebContainer3D.
 * - Adds an {@link XRUIComponent} to the {@param entity} with the mocked {@link WebContainer3D}.
 * - Sets the bounds of the {@link XRUIComponent.rootLayer} to the `@param size`.
 * - Sets the `visible` property for each children of the {@link XRUIComponent.rootLayer} to `true`.
 * @param entity The entity that the {@link XRUIComponent} will be added to.
 * @param size The size of the {@link XRUIComponent.rootLayer.bounds}.
 */
export function createMockXRUI(entity: Entity, size: number = 1) {
  // @ts-ignore
  globalThis.MutationObserver = MockMutationObserver

  const containerElement = document.createElement('div')
  containerElement.style.position = 'fixed'
  containerElement.id = 'xrui-' + 'mock' // UIFunc.name
  const manager = new WebLayerManager('mock-WebLayerManager')

  const bounds = new Bounds()
  bounds.height = size
  bounds.width = size

  const container = new WebContainer3D(containerElement, { manager: manager })
  const xrui = setComponent(entity, XRUIComponent, container)
  xrui.rootLayer.bounds = bounds
  xrui.rootLayer.margin = new Edges()
  xrui.rootLayer.children.forEach((child) => {
    child.visible = true
  })
}

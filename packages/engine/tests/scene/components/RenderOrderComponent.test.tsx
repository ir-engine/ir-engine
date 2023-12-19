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

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

import { destroyEngine } from '../../../src/ecs/classes/Engine'
import { setComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { createEngine } from '../../../src/initializeEngine'
import { addObjectToGroup } from '../../../src/scene/components/GroupComponent'
import { RenderOrderComponent } from '../../../src/scene/components/RenderOrderComponent'
import { loadEmptyScene } from '../../util/loadEmptyScene'

describe('RenderOrderComponent', () => {
  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Sets renderOrder on group', async () => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const mesh = new Mesh(geometry, material)

    const renderOrder = 2

    setComponent(entity, RenderOrderComponent, { renderOrder: renderOrder })
    addObjectToGroup(entity, mesh)

    const Reactor = RenderOrderComponent.reactor
    const tag = <Reactor />
    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    assert(mesh.renderOrder === renderOrder, 'Render order is set on mesh object in group')

    unmount()
  })

  it('Sets renderOrder on group multiple', async () => {
    const meshCount = 10

    const entity = createEntity()
    const meshes = [] as Mesh[]

    for (let i = 0; i < meshCount; i++) {
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xffff00 })
      const mesh = new Mesh(geometry, material)
      meshes.push(mesh)
      addObjectToGroup(entity, mesh)
    }

    const renderOrder = 4

    setComponent(entity, RenderOrderComponent, { renderOrder: renderOrder })

    const Reactor = RenderOrderComponent.reactor
    const tag = <Reactor />
    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    for (const mesh of meshes) {
      assert(mesh.renderOrder === renderOrder)
    }

    unmount()
  })

  it('Sets renderOrder to 0 as default', async () => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const mesh = new Mesh(geometry, material)

    const defaultRenderOrder = 0

    setComponent(entity, RenderOrderComponent)
    addObjectToGroup(entity, mesh)

    const Reactor = RenderOrderComponent.reactor
    const tag = <Reactor />
    const { rerender, unmount } = render(tag)
    await act(() => rerender(tag))

    assert(mesh.renderOrder === defaultRenderOrder)

    unmount()
  })
})

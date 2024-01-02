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

import assert from 'assert'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

import { loadEmptyScene } from '../../../tests/util/loadEmptyScene'
import { destroyEngine } from '../../ecs/classes/Engine'
import { getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { addObjectToGroup } from './GroupComponent'
import { RenderOrderComponent } from './RenderOrderComponent'

describe('RenderOrderComponent', () => {
  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Sets renderOrder to 0 as default', async () => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const mesh = new Mesh(geometry, material)

    addObjectToGroup(entity, mesh)
    assert.equal(mesh.renderOrder, 0)
    assert.equal(getComponent(entity, RenderOrderComponent), 0)
    assert.equal(RenderOrderComponent.renderOrder[entity], 0)
  })

  it('Sets renderOrder on object', async () => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const mesh = new Mesh(geometry, material)

    addObjectToGroup(entity, mesh)

    mesh.renderOrder = 2
    assert.equal(getComponent(entity, RenderOrderComponent), 2)
    assert.equal(RenderOrderComponent.renderOrder[entity], 2)
    assert.equal(mesh.renderOrder, 2)

    setComponent(entity, RenderOrderComponent, 42)
    assert.equal(getComponent(entity, RenderOrderComponent), 42)
    assert.equal(RenderOrderComponent.renderOrder[entity], 42)
    assert.equal(mesh.renderOrder, 42)
  })
})

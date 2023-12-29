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

import { destroyEngine } from '../../../src/ecs/classes/Engine'
import { getComponent, hasComponent, setComponent } from '../../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../../src/ecs/functions/EntityFunctions'
import { createEngine } from '../../../src/initializeEngine'
import { addObjectToGroup } from '../../../src/scene/components/GroupComponent'
import {
  Layer,
  ObjectLayerComponents,
  ObjectLayerMaskComponent
} from '../../../src/scene/components/ObjectLayerComponent'
import { loadEmptyScene } from '../../util/loadEmptyScene'

describe('ObjectLayerComponent', () => {
  beforeEach(async () => {
    createEngine()
    loadEmptyScene()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Sets objectLayers on group', () => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const mesh = new Mesh(geometry, material)

    const objectLayer = 2
    const nonEnabledObjectLayer = 5

    addObjectToGroup(entity, mesh)
    mesh.layers.enable(objectLayer)

    assert(hasComponent(entity, ObjectLayerMaskComponent))
    assert(hasComponent(entity, ObjectLayerComponents[objectLayer + 1]))
    assert(!hasComponent(entity, ObjectLayerComponents[nonEnabledObjectLayer]))
    assert(mesh.layers.isEnabled(objectLayer))
    assert(!mesh.layers.isEnabled(nonEnabledObjectLayer))
  })

  it('Sets objectLayers on group multiple', () => {
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

    const objectLayers = [5, 6, 7]

    setComponent(entity, ObjectLayerMaskComponent)
    ObjectLayerMaskComponent.enableLayers(entity, ...objectLayers)

    for (const mesh of meshes) {
      for (const layer of objectLayers) {
        assert(mesh.layers.isEnabled(layer))
        assert(hasComponent(entity, ObjectLayerComponents[layer + 1]))
      }
    }
  })

  it('Updates objectLayers on group', () => {
    const entity = createEntity()
    const geometry = new BoxGeometry(1, 1, 1)
    const material = new MeshBasicMaterial({ color: 0xffff00 })
    const mesh = new Mesh(geometry, material)

    const objectLayers = [2, 3, 4]
    const nonEnabledObjectLayer = 5

    addObjectToGroup(entity, mesh)
    setComponent(entity, ObjectLayerMaskComponent)
    ObjectLayerMaskComponent.enableLayers(entity, ...objectLayers)

    for (const layer of objectLayers) {
      assert(mesh.layers.isEnabled(layer))
      assert(hasComponent(entity, ObjectLayerComponents[layer + 1]))
    }

    assert(!mesh.layers.isEnabled(nonEnabledObjectLayer))

    const disableLayers = [2, 3]
    ObjectLayerMaskComponent.disableLayers(entity, ...disableLayers)

    for (const layer of objectLayers) {
      if (disableLayers.includes(layer)) {
        assert(!mesh.layers.isEnabled(layer))
        assert(!hasComponent(entity, ObjectLayerComponents[layer + 1]))
      } else {
        assert(mesh.layers.isEnabled(layer))
        assert(hasComponent(entity, ObjectLayerComponents[layer + 1]))
      }
    }
  })

  it('Layer object updates correctly', () => {
    const maxLayers = 32

    const entity = createEntity()
    const layer = new Layer(entity)

    assert(layer.isEnabled(0))
    const layerMaskComponent = getComponent(entity, ObjectLayerMaskComponent)
    assert(layerMaskComponent === 1)
    assert(ObjectLayerMaskComponent.mask[entity] === 1)
    assert(hasComponent(entity, ObjectLayerComponents[1]))

    const enabledLayers = [2, 3, 4]

    for (const enabledLayer of enabledLayers) {
      layer.enable(enabledLayer)
      assert(layer.isEnabled(enabledLayer))
    }

    const disabledLayers = [2, 3, 5]
    for (const disabledLayer of disabledLayers) {
      layer.disable(disabledLayer)
      assert(!layer.isEnabled(disabledLayer))
    }
    assert(layer.isEnabled(4))

    layer.disableAll()
    assert(layer.mask === 0)
    for (let i = 0; i < maxLayers; i++) {
      assert(!layer.isEnabled(i))
      assert(!hasComponent(entity, ObjectLayerComponents[i + 1]))
    }

    layer.enableAll()
    assert(layer.mask.valueOf() === (0xffffffff | 0))
    for (let i = 1; i < maxLayers; i++) {
      assert(layer.isEnabled(i))
      assert(hasComponent(entity, ObjectLayerComponents[i + 1]))
    }

    layer.toggle(4)
    assert(!layer.isEnabled(4))
    layer.toggle(4)
    assert(layer.isEnabled(4))

    const entity2 = createEntity()
    const entity3 = createEntity()
    const layer2 = new Layer(entity2)
    const layer3 = new Layer(entity3)

    layer2.enable(2)
    layer2.enable(3)
    layer2.enable(4)
    layer3.enable(3)

    assert(layer2.test(layer3))
  })
})

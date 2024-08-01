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

import { getComponent, hasComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity, removeEntity } from '@etherealengine/ecs/src/EntityFunctions'

import { UndefinedEntity } from '@etherealengine/ecs'
import { createEngine } from '@etherealengine/ecs/src/Engine'
import { addObjectToGroup } from './GroupComponent'
import { Layer, ObjectLayerComponents, ObjectLayerMaskComponent } from './ObjectLayerComponent'

describe('ObjectLayerComponent : todo.Organize', () => {
  beforeEach(async () => {
    createEngine()
  })

  afterEach(() => {
    return destroyEngine()
  })

  it('Sets mask and layer', () => {
    const entity = createEntity()

    const layer = 8
    const layerMask = 1 << layer

    setComponent(entity, ObjectLayerMaskComponent, layerMask)

    assert(hasComponent(entity, ObjectLayerMaskComponent))
    const componentLayerMask = getComponent(entity, ObjectLayerMaskComponent)
    assert(componentLayerMask === layerMask)
    assert(componentLayerMask !== layer)
    assert(hasComponent(entity, ObjectLayerComponents[layer]))
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
    assert(hasComponent(entity, ObjectLayerComponents[objectLayer]))
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
        assert(hasComponent(entity, ObjectLayerComponents[layer]))
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
      assert(hasComponent(entity, ObjectLayerComponents[layer]))
    }

    assert(!mesh.layers.isEnabled(nonEnabledObjectLayer))

    const disableLayers = [2, 3]
    ObjectLayerMaskComponent.disableLayers(entity, ...disableLayers)

    for (const layer of objectLayers) {
      if (disableLayers.includes(layer)) {
        assert(!mesh.layers.isEnabled(layer))
        assert(!hasComponent(entity, ObjectLayerComponents[layer]))
      } else {
        assert(mesh.layers.isEnabled(layer))
        assert(hasComponent(entity, ObjectLayerComponents[layer]))
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
    assert(hasComponent(entity, ObjectLayerComponents[0]))

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
      assert(!hasComponent(entity, ObjectLayerComponents[i]))
    }

    layer.enableAll()
    assert(layer.mask.valueOf() === (0xffffffff | 0))
    for (let i = 1; i < maxLayers; i++) {
      assert(layer.isEnabled(i))
      assert(hasComponent(entity, ObjectLayerComponents[i]))
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

const ObjectLayerMaskComponentDefaults = 1 << 0 // enable layer 0

function assertObjectLayerMaskComponentEq(A, B) {
  assert.equal(Boolean(A), Boolean(B))
  assert.equal(A.isObjectLayerMask, B.isObjectLayerMask)
}

describe('ObjectLayerMaskComponent', () => {
  describe('IDs', () => {
    it('should initialize the ObjectLayerMaskComponent.name field with the expected value', () => {
      assert.equal(ObjectLayerMaskComponent.name, 'ObjectLayerMaskComponent')
    })
  }) //:: IDs

  describe('schema', () => {})

  describe('onInit', () => {
    let testEntity = UndefinedEntity

    beforeEach(async () => {
      createEngine()
      testEntity = createEntity()
      setComponent(testEntity, ObjectLayerMaskComponent)
    })

    afterEach(() => {
      removeEntity(testEntity)
      return destroyEngine()
    })

    it('should initialize the component with the expected default values', () => {
      const data = getComponent(testEntity, ObjectLayerMaskComponent)
      assertObjectLayerMaskComponentEq(data, ObjectLayerMaskComponentDefaults)
    })
  }) //:: onInit

  describe('onSet', () => {}) //:: onSet
  describe('onRemove', () => {}) //:: onRemove
  describe('toJSON', () => {}) //:: toJSON
  describe('setLayer', () => {}) //:: setLayer
  describe('enableLayer', () => {}) //:: enableLayer
  describe('enableLayers', () => {}) //:: enableLayers
  describe('disableLayer', () => {}) //:: disableLayer
  describe('disableLayers', () => {}) //:: disableLayers
  describe('toggleLayer', () => {}) //:: toggleLayer
  describe('setMask', () => {}) //:: setMask
})

const maxBitWidth = 32

describe('ObjectLayerComponents', () => {
  describe('IDs', () => {
    ;[...Array(maxBitWidth)].forEach((_, index, __) => {
      it(`should initialize the ObjectLayerComponents[${index}].name field with the expected value`, () => {
        assert.equal(ObjectLayerComponents[index].name, `ObjectLayer${index}`)
      })
    })
  }) //:: IDs

  describe('onSet', () => {}) //:: onSet
  describe('onRemove', () => {}) //:: onRemove
})

describe('Layer', () => {
  describe('constructor', () => {}) //:: constructor
  describe('get mask', () => {}) //:: get mask
  describe('set mask', () => {}) //:: set mask
  describe('set', () => {}) //:: set
  describe('enable', () => {}) //:: enable
  describe('enableAll', () => {}) //:: enableAll
  describe('toggle', () => {}) //:: toggle
  describe('disable', () => {}) //:: disable
  describe('disableAll', () => {}) //:: disableAll
  describe('test', () => {}) //:: test
  describe('isEnabled', () => {}) //:: isEnabled
}) //:: Layer

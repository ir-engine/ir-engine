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
import { Vector3 } from 'three'

import { destroyEngine, Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  addComponent,
  defineComponent,
  getComponent,
  hasComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { addEntityNodeChild, EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { applyIncomingActions, getState } from '@etherealengine/hyperflux'

import { registerEditorReceptors } from '../services/EditorServicesReceptor'
import { EditorControlFunctions } from './EditorControlFunctions'

class TempProp {
  data: number
  constructor(data: number) {
    this.data = data
  }
  set(data: TempProp) {
    this.data = data.data
  }
}

type TestComponentType = {
  pos: Vector3
  index: number
  data: TempProp
}

export const TestComponent = defineComponent({
  name: 'TestComponent',

  onInit(entity) {
    return {
      pos: new Vector3(),
      index: 0,
      data: new TempProp(0)
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (json.pos) component.pos.value.copy(json.pos)
    if (json.index) component.index.set(json.index)
    if (json.data) component.data.set(json.data)
  }
})
function getRandomValues(): TestComponentType {
  return {
    pos: new Vector3(Math.random(), Math.random(), Math.random()),
    index: Math.random(),
    data: new TempProp(Math.random())
  }
}
describe('EditorControlFunctions', () => {
  describe('modifyProperty', () => {
    let nodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()

      Engine.instance.store.defaultDispatchDelay = () => 0

      const rootNode = getState(SceneState).sceneEntity
      nodes = [createEntity(), createEntity()]

      for (let i = 0; i < 2; i++) {
        addEntityNodeChild(nodes[i], rootNode)
        addComponent(nodes[i], TestComponent, getRandomValues())
      }
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('will execute the command', () => {
      const prop = getRandomValues()
      EditorControlFunctions.modifyProperty(nodes, TestComponent, prop)
      applyIncomingActions()
      for (const node of nodes) {
        if (typeof node === 'string') return
        const component = getComponent(node, TestComponent)
        assert.deepEqual(component, prop)
      }
    })
  })

  /** @todo */
  describe.skip('copyObject', async () => {
    let rootNode: Entity

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      Engine.instance.store.defaultDispatchDelay = () => 0

      rootNode = getState(SceneState).sceneEntity
    })

    afterEach(() => {
      return destroyEngine()
    })
  })

  describe('createObjectFromSceneElement', async () => {
    let rootNode: Entity

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      Engine.instance.store.defaultDispatchDelay = () => 0

      const world = getState(SceneState)
      rootNode = world.sceneEntity
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('creates prefab of given type', () => {
      const entity = EditorControlFunctions.createObjectFromSceneElement(GroupComponent.name, rootNode)
      assert(hasComponent(entity, EntityTreeComponent))
      assert.equal(getComponent(entity, EntityTreeComponent).parentEntity, rootNode)
      assert.equal(getComponent(rootNode, EntityTreeComponent).children.length, 1)
      assert.equal(getComponent(rootNode, EntityTreeComponent).children[0], entity)
      assert(hasComponent(entity, GroupComponent))
    })

    it('places created prefab before passed objects', () => {
      addEntityNodeChild(createEntity(), rootNode)
      addEntityNodeChild(createEntity(), rootNode)
      const before = createEntity()
      addEntityNodeChild(before, rootNode)
      addEntityNodeChild(createEntity(), rootNode)
      addEntityNodeChild(createEntity(), rootNode)
      console.log(rootNode)

      const entity = EditorControlFunctions.createObjectFromSceneElement(GroupComponent.name, rootNode, before)

      assert.equal(getComponent(entity, EntityTreeComponent).parentEntity, rootNode)
      assert.equal(getComponent(rootNode, EntityTreeComponent).children.length, 6)
      assert.equal(getComponent(rootNode, EntityTreeComponent).children[2], entity)
    })

    it('creates unique name for each newly created objects', () => {
      const entity1 = EditorControlFunctions.createObjectFromSceneElement(GroupComponent.name, rootNode)
      const entity2 = EditorControlFunctions.createObjectFromSceneElement(GroupComponent.name, rootNode)
      const entity3 = EditorControlFunctions.createObjectFromSceneElement(GroupComponent.name, rootNode)

      assert.equal(getComponent(entity1, NameComponent), 'New Group')
      assert.equal(getComponent(entity2, NameComponent), 'New Group 2')
      assert.equal(getComponent(entity3, NameComponent), 'New Group 3')
    })
  })

  /** currently failing - see #7272 */
  describe.skip('duplicateObjects', async () => {
    let nodes: Entity[]
    let parentNodes: Entity[]
    let beforeNodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      Engine.instance.store.defaultDispatchDelay = () => 0

      const rootNode = getState(SceneState).sceneEntity
      nodes = [createEntity(), createEntity()]
      parentNodes = [createEntity(), createEntity()]
      beforeNodes = [createEntity(), createEntity()]

      addEntityNodeChild(nodes[0], rootNode)
      addEntityNodeChild(nodes[1], rootNode)
      addEntityNodeChild(parentNodes[0], rootNode)
      addEntityNodeChild(parentNodes[1], rootNode)
      addEntityNodeChild(beforeNodes[0], parentNodes[0])
      addEntityNodeChild(beforeNodes[1], parentNodes[1])
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('duplicates objects', () => {
      EditorControlFunctions.duplicateObject(nodes)
      applyIncomingActions()

      const rootEntity = getState(SceneState).sceneEntity
      const rootNode = getComponent(rootEntity, EntityTreeComponent)
      rootNode.children.forEach((entity) => {
        assert(hasComponent(entity, EntityTreeComponent))
      })
    })
  })

  describe('groupObjects', async () => {
    let nodes: Entity[]
    let parentNodes: Entity[]
    let beforeNodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      Engine.instance.store.defaultDispatchDelay = () => 0

      const world = getState(SceneState)

      const rootNode = world.sceneEntity
      nodes = [createEntity(), createEntity()]
      parentNodes = [createEntity(), createEntity()]
      beforeNodes = [createEntity(), createEntity()]

      addEntityNodeChild(parentNodes[0], rootNode)
      addEntityNodeChild(parentNodes[1], rootNode)
      addEntityNodeChild(nodes[0], parentNodes[0])
      addEntityNodeChild(nodes[1], parentNodes[1])
      addEntityNodeChild(beforeNodes[0], parentNodes[0])
      addEntityNodeChild(beforeNodes[1], parentNodes[1])
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('duplicates objects', () => {
      EditorControlFunctions.groupObjects(nodes)
      for (const node of nodes) {
        assert(hasComponent(node, EntityTreeComponent))
        assert(
          getComponent(getComponent(node, EntityTreeComponent).parentEntity!, EntityTreeComponent).children.includes(
            node
          )
        )
      }
    })
  })

  describe('removeObjects', async () => {
    let nodes: Entity[]
    let parentNodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      Engine.instance.store.defaultDispatchDelay = () => 0

      const rootNode = getState(SceneState).sceneEntity
      nodes = [createEntity(), createEntity()]
      parentNodes = [createEntity(), createEntity()]
      ;[...nodes, ...parentNodes].map((node) =>
        setComponent(node, NameComponent, `Test-RemoveObjectCommandEntity-${node}`)
      )

      addEntityNodeChild(parentNodes[0], rootNode)
      addEntityNodeChild(parentNodes[1], rootNode)
      addEntityNodeChild(nodes[0], parentNodes[0])
      addEntityNodeChild(nodes[1], parentNodes[1])
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('Removes given nodes', () => {
      EditorControlFunctions.removeObject(nodes)

      nodes.forEach((node: Entity) => {
        assert(!hasComponent(node, EntityTreeComponent))
      })
    })

    it('will not remove root node', () => {
      EditorControlFunctions.removeObject([getState(SceneState).sceneEntity])

      nodes.forEach((node: Entity) => {
        assert(hasComponent(node, EntityTreeComponent))
      })
    })
  })
})

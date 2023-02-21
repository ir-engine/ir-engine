import assert from 'assert'
import { Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  createMappedComponent,
  getComponent,
  hasComponent,
  setComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeChild,
  EntityTreeComponent,
  removeEntityTree
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { SCENE_COMPONENT_GROUP } from '@xrengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { SCENE_COMPONENT_VISIBLE } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import {
  SCENE_COMPONENT_TRANSFORM,
  SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES
} from '@xrengine/engine/src/transform/components/TransformComponent'
import { applyIncomingActions } from '@xrengine/hyperflux'

import { deregisterEditorReceptors, registerEditorReceptors } from '../services/EditorServicesReceptor'
import { EditorControlFunctions } from './EditorControlFunctions'

import '@xrengine/engine/src/patchEngineNode'

import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'

import { createTransformGizmo } from '../systems/EditorControlSystem'

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

export const TestComponent = createMappedComponent<TestComponentType>('TestComponent')
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
      createTransformGizmo()

      Engine.instance.store.defaultDispatchDelay = 0

      const rootNode = Engine.instance.currentWorld.sceneEntity
      nodes = [createEntity(), createEntity()]

      for (let i = 0; i < 2; i++) {
        addEntityNodeChild(nodes[i], rootNode)
        addComponent(nodes[i], TestComponent, getRandomValues())
      }
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

  describe('addObject', async () => {
    let rootNode: Entity
    let nodes: Entity[]
    let parentNodes: Entity[]
    let beforeNodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      createTransformGizmo()
      Engine.instance.store.defaultDispatchDelay = 0

      Engine.instance.currentWorld.scenePrefabRegistry.set(ScenePrefabs.group, [
        { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
        { name: SCENE_COMPONENT_VISIBLE, props: true },
        { name: SCENE_COMPONENT_GROUP, props: true }
      ])

      rootNode = Engine.instance.currentWorld.sceneEntity
      nodes = [createEntity(), createEntity()]
      parentNodes = [createEntity(), createEntity()]
      beforeNodes = [createEntity(), createEntity()]

      addEntityNodeChild(parentNodes[0], rootNode)
      addEntityNodeChild(parentNodes[1], rootNode)
      addEntityNodeChild(beforeNodes[0], parentNodes[0])
      addEntityNodeChild(beforeNodes[1], parentNodes[1])
    })

    it('creates prefab of given type', () => {
      EditorControlFunctions.addObject(nodes, [], [], [ScenePrefabs.group])
      assert(hasComponent(nodes[0], EntityTreeComponent))
    })

    it('creates prefab of given type and adds as child of passed parent node', () => {
      EditorControlFunctions.addObject(nodes, parentNodes, [], [ScenePrefabs.group])
      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      nodes.forEach((node, index) => {
        assert(hasComponent(node, EntityTreeComponent))
        assert.equal(node, parentNodes[index])
      })
    })

    it('places created prefab before passed objects', () => {
      EditorControlFunctions.addObject(nodes, parentNodes, beforeNodes, [ScenePrefabs.group])

      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      nodes.forEach((node, index) => {
        assert(hasComponent(node, EntityTreeComponent))
        assert.equal(node, beforeNodes[index])
      })
    })

    it('creates unique name for each newly created objects', () => {
      EditorControlFunctions.addObject(nodes, parentNodes, [], [ScenePrefabs.group])

      assert.notEqual(nodes.length, 0)
      assert.notEqual(parentNodes.length, 0)
      assert.notEqual(beforeNodes.length, 0)

      assert.equal(getComponent(nodes[0], NameComponent), ScenePrefabs.group)
      assert.equal(getComponent(nodes[1], NameComponent), ScenePrefabs.group + ' 2')
    })

    // it('will create node from provided scenedata', () => {
    //   addEntityNodeChild(nodes[1], nodes[0])
    //   console.log(Engine.instance.currentWorld.entityTree)
    //   command.sceneData = [
    //     {
    //       entities: {
    //         [nodes[0].uuid]: {
    //           name: 'Test Entity',
    //           components: [{ name: 'Preview Camera', props: {} }]
    //         },
    //         [nodes[1].uuid]: {
    //           name: 'Test Entity',
    //           components: [{ name: 'Point Light', props: {} }],
    //           parent: nodes[0].uuid
    //         }
    //       },
    //       root: nodes[0].uuid,
    //       version: 1
    //     }
    //   ]
    //   command.affectedNodes = [nodes[0]]

    //   AddObjectCommand.execute(command)
    // })
  })

  /** currently failing - see #7272 */
  describe.skip('duplicateObjects', async () => {
    let nodes: Entity[]
    let parentNodes: Entity[]
    let beforeNodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      createTransformGizmo()
      Engine.instance.store.defaultDispatchDelay = 0

      const rootNode = Engine.instance.currentWorld.sceneEntity
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

    it('duplicates objects', () => {
      EditorControlFunctions.duplicateObject(nodes)
      applyIncomingActions()

      const rootEntity = Engine.instance.currentWorld.sceneEntity
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
      createTransformGizmo()
      Engine.instance.store.defaultDispatchDelay = 0

      Engine.instance.currentWorld.scenePrefabRegistry.set(ScenePrefabs.group, [
        { name: SCENE_COMPONENT_TRANSFORM, props: SCENE_COMPONENT_TRANSFORM_DEFAULT_VALUES },
        { name: SCENE_COMPONENT_VISIBLE, props: true },
        { name: SCENE_COMPONENT_GROUP, props: true }
      ])

      const rootNode = Engine.instance.currentWorld.sceneEntity
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

    it('duplicates objects', () => {
      EditorControlFunctions.groupObjects(nodes)
      for (const node of nodes) {
        assert(hasComponent(node, EntityTreeComponent))
        assert(
          getComponent(getComponent(node, EntityTreeComponent).parentEntity, EntityTreeComponent).children.includes(
            node
          )
        )
      }
    })

    afterEach(() => {
      removeEntityTree(Engine.instance.currentWorld.sceneEntity)
      deregisterEditorReceptors()
    })
  })

  describe('removeObjects', async () => {
    let nodes: Entity[]
    let parentNodes: Entity[]
    let beforeNodes: Entity[]

    beforeEach(() => {
      createEngine()
      registerEditorReceptors()
      createTransformGizmo()
      Engine.instance.store.defaultDispatchDelay = 0

      const rootNode = Engine.instance.currentWorld.sceneEntity
      nodes = [createEntity(), createEntity()]
      parentNodes = [createEntity(), createEntity()]
      beforeNodes = [createEntity(), createEntity()]
      ;[...nodes, ...parentNodes, ...beforeNodes].map((node) =>
        setComponent(node, NameComponent, `Test-RemoveObjectCommandEntity-${node}`)
      )

      addEntityNodeChild(nodes[0], parentNodes[0])
      addEntityNodeChild(nodes[1], parentNodes[1])
      addEntityNodeChild(parentNodes[0], rootNode)
      addEntityNodeChild(parentNodes[1], rootNode)
      addEntityNodeChild(beforeNodes[0], parentNodes[0])
      addEntityNodeChild(beforeNodes[1], parentNodes[1])
    })

    it('Removes given nodes', () => {
      EditorControlFunctions.removeObject(nodes)

      nodes.forEach((node: Entity) => {
        assert(!hasComponent(node, EntityTreeComponent))

        const parent = getComponent(getComponent(node, EntityTreeComponent).parentEntity, EntityTreeComponent)
        assert(parent.children)
        assert(!parent.children.includes(node))
      })
    })

    it('will not remove root node', () => {
      EditorControlFunctions.removeObject([Engine.instance.currentWorld.sceneEntity])

      nodes.forEach((node: Entity) => {
        assert(hasComponent(node, EntityTreeComponent))
      })
    })
  })
})

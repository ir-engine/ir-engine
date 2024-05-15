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

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { EntityUUID, UUIDComponent, entityExists } from '@etherealengine/ecs'
import { getComponent, hasComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { SystemDefinitions } from '@etherealengine/ecs/src/SystemFunctions'
import { GLTFSourceState } from '@etherealengine/engine/src/gltf/GLTFState'
import { SceneState } from '@etherealengine/engine/src/scene/SceneState'
import { ShadowComponent } from '@etherealengine/engine/src/scene/components/ShadowComponent'
import { SceneLoadingSystem } from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'
import { SceneJsonType } from '@etherealengine/engine/src/scene/types/SceneTypes'
import testSceneJson from '@etherealengine/engine/tests/assets/SceneLoadingTest.scene.json'
import { applyIncomingActions, getMutableState } from '@etherealengine/hyperflux'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { EventDispatcher } from '@etherealengine/spatial/src/common/classes/EventDispatcher'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { FogSettingsComponent, FogType } from '@etherealengine/spatial/src/renderer/components/FogSettingsComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { act, render } from '@testing-library/react'
import React from 'react'
import { overrideFileLoaderLoad, restoreFileLoaderLoad } from '../../../engine/tests/util/loadGLTFAssetNode'
import { EditorState } from '../services/EditorServices'
import { EditorControlFunctions } from './EditorControlFunctions'

const testScene = {
  name: '',
  thumbnailUrl: '',
  project: '',
  scenePath: 'test',
  scene: testSceneJson as unknown as SceneJsonType
}
const gltfURL = '/packages/engine/tests/assets/SceneLoadingTest'

let rootEntity: Entity
let sceneID: string

/** @todo rewrite all these tests */
describe('EditorControlFunctions', () => {
  for (const format of ['.gltf', '.scene.json']) {
    describe(format, () => {
      beforeEach(() => {
        overrideFileLoaderLoad()
        createEngine()
        getMutableState(PhysicsState).physicsWorld.set({} as any)
        getMutableState(EngineState).isEditing.set(true)
        getMutableState(EngineState).isEditor.set(true)
        Engine.instance.userID = 'user' as UserID
        Engine.instance.store.defaultDispatchDelay = () => 0
        const eventDispatcher = new EventDispatcher()
        ;(Engine.instance.api as any) = {
          service: () => {
            return {
              on: (serviceName, cb) => {
                eventDispatcher.addEventListener(serviceName, cb)
              },
              off: (serviceName, cb) => {
                eventDispatcher.removeEventListener(serviceName, cb)
              }
            }
          }
        }
        if (format === '.gltf') {
          rootEntity = GLTFSourceState.load(gltfURL + format)
          sceneID = gltfURL + format
        } else {
          rootEntity = SceneState.loadScene(gltfURL + format, JSON.parse(JSON.stringify(testScene)))!
          sceneID = 'test'
        }
        getMutableState(EditorState).scenePath.set(sceneID)
        getMutableState(EditorState).rootEntity.set(rootEntity)
      })

      afterEach(() => {
        restoreFileLoaderLoad()
        return destroyEngine()
      })

      const SceneReactor = SystemDefinitions.get(SceneLoadingSystem)!.reactor!
      const sceneTag = <SceneReactor />

      it('modifyProperty', async () => {
        applyIncomingActions()

        const { rerender, unmount } = render(sceneTag)
        await act(() => rerender(sceneTag))

        assert(rootEntity, 'root entity not found')
        assert.equal(
          hasComponent(rootEntity, EntityTreeComponent),
          true,
          'root entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(rootEntity, EntityTreeComponent).parentEntity,
          UndefinedEntity,
          'root entity does not have parentEntity'
        )

        const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
        assert(child2_1Entity, 'child_0 entity not found')
        assert.equal(
          hasComponent(child2_1Entity, EntityTreeComponent),
          true,
          'child_0 entity does not have EntityTreeComponent'
        )
        assert.equal(
          hasComponent(child2_1Entity, FogSettingsComponent),
          true,
          'child_0 entity does not have FogSettingsComponent'
        )

        const prop = {
          type: 'linear' as FogType,
          color: '#FFFFFF',
          density: 0.05,
          near: 2,
          far: 100,
          timeScale: 3,
          height: 0.1
        }

        EditorControlFunctions.modifyProperty([child2_1Entity], FogSettingsComponent, prop)

        applyIncomingActions()
        await act(() => rerender(sceneTag))

        const child2_1Entity_2 = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)

        const newComponent = getComponent(child2_1Entity_2, FogSettingsComponent)
        assert.deepStrictEqual(newComponent, prop)

        unmount()
      })

      it('duplicateObject', async () => {
        applyIncomingActions()

        const { rerender, unmount } = render(sceneTag)
        await act(() => rerender(sceneTag))

        assert(rootEntity, 'root entity not found')
        assert.equal(
          hasComponent(rootEntity, EntityTreeComponent),
          true,
          'root entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(rootEntity, EntityTreeComponent).parentEntity,
          UndefinedEntity,
          'root entity does not have parentEntity'
        )

        const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
        assert(child0Entity, 'child_0 entity not found')
        assert.equal(
          hasComponent(child0Entity, EntityTreeComponent),
          true,
          'child_0 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child0Entity, EntityTreeComponent).parentEntity,
          rootEntity,
          'child_0 entity does not have parentEntity as root entity'
        )

        EditorControlFunctions.duplicateObject([child0Entity])

        applyIncomingActions()
        await act(() => rerender(sceneTag))

        assert(rootEntity, 'root entity not found')
        assert.equal(
          getComponent(rootEntity, EntityTreeComponent).children.length,
          2,
          'root entity does not have duplicated children'
        )

        unmount()
      })

      it('groupObjects', async () => {
        applyIncomingActions()

        const { rerender, unmount } = render(sceneTag)
        await act(() => rerender(sceneTag))

        assert(rootEntity, 'root entity not found')
        assert.equal(
          hasComponent(rootEntity, EntityTreeComponent),
          true,
          'root entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(rootEntity, EntityTreeComponent).parentEntity,
          UndefinedEntity,
          'root entity does not have parentEntity'
        )

        const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
        assert(child0Entity, 'child_0 entity not found')
        assert.equal(
          hasComponent(child0Entity, EntityTreeComponent),
          true,
          'child_0 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child0Entity, EntityTreeComponent).parentEntity,
          rootEntity,
          'child_0 entity does not have parentEntity as root entity'
        )

        const child1Entity = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
        assert(child1Entity, 'child_1 entity not found')
        assert.equal(
          hasComponent(child1Entity, EntityTreeComponent),
          true,
          'child_1 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child1Entity, EntityTreeComponent).parentEntity,
          child0Entity,
          'child_1 entity does not have parentEntity as child_0 entity'
        )

        const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
        assert(child2Entity, 'child_2 entity not found')
        assert.equal(
          hasComponent(child2Entity, EntityTreeComponent),
          true,
          'child_2 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child2Entity, EntityTreeComponent).parentEntity,
          child1Entity,
          'child_2 entity does not have parentEntity as child_1 entity'
        )

        const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
        assert(child3Entity, 'child_3 entity not found')
        assert.equal(
          hasComponent(child3Entity, EntityTreeComponent),
          true,
          'child_3 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child3Entity, EntityTreeComponent).parentEntity,
          child2Entity,
          'child_3 entity does not have parentEntity as child_2 entity'
        )

        const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
        assert(child4Entity, 'child_4 entity not found')
        assert.equal(
          hasComponent(child4Entity, EntityTreeComponent),
          true,
          'child_4 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child4Entity, EntityTreeComponent).parentEntity,
          child3Entity,
          'child_4 entity does not have parentEntity as child_3 entity'
        )

        const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
        assert(child5Entity, 'child_5 entity not found')
        assert.equal(
          hasComponent(child5Entity, EntityTreeComponent),
          true,
          'child_5 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child5Entity, EntityTreeComponent).parentEntity,
          child4Entity,
          'child_5 entity does not have parentEntity as child_4 entity'
        )

        const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
        assert(child2_1Entity, 'child_2_1 entity not found')
        assert.equal(
          hasComponent(child2_1Entity, EntityTreeComponent),
          true,
          'child_2_1 entity does not have EntityTreeComponent'
        )
        assert.equal(
          getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
          child2Entity,
          'child_2_1 entity does not have parentEntity as child_2 entity'
        )

        const nodes = [child1Entity, child2Entity, child3Entity, child4Entity, child5Entity]
        const nodeUUIDs = nodes.map((node) => getComponent(node, UUIDComponent))
        EditorControlFunctions.groupObjects(nodes)

        applyIncomingActions()
        await act(() => rerender(sceneTag))

        const child1Entity_2 = UUIDComponent.getEntityByUUID('child_1' as EntityUUID)
        const newParentEntity = getComponent(child1Entity_2, EntityTreeComponent).parentEntity

        assert(newParentEntity !== UndefinedEntity, 'new entity not found')
        assert(hasComponent(newParentEntity as Entity, EntityTreeComponent))
        // for (const node of nodeUUIDs) {
        //   const entity = UUIDComponent.getEntityByUUID(node)
        //   assert.equal(
        //     getComponent(entity, EntityTreeComponent).parentEntity,
        //     newParentEntity,
        //     'new entity not found for ' + node
        //   )
        // }

        unmount()
      })

      describe('createObjectFromSceneElement', () => {
        it('creates components from given ID', async () => {
          applyIncomingActions()

          const { rerender, unmount } = render(sceneTag)
          await act(() => rerender(sceneTag))

          assert(rootEntity, 'root entity not found')
          assert.equal(
            hasComponent(rootEntity, EntityTreeComponent),
            true,
            'root entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(rootEntity, EntityTreeComponent).parentEntity,
            UndefinedEntity,
            'root entity does not have parentEntity'
          )

          const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
          assert(child0Entity, 'child_0 entity not found')
          assert.equal(
            hasComponent(child0Entity, EntityTreeComponent),
            true,
            'child_0 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child0Entity, EntityTreeComponent).parentEntity,
            rootEntity,
            'child_0 entity does not have parentEntity as root entity'
          )

          const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
          const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
          assert(child2_1Entity, 'child_2_1 entity not found')
          assert.equal(
            hasComponent(child2_1Entity, EntityTreeComponent),
            true,
            'child_2_1 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
            child2Entity,
            'child_2_1 entity does not have parentEntity as child2 entity'
          )

          EditorControlFunctions.createObjectFromSceneElement(
            [{ name: ShadowComponent.jsonID }, { name: TransformComponent.jsonID }],
            child2_1Entity
          )

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          const child2_1Entity2 = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
          assert(getComponent(child2_1Entity2, EntityTreeComponent).children.length > 0)
          const entity = getComponent(child2_1Entity2, EntityTreeComponent).children[0]
          assert(hasComponent(entity, ShadowComponent), 'created entity does not have ShadowComponent')
          assert(hasComponent(entity, TransformComponent), 'created entity does not have LocalTransformComponent')

          unmount()
        })

        it('places created entity before passed entity', async () => {
          applyIncomingActions()

          const { rerender, unmount } = render(sceneTag)
          await act(() => rerender(sceneTag))

          assert(rootEntity, 'root entity not found')
          assert.equal(
            hasComponent(rootEntity, EntityTreeComponent),
            true,
            'root entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(rootEntity, EntityTreeComponent).parentEntity,
            UndefinedEntity,
            'root entity does not have parentEntity'
          )

          const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
          assert(child0Entity, 'child_0 entity not found')
          assert.equal(
            hasComponent(child0Entity, EntityTreeComponent),
            true,
            'child_0 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child0Entity, EntityTreeComponent).parentEntity,
            rootEntity,
            'child_0 entity does not have parentEntity as root entity'
          )

          const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
          assert(child2Entity, 'child_2 entity not found')
          assert.equal(
            hasComponent(child2Entity, EntityTreeComponent),
            true,
            'child_2 entity does not have EntityTreeComponent'
          )
          const child2Children = [...getComponent(child2Entity, EntityTreeComponent).children]

          const child3Entity = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
          assert(child3Entity, 'child_3 entity not found')
          assert.equal(
            hasComponent(child3Entity, EntityTreeComponent),
            true,
            'child_3 entity does not have EntityTreeComponent'
          )

          assert.equal(
            getComponent(child3Entity, EntityTreeComponent).parentEntity,
            child2Entity,
            'child_3 entity does not have parentEntity as child_2 entity'
          )

          const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
          assert(child2_1Entity, 'child_2_1 entity not found')
          assert.equal(
            hasComponent(child2_1Entity, EntityTreeComponent),
            true,
            'child_2_1 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
            child2Entity,
            'child_2_1 entity does not have parentEntity as child2 entity'
          )

          EditorControlFunctions.createObjectFromSceneElement(
            [{ name: ShadowComponent.jsonID }],
            child2Entity,
            child2_1Entity
          ) // so it wll be between, child3 and child2_1

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          const child2Entity2 = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
          const newChildren = getComponent(child2Entity2, EntityTreeComponent).children
          assert.notEqual(newChildren, child2Children)

          const newEntity = NameComponent.entitiesByName['New Object'][0]
          const child3Entity2 = UUIDComponent.getEntityByUUID('child_3' as EntityUUID)
          const child2_1Entity2 = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
          const expectedOrder = [child3Entity2, newEntity, child2_1Entity2]
          assert.deepStrictEqual(newChildren, expectedOrder, 'new entity is not between child3 and child2_1')

          unmount()
        })

        it('creates unique name for each newly created objects', async () => {
          applyIncomingActions()

          const { rerender, unmount } = render(sceneTag)
          await act(() => rerender(sceneTag))

          assert(rootEntity, 'root entity not found')
          assert.equal(
            hasComponent(rootEntity, EntityTreeComponent),
            true,
            'root entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(rootEntity, EntityTreeComponent).parentEntity,
            UndefinedEntity,
            'root entity does not have parentEntity'
          )

          const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
          assert(child0Entity, 'child_0 entity not found')
          assert.equal(
            hasComponent(child0Entity, EntityTreeComponent),
            true,
            'child_0 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child0Entity, EntityTreeComponent).parentEntity,
            rootEntity,
            'child_0 entity does not have parentEntity as root entity'
          )

          const child2Entity = UUIDComponent.getEntityByUUID('child_2' as EntityUUID)
          const child2_1Entity = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)

          assert(child2_1Entity, 'child_2_1 entity not found')
          assert.equal(
            hasComponent(child2_1Entity, EntityTreeComponent),
            true,
            'child_2_1 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child2_1Entity, EntityTreeComponent).parentEntity,
            child2Entity,
            'child_2_1 entity does not have parentEntity as child2 entity'
          )

          EditorControlFunctions.createObjectFromSceneElement(
            [{ name: ShadowComponent.jsonID }, { name: TransformComponent.jsonID }],
            child2_1Entity
          )

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          const child2_1Entity2 = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
          const newChild1 = getComponent(child2_1Entity2, EntityTreeComponent).children[
            getComponent(child2_1Entity2, EntityTreeComponent).children.length - 1
          ]

          EditorControlFunctions.createObjectFromSceneElement(
            [{ name: ShadowComponent.jsonID }, { name: TransformComponent.jsonID }],
            child2_1Entity2
          )

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          const child2_1Entity3 = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)

          const newChild2 = getComponent(child2_1Entity3, EntityTreeComponent).children[
            getComponent(child2_1Entity3, EntityTreeComponent).children.length - 1
          ]

          EditorControlFunctions.createObjectFromSceneElement(
            [{ name: ShadowComponent.jsonID }, { name: TransformComponent.jsonID }],
            child2_1Entity3
          )

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          const child2_1Entity4 = UUIDComponent.getEntityByUUID('child_2_1' as EntityUUID)
          const newChild3 = getComponent(child2_1Entity4, EntityTreeComponent).children[
            getComponent(child2_1Entity4, EntityTreeComponent).children.length - 1
          ]

          // name is the same - todo
          //assert.notEqual(getComponent(newChild1,NameComponent), getComponent(newChild2,NameComponent))
          //assert.notEqual(getComponent(newChild2,NameComponent), getComponent(newChild3,NameComponent))
          //assert.notEqual(getComponent(newChild1,NameComponent), getComponent(newChild3,NameComponent))

          unmount()
        })
      })

      describe('removeObjects', () => {
        it('Removes given nodes', async () => {
          applyIncomingActions()

          const { rerender, unmount } = render(sceneTag)
          await act(() => rerender(sceneTag))

          assert(rootEntity, 'root entity not found')
          assert.equal(
            hasComponent(rootEntity, EntityTreeComponent),
            true,
            'root entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(rootEntity, EntityTreeComponent).parentEntity,
            UndefinedEntity,
            'root entity does not have parentEntity'
          )

          const child0Entity = UUIDComponent.getEntityByUUID('child_0' as EntityUUID)
          assert(child0Entity, 'child_0 entity not found')
          assert.equal(
            hasComponent(child0Entity, EntityTreeComponent),
            true,
            'child_0 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child0Entity, EntityTreeComponent).parentEntity,
            rootEntity,
            'child_0 entity does not have parentEntity as root entity'
          )
          const nodes = [child0Entity]
          EditorControlFunctions.removeObject(nodes)

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          nodes.forEach((node: Entity) => {
            assert(!entityExists(node))
          })

          unmount()
        })

        it('will remove children of specified nodes', async () => {
          applyIncomingActions()

          const { rerender, unmount } = render(sceneTag)
          await act(() => rerender(sceneTag))

          assert(rootEntity, 'root entity not found')
          assert.equal(
            hasComponent(rootEntity, EntityTreeComponent),
            true,
            'root entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(rootEntity, EntityTreeComponent).parentEntity,
            UndefinedEntity,
            'root entity does not have parentEntity'
          )

          const child4Entity = UUIDComponent.getEntityByUUID('child_4' as EntityUUID)
          assert(child4Entity, 'child_4 entity not found')
          assert.equal(
            hasComponent(child4Entity, EntityTreeComponent),
            true,
            'child_4 entity does not have EntityTreeComponent'
          )

          const child5Entity = UUIDComponent.getEntityByUUID('child_5' as EntityUUID)
          assert(child5Entity, 'child_5 entity not found')
          assert.equal(
            hasComponent(child5Entity, EntityTreeComponent),
            true,
            'child_5 entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(child5Entity, EntityTreeComponent).parentEntity,
            child4Entity,
            'child_5 entity does not have parentEntity as child0 entity'
          )

          const nodes = [child4Entity]
          EditorControlFunctions.removeObject(nodes)

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          assert(!entityExists(child4Entity), 'child_4 entity was not removed')
          assert(!entityExists(child5Entity), 'child_5 entity was not removed')

          unmount()
        })

        it('will not remove root node', async () => {
          applyIncomingActions()

          const { rerender, unmount } = render(sceneTag)
          await act(() => rerender(sceneTag))

          assert(rootEntity, 'root entity not found')
          assert.equal(
            hasComponent(rootEntity, EntityTreeComponent),
            true,
            'root entity does not have EntityTreeComponent'
          )
          assert.equal(
            getComponent(rootEntity, EntityTreeComponent).parentEntity,
            UndefinedEntity,
            'root entity does not have parentEntity'
          )

          const nodes = [rootEntity]

          EditorControlFunctions.removeObject(nodes)

          applyIncomingActions()
          await act(() => rerender(sceneTag))

          assert(entityExists(rootEntity), 'root entity was removed')
          assert(hasComponent(rootEntity, EntityTreeComponent), 'root entity does not have EntityTreeComponent')

          unmount()
        })
      })
    })
  }
})

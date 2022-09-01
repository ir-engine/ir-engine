import assert from 'assert'
import { Object3D } from 'three'

import { createEngine } from '../../initializeEngine'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { SceneObjectComponent } from '../../scene/components/SceneObjectComponent'
import { Engine } from '../classes/Engine'
import { addComponent, defineQuery, getComponent, hasComponent } from './ComponentFunctions'
import { unloadScene } from './EngineFunctions'
import { createEntity } from './EntityFunctions'

describe('EngineFunctions', () => {
  describe('unloadScene', () => {
    it('can unload all scene entities', () => {
      createEngine()
      const world = Engine.instance.currentWorld
      const object3dQuery = defineQuery([Object3DComponent])
      const sceneObjectQuery = defineQuery([SceneObjectComponent])

      // create a bunch of entities
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      const sceneEntity = createEntity()
      addComponent(sceneEntity, Object3DComponent, { value: new Object3D() })
      addComponent(sceneEntity, SceneObjectComponent, true)

      const objectEntities = object3dQuery(world)

      // add obejcts to scene
      for (const entity of objectEntities)
        Engine.instance.currentWorld.scene.add(getComponent(entity, Object3DComponent).value)

      assert.equal(objectEntities.length, 2)

      unloadScene(world)

      assert.equal(object3dQuery(world).length, 1)

      // should clean up world entity too
      assert.equal(hasComponent(world.sceneEntity, SceneObjectComponent), false)
      const persistedEntites = sceneObjectQuery(world)
      assert.equal(persistedEntites.length, 0)
    })
  })
})

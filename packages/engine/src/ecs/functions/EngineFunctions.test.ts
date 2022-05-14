import assert from 'assert'
import { Object3D } from 'three'

import { createEngine } from '../../initializeEngine'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { PersistTagComponent } from '../../scene/components/PersistTagComponent'
import { Engine } from '../classes/Engine'
import { addComponent, defineQuery, getComponent, hasComponent } from './ComponentFunctions'
import { unloadAllEntities, unloadScene } from './EngineFunctions'
import { createEntity } from './EntityFunctions'

describe('EngineFunctions', () => {
  describe('unloadAllEntities', () => {
    it('can unload all scene entities', () => {
      createEngine()
      const world = Engine.instance.currentWorld
      const object3dQuery = defineQuery([Object3DComponent])
      const persistQuery = defineQuery([PersistTagComponent])

      // create a bunch of entities
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      const persistedEntity = createEntity()
      addComponent(persistedEntity, Object3DComponent, { value: new Object3D() })
      addComponent(persistedEntity, PersistTagComponent, {})

      const objectEntities = object3dQuery(world)

      // add obejcts to scene
      for (const entity of objectEntities)
        Engine.instance.currentWorld.scene.add(getComponent(entity, Object3DComponent).value)

      assert.equal(objectEntities.length, 5)

      unloadAllEntities(world, true)

      assert.equal(object3dQuery(world).length, 0)

      // should clean up world entity too
      assert.equal(hasComponent(world.worldEntity, PersistTagComponent), false)
      const persistedEntites = persistQuery(world)
      assert.equal(persistedEntites.length, 0)
    })

    it('can unload all non-persisted scene entities', () => {
      createEngine()
      const world = Engine.instance.currentWorld
      const getEntities = defineQuery([Object3DComponent])
      const persistQuery = defineQuery([PersistTagComponent])

      // create a bunch of entities
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      addComponent(createEntity(), Object3DComponent, { value: new Object3D() })
      const persistedEntity = createEntity()
      addComponent(persistedEntity, Object3DComponent, { value: new Object3D() })
      addComponent(persistedEntity, PersistTagComponent, {})

      const objectEntities = getEntities(world)

      // add obejcts to scene
      for (const entity of objectEntities)
        Engine.instance.currentWorld.scene.add(getComponent(entity, Object3DComponent).value)

      assert.equal(objectEntities.length, 5)

      unloadAllEntities(world, false)

      const persistedObjectEntites = getEntities(world)
      // should keep persisted entity
      assert.equal(persistedObjectEntites.length, 1)
      assert(hasComponent(persistedObjectEntites[0], Object3DComponent))
      assert(hasComponent(persistedObjectEntites[0], PersistTagComponent))
      assert(hasComponent(world.worldEntity, PersistTagComponent))

      const persistedEntites = persistQuery(world)
      assert.equal(persistedEntites.length, 2)
    })
  })

  // describe('unloadScene', () => {

  //   it('can unload scene while persisting', () => {

  //     unloadScene()

  //   })

  // })
})

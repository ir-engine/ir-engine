import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { createWorld, World } from '../../../ecs/classes/World'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SpawnPointComponent } from '../../components/SpawnPointComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import {
  deserializeSpawnPoint,
  prepareSpawnPointForGLTFExport,
  SCENE_COMPONENT_SPAWN_POINT,
  serializeSpawnPoint
} from './SpawnPointFunctions'

class AssetLoader {
  static async loadAsync() {
    return { scene: new Object3D() }
  }
}

describe('SpawnPointFunctions', () => {
  let world: World
  let entity: Entity
  let spawnPointFunctions = proxyquire('./SpawnPointFunctions', {
    '../../../assets/classes/AssetLoader': { AssetLoader }
  })

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    entity = createEntity()
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SPAWN_POINT,
    props: sceneComponentData
  }

  describe('deserializeSpawnPoint()', () => {
    it('creates SpawnPoint Component with provided component data', () => {
      deserializeSpawnPoint(entity, sceneComponent)

      const spawnpointComponent = getComponent(entity, SpawnPointComponent)
      assert(spawnpointComponent)
      assert(Object.keys(spawnpointComponent).length === 0)
    })

    it('creates SpawnPoint Object3D if Not created', () => {
      deserializeSpawnPoint(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d, 'SpawnPoint is not created')
    })

    it('does not create SpawnPoint Object3D if already created', () => {
      const obj3d = new Object3D()
      addComponent(entity, Object3DComponent, { value: obj3d })

      deserializeSpawnPoint(entity, sceneComponent)
      assert(getComponent(entity, Object3DComponent)?.value === obj3d)
    })

    describe('Editor vs Location', () => {
      it('creates SpawnPoint in Location', () => {
        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeSpawnPoint(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_SPAWN_POINT))
      })

      it('creates SpawnPoint in Editor', async () => {
        Engine.isEditor = true

        addComponent(entity, EntityNodeComponent, { components: [] })

        await spawnPointFunctions.deserializeSpawnPoint(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SPAWN_POINT))

        const obj3d = getComponent(entity, Object3DComponent)?.value
        assert(obj3d.children.includes(obj3d.userData.helperModel))
        assert(obj3d.children.includes(obj3d.userData.helperBox))
        assert(obj3d.userData.helperModel.layers.isEnabled(ObjectLayers.NodeHelper))
        assert(obj3d.userData.helperBox.layers.isEnabled(ObjectLayers.NodeHelper))
        Engine.isEditor = false
      })
    })
  })

  describe('serializeSpawnPoint()', () => {
    it('should properly serialize spawnpoint', () => {
      deserializeSpawnPoint(entity, sceneComponent)
      assert.deepEqual(serializeSpawnPoint(entity), sceneComponent)
    })

    it('should return undefine if there is no spawnpoint component', () => {
      assert(serializeSpawnPoint(entity) === undefined)
    })
  })

  describe('prepareSpawnPointForGLTFExport()', () => {
    let spawnPoint: Object3D = new Object3D()
    let helperModel: Object3D = new Object3D()
    let helperBox: Object3D = new Object3D()

    describe('Helper Model', () => {
      beforeEach(() => {
        spawnPoint = new Object3D()
        helperModel = new Object3D()
        spawnPoint.userData.helperModel = helperModel
        spawnPoint.add(helperModel)
      })

      it('should remove helper model', () => {
        prepareSpawnPointForGLTFExport(spawnPoint)
        assert(!spawnPoint.children.includes(helperModel))
        assert(!spawnPoint.userData.helperModel)
      })
    })

    describe('Helper Box', () => {
      beforeEach(() => {
        spawnPoint = new Object3D()
        helperBox = new Object3D()
        spawnPoint.userData.helperBox = helperBox
        spawnPoint.add(helperBox)
      })

      it('should remove helper box', () => {
        prepareSpawnPointForGLTFExport(spawnPoint)
        assert(!spawnPoint.children.includes(spawnPoint.userData.helperBox))
        assert(!spawnPoint.userData.helperBox)
      })
    })
  })
})

import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Sinon from 'sinon'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  getAllComponentsOfType,
  getComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeChild,
  destroyEntityTree,
  EntityTreeComponent
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { createEngine, setupEngineActionSystems } from '@etherealengine/engine/src/initializeEngine'

import '@etherealengine/engine/src/patchEngineNode'

import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { LoadState, PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { loadPrefab, unloadPrefab } from '@etherealengine/engine/src/scene/functions/loaders/PrefabComponentFunctions'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { XRELoader } from '../../../assets/classes/XRELoader'
import { World } from '../../../ecs/classes/World'
import { initSystems } from '../../../ecs/functions/SystemFunctions'
import { TransformModule } from '../../../transform/TransformModule'
import { SceneClientModule } from '../../SceneClientModule'
import { SceneCommonModule } from '../../SceneCommonModule'

describe('PrefabComponentFunctions', async () => {
  let entity: Entity
  let world: World
  let sandbox: Sinon.SinonSandbox
  let nextFixedStep: Promise<void>
  const initEntity = () => {
    entity = createEntity()
    world = Engine.instance.currentWorld
    addEntityNodeChild(entity, world.sceneEntity)
  }
  const testDir = 'packages/engine/tests/assets'
  beforeEach(async () => {
    sandbox = Sinon.createSandbox()
    createEngine()
    setupEngineActionSystems()
    initEntity()
    Engine.instance.engineTimer.start()

    Engine.instance.publicPath = ''

    await initSystems(world, [
      ...TransformModule(),
      ...SceneCommonModule(),
      ...SceneClientModule(),
      {
        uuid: 'Asset',
        type: 'FIXED_LATE',
        systemLoader: () =>
          Promise.resolve({
            default: async () => {
              let resolve: () => void
              nextFixedStep = new Promise<void>((r) => (resolve = r))
              return {
                execute: () => {
                  resolve()
                  nextFixedStep = new Promise<void>((r) => (resolve = r))
                },
                cleanup: async () => {}
              }
            }
          })
      }
    ])
  })

  afterEach(() => {
    sandbox.restore()
  })

  function dupeLoader(): any {
    return Object.entries(AssetLoader)
      .map(([k, v]) => {
        const result = {}
        result[k] = v
        return result
      })
      .reduce((a: Object, b: Object) => {
        return { ...a, ...b }
      })
  }

  function setContent(content) {
    const dudLoader = dupeLoader()

    dudLoader.loadAsync = async (url) => {
      return content
    }
    return dudLoader
  }

  function noFile() {
    const dudLoader = dupeLoader()
    dudLoader.loadAsync = async (url) => {
      throw Error('file not found')
    }
    return dudLoader
  }

  async function loadXRE(file, root?: Entity) {
    const scenePath = path.join(appRootPath.path, testDir, file)
    const xreLoader = new XRELoader()
    if (root) xreLoader.rootNode = root!
    const rawData = fs.readFileSync(scenePath, { encoding: 'utf-8' })
    const result = await xreLoader.parse(rawData)
    return result
  }

  describe('loadAsset()', () => {
    it('Correctly handles loading empty asset', async () => {
      //load test empty scene
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/empty.xre.gltf`
      })
      //load asset from example repo
      const emptyScene = await loadXRE('empty.xre.gltf')
      await loadPrefab(entity, setContent(emptyScene))

      console.log('DEBUG EMPTY SCENE', entity, world.fixedTick)

      //wait one fixed frame for system to reparent
      await nextFixedStep

      //check that PrefabComponent is correctly configured
      const assetComp = getComponent(entity, PrefabComponent)
      assert(assetComp, 'asset component exists')
      assert.equal(assetComp.loaded, LoadState.LOADED, 'asset is in a loaded state')
    })

    it('Correctly handles file not existing', async () => {
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/nonexistent.xre.gltf`
      })
      //load from asset path that does not exist
      try {
        await loadPrefab(entity, noFile())
        //wait one frame for system to reparent
        await nextFixedStep
      } catch (e) {
        //check that PrefabComponent has identical state to pre-load attempt
        const assetComp = getComponent(entity, PrefabComponent)
        assert(assetComp, 'asset component exists')
        assert(assetComp.loaded === LoadState.UNLOADED, 'asset is in unloaded state')
      }
    })

    it('Correctly handles loading basic test asset file', async () => {
      const assetPath = `${testDir}/empty_model.xre.gltf`
      addComponent(entity, PrefabComponent, {
        src: assetPath
      })
      //load asset from example repo
      await loadPrefab(entity, setContent(loadXRE('empty_model.xre.gltf', entity)))
      //wait one frame for system to reparent
      await nextFixedStep
      //check that AssetLoadedComponent and PrefabComponent are correctly configured
      const assetComp = getComponent(entity, PrefabComponent)
      assert(assetComp, 'Asset component exists')
      //check that asset root contains correct children

      const eNode = getComponent(entity, EntityTreeComponent)
      assert(entity, 'asset root entity node exists')
      assert(assetComp.loaded === LoadState.LOADED, 'asset has finished loading')
      const modelChild = eNode.children![0]
      // //check for model component
      const modelComp = getComponent(modelChild, ModelComponent)
      assert(modelComp, 'Child model component exists')
    })

    it('Correctly handles multiple load calls in single frame', async () => {
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/empty.xre.gltf`
      })
      //repeated load asset call for empty asset
      const loader = setContent(loadXRE('empty.xre.gltf'))
      await Promise.all([loadPrefab(entity, loader), loadPrefab(entity, loader)]) //one of these should give a warning saying Asset is not unloaded

      //wait one fixed frame for system to reparent
      await nextFixedStep
      //check that second call is ignored by...
      //make sure that loaded state is identical to single load call
      const assetComp = getComponent(entity, PrefabComponent)
      assert(assetComp, 'PrefabComponent exists')
      assert.equal(assetComp.loaded, LoadState.LOADED, 'Asset state is set to loaded')
    })

    it('Calls load, then is deleted', async () => {
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/empty_model.xre.gltf`
      })
      //call load
      await loadPrefab(entity, setContent(loadXRE('empty_model.xre.gltf', entity)))
      //delete entity
      destroyEntityTree(entity)
      //wait one fixed frame
      await nextFixedStep
      assert.equal(getAllComponentsOfType(PrefabComponent, world).length, 0, 'no Asset components in scene')
      assert.equal(getAllComponentsOfType(ModelComponent, world).length, 0, 'no ModelComponents in scene')
    })
  })

  describe('unloadAsset()', () => {
    it('Correctly handles unloading empty asset', async () => {
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/empty.xre.gltf`
      })
      //call load
      await loadPrefab(entity, setContent(loadXRE('empty.xre.gltf')))
      //wait one fixed frame
      await nextFixedStep
      //unload asset
      unloadPrefab(entity)
      //execute frame
      await nextFixedStep
      //ensure that asset system does not try to load asset
      const assetComp = getComponent(entity, PrefabComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
      assert.equal(assetComp.roots.length, 0, 'Asset has no roots')
    })

    it('Correctly handles unloading basic asset file', async () => {
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/empty_model.xre.gltf`
      })
      //call load
      await loadPrefab(entity, setContent(loadXRE('empty_model.xre.gltf', entity)))
      // wait for frame
      await nextFixedStep
      //unload asset
      unloadPrefab(entity)
      // wait for frame
      await nextFixedStep
      //ensure that asset system does not try to load asset
      const assetComp = getComponent(entity, PrefabComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
      //check that asset child hierarchy is removed
      assert.equal(assetComp.roots.length, 0, 'Asset has no roots')
      assert.equal(getAllComponentsOfType(ModelComponent, world).length, 0, 'no ModelComponents in scene')
    })

    it('Correctly handles unloading empty asset', async () => {
      addComponent(entity, PrefabComponent, {
        src: `${testDir}/empty.xre.gltf`
      })
      //call load
      await loadPrefab(entity, setContent(loadXRE('empty.xre.gltf')))
      // wait for frame
      await nextFixedStep
      //unload asset
      unloadPrefab(entity)
      //unload asset again
      unloadPrefab(entity)
      // wait for frame
      await nextFixedStep
      //ensure that asset system does not try to load asset
      const assetComp = getComponent(entity, PrefabComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
      assert.equal(assetComp.roots.length, 0, 'Asset has no roots')
    })
  })

  //TODO:
  //test can serialize scene to file
  //test can deserialize file into scene
  //test serialize multiple assets at once
  //test deserialize multiple assets at once
  //test nested serialization
  //test nested deserialization
})

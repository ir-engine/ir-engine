import appRootPath from 'app-root-path'
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import Sinon from 'sinon'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  getAllComponentsOfType,
  getComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeChild,
  createEntityNode,
  removeEntityNodeFromParent
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEngine, setupEngineActionSystems } from '@xrengine/engine/src/initializeEngine'

import '@xrengine/engine/src/patchEngineNode'

import { AssemblyComponent, LoadState } from '@xrengine/engine/src/scene/components/AssemblyComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { loadAsset, unloadAsset } from '@xrengine/engine/src/scene/functions/loaders/AssemblyComponentFunctions'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { XRELoader } from '../../../assets/classes/XRELoader'
import { World } from '../../../ecs/classes/World'
import { EntityTreeNode } from '../../../ecs/functions/EntityTree'
import { initSystems } from '../../../ecs/functions/SystemFunctions'
import { TransformModule } from '../../../transform/TransformModule'
import { SceneClientModule } from '../../SceneClientModule'
import { SceneCommonModule } from '../../SceneCommonModule'

describe('AssemblyComponentFunctions', async () => {
  let entity: Entity
  let node: EntityTreeNode
  let world: World
  let sandbox: Sinon.SinonSandbox
  let nextFixedStep: Promise<void>
  const initEntity = () => {
    entity = createEntity()
    node = createEntityNode(entity)
    world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
  }
  const testDir = 'packages/engine/tests/assets/'
  beforeEach(async () => {
    sandbox = Sinon.createSandbox()
    createEngine()
    setupEngineActionSystems()
    initEntity()
    Engine.instance.engineTimer.start()

    Engine.instance.publicPath = ''
    await Promise.all([TransformModule(), SceneCommonModule(), SceneClientModule()])

    await initSystems(world, [
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
    if (root) xreLoader.rootNode = Engine.instance.currentWorld.entityTree.entityNodeMap.get(root)!
    const rawData = fs.readFileSync(scenePath, { encoding: 'utf-8' })
    const result = await xreLoader.parse(rawData)
    return result
  }

  describe('loadAsset()', () => {
    it('Correctly handles loading empty asset', async () => {
      //load test empty scene
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/empty.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //load asset from example repo
      const emptyScene = await loadXRE('empty.xre.gltf')
      await loadAsset(entity, setContent(emptyScene))

      console.log('DEBUG EMPTY SCENE', entity, world.fixedTick)

      //wait one fixed frame for system to reparent
      await nextFixedStep

      //check that AssemblyComponent is correctly configured
      const assetComp = getComponent(entity, AssemblyComponent)
      assert(assetComp, 'asset component exists')
      assert.equal(assetComp.loaded, LoadState.LOADED, 'asset is in a loaded state')
    })

    it('Correctly handles file not existing', async () => {
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/nonexistent.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //load from asset path that does not exist
      try {
        await loadAsset(entity, noFile())
        //wait one frame for system to reparent
        await nextFixedStep
      } catch (e) {
        //check that AssemblyComponent has identical state to pre-load attempt
        const assetComp = getComponent(entity, AssemblyComponent)
        assert(assetComp, 'asset component exists')
        assert(assetComp.loaded === LoadState.UNLOADED, 'asset is in unloaded state')
      }
    })

    it('Correctly handles loading basic test asset file', async () => {
      const assetPath = `${testDir}/empty_model.xre.gltf`
      addComponent(entity, AssemblyComponent, {
        src: assetPath,
        loaded: LoadState.UNLOADED
      })
      //load asset from example repo
      await loadAsset(entity, setContent(loadXRE('empty_model.xre.gltf', entity)))
      //wait one frame for system to reparent
      await nextFixedStep
      //check that AssetLoadedComponent and AssemblyComponent are correctly configured
      const assetComp = getComponent(entity, AssemblyComponent)
      assert(assetComp, 'Asset component exists')
      //check that asset root contains correct children

      const eNode = world.entityTree.entityNodeMap.get(entity)
      assert(eNode, 'asset root entity node exists')
      assert(assetComp.loaded === LoadState.LOADED, 'asset has finished loading')
      const modelChild = eNode.children![0]
      // //check for model component
      const modelComp = getComponent(modelChild, ModelComponent)
      assert(modelComp, 'Child model component exists')
    })

    it('Correctly handles multiple load calls in single frame', async () => {
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/empty.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //repeated load asset call for empty asset
      const loader = setContent(loadXRE('empty.xre.gltf'))
      await Promise.all([loadAsset(entity, loader), loadAsset(entity, loader)]) //one of these should return a warning saying Asset is not unloaded

      //wait one fixed frame for system to reparent
      await nextFixedStep
      //check that second call is ignored by...
      //make sure that loaded state is identical to single load call
      const assetComp = getComponent(entity, AssemblyComponent)
      assert(assetComp, 'AssemblyComponent exists')
      assert.equal(assetComp.loaded, LoadState.LOADED, 'Asset state is set to loaded')
    })

    it('Calls load, then is deleted', async () => {
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/empty.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty.xre.gltf', entity)))
      //delete entity
      removeEntityNodeFromParent(node, world.entityTree)
      removeEntity(entity)
      //wait one fixed frame
      await nextFixedStep
      assert.equal(getAllComponentsOfType(AssemblyComponent, world).length, 0, 'no Asset components in scene')
    })
  })

  describe('unloadAsset()', () => {
    it('Correctly handles unloading empty asset', async () => {
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/empty.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty.xre.gltf')))
      //wait one fixed frame
      await nextFixedStep
      //unload asset
      unloadAsset(entity)
      //execute frame
      await nextFixedStep
      //ensure that asset system does not try to load asset
      const assetComp = getComponent(entity, AssemblyComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
      assert.equal(assetComp.roots.length, 0, 'Asset has no roots')
    })

    it('Correctly handles unloading basic asset file', async () => {
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/empty_model.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty_model.xre.gltf', entity)))
      // wait for frame
      await nextFixedStep
      //unload asset
      unloadAsset(entity)
      // wait for frame
      await nextFixedStep
      //ensure that asset system does not try to load asset
      const assetComp = getComponent(entity, AssemblyComponent)
      assert.equal(assetComp.loaded, LoadState.UNLOADED, 'Asset state is set to unloaded')
      //check that asset child hierarchy is removed
      assert.equal(assetComp.roots.length, 0, 'Asset has no roots')
      assert(node.children == undefined || node.children.length === 0, 'child hierarchy is removed')
    })

    it('Correctly handles unloading empty asset', async () => {
      addComponent(entity, AssemblyComponent, {
        src: `${testDir}/empty.xre.gltf`,
        loaded: LoadState.UNLOADED
      })
      //call load
      await loadAsset(entity, setContent(loadXRE('empty.xre.gltf')))
      // wait for frame
      await nextFixedStep
      //unload asset
      unloadAsset(entity)
      //unload asset again
      unloadAsset(entity)
      // wait for frame
      await nextFixedStep
      //ensure that asset system does not try to load asset
      const assetComp = getComponent(entity, AssemblyComponent)
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

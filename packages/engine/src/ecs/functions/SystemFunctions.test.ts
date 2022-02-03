import assert from 'assert'
import { Engine } from '../classes/Engine'
import { createWorld, World } from '../classes/World'
import { initSystems, unloadSystems } from './SystemFunctions'
import { SystemUpdateType } from './SystemUpdateType'

const MockSystemModulePromise = async () => {
  return {
    default: MockSystemInitialiser
  }
}

async function MockSystemInitialiser(world: World) {
  return () => {}
}

const AnotherMockSystemModulePromise = async () => {
  return {
    default: AnotherMockSystemInitialiser
  }
}

async function AnotherMockSystemInitialiser(world: World) {
  return () => {}
}

describe('SystemFunctions', () => {
  describe('initSystems', () => {
    it('can initialize systems', async () => {
      const world = createWorld()
      Engine.currentWorld = world
      const fixedPipeline = SystemUpdateType.FIXED
      await initSystems(world, [
        {
          systemModulePromise: MockSystemModulePromise(),
          type: SystemUpdateType.FIXED,
          sceneSystem: true
        }
      ])

      assert.equal(world.pipelines[fixedPipeline].length, 1)
      assert.equal(world.pipelines[fixedPipeline][0].name, MockSystemInitialiser.name)
      assert.equal(world.pipelines[fixedPipeline][0].type, fixedPipeline)
      assert.equal(world.pipelines[fixedPipeline][0].sceneSystem, true)
      assert.equal(typeof world.pipelines[fixedPipeline][0].execute, 'function')
    })

    it('can initialize multiple systems of same type', async () => {
      const world = createWorld()
      Engine.currentWorld = world
      const fixedPipeline = SystemUpdateType.FIXED
      await initSystems(world, [
        {
          systemModulePromise: MockSystemModulePromise(),
          type: fixedPipeline,
          sceneSystem: true
        },
        {
          systemModulePromise: AnotherMockSystemModulePromise(),
          type: fixedPipeline,
          sceneSystem: false
        }
      ])

      assert.equal(world.pipelines[fixedPipeline].length, 2)
      assert.equal(world.pipelines[fixedPipeline][0].name, MockSystemInitialiser.name)
      assert.equal(world.pipelines[fixedPipeline][1].name, AnotherMockSystemInitialiser.name)
      assert.equal(world.pipelines[fixedPipeline][0].type, fixedPipeline)
      assert.equal(world.pipelines[fixedPipeline][1].type, fixedPipeline)
      assert.equal(world.pipelines[fixedPipeline][0].sceneSystem, true)
      assert.equal(world.pipelines[fixedPipeline][1].sceneSystem, false)
      assert.equal(typeof world.pipelines[fixedPipeline][0].execute, 'function')
      assert.equal(typeof world.pipelines[fixedPipeline][1].execute, 'function')
    })

    it('can initialize multiple systems of different type', async () => {
      const world = createWorld()
      Engine.currentWorld = world
      const fixedPipeline = SystemUpdateType.FIXED
      const updatePipeline = SystemUpdateType.UPDATE
      await initSystems(world, [
        {
          systemModulePromise: MockSystemModulePromise(),
          type: fixedPipeline,
          sceneSystem: true
        },
        {
          systemModulePromise: AnotherMockSystemModulePromise(),
          type: updatePipeline,
          sceneSystem: false
        }
      ])

      assert.equal(world.pipelines[fixedPipeline].length, 1)
      assert.equal(world.pipelines[fixedPipeline][0].name, MockSystemInitialiser.name)
      assert.equal(world.pipelines[fixedPipeline][0].type, fixedPipeline)
      assert.equal(world.pipelines[fixedPipeline][0].sceneSystem, true)
      assert.equal(typeof world.pipelines[fixedPipeline][0].execute, 'function')

      assert.equal(world.pipelines[updatePipeline].length, 1)
      assert.equal(world.pipelines[updatePipeline][0].name, AnotherMockSystemInitialiser.name)
      assert.equal(world.pipelines[updatePipeline][0].type, updatePipeline)
      assert.equal(world.pipelines[updatePipeline][0].sceneSystem, false)
      assert.equal(typeof world.pipelines[updatePipeline][0].execute, 'function')
    })
  })

  describe('unloadSystems', () => {
    it('can remove scene system', async () => {
      const world = createWorld()
      Engine.currentWorld = world
      const pipelineType = SystemUpdateType.FIXED
      await initSystems(world, [
        {
          systemModulePromise: MockSystemModulePromise(),
          type: pipelineType,
          sceneSystem: true
        }
      ])

      assert.equal(world.pipelines[pipelineType].length, 1)

      unloadSystems(world, true)

      assert.equal(world.pipelines[pipelineType].length, 0)
    })

    it('can remove all systems', async () => {
      const world = createWorld()
      Engine.currentWorld = world
      const pipelineType = SystemUpdateType.FIXED
      await initSystems(world, [
        {
          systemModulePromise: MockSystemModulePromise(),
          type: pipelineType,
          sceneSystem: false
        },
        {
          systemModulePromise: AnotherMockSystemModulePromise(),
          type: pipelineType,
          sceneSystem: false
        }
      ])

      assert.equal(world.pipelines[pipelineType].length, 2)

      unloadSystems(world, false)

      assert.equal(world.pipelines[pipelineType].length, 0)
    })

    it('can remove only scene systems', async () => {
      const world = createWorld()
      Engine.currentWorld = world
      const pipelineType = SystemUpdateType.FIXED
      await initSystems(world, [
        {
          systemModulePromise: MockSystemModulePromise(),
          type: pipelineType,
          sceneSystem: true
        },
        {
          systemModulePromise: AnotherMockSystemModulePromise(),
          type: pipelineType,
          sceneSystem: false
        }
      ])

      assert.equal(world.pipelines[pipelineType].length, 2)

      unloadSystems(world, true)

      assert.equal(world.pipelines[pipelineType].length, 1)
    })
  })
})

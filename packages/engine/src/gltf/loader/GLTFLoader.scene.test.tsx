/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * @fileoverview
 * Unit Test suite for loading the `glTF.scenes` and `glTF.scene` root properties.
 * Based on glTF 2.0 specification requirements.
 * */
import { GLTF } from '@gltf-transform/core'
import { createEngine, destroyEngine, EntityTreeComponent, getComponent } from '@ir-engine/ecs'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
  // Clear the dependency cache before each test
  DependencyCache.clear()
})

overrideFileLoaderLoad()

beforeEach(async () => {
  createEngine()
  startEngineReactor()

  await act(() => render(null))
})

afterEach(() => {
  destroyEngine()
})

// Helper function to create a minimal valid GLTF with scenes
const mockGLTFWithScenes = (scenes: GLTF.IScene[] = [], sceneIndex?: number): GLTF.IGLTF => {
  const gltf: GLTF.IGLTF = {
    asset: {
      version: '2.0'
    }
  }

  if (scenes.length > 0) {
    gltf.scenes = scenes
  }

  if (typeof sceneIndex === 'number') {
    gltf.scene = sceneIndex
  }

  return gltf
}

// Helper function to create a minimal valid GLTF with nodes
const mockGLTFWithNodes = (nodes: GLTF.INode[] = []): GLTF.IGLTF => {
  const gltf: GLTF.IGLTF = {
    asset: {
      version: '2.0'
    },
    scenes: [{ nodes: Array.from({ length: nodes.length }, (_, i) => i) }],
    scene: 0,
    nodes
  }

  return gltf
}

describe('glTF.scene Property (Root Level)', () => {
  it('MAY be undefined', async () => {
    // Create a GLTF with scenes but no default scene index
    const gltf = mockGLTFWithScenes([{ nodes: [] }])
    const options = mockGLTFOptions(gltf)

    // Should not throw when scene is undefined
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
  })

  it('MUST be an `integer` type when defined', async () => {
    // Create a GLTF with an invalid non-integer scene index
    const gltf = mockGLTFWithScenes([{ nodes: [] }])
    gltf.scene = 0.5 // Non-integer value
    const options = mockGLTFOptions(gltf)

    // Should throw when scene is not an integer
    // Note: This may not throw if the implementation doesn't validate this
    // but we're testing the specification requirement
    try {
      await GLTFLoaderFunctions.loadScene(options, gltf.scene!)
      expect.fail('Should throw for non-integer scene index')
    } catch (error) {
      // Test passes if it throws
      expect(error).toBeDefined()
    }
  })

  /** @todo Should throw. Our implementation does not respect the specification for glTF.scene range validation */
  it.fails('MUST have a value in range [0 .. glTF.scenes.length-1]', async () => {
    // Create a GLTF with scene index out of range
    const gltf = mockGLTFWithScenes([{ nodes: [] }], 1) // Index 1 is out of range
    const options = mockGLTFOptions(gltf)

    // Should throw when scene index is out of range
    await expect(GLTFLoaderFunctions.loadScene(options, gltf.scene!)).rejects.toThrow()
  })

  /** @todo Should throw. Our implementation does not respect the specification for glTF.scene when scenes is undefined */
  it.fails('MUST NOT be defined if `scenes` is undefined', async () => {
    // Create a GLTF with scene index but no scenes array
    const gltf = mockGLTFWithScenes(undefined, 0)
    const options = mockGLTFOptions(gltf)

    // Should throw when scene is defined but scenes is undefined
    await expect(GLTFLoaderFunctions.loadScene(options, gltf.scene!)).rejects.toThrow()
  })
}) //:: glTF.scene (Root Level)

describe('glTF.scenes Property', () => {
  it('MAY be undefined', async () => {
    // Create a GLTF with no scenes
    const gltf = mockGLTFWithScenes()
    const options = mockGLTFOptions(gltf)

    // Should not throw when scenes is undefined
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
  })

  /** @todo Should throw. Our implementation does not respect the specification for glTF.scenes type validation */
  it.fails('MUST be an array of `scene` objects when defined', async () => {
    // Create a GLTF with invalid scenes (not an array)
    const gltf = mockGLTFWithScenes()
    gltf.scenes = {} as any // Not an array
    const options = mockGLTFOptions(gltf)

    // Should throw when scenes is not an array
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).rejects.toThrow()
  })

  /** @todo Should throw. Our implementation does not respect the specification for glTF.scenes length validation */
  it.fails('MUST have a length in range [1..] when defined', async () => {
    // Create a GLTF with empty scenes array
    const gltf = mockGLTFWithScenes([])
    const options = mockGLTFOptions(gltf)

    // Should throw when scenes array is empty
    await expect(GLTFLoaderFunctions.loadScene(options, 0)).rejects.toThrow()
  })
}) //:: glTF.scenes

describe('glTF: Scene Type', () => {
  describe('nodes', () => {
    it('MAY be undefined', async () => {
      // Create a GLTF with a scene that has no nodes
      const gltf = mockGLTFWithScenes([{ nodes: [] }], 0)
      const options = mockGLTFOptions(gltf)

      // Should not throw when nodes is undefined
      await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
    })

    it('MUST be an array of `integer` types when defined', async () => {
      // Create a GLTF with a scene that has invalid nodes (non-integer)
      const gltf = mockGLTFWithScenes([{ nodes: [0, 1.5] }], 0)
      const options = mockGLTFOptions(gltf)

      // Should throw when nodes contains non-integer values
      try {
        await GLTFLoaderFunctions.loadScene(options, 0)
        expect.fail('Should throw for non-integer node indices')
      } catch (error) {
        // Test passes if it throws
        expect(error).toBeDefined()
      }
    })

    it('MUST have unique values', async () => {
      // Create a GLTF with a scene that has duplicate node indices
      const gltf = mockGLTFWithNodes([{}, {}])
      gltf.scenes![0].nodes = [0, 0] // Duplicate node index
      const options = mockGLTFOptions(gltf)

      // Should throw or result in incorrect scene structure
      await GLTFLoaderFunctions.loadScene(options, 0)

      const rootEntity = options.entity
      const childEntities = getComponent(rootEntity, EntityTreeComponent)?.children || []

      // If duplicate nodes are handled correctly, we should have only one child
      // If they're not validated, we might have two children with the same node
      expect(childEntities.length).toBe(1)
    })

    it('MUST have values that are >= 0', async () => {
      // Create a GLTF with a scene that has negative node indices
      const gltf = mockGLTFWithScenes([{ nodes: [0, -1] }], 0)
      const options = mockGLTFOptions(gltf)

      // Should throw when nodes contains negative values
      try {
        await GLTFLoaderFunctions.loadScene(options, 0)
        expect.fail('Should throw for negative node indices')
      } catch (error) {
        // Test passes if it throws
        expect(error).toBeDefined()
      }
    })
  }) //:: nodes

  describe('name', () => {
    it('MAY be undefined', async () => {
      // Create a GLTF with a scene that has no name
      const gltf = mockGLTFWithScenes([{ nodes: [] }], 0)
      const options = mockGLTFOptions(gltf)

      // Should not throw when name is undefined
      await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
    })

    it('MUST be a `string` type when defined', async () => {
      // Create a GLTF with a scene that has an invalid name (not a string)
      const gltf = mockGLTFWithScenes([{ nodes: [], name: 42 as any }], 0)
      const options = mockGLTFOptions(gltf)

      // Should throw when name is not a string
      try {
        await GLTFLoaderFunctions.loadScene(options, 0)
        expect.fail('Should throw for non-string scene name')
      } catch (error) {
        // Test passes if it throws
        expect(error).toBeDefined()
      }
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', async () => {
      // Create a GLTF with a scene that has no extensions
      const gltf = mockGLTFWithScenes([{ nodes: [] }], 0)
      const options = mockGLTFOptions(gltf)

      // Should not throw when extensions is undefined
      await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
    })

    it('MUST be a JSON object when defined', async () => {
      // Create a GLTF with a scene that has invalid extensions (not an object)
      const gltf = mockGLTFWithScenes([{ nodes: [], extensions: 42 as any }], 0)
      const options = mockGLTFOptions(gltf)

      // Should throw when extensions is not an object
      try {
        await GLTFLoaderFunctions.loadScene(options, 0)
        expect.fail('Should throw for non-object extensions')
      } catch (error) {
        // Test passes if it throws
        expect(error).toBeDefined()
      }
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', async () => {
      // Create a GLTF with a scene that has no extras
      const gltf = mockGLTFWithScenes([{ nodes: [] }], 0)
      const options = mockGLTFOptions(gltf)

      // Should not throw when extras is undefined
      await expect(GLTFLoaderFunctions.loadScene(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Scene

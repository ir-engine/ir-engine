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
 * Unit Test suite for validating `glTF.samplers` directly and indirectly through texture loading.
 * Based on glTF 2.0 specification requirements.
 */
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

// describe('glTF.samplers Property', () => {
//   it.todo('MAY be undefined', () => {})
//   it.todo('MUST be an array of `sampler` objects when defined', () => {})
//   it.todo('MUST have a length in range [1..] when defined', () => {})
// }) //:: glTF.samplers

// describe('glTF: Sampler Type', () => {
//   describe('magFilter', () => {
//     it.todo('MAY be undefined', () => {})
//     it.todo('MUST be an `integer` type when defined', () => {})
//     it.todo('MUST be one of the allowed values: 9728 NEAREST, 9729 LINEAR', () => {})
//   }) //:: magFilter

//   describe('minFilter', () => {
//     it.todo('MAY be undefined', () => {})
//     it.todo('MUST be an `integer` type when defined', () => {})
//     it.todo(
//       'MUST be one of the allowed values: 9728 NEAREST, 9729 LINEAR, 9984 NEAREST_MIPMAP_NEAREST, 9985 LINEAR_MIPMAP_NEAREST, 9986 NEAREST_MIPMAP_LINEAR, 9987 LINEAR_MIPMAP_LINEAR',
//       () => {}
//     )
//   }) //:: minFilter

//   describe('wrapS', () => {
//     it.todo('MAY be undefined', () => {})
//     it.todo('SHOULD assign a default value of 10497 REPEAT', () => {})
//     it.todo('MUST be an `integer` type when defined', () => {})
//     it.todo('MUST be one of the allowed values: 33071 CLAMP_TO_EDGE, 33648 MIRRORED_REPEAT, 10497 REPEAT', () => {})
//   }) //:: wrapS

//   describe('wrapT', () => {
//     it.todo('MAY be undefined', () => {})
//     it.todo('SHOULD assign a default value of 10497 REPEAT', () => {})
//     it.todo('MUST be an `integer` type when defined', () => {})
//     it.todo('MUST be one of the allowed values: 33071 CLAMP_TO_EDGE, 33648 MIRRORED_REPEAT, 10497 REPEAT', () => {})
//   }) //:: wrapT

//   describe('name', () => {
//     it.todo('MAY be undefined', () => {})
//     it.todo('MUST be a `string` type when defined', () => {})
//   }) //:: name

//   describe('extensions', () => {
//     it.todo('MAY be undefined', () => {})
//     it.todo('MUST be a JSON object when defined', () => {})
//   }) //:: extensions

//   describe('extras', () => {
//     it.todo('MAY be undefined', () => {})
//   }) //:: extras
// }) //:: glTF: Sampler

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

describe('glTF.samplers Property (indirect validation)', () => {
  it('MAY be undefined', async () => {
    const options = mockGLTFOptions(mockGLTF())
    console.log('options', options)
    delete options.document.samplers
    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture).toBeDefined()
    expect(texture.wrapS).toBeDefined() // Default value
    expect(texture.wrapT).toBeDefined() // Default value
  })

  it('MUST be an array of `sampler` objects when defined', async () => {
    const options = mockGLTFOptions(mockGLTF())
    options.document.samplers = 42 as any // Invalid type
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MUST have a length in range [1..] when defined', async () => {
    const options = mockGLTFOptions(mockGLTF())
    options.document.samplers = [] // Empty array
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })
})

describe('glTF: Sampler Type (direct and indirect validation)', () => {
  function mockGLTFWithSampler(sampler: any) {
    const result = mockGLTF()
    result.samplers = [sampler]
    return result
  }

  it('MAY have undefined `magFilter`', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({}))
    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture.magFilter).toBeDefined() // Default value
  })

  it('MUST have `magFilter` as an integer when defined', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ magFilter: 9729.42 })) // Invalid type
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MUST have `magFilter` as one of the allowed values', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ magFilter: 42 })) // Invalid value
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MAY have undefined `wrapS` and `wrapT`', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({}))
    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture.wrapS).toBeDefined() // Default value
    expect(texture.wrapT).toBeDefined() // Default value
  })

  it('MUST have `wrapS` and `wrapT` as integers when defined', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ wrapS: 10497.42, wrapT: 10497.42 })) // Invalid type
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MUST have `wrapS` and `wrapT` as one of the allowed values', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ wrapS: 42, wrapT: 42 })) // Invalid values
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MAY have undefined `minFilter`', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({}))
    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture.minFilter).toBeDefined() // Default value
  })

  it('MUST have `minFilter` as an integer when defined', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ minFilter: 9987.42 })) // Invalid type
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MUST have `minFilter` as one of the allowed values', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ minFilter: 42 })) // Invalid value
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MAY have undefined `extensions`', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({}))
    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture).toBeDefined()
  })

  it('MUST have `extensions` as a JSON object when defined', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({ extensions: 42 })) // Invalid type
    await expect(GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)).rejects.toThrowError()
  })

  it('MAY have undefined `extras`', async () => {
    const options = mockGLTFOptions(mockGLTFWithSampler({}))
    const texture = await GLTFLoaderFunctions.loadTextureImage(options, 0, 0, {} as any)
    expect(texture).toBeDefined()
  })
})

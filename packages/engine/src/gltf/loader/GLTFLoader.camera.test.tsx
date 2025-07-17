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
 * Unit Test suite for loading the `glTF.cameras` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'

import { createEngine, createEntity, destroyEngine, removeEntity, UndefinedEntity } from '@ir-engine/ecs'
import { DependencyCache, GLTFLoaderFunctions } from '../GLTFLoaderFunctions'

beforeEach(() => {
  DependencyCache.clear()
})

overrideFileLoaderLoad()

let testEntity = UndefinedEntity

beforeEach(async () => {
  createEngine()
  startEngineReactor()
  testEntity = createEntity()

  await act(() => render(null))
})

afterEach(() => {
  removeEntity(testEntity)
  destroyEngine()
})

/**
 * @todo
 * Cannot possibly tested in our current GLTFLoader implementation
 * It requires a GLTFLoader gltf root properties validation function that does not exist.
 * */

describe('glTF.cameras Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `camera` objects when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.cameras

/**
 * @todo
 * Revisit all of these, and double check that the data is setup correctly.
 * Its very likely that it is not.
 * */
describe('glTF: Camera Type', () => {
  function mockGLTFMinimalCamera() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0',
        camera: 0
      }
    ]
    result.cameras = [
      {
        type: 'perspective',
        perspective: {
          yfov: 45,
          znear: 1,
          zfar: 10
        }
      }
    ]
    return result
  }

  describe('type', () => {
    it.todo('MUST be defined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].type
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST be a `string` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 42 as any // Not a string
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST be one of the allowed values: "perspective" | "orthographic"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'SomeIncorrectValue' as any // Not an allowed value
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: type

  describe('orthographic', () => {
    it.todo('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      delete options.document.cameras![0].orthographic
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be defined if `type` is "orthographic"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'orthographic'
      delete options.document.cameras![0].orthographic
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST not be defined if `type` is "perspective"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'perspective'
      options.document.cameras![0].orthographic = {} as any // Not undefined
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST be a `camera.orthographic` object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'orthographic'
      options.document.cameras![0].orthographic = 42 as any // Not a `camera.orthographic` object
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: orthographic

  describe('perspective', () => {
    it('MAY be undefined', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'orthographic'
      options.document.cameras![0].orthographic = {
        xmag: 1,
        ymag: 1,
        znear: 1,
        zfar: 10
      }
      delete options.document.cameras![0].perspective
      await GLTFLoaderFunctions.loadCamera(options, testEntity, 0)
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be defined if `type` is "perspective"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      delete options.document.cameras![0].perspective
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST not be defined if `type` is "orthographic"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'orthographic'
      options.document.cameras![0].orthographic = {
        xmag: 1,
        ymag: 1,
        znear: 1,
        zfar: 10
      }
      options.document.cameras![0].perspective = {} as any // Not undefined
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST be a `camera.perspective` object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].type = 'perspective'
      options.document.cameras![0].perspective = 42 as any // Not a `camera.orthographic` object
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: perspective

  describe('name', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      delete options.document.cameras![0].name
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a `string` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].name = 42 as any // Not a string
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      delete options.document.cameras![0].extensions
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      options.document.cameras![0].extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCamera())
      delete options.document.cameras![0].extras
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Camera

describe.todo('glTF: Camera.Orthographic Type', () => {
  function mockGLTFMinimalCameraOrthographic() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0',
        camera: 0
      }
    ]
    result.cameras = [
      {
        type: 'orthographic',
        orthographic: {
          xmag: 1,
          ymag: 1,
          zfar: 10,
          znear: 1
        }
      }
    ]
    return result
  }

  describe.todo('xmag', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].orthographic!.xmag
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be a `number` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.xmag = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST NOT equal zero', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.xmag = 0 // Equal zero
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    /** @todo How to check for SHOULD NOT in this context */
    it.todo('SHOULD NOT be negative', () => {})
  }) //:: xmag

  describe('ymag', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].orthographic!.ymag
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be a `number` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.ymag = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST NOT equal zero', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.ymag = 0 // Equal zero
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    /** @todo How to check for SHOULD NOT in this context */
    it.todo('SHOULD NOT be negative', () => {})
  }) //:: ymag

  describe('zfar', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].orthographic!.zfar
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be a `number` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.zfar = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST have a value greater than zero', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.zfar = -1 // Not greater than zero
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be greater than `znear`', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.znear = 10
      options.document.cameras![0].orthographic!.zfar = 1 // Not greater than znear
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: zfar

  describe('znear', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].orthographic!.znear
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be a `number` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.znear = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.znear = -1 // Not in range [0..]
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: znear

  describe.todo('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      delete options.document.cameras![0].orthographic!.extensions
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      options.document.cameras![0].orthographic!.extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it.todo('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraOrthographic())
      delete options.document.cameras![0].orthographic!.extras
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Camera.Orthographic

describe('glTF: Camera.Perspective Type', () => {
  function mockGLTFMinimalCameraPerspective() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0',
        camera: 0
      }
    ]
    result.cameras = [
      {
        type: 'perspective',
        perspective: {
          yfov: 45,
          znear: 1
        }
      }
    ]
    return result
  }

  describe('aspectRatio', () => {
    it.todo('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      delete options.document.cameras![0].perspective!.aspectRatio
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a `number` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.aspectRatio = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST have a value > 0 when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.aspectRatio = 0 // Not > 0
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST use the rendering viewport aspect ratio when undefined', () => {})
  }) //:: aspectRatio

  describe.todo('yfov', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].perspective!.yfov
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be a `number` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.yfov = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST a value > 0', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.yfov = 0 // Not > 0
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: yfov

  describe('zfar', () => {
    it.todo('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      delete options.document.cameras![0].perspective!.zfar
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a `number` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.zfar = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST have a value > 0 when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.zfar = 0 // Not > 0
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it.todo('MUST be greater than `znear` when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.znear = 10
      options.document.cameras![0].perspective!.zfar = 1 // Not greater than znear
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: zfar

  describe.todo('znear', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.cameras![0].perspective!.znear
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST be a `number` type', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.znear = 'NotANumber' as any // Not a number
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })

    it('MUST have a value > 0', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.znear = 0 // Not > 0
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: znear

  describe('extensions', () => {
    it.todo('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      delete options.document.cameras![0].perspective!.extensions
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })

    it.todo('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      options.document.cameras![0].perspective!.extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe.todo('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalCameraPerspective())
      delete options.document.cameras![0].perspective!.extras
      expect(GLTFLoaderFunctions.loadCamera(options, testEntity, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: CameraPerspective

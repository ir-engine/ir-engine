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
 * Unit Test suite for loading the `glTF.animations` root property and all its children.
 * Based on glTF 2.0 specification requirements.
 * */
import { overrideFileLoaderLoad } from '@ir-engine/spatial/tests/util/overrideAssetLoaders'
import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { startEngineReactor } from '../../../tests/startEngineReactor'

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { AnimationClip, InterpolateLinear } from 'three'
import { mockGLTF, mockGLTFOptions } from '../../../tests/util/mockGLTF'
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

/**
 * @todo
 * Cannot possibly tested in our current GLTFLoader implementation
 * It requires a GLTFLoader gltf root properties validation function that does not exist.
 * */
describe('glTF.animations Property', () => {
  it.todo('MAY be undefined', () => {})
  it.todo('MUST be an array of `animation`s when defined', () => {})
  it.todo('MUST have a length in range [1..] when defined', () => {})
}) //:: glTF.animations

/**
 * @todo
 * Should be accessing the loader from the root GLTFLoader function (currently does not exist)
 * */
describe('glTF: Animation Type', () => {
  /**
   * @description Creates the most minimal gltf with one animation possible, as required by spec
   * */
  function mockGLTFMinimalAnimation() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0'
      },
      {
        name: 'node1'
      }
    ]
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
      },
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
      }
    ]
    result.animations = [
      {
        channels: [
          {
            sampler: 0,
            target: {
              node: 0,
              path: 'translation'
            }
          }, //:: animation.channels.sampler 0
          {
            sampler: 1,
            target: {
              node: 1,
              path: 'rotation'
            }
          } //:: animation.channels.sampler 1
        ], //:: animation.channels
        samplers: [
          {
            input: 0,
            output: 1
          },
          {
            input: 0,
            output: 1
          }
        ]
      }
    ]
    return result
  }

  describe('channels', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].channels
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channels */
    it.fails('MUST be an array of `animation.channel` types', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].channels = 42 as any // Not an array of `animation.channel` types
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channels */
    it.fails('MUST have a length in range [1..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].channels = [] // Not in range [1..]
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channels */
    it.fails('MUST ensure that different channels of the same animation do NOT have the same targets.', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].channels[1].target.node = 0 // Same target as channel 0
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: channels

  describe('samplers', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].samplers
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST be an array of `animation.sampler` types', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].samplers = 42 as any // Not an array of `animation.sampler` types
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST have a length in range [1..]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].samplers = [] // Not in range [1..]
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: samplers

  describe('name', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      delete options.document.animations![0].name
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.name */
    it.fails('MUST be a `string` type when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].name = 42 as any // Not a string
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: name

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      delete options.document.animations![0].extensions
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      options.document.animations![0].extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimation())
      delete options.document.animations![0].extras
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: Animation

describe('glTF: AnimationChannel Type', () => {
  /**
   * @description Creates the most minimal gltf with one animation possible, as required by spec
   * */
  function mockGLTFMinimalAnimationChannel() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0'
      },
      {
        name: 'node1'
      }
    ]
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
      },
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
      }
    ]
    result.animations = [
      {
        channels: [
          {
            sampler: 0,
            target: {
              node: 0,
              path: 'translation'
            }
          }, //:: animation.channels.sampler 0
          {
            sampler: 1,
            target: {
              node: 1,
              path: 'rotation'
            }
          } //:: animation.channels.sampler 1
        ], //:: animation.channels
        samplers: [
          {
            input: 0,
            output: 1
          },
          {
            input: 0,
            output: 1
          }
        ]
      }
    ]
    return result
  }

  describe('sampler', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].channels[0].sampler
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it("MUST be an `integer` index into the animation's `samplers` array", () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      options.document.animations![0].channels[0].sampler = 42 as any // Not an integer
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0..animation.samplers.length - 1]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      options.document.animations![0].channels[0].sampler = 42 as any // Not in range [0..animation.samplers.length - 1]
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: sampler

  describe('target', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].channels[0].target
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channel.target */
    it.fails('MUST be an `animation.channel.target` type object', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      options.document.animations![0].channels[0].target = 42 as any // Not an animation.channel.target type object
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: target

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      delete options.document.animations![0].channels[0].extensions
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channel.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      options.document.animations![0].channels[0].extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannel())
      delete options.document.animations![0].channels[0].extras
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: AnimationChannel

describe('glTF: AnimationChannelTarget Type', () => {
  /**
   * @description Creates the most minimal gltf with one animation possible, as required by spec
   * */
  function mockGLTFMinimalAnimationChannelTarget() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0'
      },
      {
        name: 'node1'
      }
    ]
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
      },
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR'
      }
    ]
    result.animations = [
      {
        channels: [
          {
            sampler: 0,
            target: {
              node: 0,
              path: 'translation'
            }
          }, //:: animation.channels.sampler 0
          {
            sampler: 1,
            target: {
              node: 1,
              path: 'rotation'
            }
          } //:: animation.channels.sampler 1
        ], //:: animation.channels
        samplers: [
          {
            input: 0,
            output: 1
          },
          {
            input: 0,
            output: 1
          }
        ]
      }
    ]
    return result
  }

  describe('node', () => {
    // Note: Optional if an extension like KHR_animation_pointer is used
    it.todo('MAY be undefined (if using specific extensions)', () => {})

    it('MUST be an `integer` index into the root `nodes` array when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      options.document.animations![0].channels[0].target.node = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0..glTF.nodes.length - 1] when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      options.document.animations![0].channels[0].target.node = 42 as any // Not in range [0..glTF.nodes.length - 1]
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: node

  describe('path', () => {
    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channel.target.path */
    it.fails('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].channels[0].target.path
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channel.target.path */
    it.fails('MUST be a `string`', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      options.document.animations![0].channels[0].target.path = 42 as any // Not a string
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channel.target.path */
    it.fails('MUST be one of the allowed values: "translation" | "rotation" | "scale" | "weights"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      options.document.animations![0].channels[0].target.path = 'SomeIncorrectValue' as any // Not an allowed value
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    // Note: Extensions like KHR_animation_pointer allow "pointer"
    it.todo('MAY allow "pointer" if KHR_animation_pointer extension is used', () => {})

    /** @todo Are these requirements or recommendations? How do we test them if they are requirements? */
    it.todo(
      'MUST ensure that the sampler values are a translation along the (X,Y,Z) axes when its value is "translation".',
      () => {}
    )
    it.todo(
      'MUST ensure that the sampler values are the values of a quaternion in the order (x,y,z,w), where w is the scalar when its value is "rotation" property',
      () => {}
    )
    it.todo(
      'MUST ensure that the sampler values are the scaling factors along the (X,Y,Z) axes when its value is "scale".',
      () => {}
    )
  }) //:: path

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      delete options.document.animations![0].channels[0].target.extensions
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.channel.target.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      options.document.animations![0].channels[0].target.extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    // Example: KHR_animation_pointer specific properties
    it.todo('MUST contain valid extension properties if defined (e.g., KHR_animation_pointer.pointer)', () => {})
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationChannelTarget())
      delete options.document.animations![0].channels[0].target.extras
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: AnimationChannelTarget

describe('glTF: AnimationSampler Type', () => {
  /**
   * @description Creates the most minimal gltf with one animation possible, as required by spec
   * */
  function mockGLTFMinimalAnimationSampler() {
    const result = mockGLTF()
    result.nodes = [
      {
        name: 'node0'
      },
      {
        name: 'node1'
      }
    ]
    result.accessors = [
      {
        componentType: 5126, // FLOAT
        count: 4,
        type: 'SCALAR',
        bufferView: 0
      },
      {
        componentType: 5126, // FLOAT
        count: 1,
        type: 'SCALAR',
        bufferView: 1
      }
    ]
    result.bufferViews = [
      {
        buffer: 0,
        byteLength: 16, // 4 floats * 4 bytes each
        byteOffset: 0
      },
      {
        buffer: 0,
        byteLength: 4,
        byteOffset: 16
      }
    ]
    result.buffers = [
      {
        byteLength: 20
        // uri: 'data:application/octet-stream;base64,AAAAAAAAgD8AAAAAAIA/AAAAAAAA' // base64 encoded data
      }
    ]
    result.animations = [
      {
        channels: [
          {
            sampler: 0,
            target: {
              node: 0,
              path: 'translation'
            }
          }, //:: animation.channels.sampler 0
          {
            sampler: 1,
            target: {
              node: 1,
              path: 'rotation'
            }
          } //:: animation.channels.sampler 1
        ], //:: animation.channels
        samplers: [
          {
            input: 0,
            output: 1
          },
          {
            input: 0,
            output: 1
          }
        ]
      }
    ]
    return result
  }

  describe('input', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].samplers[0].input
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST be an integer when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].input = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0..glTF.accessors.length - 1]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].input = 42 as any // Not in range [0..glTF.accessors.length - 1]
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST be an index into the root `accessors` array', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].input = 42 // Not an index into the root `accessors` array
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.input */
    it.fails('MUST reference an accessor containing FLOAT scalars', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.accessors![0].type = 'VEC3' // Not a FLOAT scalar
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo How to setup the buffer data? Loading from the URI fails ? */
    it.todo('MUST reference an accessor with strictly increasing values  _(ie. time[n + 1] > time[n])_', async () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      const accessor = options.document.accessors![0]
      const bufferView = options.document.bufferViews![accessor.bufferView!]
      // const buffer = options.document.buffers![bufferView.buffer]
      const data = await GLTFLoaderFunctions.loadBuffer(options, bufferView.buffer)
      console.log(data)
      const values = []
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: input

  describe('interpolation', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      delete options.document.animations![0].samplers[0].interpolation
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.interpolation */
    it.fails('MUST be one of the `string` allowed values: "LINEAR" | "STEP" | "CUBICSPLINE"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].interpolation = 'SomeIncorrectValue' as any // Not an allowed value
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.interpolation */
    it.fails('SHOULD assign a default value of "LINEAR"', () => {
      const Expected = InterpolateLinear
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      expect(options.document.animations![0].samplers[0].interpolation).toBeUndefined()
      let animation = {} as AnimationClip
      expect(async () => (animation = await GLTFLoaderFunctions.loadAnimation(options, 0))).not.toThrowError()
      expect(animation.tracks).toBeDefined()
      expect(animation.tracks.length).not.toBe(0)
      expect(animation.tracks[0].getInterpolation()).toBe(Expected)
    })

    // LINEAR
    it.todo('SHOULD use slerp to interpolate quaternions when "LINEAR"', () => {})

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.interpolation */
    it.fails('MUST have the same number of input and output elements when "LINEAR"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].interpolation = 'LINEAR'
      const inputID = options.document.animations![0].samplers[0].input
      const outputID = options.document.animations![0].samplers[0].output
      expect(options.document.accessors![inputID].count).not.toBe(options.document.accessors![outputID].count)
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    // STEP
    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.interpolation */
    it.fails('MUST have the same number of input and output elements when "STEP"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].interpolation = 'STEP'
      const inputID = options.document.animations![0].samplers[0].input
      const outputID = options.document.animations![0].samplers[0].output
      expect(options.document.accessors![inputID].count).not.toBe(options.document.accessors![outputID].count)
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    // CUBICSPLINE
    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.interpolation */
    it.fails(
      'MUST store three elements for each input in the output (in-tangent, spline vertex, out-tangent) when "CUBICSPLINE"',
      () => {
        const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
        options.document.animations![0].samplers[0].interpolation = 'CUBICSPLINE'
        const inputID = options.document.animations![0].samplers[0].input
        const outputID = options.document.animations![0].samplers[0].output
        expect(options.document.accessors![inputID].count * 3).not.toBe(options.document.accessors![outputID].count)
        expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
      }
    )

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.interpolation */
    it.fails('MUST check that there are at least two keyframes when "CUBICSPLINE"', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].interpolation = 'CUBICSPLINE'
      const samplerID = options.document.animations![0].samplers[0].input
      options.document.accessors![samplerID].count = 1 // Less than two keyframes
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    // Note: Specific interpolations might be required for certain types via extensions
    // it.todo('MUST use "STEP" interpolation if animating integer or boolean types via extensions', () => {})
  }) //:: interpolation

  describe('output', () => {
    it('MUST be defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      // @ts-expect-error Delete, even if mandatory, to provoke the error
      delete options.document.animations![0].samplers[0].output
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST be an `integer` index into the root `accessors` array', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].output = 1.42 // Not an integer
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })

    it('MUST have a value in range [0 .. glTF.accessors.length-1]', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].output = 42 as any // Not in range [0 .. glTF.accessors.length-1]
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: output

  describe('extensions', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      delete options.document.animations![0].samplers[0].extensions
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })

    /** @todo Should throw. Our implementation does not respect the specification for glTF.animation.sampler.extensions */
    it.fails('MUST be a JSON object when defined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      options.document.animations![0].samplers[0].extensions = 42 as any // Not a JSON object
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).rejects.toThrowError()
    })
  }) //:: extensions

  describe('extras', () => {
    it('MAY be undefined', () => {
      const options = mockGLTFOptions(mockGLTFMinimalAnimationSampler())
      delete options.document.animations![0].samplers[0].extras
      expect(GLTFLoaderFunctions.loadAnimation(options, 0)).resolves.not.toThrow()
    })
  }) //:: extras
}) //:: glTF: AnimationSampler

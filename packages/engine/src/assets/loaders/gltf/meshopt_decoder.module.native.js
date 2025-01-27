// This file is part of meshoptimizer library and is distributed under the terms of MIT License.
// Copyright (C) 2016-2022, by Arseny Kapoulkine (arseny.kapoulkine@gmail.com)

import { WebAssembly } from '@callstack/polygen'
import MeshoptDecoderWasm from './meshopt_decoder.wasm'

var MeshoptDecoder = (function () {
  'use strict'

  if (typeof WebAssembly !== 'object') {
    return {
      supported: false
    }
  }

  var instance

  var ready = WebAssembly.instantiate(new WebAssembly.Module(MeshoptDecoderWasm), {}).then(function (resultInstance) {
    instance = resultInstance
    instance.exports.__wasm_call_ctors()
    console.warn('MeshOptimizer Decoder Ready', instance.exports)
  })

  function decode(mode, target, count, size, source, filter) {
    // var sbrk = instance.exports.sbrk
    var count4 = (count + 3) & ~3
    var tp = instance.exports.sbrk(count4 * size)
    var sp = instance.exports.sbrk(source.length)
    var heap = new Uint8Array(instance.exports.memory.buffer)
    heap.set(source, sp)
    var res = instance.exports[mode](tp, count, size, sp, source.length)
    if (res == 0 && filter) {
      instance.exports[filter](tp, count4, size)
    }
    target.set(heap.subarray(tp, tp + count * size))
    instance.exports.sbrk(tp - instance.exports.sbrk(0))
    if (res != 0) {
      throw new Error('Malformed buffer data: ' + res)
    }
  }

  var filters = {
    NONE: '',
    OCTAHEDRAL: 'meshopt_decodeFilterOct',
    QUATERNION: 'meshopt_decodeFilterQuat',
    EXPONENTIAL: 'meshopt_decodeFilterExp'
  }

  var decoders = {
    ATTRIBUTES: 'meshopt_decodeVertexBuffer',
    TRIANGLES: 'meshopt_decodeIndexBuffer',
    INDICES: 'meshopt_decodeIndexSequence'
  }

  return {
    ready: ready,
    supported: true,
    useWorkers: function (count) {
      console.warn('Meshopt workers not supported in React Native, using synchronous methods instead')
    },
    decodeVertexBuffer: function (target, count, size, source, filter) {
      decode(decoders.ATTRIBUTES, target, count, size, source, filters[filter])
    },
    decodeIndexBuffer: function (target, count, size, source) {
      decode(decoders.TRIANGLES, target, count, size, source)
    },
    decodeIndexSequence: function (target, count, size, source) {
      decode(decoders.INDICES, target, count, size, source)
    },
    decodeGltfBuffer: function (target, count, size, source, mode, filter) {
      decode(decoders[mode], target, count, size, source, filters[filter])
    }
  }
})()

export { MeshoptDecoder }

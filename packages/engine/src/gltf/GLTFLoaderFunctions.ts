import { GLTF } from '@gltf-transform/core'
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  InterleavedBuffer,
  InterleavedBufferAttribute,
  LoaderUtils,
  Sphere,
  Vector3
} from 'three'
import { FileLoader } from '../assets/loaders/base/FileLoader'
import { WEBGL_COMPONENT_TYPES, WEBGL_TYPE_SIZES } from '../assets/loaders/gltf/GLTFConstants'
import { getNormalizedComponentScale } from '../assets/loaders/gltf/GLTFLoaderFunctions'
import { GLTFParserOptions, GLTFRegistry } from '../assets/loaders/gltf/GLTFParser'

// todo make this a state
const cache = new GLTFRegistry()

const loadAccessor = (options: GLTFParserOptions, json: GLTF.IGLTF, accessorIndex: number) => {
  const accessorDef = json.accessors![accessorIndex]

  if (accessorDef.bufferView === undefined && accessorDef.sparse === undefined) {
    const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
    const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]
    const normalized = accessorDef.normalized === true

    const array = new TypedArray(accessorDef.count * itemSize)
    return Promise.resolve(new BufferAttribute(array, itemSize, normalized))
  }

  const pendingBufferViews = [] as Array<Promise<ArrayBuffer> | null> // todo

  if (accessorDef.bufferView !== undefined) {
    pendingBufferViews.push(GLTFLoaderFunctions.loadBufferView(options, json, accessorDef.bufferView))
  } else {
    pendingBufferViews.push(null)
  }

  if (accessorDef.sparse !== undefined) {
    pendingBufferViews.push(GLTFLoaderFunctions.loadBufferView(options, json, accessorDef.sparse.indices.bufferView))
    pendingBufferViews.push(GLTFLoaderFunctions.loadBufferView(options, json, accessorDef.sparse.values.bufferView))
  }

  return Promise.all(pendingBufferViews).then(function (bufferViews) {
    const bufferView = bufferViews[0]

    const itemSize = WEBGL_TYPE_SIZES[accessorDef.type]
    const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType]

    // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
    const elementBytes = TypedArray.BYTES_PER_ELEMENT
    const itemBytes = elementBytes * itemSize
    const byteOffset = accessorDef.byteOffset || 0
    const byteStride =
      accessorDef.bufferView !== undefined ? json.bufferViews![accessorDef.bufferView].byteStride : undefined
    const normalized = accessorDef.normalized === true
    let array, bufferAttribute

    // The buffer is not interleaved if the stride is the item size in bytes.
    if (byteStride && byteStride !== itemBytes) {
      // Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
      // This makes sure that IBA.count reflects accessor.count properly
      const ibSlice = Math.floor(byteOffset / byteStride)
      const ibCacheKey =
        'InterleavedBuffer:' +
        accessorDef.bufferView +
        ':' +
        accessorDef.componentType +
        ':' +
        ibSlice +
        ':' +
        accessorDef.count
      let ib = cache.get(ibCacheKey)

      if (!ib) {
        array = new TypedArray(bufferView!, ibSlice * byteStride, (accessorDef.count * byteStride) / elementBytes)

        // Integer parameters to IB/IBA are in array elements, not bytes.
        ib = new InterleavedBuffer(array, byteStride / elementBytes)

        cache.add(ibCacheKey, ib)
      }

      bufferAttribute = new InterleavedBufferAttribute(
        ib,
        itemSize,
        (byteOffset % byteStride) / elementBytes,
        normalized
      )
    } else {
      if (bufferView === null) {
        array = new TypedArray(accessorDef.count * itemSize)
      } else {
        array = new TypedArray(bufferView, byteOffset, accessorDef.count * itemSize)
      }

      bufferAttribute = new BufferAttribute(array, itemSize, normalized)
    }

    // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
    if (accessorDef.sparse !== undefined) {
      const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR
      const TypedArrayIndices = WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType]

      const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0
      const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0

      const sparseIndices = new TypedArrayIndices(
        bufferViews[1]!,
        byteOffsetIndices,
        accessorDef.sparse.count * itemSizeIndices
      )
      const sparseValues = new TypedArray(bufferViews[2]!, byteOffsetValues, accessorDef.sparse.count * itemSize)

      if (bufferView !== null) {
        // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
        bufferAttribute = new BufferAttribute(
          bufferAttribute.array.slice(),
          bufferAttribute.itemSize,
          bufferAttribute.normalized
        )
      }

      for (let i = 0, il = sparseIndices.length; i < il; i++) {
        const index = sparseIndices[i]

        bufferAttribute.setX(index, sparseValues[i * itemSize])
        if (itemSize >= 2) bufferAttribute.setY(index, sparseValues[i * itemSize + 1])
        if (itemSize >= 3) bufferAttribute.setZ(index, sparseValues[i * itemSize + 2])
        if (itemSize >= 4) bufferAttribute.setW(index, sparseValues[i * itemSize + 3])
        if (itemSize >= 5) throw new Error('THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.')
      }
    }

    return bufferAttribute
  })
}

const loadBufferView = async (options: GLTFParserOptions, json: GLTF.IGLTF, bufferViewIndex: number) => {
  const bufferViewDef = json.bufferViews![bufferViewIndex]

  const buffer = await GLTFLoaderFunctions.loadBuffer(options, json, bufferViewDef.buffer)

  const byteLength = bufferViewDef.byteLength || 0
  const byteOffset = bufferViewDef.byteOffset || 0

  return buffer.slice(byteOffset, byteOffset + byteLength)
}

const loadBuffer = async (options: GLTFParserOptions, json: GLTF.IGLTF, bufferIndex: number) => {
  const bufferDef = json.buffers![bufferIndex]

  /** @todo */
  // if (bufferDef.type && bufferDef.type !== 'arraybuffer') {
  //   throw new Error('THREE.GLTFLoader: ' + bufferDef.type + ' buffer type is not supported.')
  // }

  // If present, GLB container is required to be the first buffer.
  // if (bufferDef.uri === undefined && bufferIndex === 0) {
  //   return Promise.resolve(this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body)
  // }

  /** @todo use global file loader */
  const fileLoader = new FileLoader(options.manager)
  fileLoader.setResponseType('arraybuffer')
  if (options.crossOrigin === 'use-credentials') {
    fileLoader.setWithCredentials(true)
  }

  return new Promise<ArrayBuffer>(function (resolve, reject) {
    fileLoader.load(LoaderUtils.resolveURL(bufferDef.uri!, options.path), resolve as any, undefined, function () {
      reject(new Error('THREE.GLTFLoader: Failed to load buffer "' + bufferDef.uri + '".'))
    })
  })
}

export function computeBounds(json: GLTF.IGLTF, geometry: BufferGeometry, primitiveDef: GLTF.IMeshPrimitive) {
  const attributes = primitiveDef.attributes

  const box = new Box3()

  if (attributes.POSITION !== undefined) {
    const accessor = json.accessors![attributes.POSITION]

    const min = accessor.min
    const max = accessor.max

    // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

    if (min !== undefined && max !== undefined) {
      box.set(new Vector3(min[0], min[1], min[2]), new Vector3(max[0], max[1], max[2]))

      if (accessor.normalized) {
        const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType])
        box.min.multiplyScalar(boxScale)
        box.max.multiplyScalar(boxScale)
      }
    } else {
      console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.')

      return
    }
  } else {
    return
  }

  const targets = primitiveDef.targets

  if (targets !== undefined) {
    const maxDisplacement = new Vector3()
    const vector = new Vector3()

    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i]

      if (target.POSITION !== undefined) {
        const accessor = json.accessors![target.POSITION]
        const min = accessor.min
        const max = accessor.max

        // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

        if (min !== undefined && max !== undefined) {
          // we need to get max of absolute components because target weight is [-1,1]
          vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])))
          vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])))
          vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])))

          if (accessor.normalized) {
            const boxScale = getNormalizedComponentScale(WEBGL_COMPONENT_TYPES[accessor.componentType])
            vector.multiplyScalar(boxScale)
          }

          // Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
          // to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
          // are used to implement key-frame animations and as such only two are active at a time - this results in very large
          // boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
          maxDisplacement.max(vector)
        } else {
          console.warn('THREE.GLTFLoader: Missing min/max properties for accessor POSITION.')
        }
      }
    }

    // As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
    box.expandByVector(maxDisplacement)
  }

  geometry.boundingBox = box

  const sphere = new Sphere()

  box.getCenter(sphere.center)
  sphere.radius = box.min.distanceTo(box.max) / 2

  geometry.boundingSphere = sphere
}

export const GLTFLoaderFunctions = {
  loadAccessor,
  loadBufferView,
  loadBuffer,
  computeBounds
}

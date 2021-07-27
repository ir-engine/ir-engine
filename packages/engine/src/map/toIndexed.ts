import * as THREE from 'three'

// Author: Fyrestar https://mevedia.com (https://github.com/Fyrestar/THREE.BufferGeometry-toIndexed)

let list = [],
  vertices = {}

let _src, attributesKeys, morphKeys

let prec = 0,
  precHalf = 0,
  length = 0

function floor(array, offset) {
  if (array instanceof Float32Array) {
    return Math.floor(array[offset] * prec)

    // } else if ( array instanceof Float16Array ) {

    // 	return Math.floor( array[ offset ] * precHalf );
  } else {
    return array[offset]
  }
}

function createAttribute(src_attribute) {
  const dst_attribute = new THREE.BufferAttribute(
    new src_attribute.array.constructor(length * src_attribute.itemSize),
    src_attribute.itemSize
  )

  const dst_array = dst_attribute.array
  const src_array = src_attribute.array

  switch (src_attribute.itemSize) {
    case 1:
      for (let i = 0, l = list.length; i < l; i++) {
        dst_array[i] = src_array[list[i]]
      }

      break
    case 2:
      for (let i = 0, l = list.length; i < l; i++) {
        const index = list[i] * 2

        const offset = i * 2

        dst_array[offset] = src_array[index]
        dst_array[offset + 1] = src_array[index + 1]
      }

      break
    case 3:
      for (let i = 0, l = list.length; i < l; i++) {
        const index = list[i] * 3

        const offset = i * 3

        dst_array[offset] = src_array[index]
        dst_array[offset + 1] = src_array[index + 1]
        dst_array[offset + 2] = src_array[index + 2]
      }

      break
    case 4:
      for (let i = 0, l = list.length; i < l; i++) {
        const index = list[i] * 4

        const offset = i * 4

        dst_array[offset] = src_array[index]
        dst_array[offset + 1] = src_array[index + 1]
        dst_array[offset + 2] = src_array[index + 2]
        dst_array[offset + 3] = src_array[index + 3]
      }

      break
  }

  return dst_attribute
}

function hashAttribute(attribute, offset) {
  const array = attribute.array

  switch (attribute.itemSize) {
    case 1:
      return floor(array, offset)

    case 2:
      return floor(array, offset) + '_' + floor(array, offset + 1)

    case 3:
      return floor(array, offset) + '_' + floor(array, offset + 1) + '_' + floor(array, offset + 2)

    case 4:
      return (
        floor(array, offset) +
        '_' +
        floor(array, offset + 1) +
        '_' +
        floor(array, offset + 2) +
        '_' +
        floor(array, offset + 3)
      )
  }
}

function store(index, n) {
  let id = ''

  for (let i = 0, l = attributesKeys.length; i < l; i++) {
    const key = attributesKeys[i]
    const attribute = _src.attributes[key]

    const offset = attribute.itemSize * index * 3 + n * attribute.itemSize

    id += hashAttribute(attribute, offset) + '_'
  }

  for (let i = 0, l = morphKeys.length; i < l; i++) {
    const key = morphKeys[i]
    const attribute = _src.morphAttributes[key]

    const offset = attribute.itemSize * index * 3 + n * attribute.itemSize

    id += hashAttribute(attribute, offset) + '_'
  }

  if (vertices[id] === undefined) {
    vertices[id] = list.length

    list.push(index * 3 + n)
  }

  return vertices[id]
}

function storeFast(x, y, z, v) {
  const id = Math.floor(x * prec) + '_' + Math.floor(y * prec) + '_' + Math.floor(z * prec)

  if (vertices[id] === undefined) {
    vertices[id] = list.length

    list.push(v)
  }

  return vertices[id]
}

function indexBufferGeometry(src, dst, fullIndex) {
  _src = src

  attributesKeys = Object.keys(src.attributes)
  morphKeys = Object.keys(src.morphAttributes)

  const position = src.attributes.position.array
  const faceCount = position.length / 3 / 3

  const typedArray = faceCount * 3 > 65536 ? Uint32Array : Uint16Array
  const indexArray = new typedArray(faceCount * 3)

  // Full index only connects vertices where all attributes are equal

  if (fullIndex) {
    for (let i = 0, l = faceCount; i < l; i++) {
      indexArray[i * 3] = store(i, 0)
      indexArray[i * 3 + 1] = store(i, 1)
      indexArray[i * 3 + 2] = store(i, 2)
    }
  } else {
    for (let i = 0, l = faceCount; i < l; i++) {
      const offset = i * 9

      indexArray[i * 3] = storeFast(position[offset], position[offset + 1], position[offset + 2], i * 3)
      indexArray[i * 3 + 1] = storeFast(position[offset + 3], position[offset + 4], position[offset + 5], i * 3 + 1)
      indexArray[i * 3 + 2] = storeFast(position[offset + 6], position[offset + 7], position[offset + 8], i * 3 + 2)
    }
  }

  // Index

  dst.index = new THREE.BufferAttribute(indexArray, 1)

  length = list.length

  // Attributes

  for (let i = 0, l = attributesKeys.length; i < l; i++) {
    const key = attributesKeys[i]

    dst.attributes[key] = createAttribute(src.attributes[key])
  }

  // Morph Attributes

  for (let i = 0, l = morphKeys.length; i < l; i++) {
    const key = morphKeys[i]

    dst.morphAttributes[key] = createAttribute(src.morphAttributes[key])
  }

  if (src.boundingSphere) {
    dst.boundingSphere = src.boundingSphere.clone()
  } else {
    dst.boundingSphere = new THREE.Sphere()
    dst.computeBoundingSphere()
  }

  if (src.boundingBox) {
    dst.boundingBox = src.boundingBox.clone()
  } else {
    dst.boundingBox = new THREE.Box3()
    dst.computeBoundingBox()
  }

  // Groups

  const groups = src.groups

  for (let i = 0, l = groups.length; i < l; i++) {
    const group = groups[i]

    dst.addGroup(group.start, group.count, group.materialIndex)
  }

  // Release data

  vertices = {}
  list = []

  _src = null
  attributesKeys = []
  morphKeys = []
}

export function toIndexed(src: THREE.BufferGeometry, fullIndex = false, precision = 6) {
  prec = Math.pow(10, precision)
  precHalf = Math.pow(10, Math.floor(precision / 2))

  const dst = new THREE.BufferGeometry()

  indexBufferGeometry(src, dst, fullIndex)

  return dst
}

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { AttributeGPUType, BufferAttribute, BufferGeometry, Mesh, Object3D } from 'three'

import iterateObject3D from '@ir-engine/spatial/src/common/functions/iterateObject3D'

export default function getFirstMesh(obj3d: Object3D): Mesh | null {
  const meshes = iterateObject3D(
    obj3d,
    (child) => child,
    (child: Mesh) => child?.isMesh,
    false,
    true
  )
  return meshes.length > 0 ? meshes[0] : null
}

export function getMeshes(obj3d: Object3D): Mesh[] {
  return iterateObject3D(
    obj3d,
    (child) => child,
    (child: Mesh) => child?.isMesh,
    false,
    false
  )
}

/** Merge geometries, (copied from three/examples/jsm/utils/BufferGeometryUtils.js to avoid importing examples file)
 * @param  {Array<BufferGeometry>} geometries
 * @param  {Boolean} useGroups
 * @return {BufferGeometry}
 */
export function mergeGeometries(geometries, useGroups = false) {
  const isIndexed = geometries[0].index !== null

  const attributesUsed = new Set(Object.keys(geometries[0].attributes))
  const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes))

  const attributes = {}
  const morphAttributes = {}

  const morphTargetsRelative = geometries[0].morphTargetsRelative

  const mergedGeometry = new BufferGeometry()

  let offset = 0

  for (let i = 0; i < geometries.length; ++i) {
    const geometry = geometries[i]
    let attributesCount = 0

    // ensure that all geometries are indexed, or none
    if (isIndexed !== (geometry.index !== null)) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
          i +
          '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.'
      )
      return null
    }

    // gather attributes, exit early if they're different
    for (const name in geometry.attributes) {
      if (!attributesUsed.has(name)) {
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
            i +
            '. All geometries must have compatible attributes; make sure "' +
            name +
            '" attribute exists among all geometries, or in none of them.'
        )
        return null
      }

      if (attributes[name] === undefined) attributes[name] = []

      attributes[name].push(geometry.attributes[name])
      attributesCount++
    }

    // ensure geometries have the same number of attributes
    if (attributesCount !== attributesUsed.size) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
          i +
          '. Make sure all geometries have the same number of attributes.'
      )
      return null
    }

    // gather morph attributes, exit early if they're different
    if (morphTargetsRelative !== geometry.morphTargetsRelative) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
          i +
          '. .morphTargetsRelative must be consistent throughout all geometries.'
      )
      return null
    }

    for (const name in geometry.morphAttributes) {
      if (!morphAttributesUsed.has(name)) {
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
            i +
            '.  .morphAttributes must be consistent throughout all geometries.'
        )
        return null
      }

      if (morphAttributes[name] === undefined) morphAttributes[name] = []

      morphAttributes[name].push(geometry.morphAttributes[name])
    }

    if (useGroups) {
      let count

      if (isIndexed) {
        count = geometry.index.count
      } else if (geometry.attributes.position !== undefined) {
        count = geometry.attributes.position.count
      } else {
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index ' +
            i +
            '. The geometry must have either an index or a position attribute'
        )
        return null
      }
      mergedGeometry.addGroup(offset, count, i)
      offset += count
    }
  }

  // merge indices

  if (isIndexed) {
    let indexOffset = 0
    const mergedIndex = [] as number[]

    for (let i = 0; i < geometries.length; ++i) {
      const index = geometries[i].index

      for (let j = 0; j < index.count; ++j) {
        mergedIndex.push(index.getX(j) + indexOffset)
      }
      indexOffset += geometries[i].attributes.position.count
    }
    mergedGeometry.setIndex(mergedIndex)
  }

  // merge attributes

  for (const name in attributes) {
    const mergedAttribute = mergeAttributes(attributes[name])

    if (!mergedAttribute) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the ' + name + ' attribute.'
      )
      return null
    }
    mergedGeometry.setAttribute(name, mergedAttribute)
  }

  // merge morph attributes

  for (const name in morphAttributes) {
    const numMorphTargets = morphAttributes[name][0].length

    if (numMorphTargets === 0) break

    mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {}
    mergedGeometry.morphAttributes[name] = []

    for (let i = 0; i < numMorphTargets; ++i) {
      const morphAttributesToMerge = [] as BufferAttribute[]

      for (let j = 0; j < morphAttributes[name].length; ++j) {
        morphAttributesToMerge.push(morphAttributes[name][j][i])
      }

      const mergedMorphAttribute = mergeAttributes(morphAttributesToMerge)

      if (!mergedMorphAttribute) {
        console.error(
          'THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the ' + name + ' morphAttribute.'
        )
        return null
      }
      mergedGeometry.morphAttributes[name].push(mergedMorphAttribute)
    }
  }
  return mergedGeometry
}

/**
 * @param {Array<BufferAttribute>} attributes
 * @return {BufferAttribute}
 */
function mergeAttributes(attributes) {
  let TypedArray
  let itemSize
  let normalized
  let gpuType = -1
  let arrayLength = 0

  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i]

    if (TypedArray === undefined) TypedArray = attribute.array.constructor

    if (TypedArray !== attribute.array.constructor) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.'
      )
      return null
    }

    if (itemSize === undefined) itemSize = attribute.itemSize

    if (itemSize !== attribute.itemSize) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.'
      )
      return null
    }

    if (normalized === undefined) normalized = attribute.normalized

    if (normalized !== attribute.normalized) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.'
      )
      return null
    }

    if (gpuType === -1) gpuType = attribute.gpuType

    if (gpuType !== attribute.gpuType) {
      console.error(
        'THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.'
      )
      return null
    }
    arrayLength += attribute.count * itemSize
  }

  const array = new TypedArray(arrayLength)
  const result = new BufferAttribute(array, itemSize, normalized)
  let offset = 0

  for (let i = 0; i < attributes.length; ++i) {
    const attribute = attributes[i]

    if (attribute.isInterleavedBufferAttribute) {
      const tupleOffset = offset / itemSize

      for (let j = 0, l = attribute.count; j < l; j++) {
        for (let c = 0; c < itemSize; c++) {
          const value = attribute.getComponent(j, c)
          result.setComponent(j + tupleOffset, c, value)
        }
      }
    } else {
      array.set(attribute.array, offset)
    }
    offset += attribute.count * itemSize
  }

  if (gpuType !== undefined) {
    result.gpuType = gpuType as AttributeGPUType
  }
  return result
}

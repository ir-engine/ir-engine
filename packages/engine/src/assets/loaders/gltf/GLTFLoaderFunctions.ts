/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  Box3,
  ColorManagement,
  FrontSide,
  Interpolant,
  LinearSRGBColorSpace,
  MeshStandardMaterial,
  Quaternion,
  Sphere,
  TriangleFanDrawMode,
  TrianglesDrawMode,
  TriangleStripDrawMode,
  Vector3
} from 'three'

import { ATTRIBUTES, WEBGL_COMPONENT_TYPES } from './GLTFConstants'
import { EXTENSIONS } from './GLTFExtensions'

/**
 * @param {BufferGeometry} geometry
 * @param {number} drawMode
 * @return {BufferGeometry}
 */
export function toTrianglesDrawMode(geometry, drawMode) {
  if (drawMode === TrianglesDrawMode) {
    console.warn('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.')
    return geometry
  }

  if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
    let index = geometry.getIndex()

    // generate index if not present

    if (index === null) {
      const indices = [] as number[]

      const position = geometry.getAttribute('position')

      if (position !== undefined) {
        for (let i = 0; i < position.count; i++) {
          indices.push(i)
        }

        geometry.setIndex(indices)
        index = geometry.getIndex()
      } else {
        console.error(
          'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.'
        )
        return geometry
      }
    }

    //

    const numberOfTriangles = index.count - 2
    const newIndices = [] as number[]

    if (drawMode === TriangleFanDrawMode) {
      // gl.TRIANGLE_FAN

      for (let i = 1; i <= numberOfTriangles; i++) {
        newIndices.push(index.getX(0))
        newIndices.push(index.getX(i))
        newIndices.push(index.getX(i + 1))
      }
    } else {
      // gl.TRIANGLE_STRIP

      for (let i = 0; i < numberOfTriangles; i++) {
        if (i % 2 === 0) {
          newIndices.push(index.getX(i))
          newIndices.push(index.getX(i + 1))
          newIndices.push(index.getX(i + 2))
        } else {
          newIndices.push(index.getX(i + 2))
          newIndices.push(index.getX(i + 1))
          newIndices.push(index.getX(i))
        }
      }
    }

    if (newIndices.length / 3 !== numberOfTriangles) {
      console.error('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.')
    }

    // build final geometry

    const newGeometry = geometry.clone()
    newGeometry.setIndex(newIndices)
    newGeometry.clearGroups()

    return newGeometry
  } else {
    console.error('THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode)
    return geometry
  }
}

/**
 * @param {Object3D|Material|BufferGeometry} object
 * @param {GLTF.definition} gltfDef
 */
export function assignExtrasToUserData(object, gltfDef) {
  if (gltfDef.extras !== undefined) {
    if (typeof gltfDef.extras === 'object') {
      Object.assign(object.userData, gltfDef.extras)
    } else {
      console.warn('THREE.GLTFLoader: Ignoring primitive type .extras, ' + gltfDef.extras)
    }
  }
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
 *
 * @param {BufferGeometry} geometry
 * @param {Array<GLTF.Target>} targets
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
export function addMorphTargets(geometry, targets, parser) {
  let hasMorphPosition = false
  let hasMorphNormal = false
  let hasMorphColor = false

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (target.POSITION !== undefined) hasMorphPosition = true
    if (target.NORMAL !== undefined) hasMorphNormal = true
    if (target.COLOR_0 !== undefined) hasMorphColor = true

    if (hasMorphPosition && hasMorphNormal && hasMorphColor) break
  }

  if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor) return Promise.resolve(geometry)

  const pendingPositionAccessors = [] as Promise<unknown>[]
  const pendingNormalAccessors = [] as Promise<unknown>[]
  const pendingColorAccessors = [] as Promise<unknown>[]

  for (let i = 0, il = targets.length; i < il; i++) {
    const target = targets[i]

    if (hasMorphPosition) {
      const pendingAccessor =
        target.POSITION !== undefined ? parser.getDependency('accessor', target.POSITION) : geometry.attributes.position

      pendingPositionAccessors.push(pendingAccessor)
    }

    if (hasMorphNormal) {
      const pendingAccessor =
        target.NORMAL !== undefined ? parser.getDependency('accessor', target.NORMAL) : geometry.attributes.normal

      pendingNormalAccessors.push(pendingAccessor)
    }

    if (hasMorphColor) {
      const pendingAccessor =
        target.COLOR_0 !== undefined ? parser.getDependency('accessor', target.COLOR_0) : geometry.attributes.color

      pendingColorAccessors.push(pendingAccessor)
    }
  }

  return Promise.all([
    Promise.all(pendingPositionAccessors),
    Promise.all(pendingNormalAccessors),
    Promise.all(pendingColorAccessors)
  ]).then(function (accessors) {
    const morphPositions = accessors[0]
    const morphNormals = accessors[1]
    const morphColors = accessors[2]

    if (hasMorphPosition) geometry.morphAttributes.position = morphPositions
    if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals
    if (hasMorphColor) geometry.morphAttributes.color = morphColors
    geometry.morphTargetsRelative = true

    return geometry
  })
}

/**
 * @param {Mesh} mesh
 * @param {GLTF.Mesh} meshDef
 */
export function updateMorphTargets(mesh, meshDef) {
  mesh.updateMorphTargets()

  if (meshDef.weights !== undefined) {
    for (let i = 0, il = meshDef.weights.length; i < il; i++) {
      mesh.morphTargetInfluences[i] = meshDef.weights[i]
    }
  }

  // .extras has user-defined data, so check that .extras.targetNames is an array.
  if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
    const targetNames = meshDef.extras.targetNames

    if (mesh.morphTargetInfluences.length === targetNames.length) {
      mesh.morphTargetDictionary = {}

      for (let i = 0, il = targetNames.length; i < il; i++) {
        mesh.morphTargetDictionary[targetNames[i]] = i
      }
    } else {
      console.warn('THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.')
    }
  }
}

export function createPrimitiveKey(primitiveDef) {
  let geometryKey

  const dracoExtension = primitiveDef.extensions && primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]

  if (dracoExtension) {
    geometryKey =
      'draco:' +
      dracoExtension.bufferView +
      ':' +
      dracoExtension.indices +
      ':' +
      createAttributesKey(dracoExtension.attributes)
  } else {
    geometryKey = primitiveDef.indices + ':' + createAttributesKey(primitiveDef.attributes) + ':' + primitiveDef.mode
  }

  if (primitiveDef.targets !== undefined) {
    for (let i = 0, il = primitiveDef.targets.length; i < il; i++) {
      geometryKey += ':' + createAttributesKey(primitiveDef.targets[i])
    }
  }

  return geometryKey
}

export function createAttributesKey(attributes) {
  let attributesKey = ''

  const keys = Object.keys(attributes).sort()

  for (let i = 0, il = keys.length; i < il; i++) {
    attributesKey += keys[i] + ':' + attributes[keys[i]] + ';'
  }

  return attributesKey
}

export function getNormalizedComponentScale(constructor) {
  // Reference:
  // https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data

  switch (constructor) {
    case Int8Array:
      return 1 / 127

    case Uint8Array:
      return 1 / 255

    case Int16Array:
      return 1 / 32767

    case Uint16Array:
      return 1 / 65535

    default:
      throw new Error('THREE.GLTFLoader: Unsupported normalized accessor component type.')
  }
}

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 */
export function computeBounds(geometry, primitiveDef, parser) {
  const attributes = primitiveDef.attributes

  const box = new Box3()

  if (attributes.POSITION !== undefined) {
    const accessor = parser.json.accessors[attributes.POSITION]

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
        const accessor = parser.json.accessors[target.POSITION]
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

/**
 * @param {BufferGeometry} geometry
 * @param {GLTF.Primitive} primitiveDef
 * @param {GLTFParser} parser
 * @return {Promise<BufferGeometry>}
 */
export function addPrimitiveAttributes(geometry, primitiveDef, parser) {
  const attributes = primitiveDef.attributes

  const pending = [] as Promise<unknown>[]

  function assignAttributeAccessor(accessorIndex, attributeName) {
    return parser.getDependency('accessor', accessorIndex).then(function (accessor) {
      geometry.setAttribute(attributeName, accessor)
    })
  }

  for (const gltfAttributeName in attributes) {
    const threeAttributeName = ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase()

    // Skip attributes already provided by e.g. Draco extension.
    if (threeAttributeName in geometry.attributes) continue

    pending.push(assignAttributeAccessor(attributes[gltfAttributeName], threeAttributeName))
  }

  if (primitiveDef.indices !== undefined && !geometry.index) {
    const accessor = parser.getDependency('accessor', primitiveDef.indices).then(function (accessor) {
      geometry.setIndex(accessor)
    })

    pending.push(accessor)
  }

  if (ColorManagement.workingColorSpace !== LinearSRGBColorSpace && 'COLOR_0' in attributes) {
    console.warn(
      `THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ColorManagement.workingColorSpace}" not supported.`
    )
  }

  assignExtrasToUserData(geometry, primitiveDef)

  computeBounds(geometry, primitiveDef, parser)

  return Promise.all(pending).then(function () {
    return primitiveDef.targets !== undefined ? addMorphTargets(geometry, primitiveDef.targets, parser) : geometry
  })
}

/**
 * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
 */
export function createDefaultMaterial(cache) {
  if (cache['DefaultMaterial'] === undefined) {
    cache['DefaultMaterial'] = new MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      metalness: 1,
      roughness: 1,
      transparent: false,
      depthTest: true,
      side: FrontSide
    })
  }

  return cache['DefaultMaterial']
}

export function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
  // Add unknown glTF extensions to an object's userData.

  for (const name in objectDef.extensions) {
    if (knownExtensions[name] === undefined) {
      object.userData.gltfExtensions = object.userData.gltfExtensions || {}
      object.userData.gltfExtensions[name] = objectDef.extensions[name]
    }
  }
}

/*********************************/
/********** INTERPOLATION ********/
/*********************************/

// Spline Interpolation
// Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
export class GLTFCubicSplineInterpolant extends Interpolant {
  constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
    super(parameterPositions, sampleValues, sampleSize, resultBuffer)
  }

  copySampleValue_(index) {
    // Copies a sample value to the result buffer. See description of glTF
    // CUBICSPLINE values layout in interpolate_() function below.

    const result = this.resultBuffer,
      values = this.sampleValues,
      valueSize = this.valueSize,
      offset = index * valueSize * 3 + valueSize

    for (let i = 0; i !== valueSize; i++) {
      result[i] = values[offset + i]
    }

    return result
  }

  interpolate_(i1, t0, t, t1) {
    const result = this.resultBuffer
    const values = this.sampleValues
    const stride = this.valueSize

    const stride2 = stride * 2
    const stride3 = stride * 3

    const td = t1 - t0

    const p = (t - t0) / td
    const pp = p * p
    const ppp = pp * p

    const offset1 = i1 * stride3
    const offset0 = offset1 - stride3

    const s2 = -2 * ppp + 3 * pp
    const s3 = ppp - pp
    const s0 = 1 - s2
    const s1 = s3 - pp + p

    // Layout of keyframe output values for CUBICSPLINE animations:
    //   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
    for (let i = 0; i !== stride; i++) {
      const p0 = values[offset0 + i + stride] // splineVertex_k
      const m0 = values[offset0 + i + stride2] * td // outTangent_k * (t_k+1 - t_k)
      const p1 = values[offset1 + i + stride] // splineVertex_k+1
      const m1 = values[offset1 + i] * td // inTangent_k+1 * (t_k+1 - t_k)

      result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1
    }

    return result
  }
}

const _q = new Quaternion()

export class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
  interpolate_(i1, t0, t, t1) {
    const result = super.interpolate_(i1, t0, t, t1)

    _q.fromArray(result).normalize().toArray(result)

    return result
  }
}

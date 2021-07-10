import { mergeBufferGeometries } from '../../common/classes/BufferGeometryUtils'
import {
  Quaternion,
  Vector3,
  Euler,
  Matrix4,
  ConeBufferGeometry,
  Color,
  BufferAttribute,
  MeshPhongMaterial,
  Mesh,
  Object3D,
  Bone,
  Skeleton
} from 'three'

export const localVector = new Vector3()
export const localVector2 = new Vector3()
export const localQuaternion = new Quaternion()
export const localEuler = new Euler()
export const localMatrix = new Matrix4()

export const upRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 0.5)
export const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.5)
export const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI * 0.5)
export const defaultSitAnimation = 'chair'
export const defaultUseAnimation = 'combo'
export const useAnimationRate = 750

/**
 *
 * @author Avaer Kazmer
 * @param bone
 */
export const localizeMatrixWorld = (bone) => {
  bone.matrix.copy(bone.matrixWorld)
  if (bone.parent) {
    bone.matrix.premultiply(bone.parent.matrixWorld.clone().invert())
  }
  bone.matrix.decompose(bone.position, bone.quaternion, bone.scale)

  for (let i = 0; i < bone.children.length; i++) {
    localizeMatrixWorld(bone.children[i])
  }
}

/**
 *
 * @author Avaer Kazmer
 * @param bones
 * @param boneName
 * @returns
 */
export const findBoneDeep = (bones, boneName) => {
  for (let i = 0; i < bones.length; i++) {
    const bone = bones[i]
    if (bone.name === boneName) {
      return bone
    } else {
      const deepBone = findBoneDeep(bone.children, boneName)
      if (deepBone) {
        return deepBone
      }
    }
  }
  return null
}

/**
 *
 * @author Avaer Kazmer
 * @param src
 * @param dst
 */
export const copySkeleton = (src, dst) => {
  for (let i = 0; i < src.bones.length; i++) {
    const srcBone = src.bones[i]
    const dstBone = findBoneDeep(dst.bones, srcBone.name)
    dstBone.matrixWorld.copy(srcBone.matrixWorld)
  }

  const armature = dst.bones[0].parent
  localizeMatrixWorld(armature)

  dst.calculateInverses()
}

/**
 *
 * @author Avaer Kazmer
 */
export const cubeGeometry = new ConeBufferGeometry(0.05, 0.2, 3).applyMatrix4(
  new Matrix4().makeRotationFromQuaternion(
    new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, 1))
  )
)
export const cubeGeometryPositions = cubeGeometry.attributes.position.array
export const numCubeGeometryPositions = cubeGeometryPositions.length
export const srcCubeGeometries = {}
export const makeDebugMeshes = () => {
  const geometries = []
  const makeCubeMesh = (color, scale = 1) => {
    color = new Color(color)

    let srcGeometry = srcCubeGeometries[scale]
    if (!srcGeometry) {
      srcGeometry = cubeGeometry.clone().applyMatrix4(localMatrix.makeScale(scale, scale, scale))
      srcCubeGeometries[scale] = srcGeometry
    }
    const geometry = srcGeometry.clone()
    const colors = new Float32Array(cubeGeometry.attributes.position.array.length)
    for (let i = 0; i < colors.length; i += 3) {
      color.toArray(colors, i)
    }
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    const index = geometries.length
    geometries.push(geometry)
    return [index, srcGeometry]
  }
  const fingerScale = 0.25
  const attributes = {
    eyes: makeCubeMesh(0xff0000),
    head: makeCubeMesh(0xff8080),

    chest: makeCubeMesh(0xffff00),
    leftShoulder: makeCubeMesh(0x00ff00),
    rightShoulder: makeCubeMesh(0x008000),
    leftUpperArm: makeCubeMesh(0x00ffff),
    rightUpperArm: makeCubeMesh(0x008080),
    leftLowerArm: makeCubeMesh(0x0000ff),
    rightLowerArm: makeCubeMesh(0x000080),
    leftHand: makeCubeMesh(0xffffff),
    rightHand: makeCubeMesh(0x808080),

    leftThumb2: makeCubeMesh(0xff0000, fingerScale),
    leftThumb1: makeCubeMesh(0x00ff00, fingerScale),
    leftThumb0: makeCubeMesh(0x0000ff, fingerScale),
    leftIndexFinger3: makeCubeMesh(0xff0000, fingerScale),
    leftIndexFinger2: makeCubeMesh(0x00ff00, fingerScale),
    leftIndexFinger1: makeCubeMesh(0x0000ff, fingerScale),
    leftMiddleFinger3: makeCubeMesh(0xff0000, fingerScale),
    leftMiddleFinger2: makeCubeMesh(0x00ff00, fingerScale),
    leftMiddleFinger1: makeCubeMesh(0x0000ff, fingerScale),
    leftRingFinger3: makeCubeMesh(0xff0000, fingerScale),
    leftRingFinger2: makeCubeMesh(0x00ff00, fingerScale),
    leftRingFinger1: makeCubeMesh(0x0000ff, fingerScale),
    leftLittleFinger3: makeCubeMesh(0xff0000, fingerScale),
    leftLittleFinger2: makeCubeMesh(0x00ff00, fingerScale),
    leftLittleFinger1: makeCubeMesh(0x0000ff, fingerScale),
    rightThumb2: makeCubeMesh(0xff0000, fingerScale),
    rightThumb1: makeCubeMesh(0x00ff00, fingerScale),
    rightThumb0: makeCubeMesh(0x0000ff, fingerScale),
    rightIndexFinger3: makeCubeMesh(0xff0000, fingerScale),
    rightIndexFinger2: makeCubeMesh(0x00ff00, fingerScale),
    rightIndexFinger1: makeCubeMesh(0x0000ff, fingerScale),
    rightMiddleFinger3: makeCubeMesh(0xff0000, fingerScale),
    rightMiddleFinger2: makeCubeMesh(0x00ff00, fingerScale),
    rightMiddleFinger1: makeCubeMesh(0x0000ff, fingerScale),
    rightRingFinger3: makeCubeMesh(0xff0000, fingerScale),
    rightRingFinger2: makeCubeMesh(0x00ff00, fingerScale),
    rightRingFinger1: makeCubeMesh(0x0000ff, fingerScale),
    rightLittleFinger3: makeCubeMesh(0xff0000, fingerScale),
    rightLittleFinger2: makeCubeMesh(0x00ff00, fingerScale),
    rightLittleFinger1: makeCubeMesh(0x0000ff, fingerScale),

    hips: makeCubeMesh(0xff0000),
    leftUpperLeg: makeCubeMesh(0xffff00),
    rightUpperLeg: makeCubeMesh(0x808000),
    leftLowerLeg: makeCubeMesh(0x00ff00),
    rightLowerLeg: makeCubeMesh(0x008000),
    leftFoot: makeCubeMesh(0xffffff),
    rightFoot: makeCubeMesh(0x808080)
  }
  const geometry = mergeBufferGeometries(geometries)
  for (const k in attributes) {
    const [index, srcGeometry] = attributes[k]
    const attribute = new BufferAttribute(
      // @ts-ignore
      new Float32Array(
        geometry.attributes.position.array.buffer,
        geometry.attributes.position.array.byteOffset +
          index * numCubeGeometryPositions * Float32Array.BYTES_PER_ELEMENT,
        numCubeGeometryPositions
      ),
      3
    )
    // @ts-ignore
    attribute.srcGeometry = srcGeometry
    // @ts-ignore
    attribute.visible = true
    attributes[k] = attribute
  }
  const material = new MeshPhongMaterial({
    flatShading: true,
    vertexColors: true
  })
  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  // @ts-ignore
  mesh.attributes = attributes
  return mesh
}

/**
 *
 * @author Avaer Kazmer
 * @param skeleton
 * @returns
 */
export const getTailBones = (skeleton) => {
  const result = []
  const recurse = (bones) => {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i]
      if (bone.children.length === 0) {
        if (!result.includes(bone)) {
          result.push(bone)
        }
      } else {
        recurse(bone.children)
      }
    }
  }
  recurse(skeleton.bones)
  return result
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @param pred
 * @returns
 */
export const findClosestParentBone = (bone, pred) => {
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      return bone
    }
  }
  return null
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @param pred
 * @returns
 */
export const findFurthestParentBone = (bone, pred) => {
  let result = null
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      result = bone
    }
  }
  return result
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @param parentBone
 * @returns
 */
export const distanceToParentBone = (bone, parentBone) => {
  for (let i = 0; bone; bone = bone.parent, i++) {
    if (bone === parentBone) {
      return i
    }
  }
  return Infinity
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @param pred
 * @returns
 */
export const findClosestChildBone = (bone, pred) => {
  const recurse = (bone) => {
    if (pred(bone)) {
      return bone
    } else {
      for (let i = 0; i < bone.children.length; i++) {
        const result = recurse(bone.children[i])
        if (result) {
          return result
        }
      }
      return null
    }
  }
  return recurse(bone)
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @param distance
 * @returns
 */
export const traverseChild = (bone, distance) => {
  if (distance <= 0) {
    return bone
  } else {
    for (let i = 0; i < bone.children.length; i++) {
      const child = bone.children[i]
      const subchild = traverseChild(child, distance - 1)
      if (subchild !== null) {
        return subchild
      }
    }
    return null
  }
}

/**
 *
 * @author Avaer Kazmer
 * @param name
 * @param regex
 * @returns
 */
export const countCharacters = (name, regex) => {
  let result = 0
  for (let i = 0; i < name.length; i++) {
    if (regex.test(name[i])) {
      result++
    }
  }
  return result
}

/**
 *
 * @author Avaer Kazmer
 * @param skeleton
 * @returns
 */
export const findHips = (skeleton) => skeleton.bones.find((bone) => /hip|root|rootx|pelvis/i.test(bone.name))
export const findHead = (tailBones) => {
  const headBones = tailBones
    .map((tailBone) => {
      const headBone = findFurthestParentBone(tailBone, (bone) => /head/i.test(bone.name))
      if (headBone) {
        return headBone
      } else {
        return null
      }
    })
    .filter((bone) => bone)
  const headBone = headBones.length > 0 ? headBones[0] : null
  if (headBone) {
    return headBone
  } else {
    return null
  }
}

/**
 *
 * @author Avaer Kazmer
 * @param tailBones
 * @param left
 * @returns
 */
export const findEye = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const eyeBones = tailBones
    .map((tailBone) => {
      const eyeBone = findFurthestParentBone(
        tailBone,
        (bone) => /eye/i.test(bone.name) && regexp.test(bone.name.replace(/eye/gi, ''))
      )
      if (eyeBone) {
        return eyeBone
      } else {
        return null
      }
    })
    .filter((spec) => spec)
    .sort((a, b) => {
      const aName = a.name.replace(/shoulder/gi, '')
      const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i)
      const bName = b.name.replace(/shoulder/gi, '')
      const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i)
      if (!left) {
        return aLeftBalance - bLeftBalance
      } else {
        return bLeftBalance - aLeftBalance
      }
    })
  const eyeBone = eyeBones.length > 0 ? eyeBones[0] : null
  if (eyeBone) {
    return eyeBone
  } else {
    return null
  }
}

/**
 *
 * @author Avaer Kazmer
 * @param chest
 * @param hips
 * @returns
 */
export const findSpine = (chest, hips) => {
  for (let bone = chest; bone; bone = bone.parent) {
    if (bone.parent === hips) {
      return bone
    }
  }
  return null
}

/**
 *
 * @author Avaer Kazmer
 * @param tailBones
 * @param left
 * @returns
 */
export const findShoulder = (tailBones, left) => {
  // console.log("Finding shoulder")
  const regexp = left ? /l/i : /r/i
  const shoulderBones = tailBones
    .map((tailBone) => {
      const shoulderBone = findClosestParentBone(
        tailBone,
        (bone) => /shoulder|clavicle/i.test(bone.name) && regexp.test(bone.name.replace(/shoulder|clavicle/gi, ''))
      )
      if (shoulderBone) {
        const distance = distanceToParentBone(tailBone, shoulderBone)
        if (distance >= 3) {
          return {
            bone: shoulderBone,
            distance
          }
        } else {
          return null
        }
      } else {
        return null
      }
    })
    .filter((spec) => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.bone.name.replace(/shoulder|clavicle/gi, '')
        const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i)
        const bName = b.bone.name.replace(/shoulder|clavicle/gi, '')
        const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i)
        if (!left) {
          return aLeftBalance - bLeftBalance
        } else {
          return bLeftBalance - aLeftBalance
        }
      }
    })
  const shoulderBone = shoulderBones.length > 0 ? shoulderBones[0].bone : null
  if (shoulderBone) {
    return shoulderBone
  } else {
    return null
  }
}

/**
 *
 * @author Avaer Kazmer
 * @param shoulderBone
 * @returns
 */
export const findHand = (shoulderBone) => findClosestChildBone(shoulderBone, (bone) => /hand|wrist/i.test(bone.name))
export const findFinger = (handBone, r) => findClosestChildBone(handBone, (bone) => r.test(bone.name))
export const findFoot = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const legBones = tailBones
    .map((tailBone) => {
      const footBone = findFurthestParentBone(
        tailBone,
        (bone) => /foot|ankle/i.test(bone.name) && regexp.test(bone.name.replace(/foot|ankle/gi, ''))
      )
      if (footBone) {
        const legBone = findFurthestParentBone(
          footBone,
          (bone) =>
            /(thigh|leg)(?!.*twist)/i.test(bone.name) && regexp.test(bone.name.replace(/(thigh|leg)(?!.*twist)/gi, ''))
        )
        if (legBone) {
          const distance = distanceToParentBone(footBone, legBone)
          if (distance >= 2) {
            return {
              footBone,
              distance
            }
          } else {
            return null
          }
        } else {
          return null
        }
      } else {
        return null
      }
    })
    .filter((spec) => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.footBone.name.replace(/foot|ankle/gi, '')
        const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i)
        const bName = b.footBone.name.replace(/foot|ankle/gi, '')
        const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i)
        if (!left) {
          return aLeftBalance - bLeftBalance
        } else {
          return bLeftBalance - aLeftBalance
        }
      }
    })
  const footBone = legBones.length > 0 ? legBones[0].footBone : null
  if (footBone) {
    return footBone
  } else {
    return null
  }
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @returns
 */
export const findArmature = (bone) => {
  for (; ; bone = bone.parent) {
    if (!bone.isBone) {
      return bone
    }
  }
  return null // can't happen
}

/**
 *
 * @author Avaer Kazmer
 * @param bone
 * @returns
 */
export const exportBone = (bone) => {
  return [
    bone.name,
    bone.position.toArray().concat(bone.quaternion.toArray()).concat(bone.scale.toArray()),
    bone.children.map((b) => exportBone(b))
  ]
}

/**
 *
 * @author Avaer Kazmer
 * @param skeleton
 * @returns
 */
export const exportSkeleton = (skeleton) => {
  const hips = findHips(skeleton)
  const armature = findArmature(hips)
  return JSON.stringify(exportBone(armature))
}

/**
 *
 * @author Avaer Kazmer
 * @param b
 * @param Cons
 * @param ChildCons
 * @returns
 */

export const importObject = (b, Cons, ChildCons) => {
  const [name, array, children] = b
  const bone = new Cons()
  bone.name = name
  bone.position.fromArray(array, 0)
  bone.quaternion.fromArray(array, 3)
  bone.scale.fromArray(array, 3 + 4)
  for (let i = 0; i < children.length; i++) {
    bone.add(importObject(children[i], ChildCons, ChildCons))
  }
  return bone
}

/**
 *
 * @author Avaer Kazmer
 * @param b
 * @returns
 */
export const importArmature = (b) => importObject(b, Object3D, Bone)
export const importSkeleton = (s) => {
  const armature = importArmature(JSON.parse(s))
  return new Skeleton(armature.children)
}

/**
 *
 * @author Avaer Kazmer
 */
export class AnimationMapping {
  quaternionKey: any
  quaternion: any
  isTop: any
  constructor(quaternionKey, quaternion, isTop) {
    this.quaternionKey = quaternionKey
    this.quaternion = quaternion
    this.isTop = isTop
  }
}

import { Vector3, Quaternion, Matrix4, ConeBufferGeometry, MeshPhongMaterial, Mesh, Object3D, Bone, Skeleton } from "three"

export const _localizeMatrixWorld = bone => {
  bone.matrix.copy(bone.matrixWorld)
  if (bone.parent) {
    bone.matrix.premultiply(new Matrix4().getInverse(bone.parent.matrixWorld))
  }
  bone.matrix.decompose(bone.position, bone.quaternion, bone.scale)

  for (let i = 0; i < bone.children.length; i++) {
    _localizeMatrixWorld(bone.children[i])
  }
}
export const _findBoneDeep = (bones, boneName) => {
  for (let i = 0; i < bones.length; i++) {
    const bone = bones[i]
    if (bone.name === boneName) {
      return bone
    } else {
      const deepBone = _findBoneDeep(bone.children, boneName)
      if (deepBone) {
        return deepBone
      }
    }
  }
  return null
}
export const _copySkeleton = (src, dst) => {
  for (let i = 0; i < src.bones.length; i++) {
    const srcBone = src.bones[i]
    const dstBone = _findBoneDeep(dst.bones, srcBone.name)
    dstBone.matrixWorld.copy(srcBone.matrixWorld)
  }

  const armature = dst.bones[0].parent
  _localizeMatrixWorld(armature)

  dst.calculateInverses()
}
const cubeGeometry = new ConeBufferGeometry(0.05, 0.2, 3).applyMatrix4(
  new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 0, 1)))
)
const cubeMaterials = {}
const _getCubeMaterial = color => {
  let material = cubeMaterials[color]
  if (!material) {
    material = new MeshPhongMaterial({
      color,
      flatShading: true
    })
    cubeMaterials[color] = material
  }
  return material
}
const _makeCubeMesh = (color = 0x0000ff) => {
  const mesh = new Mesh(cubeGeometry, _getCubeMaterial(color))
  mesh.frustumCulled = false
  /* if (color === 0x008000 || color === 0x808000) {
        mesh.add(new AxesHelper());
      } */
  mesh.updateMatrixWorld = () => {
    console.log("UpdateMatrixWorld")
  }
  return mesh
}
export const _makeDebugMeshes = () => ({
  eyes: _makeCubeMesh(0xff0000),
  head: _makeCubeMesh(0xff8080),

  chest: _makeCubeMesh(0xffff00),
  leftShoulder: _makeCubeMesh(0x00ff00),
  rightShoulder: _makeCubeMesh(0x008000),
  leftUpperArm: _makeCubeMesh(0x00ffff),
  rightUpperArm: _makeCubeMesh(0x008080),
  leftLowerArm: _makeCubeMesh(0x0000ff),
  rightLowerArm: _makeCubeMesh(0x000080),
  leftHand: _makeCubeMesh(0xffffff),
  rightHand: _makeCubeMesh(0x808080),

  hips: _makeCubeMesh(0xff0000),
  leftUpperLeg: _makeCubeMesh(0xffff00),
  rightUpperLeg: _makeCubeMesh(0x808000),
  leftLowerLeg: _makeCubeMesh(0x00ff00),
  rightLowerLeg: _makeCubeMesh(0x008000),
  leftFoot: _makeCubeMesh(0xffffff),
  rightFoot: _makeCubeMesh(0x808080)
})

export const _getTailBones = skeleton => {
  const result = []
  const _recurse = bones => {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i]
      if (bone.children.length === 0) {
        if (!result.includes(bone)) {
          result.push(bone)
        }
      } else {
        _recurse(bone.children)
      }
    }
  }
  _recurse(skeleton.bones)
  return result
}
export const _findClosestParentBone = (bone, pred) => {
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      return bone
    }
  }
  return null
}
export const _findFurthestParentBone = (bone, pred) => {
  let result = null
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      result = bone
    }
  }
  return result
}
export const _distanceToParentBone = (bone, parentBone) => {
  for (let i = 0; bone; bone = bone.parent, i++) {
    if (bone === parentBone) {
      return i
    }
  }
  return Infinity
}
export const _findClosestChildBone = (bone, pred) => {
  const _recurse = bone => {
    if (pred(bone)) {
      return bone
    } else {
      for (let i = 0; i < bone.children.length; i++) {
        const result = _recurse(bone.children[i])
        if (result) {
          return result
        }
      }
      return null
    }
  }
  return _recurse(bone)
}
export const _traverseChild = (bone, distance) => {
  if (distance <= 0) {
    return bone
  } else {
    for (let i = 0; i < bone.children.length; i++) {
      const child = bone.children[i]
      const subchild = _traverseChild(child, distance - 1)
      if (subchild !== null) {
        return subchild
      }
    }
    return null
  }
}
export const _countCharacters = (name, regex) => {
  let result = 0
  for (let i = 0; i < name.length; i++) {
    if (regex.test(name[i])) {
      result++
    }
  }
  return result
}
export const _findHips = skeleton => skeleton.bones.find(bone => /hip/i.test(bone.name))
export const _findHead = tailBones => {
  const headBones = tailBones
    .map(tailBone => {
      const headBone = _findFurthestParentBone(tailBone, bone => /head/i.test(bone.name))
      if (headBone) {
        return headBone
      } else {
        return null
      }
    })
    .filter(bone => bone)
  const headBone = headBones.length > 0 ? headBones[0] : null
  if (headBone) {
    return headBone
  } else {
    return null
  }
}
export const _findEye = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const eyeBones = tailBones
    .map(tailBone => {
      const eyeBone = _findFurthestParentBone(tailBone, bone => /eye/i.test(bone.name) && regexp.test(bone.name.replace(/eye/gi, "")))
      if (eyeBone) {
        return eyeBone
      } else {
        return null
      }
    })
    .filter(spec => spec)
    .sort((a, b) => {
      const aName = a.name.replace(/shoulder/gi, "")
      const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
      const bName = b.name.replace(/shoulder/gi, "")
      const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
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
export const _findSpine = (chest, hips) => {
  for (let bone = chest; bone; bone = bone.parent) {
    if (bone.parent === hips) {
      return bone
    }
  }
  return null
}
export const _findShoulder = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const shoulderBones = tailBones
    .map(tailBone => {
      const shoulderBone = _findClosestParentBone(tailBone, bone => /shoulder/i.test(bone.name) && regexp.test(bone.name.replace(/shoulder/gi, "")))
      if (shoulderBone) {
        const distance = _distanceToParentBone(tailBone, shoulderBone)
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
    .filter(spec => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.bone.name.replace(/shoulder/gi, "")
        const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
        const bName = b.bone.name.replace(/shoulder/gi, "")
        const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
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
export const _findHand = shoulderBone => _findClosestChildBone(shoulderBone, bone => /hand|wrist/i.test(bone.name))
export const _findFoot = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const legBones = tailBones
    .map(tailBone => {
      const footBone = _findFurthestParentBone(tailBone, bone => /foot|ankle/i.test(bone.name) && regexp.test(bone.name.replace(/foot|ankle/gi, "")))
      if (footBone) {
        const legBone = _findFurthestParentBone(footBone, bone => /leg|thigh/i.test(bone.name) && regexp.test(bone.name.replace(/leg|thigh/gi, "")))
        if (legBone) {
          const distance = _distanceToParentBone(footBone, legBone)
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
    .filter(spec => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.footBone.name.replace(/foot|ankle/gi, "")
        const aLeftBalance = _countCharacters(aName, /l/i) - _countCharacters(aName, /r/i)
        const bName = b.footBone.name.replace(/foot|ankle/gi, "")
        const bLeftBalance = _countCharacters(bName, /l/i) - _countCharacters(bName, /r/i)
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
export const _findArmature = bone => {
  for (; ; bone = bone.parent) {
    if (!bone.isBone) {
      return bone
    }
  }
  return null // can't happen
}

export const _exportBone = bone => {
  return [
    bone.name,
    bone.position
      .toArray()
      .concat(bone.quaternion.toArray())
      .concat(bone.scale.toArray()),
    bone.children.map(b => _exportBone(b))
  ]
}
export const _exportSkeleton = skeleton => {
  const hips = _findHips(skeleton)
  const armature = _findArmature(hips)
  return JSON.stringify(_exportBone(armature))
}
export const _importObject = (b, Cons, ChildCons) => {
  const [name, array, children] = b
  const bone = new Cons()
  bone.name = name
  bone.position.fromArray(array, 0)
  bone.quaternion.fromArray(array, 3)
  bone.scale.fromArray(array, 3 + 4)
  for (let i = 0; i < children.length; i++) {
    bone.add(_importObject(children[i], ChildCons, ChildCons))
  }
  return bone
}
export const _importArmature = b => _importObject(b, Object3D, Bone)
export const _importSkeleton = s => {
  const armature = _importArmature(JSON.parse(s))
  return new Skeleton(armature.children)
}

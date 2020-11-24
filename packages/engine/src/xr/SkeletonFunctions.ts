// Skeleton functions from Exokit Avatars
// github.com/exokitxr/avatars

import { Bone, Matrix4, Object3D, Skeleton } from "three"

export const worldToLocal = bone => {
  bone.matrix.copy(bone.matrixWorld)
  if (bone.parent) {
    bone.matrix.premultiply(new Matrix4().getInverse(bone.parent.matrixWorld))
  }
  bone.matrix.decompose(bone.position, bone.quaternion, bone.scale)

  for (let i = 0; i < bone.children.length; i++) {
    worldToLocal(bone.children[i])
  }
}
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
export const copySkeleton = (src, dst) => {
  for (let i = 0; i < src.bones.length; i++) {
    const srcBone = src.bones[i]
    const dstBone = findBoneDeep(dst.bones, srcBone.name)
    dstBone.matrixWorld.copy(srcBone.matrixWorld)
  }

  const armature = dst.bones[0].parent
  worldToLocal(armature)

  dst.calculateInverses()
}

export const getTailBones = skeleton => {
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
export const findClosestParentBone = (bone, pred) => {
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      return bone
    }
  }
  return null
}
export const findFurthestParentBone = (bone, pred) => {
  let result = null
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      result = bone
    }
  }
  return result
}
export const distanceToParentBone = (bone, parentBone) => {
  for (let i = 0; bone; bone = bone.parent, i++) {
    if (bone === parentBone) {
      return i
    }
  }
  return Infinity
}
export const findClosestChildBone = (bone, pred) => {
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
export const countActors = (name, regex) => {
  let result = 0
  for (let i = 0; i < name.length; i++) {
    if (regex.test(name[i])) {
      result++
    }
  }
  return result
}
export const findHips = skeleton => skeleton.bones.find(bone => /hip/i.test(bone.name))
export const findHead = tailBones => {
  const headBones = tailBones
    .map(tailBone => {
      const headBone = findFurthestParentBone(tailBone, bone => /head/i.test(bone.name))
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
export const findEye = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const eyeBones = tailBones
    .map(tailBone => {
      const eyeBone = findFurthestParentBone(
        tailBone,
        bone => /eye/i.test(bone.name) && regexp.test(bone.name.replace(/eye/gi, ""))
      )
      if (eyeBone) {
        return eyeBone
      } else {
        return null
      }
    })
    .filter(spec => spec)
    .sort((a, b) => {
      const aName = a.name.replace(/shoulder/gi, "")
      const aLeftBalance = countActors(aName, /l/i) - countActors(aName, /r/i)
      const bName = b.name.replace(/shoulder/gi, "")
      const bLeftBalance = countActors(bName, /l/i) - countActors(bName, /r/i)
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
export const findSpine = (chest, hips) => {
  for (let bone = chest; bone; bone = bone.parent) {
    if (bone.parent === hips) {
      return bone
    }
  }
  return null
}
export const findShoulder = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const shoulderBones = tailBones
    .map(tailBone => {
      const shoulderBone = findClosestParentBone(
        tailBone,
        bone => /shoulder/i.test(bone.name) && regexp.test(bone.name.replace(/shoulder/gi, ""))
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
    .filter(spec => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.bone.name.replace(/shoulder/gi, "")
        const aLeftBalance = countActors(aName, /l/i) - countActors(aName, /r/i)
        const bName = b.bone.name.replace(/shoulder/gi, "")
        const bLeftBalance = countActors(bName, /l/i) - countActors(bName, /r/i)
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
export const findHand = shoulderBone => findClosestChildBone(shoulderBone, bone => /hand|wrist/i.test(bone.name))
export const findFoot = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i
  const legBones = tailBones
    .map(tailBone => {
      const footBone = findFurthestParentBone(
        tailBone,
        bone => /foot|ankle/i.test(bone.name) && regexp.test(bone.name.replace(/foot|ankle/gi, ""))
      )
      if (footBone) {
        const legBone = findFurthestParentBone(
          footBone,
          bone => /leg|thigh/i.test(bone.name) && regexp.test(bone.name.replace(/leg|thigh/gi, ""))
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
    .filter(spec => spec)
    .sort((a, b) => {
      const diff = b.distance - a.distance
      if (diff !== 0) {
        return diff
      } else {
        const aName = a.footBone.name.replace(/foot|ankle/gi, "")
        const aLeftBalance = countActors(aName, /l/i) - countActors(aName, /r/i)
        const bName = b.footBone.name.replace(/foot|ankle/gi, "")
        const bLeftBalance = countActors(bName, /l/i) - countActors(bName, /r/i)
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
export const findArmature = bone => {
  for (; ; bone = bone.parent) {
    if (!bone.isBone) {
      return bone
    }
  }
  return null // can't happen
}

export const exportBone = bone => {
  return [
    bone.name,
    bone.position
      .toArray()
      .concat(bone.quaternion.toArray())
      .concat(bone.scale.toArray()),
    bone.children.map(b => exportBone(b))
  ]
}
export const exportSkeleton = skeleton => {
  const hips = findHips(skeleton)
  const armature = findArmature(hips)
  return JSON.stringify(exportBone(armature))
}
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
export const importArmature = b => importObject(b, Object3D, Bone)
export const importSkeleton = s => {
  const armature = importArmature(JSON.parse(s))
  return new Skeleton(armature.children)
}

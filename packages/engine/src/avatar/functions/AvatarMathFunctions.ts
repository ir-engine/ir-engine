import {
  Bone,
  Euler,
  Matrix4,
  Object3D,
  Quaternion,
  Skeleton,
  Vector3
} from 'three';

export const localVector = new Vector3();
export const localVector2 = new Vector3();
export const localQuaternion = new Quaternion();
export const localEuler = new Euler();
export const localMatrix = new Matrix4();

/**
 * 
 * @author Avaer Kazmer
 * @param bone 
 */
export const localizeMatrixWorld = bone => {
  bone.matrix.copy(bone.matrixWorld);
  if (bone.parent) {
    bone.matrix.premultiply(bone.parent.matrixWorld.clone().invert());
  }
  bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);

  for (let i = 0; i < bone.children.length; i++) {
    localizeMatrixWorld(bone.children[i]);
  }
};

/**
 * 
 * @author Avaer Kazmer
 * @param bones 
 * @param boneName 
 * @returns 
 */
export const findBoneDeep = (bones, boneName) => {
  for (let i = 0; i < bones.length; i++) {
    const bone = bones[i];
    if (bone.name === boneName) {
      return bone;
    } else {
      const deepBone = findBoneDeep(bone.children, boneName);
      if (deepBone) {
        return deepBone;
      }
    }
  }
  return null;
};

/**
 * 
 * @author Avaer Kazmer
 * @param src 
 * @param dst 
 */
export const copySkeleton = (src, dst) => {
  for (let i = 0; i < src.bones.length; i++) {
    const srcBone = src.bones[i];
    const dstBone = findBoneDeep(dst.bones, srcBone.name);
    dstBone.matrixWorld.copy(srcBone.matrixWorld);
  }

  const armature = dst.bones[0].parent;
  localizeMatrixWorld(armature);

  dst.calculateInverses();
};

/**
 * 
 * @author Avaer Kazmer
 * @param skeleton 
 * @returns 
 */
export const getTailBones = skeleton => {
  const result = [];
  const recurse = bones => {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];
      if (bone.children.length === 0) {
        if (!result.includes(bone)) {
          result.push(bone);
        }
      } else {
        recurse(bone.children);
      }
    }
  };
  recurse(skeleton.bones);
  return result;
};

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
      return bone;
    }
  }
  return null;
};

/**
 * 
 * @author Avaer Kazmer
 * @param bone 
 * @param pred 
 * @returns 
 */
export const findFurthestParentBone = (bone, pred) => {
  let result = null;
  for (; bone; bone = bone.parent) {
    if (pred(bone)) {
      result = bone;
    }
  }
  return result;
};

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
      return i;
    }
  }
  return Infinity;
};

/**
 * 
 * @author Avaer Kazmer
 * @param bone 
 * @param pred 
 * @returns 
 */
export const findClosestChildBone = (bone, pred) => {
  const recurse = bone => {
    if (pred(bone)) {
      return bone;
    } else {
      for (let i = 0; i < bone.children.length; i++) {
        const result = recurse(bone.children[i]);
        if (result) {
          return result;
        }
      }
      return null;
    }
  };
  return recurse(bone);
};

/**
 * 
 * @author Avaer Kazmer
 * @param bone 
 * @param distance 
 * @returns 
 */
export const traverseChild = (bone, distance) => {
  if (distance <= 0) {
    return bone;
  } else {
    for (let i = 0; i < bone.children.length; i++) {
      const child = bone.children[i];
      const subchild = traverseChild(child, distance - 1);
      if (subchild !== null) {
        return subchild;
      }
    }
    return null;
  }
};

/**
 * 
 * @author Avaer Kazmer
 * @param name 
 * @param regex 
 * @returns 
 */
export const countCharacters = (name, regex) => {
  let result = 0;
  for (let i = 0; i < name.length; i++) {
    if (regex.test(name[i])) {
      result++;
    }
  }
  return result;
};

/**
 * 
 * @author Avaer Kazmer
 * @param skeleton 
 * @returns 
 */
export const findHips = skeleton => skeleton.bones.find(bone => /hip|root|rootx|pelvis/i.test(bone.name));
export const findHead = tailBones => {
  const headBones = tailBones.map(tailBone => {
    const headBone = findFurthestParentBone(tailBone, bone => /head/i.test(bone.name));
    if (headBone) {
      return headBone;
    } else {
      return null;
    }
  }).filter(bone => bone);
  const headBone = headBones.length > 0 ? headBones[0] : null;
  if (headBone) {
    return headBone;
  } else {
    return null;
  }
};

/**
 * 
 * @author Avaer Kazmer
 * @param tailBones 
 * @param left 
 * @returns 
 */
export const findEye = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i;
  const eyeBones = tailBones.map(tailBone => {
    const eyeBone = findFurthestParentBone(tailBone, bone => /eye/i.test(bone.name) && regexp.test(bone.name.replace(/eye/gi, '')));
    if (eyeBone) {
      return eyeBone;
    } else {
      return null;
    }
  }).filter(spec => spec).sort((a, b) => {
    const aName = a.name.replace(/shoulder/gi, '');
    const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i);
    const bName = b.name.replace(/shoulder/gi, '');
    const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i);
    if (!left) {
      return aLeftBalance - bLeftBalance;
    } else {
      return bLeftBalance - aLeftBalance;
    }
  });
  const eyeBone = eyeBones.length > 0 ? eyeBones[0] : null;
  if (eyeBone) {
    return eyeBone;
  } else {
    return null;
  }
};

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
      return bone;
    }
  }
  return null;
};

/**
 * 
 * @author Avaer Kazmer
 * @param tailBones 
 * @param left 
 * @returns 
 */
export const findShoulder = (tailBones, left) => {
  // console.log("Finding shoulder")
  const regexp = left ? /l/i : /r/i;
  const shoulderBones = tailBones.map(tailBone => {
    const shoulderBone = findClosestParentBone(tailBone, bone => /shoulder|clavicle/i.test(bone.name) && regexp.test(bone.name.replace(/shoulder|clavicle/gi, '')));
    if (shoulderBone) {
      const distance = distanceToParentBone(tailBone, shoulderBone);
      if (distance >= 3) {
        return {
          bone: shoulderBone,
          distance,
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  }).filter(spec => spec).sort((a, b) => {
    const diff = b.distance - a.distance;
    if (diff !== 0) {
      return diff;
    } else {
      const aName = a.bone.name.replace(/shoulder|clavicle/gi, '');
      const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i);
      const bName = b.bone.name.replace(/shoulder|clavicle/gi, '');
      const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i);
      if (!left) {
        return aLeftBalance - bLeftBalance;
      } else {
        return bLeftBalance - aLeftBalance;
      }
    }
  });
  const shoulderBone = shoulderBones.length > 0 ? shoulderBones[0].bone : null;
  if (shoulderBone) {
    return shoulderBone;
  } else {
    return null;
  }
};

/**
 * 
 * @author Avaer Kazmer
 * @param shoulderBone 
 * @returns 
 */
export const findHand = shoulderBone => findClosestChildBone(shoulderBone, bone => /hand|wrist/i.test(bone.name));
export const findFinger = (handBone, r) => findClosestChildBone(handBone, bone => r.test(bone.name));
export const findFoot = (tailBones, left) => {
  const regexp = left ? /l/i : /r/i;
  const legBones = tailBones.map(tailBone => {
    const footBone = findFurthestParentBone(tailBone, bone => /foot|ankle/i.test(bone.name) && regexp.test(bone.name.replace(/foot|ankle/gi, '')));
    if (footBone) {
      const legBone = findFurthestParentBone(footBone, bone => /(thigh|leg)(?!.*twist)/i.test(bone.name) && regexp.test(bone.name.replace(/(thigh|leg)(?!.*twist)/gi, '')));
      if (legBone) {
        const distance = distanceToParentBone(footBone, legBone);
        if (distance >= 2) {
          return {
            footBone,
            distance,
          };
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }).filter(spec => spec).sort((a, b) => {
    const diff = b.distance - a.distance;
    if (diff !== 0) {
      return diff;
    } else {
      const aName = a.footBone.name.replace(/foot|ankle/gi, '');
      const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i);
      const bName = b.footBone.name.replace(/foot|ankle/gi, '');
      const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i);
      if (!left) {
        return aLeftBalance - bLeftBalance;
      } else {
        return bLeftBalance - aLeftBalance;
      }
    }
  });
  const footBone = legBones.length > 0 ? legBones[0].footBone : null;
  if (footBone) {
    return footBone;
  } else {
    return null;
  }
};

/**
 * 
 * @author Avaer Kazmer
 * @param bone 
 * @returns 
 */
export const findArmature = bone => {
  for (; ; bone = bone.parent) {
    if (!bone.isBone) {
      return bone;
    }
  }
  return null; // can't happen
};

/**
 * 
 * @author Avaer Kazmer
 * @param bone 
 * @returns 
 */
export const exportBone = bone => {
  return [bone.name, bone.position.toArray().concat(bone.quaternion.toArray()).concat(bone.scale.toArray()), bone.children.map(b => exportBone(b))];
};

/**
 * 
 * @author Avaer Kazmer
 * @param skeleton 
 * @returns 
 */
export const exportSkeleton = skeleton => {
  const hips = findHips(skeleton);
  const armature = findArmature(hips);
  return JSON.stringify(exportBone(armature));
};

/**
 * 
 * @author Avaer Kazmer
 * @param b 
 * @param Cons 
 * @param ChildCons 
 * @returns 
 */

export const importObject = (b, Cons, ChildCons) => {
  const [name, array, children] = b;
  const bone = new Cons();
  bone.name = name;
  bone.position.fromArray(array, 0);
  bone.quaternion.fromArray(array, 3);
  bone.scale.fromArray(array, 3 + 4);
  for (let i = 0; i < children.length; i++) {
    bone.add(importObject(children[i], ChildCons, ChildCons));
  }
  return bone;
};

/**
 * 
 * @author Avaer Kazmer
 * @param b 
 * @returns 
 */
export const importArmature = b => importObject(b, Object3D, Bone);
export const importSkeleton = s => {
  const armature = importArmature(JSON.parse(s));
  return new Skeleton(armature.children);
};

/**
 * 
 * @author Avaer Kazmer
 */
export class AnimationMapping {
  quaternionKey: any;
  quaternion: any;
  isTop: any;
  constructor(quaternionKey, quaternion, isTop) {
    this.quaternionKey = quaternionKey;
    this.quaternion = quaternion;
    this.isTop = isTop;
  }
}

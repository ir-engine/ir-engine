/**
* Takes in a rootBone and recursively traverses the bone heirarchy,
* setting each bone's +Z axis to face it's child bones. The IK system follows this
* convention, so this step is necessary to update the bindings of a skinned mesh.
*
* Must rebind the model to it's skeleton after this function.
*
* @author mrdoob and three.js community
* @param {Bone} rootBone
* @param {Object} context - options and buffer for stateful bone calculations
*                 context.exclude: [ boneNames to exclude ]
*                 context.preRotations: { boneName: Quaternion, ... }
*/

import {
  AnimationClip,
  AnimationMixer,
  Euler,
  Matrix4,
  Quaternion,
  QuaternionKeyframeTrack,
  SkeletonHelper,
  Vector2,
  Vector3,
  VectorKeyframeTrack
} from 'three';
import { Options, RetargetOptions, ShortOptions } from '../interfaces/SkeletonInterfaces';

export function retarget(target, source, options: Options) {
  if (!options) options = {
    preserveMatrix: true,
    preservePosition: true,
    preserveHipPosition: false,
    useTargetMatrix: false,
    hip: 'hip',
    names: {}
  }
  const pos = new Vector3(),
    quat = new Quaternion(),
    scale = new Vector3(),
    bindBoneMatrix = new Matrix4(),
    relativeMatrix = new Matrix4(),
    globalMatrix = new Matrix4();

  options.preserveMatrix = options.preserveMatrix !== undefined ? options.preserveMatrix : true;
  options.preservePosition = options.preservePosition !== undefined ? options.preservePosition : true;
  options.preserveHipPosition = options.preserveHipPosition !== undefined ? options.preserveHipPosition : false;
  options.useTargetMatrix = options.useTargetMatrix !== undefined ? options.useTargetMatrix : false;
  options.hip = options.hip !== undefined ? options.hip : 'hip';
  options.names = options.names || {};

  const sourceBones = source.isObject3D ? source.skeleton.bones : getBones(source),
    bones = target.isObject3D ? target.skeleton.bones : getBones(target);

  let bindBones,
    bone, name, boneTo,
    bonesPosition;

  // reset bones

  if (target.isObject3D) {
    target.skeleton.pose();
  } else {
    options.useTargetMatrix = true;
    options.preserveMatrix = false;
  }

  if (options.preservePosition) {
    bonesPosition = [];
    for (let i = 0; i < bones.length; i++) {
      bonesPosition.push(bones[i].position.clone());
    }
  }

  if (options.preserveMatrix) {

    // reset matrix

    target.updateMatrixWorld();
    target.matrixWorld.identity();

    // reset children matrix

    for (let i = 0; i < target.children.length; ++i) {
      target.children[i].updateMatrixWorld(true);
    }

  }

  if (options.offsets) {

    bindBones = [];

    for (let i = 0; i < bones.length; ++i) {

      bone = bones[i];
      name = options.names[bone.name] || bone.name;

      if (options.offsets && options.offsets[name]) {

        bone.matrix.multiply(options.offsets[name]);

        bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);

        bone.updateMatrixWorld();

      }

      bindBones.push(bone.matrixWorld.clone());

    }

  }

  for (let i = 0; i < bones.length; ++i) {

    bone = bones[i];
    name = options.names[bone.name] || bone.name;

    boneTo = getBoneByName(name, sourceBones);

    globalMatrix.copy(bone.matrixWorld);

    if (boneTo) {

      boneTo.updateMatrixWorld();

      if (options.useTargetMatrix) {

        relativeMatrix.copy(boneTo.matrixWorld);

      } else {

        relativeMatrix.copy(target.matrixWorld).invert();
        relativeMatrix.multiply(boneTo.matrixWorld);

      }

      // ignore scale to extract rotation

      scale.setFromMatrixScale(relativeMatrix);
      relativeMatrix.scale(scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z));

      // apply to global matrix

      globalMatrix.makeRotationFromQuaternion(quat.setFromRotationMatrix(relativeMatrix));

      if (target.isObject3D) {

        const boneIndex = bones.indexOf(bone),
          wBindMatrix = bindBones ? bindBones[boneIndex] : bindBoneMatrix.copy(target.skeleton.boneInverses[boneIndex]).invert();

        globalMatrix.multiply(wBindMatrix);

      }

      globalMatrix.copyPosition(relativeMatrix);

    }

    if (bone.parent && bone.parent.isBone) {

      bone.matrix.copy(bone.parent.matrixWorld).invert();
      bone.matrix.multiply(globalMatrix);

    } else {

      bone.matrix.copy(globalMatrix);

    }

    if (options.preserveHipPosition && name === options.hip) {

      bone.matrix.setPosition(pos.set(0, bone.position.y, 0));

    }

    bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);

    bone.updateMatrixWorld();

  }

  if (options.preservePosition) {

    for (let i = 0; i < bones.length; ++i) {

      bone = bones[i];
      name = options.names[bone.name] || bone.name;

      if (name !== options.hip) {

        bone.position.copy(bonesPosition[i]);

      }

    }

  }

  if (options.preserveMatrix) {

    // restore matrix

    target.updateMatrixWorld(true);

  }

}

export function retargetClip(target, source, clip, options: RetargetOptions = {}) {

  options.useFirstFramePosition = options.useFirstFramePosition !== undefined ? options.useFirstFramePosition : false;
  options.fps = options.fps !== undefined ? options.fps : 30;
  options.names = options.names || [];

  if (!source.isObject3D) {

    source = getHelperFromSkeleton(source);

  }

  const numFrames = Math.round(clip.duration * (options.fps / 1000) * 1000),
    delta = 1 / options.fps,
    convertedTracks = [],
    mixer = new AnimationMixer(source),
    bones = getBones(target.skeleton),
    boneDatas = [];
  let positionOffset,
    bone, boneTo, boneData,
    name;

  mixer.clipAction(clip).play();
  mixer.update(0);

  source.updateMatrixWorld();

  for (let i = 0; i < numFrames; ++i) {

    const time = i * delta;

    retarget(target, source, options);

    for (let j = 0; j < bones.length; ++j) {

      name = options.names[bones[j].name] || bones[j].name;

      boneTo = getBoneByName(name, source.skeleton);

      if (boneTo) {

        bone = bones[j];
        boneData = boneDatas[j] = boneDatas[j] || { bone: bone };

        if (options.hip === name) {

          if (!boneData.pos) {

            boneData.pos = {
              times: new Float32Array(numFrames),
              values: new Float32Array(numFrames * 3)
            };

          }

          if (options.useFirstFramePosition) {

            if (i === 0) {

              positionOffset = bone.position.clone();

            }

            bone.position.sub(positionOffset);

          }

          boneData.pos.times[i] = time;

          bone.position.toArray(boneData.pos.values, i * 3);

        }

        if (!boneData.quat) {

          boneData.quat = {
            times: new Float32Array(numFrames),
            values: new Float32Array(numFrames * 4)
          };

        }

        boneData.quat.times[i] = time;

        bone.quaternion.toArray(boneData.quat.values, i * 4);

      }

    }

    mixer.update(delta);

    source.updateMatrixWorld();

  }

  for (let i = 0; i < boneDatas.length; ++i) {

    boneData = boneDatas[i];

    if (boneData) {

      if (boneData.pos) {

        convertedTracks.push(new VectorKeyframeTrack(
          '.bones[' + boneData.bone.name + '].position',
          boneData.pos.times,
          boneData.pos.values
        ));

      }

      convertedTracks.push(new QuaternionKeyframeTrack(
        '.bones[' + boneData.bone.name + '].quaternion',
        boneData.quat.times,
        boneData.quat.values
      ));

    }

  }

  mixer.uncacheAction(clip);

  return new AnimationClip(clip.name, - 1, convertedTracks);

}

export function getHelperFromSkeleton(skeleton) {

  const source = new SkeletonHelper(skeleton.bones[0]);
  (source as any).skeleton = skeleton;

  return source;

}

export function getSkeletonOffsets(target, source, options: ShortOptions = {}) {

  const targetParentPos = new Vector3(),
    targetPos = new Vector3(),
    sourceParentPos = new Vector3(),
    sourcePos = new Vector3(),
    targetDir = new Vector2(),
    sourceDir = new Vector2();

  options.hip = options.hip !== undefined ? options.hip : 'hip';
  options.names = options.names || {};

  if (!source.isObject3D) {

    source = getHelperFromSkeleton(source);

  }

  const nameKeys = Object.keys(options.names),
    nameValues = Object.values(options.names),
    sourceBones = source.isObject3D ? source.skeleton.bones : getBones(source),
    bones = target.isObject3D ? target.skeleton.bones : getBones(target),
    offsets = [];

  let bone, boneTo,
    name, i;

  target.skeleton.pose();

  for (i = 0; i < bones.length; ++i) {

    bone = bones[i];
    name = options.names[bone.name] || bone.name;

    boneTo = getBoneByName(name, sourceBones);

    if (boneTo && name !== options.hip) {

      const boneParent = getNearestBone(bone.parent, nameKeys),
        boneToParent = getNearestBone(boneTo.parent, nameValues);

      boneParent.updateMatrixWorld();
      boneToParent.updateMatrixWorld();

      targetParentPos.setFromMatrixPosition(boneParent.matrixWorld);
      targetPos.setFromMatrixPosition(bone.matrixWorld);

      sourceParentPos.setFromMatrixPosition(boneToParent.matrixWorld);
      sourcePos.setFromMatrixPosition(boneTo.matrixWorld);

      targetDir.subVectors(
        new Vector2(targetPos.x, targetPos.y),
        new Vector2(targetParentPos.x, targetParentPos.y)
      ).normalize();

      sourceDir.subVectors(
        new Vector2(sourcePos.x, sourcePos.y),
        new Vector2(sourceParentPos.x, sourceParentPos.y)
      ).normalize();

      const laterialAngle = targetDir.angle() - sourceDir.angle();

      const offset = new Matrix4().makeRotationFromEuler(
        new Euler(
          0,
          0,
          laterialAngle
        )
      );

      bone.matrix.multiply(offset);

      bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);

      bone.updateMatrixWorld();

      offsets[name] = offset;

    }

  }

  return offsets;

}

export function renameBones(skeleton, names) {

  const bones = getBones(skeleton);

  for (let i = 0; i < bones.length; ++i) {

    const bone = bones[i];

    if (names[bone.name]) {

      bone.name = names[bone.name];

    }

  }

  return this;

}

export function getBones(skeleton) {

  return Array.isArray(skeleton) ? skeleton : skeleton.bones;

}

export function getBoneByName(name, skeleton) {

  for (let i = 0, bones = getBones(skeleton); i < bones.length; i++) {

    if (name === bones[i].name)

      return bones[i];

  }

}

export function getNearestBone(bone, names) {

  while (bone.isBone) {

    if (names.indexOf(bone.name) !== - 1) {

      return bone;

    }

    bone = bone.parent;

  }

}

export function findBoneTrackData(name, tracks) {

  const regexp = /\[(.*)\]\.(.*)/,
    result = { name: name };

  for (let i = 0; i < tracks.length; ++i) {

    // 1 is track name
    // 2 is track type
    const trackData = regexp.exec(tracks[i].name);

    if (trackData && name === trackData[1]) {

      result[trackData[2]] = i;

    }

  }

  return result;

}

export function getEqualsBonesNames(skeleton, targetSkeleton) {

  const sourceBones = getBones(skeleton),
    targetBones = getBones(targetSkeleton),
    bones = [];

  search: for (let i = 0; i < sourceBones.length; i++) {

    const boneName = sourceBones[i].name;

    for (let j = 0; j < targetBones.length; j++) {

      if (boneName === targetBones[j].name) {

        bones.push(boneName);

        continue search;

      }

    }

  }

  return bones;

}

export function clone(source) {

  const sourceLookup = new Map();
  const cloneLookup = new Map();

  const clone = source.clone();

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {

    sourceLookup.set(clonedNode, sourceNode);
    cloneLookup.set(sourceNode, clonedNode);

  });

  clone.traverse((node) => {

    if (!node.isSkinnedMesh) return;

    const clonedMesh = node;
    const sourceMesh = sourceLookup.get(node);
    const sourceBones = sourceMesh.skeleton.bones;

    clonedMesh.skeleton = sourceMesh.skeleton.clone();
    clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);

    clonedMesh.skeleton.bones = sourceBones.map((bone) => {

      return cloneLookup.get(bone);

    });

    clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);

  });

  return clone;

}


export function parallelTraverse(a, b, callback) {

  callback(a, b);

  for (let i = 0; i < a.children.length; i++) {

    parallelTraverse(a.children[i], b.children[i], callback);

  }

}
/**
 * 
 * @author Avaer Kazmer
 * @param rootBone 
 * @param context 
 * @returns 
  * Takes in a rootBone and recursively traverses the bone heirarchy,
  * setting each bone's +Z axis to face it's child bones. The IK system follows this
  * convention, so this step is necessary to update the bindings of a skinned mesh.
  *
  * Must rebind the model to it's skeleton after this function.
  *
  * @param {THREE.Bone} rootBone
  * @param {Object} context - options and buffer for stateful bone calculations
  *                 context.exclude: [ boneNames to exclude ]
  *                 context.preRotations: { boneName: THREE.Quaternion, ... }
  */
function fixSkeletonZForward(rootBone, context) {
  context = context || {};
  precalculateZForwards(rootBone, context);
  if (context.exclude) {
    const bones = [rootBone];
    rootBone.traverse((b) => bones.push(b));
    bones.forEach((b) => {
      if (~context.exclude.indexOf(b.id) || ~context.exclude.indexOf(b.name)) {
        delete context.averagedDirs[b.id];
      }
    });
  }
  return setZForward(rootBone, context);
}

const RESETQUAT = new Quaternion();

/**
* Takes in a rootBone and recursively traverses the bone heirarchy,
* setting each bone's +Z axis to face it's child bones. The IK system follows this
* convention, so this step is necessary to update the bindings of a skinned mesh.
*
* Must rebind the model to it's skeleton after this function.
*
*@author Avaer Kazmer
* @param {BONE} rootBone
*/

function precalculateZForwards(rootBone, context) {
  context = context || rootBone;
  context.worldPos = context.worldPos || {};
  context.averagedDirs = context.averagedDirs || {};
  context.preRotations = context.preRotations || {};
  getOriginalWorldPositions(rootBone, context.worldPos)
  calculateAverages(rootBone, context.worldPos, context.averagedDirs);
  return context;
}

/**
 * 
 * @author Avaer Kazmer
 * @param rootBone 
 * @param context 
 * @returns 
 */
function setZForward(rootBone, context) {
  if (!context || !context.worldPos) {
    context = context || {};
    precalculateZForwards(rootBone, context);
  }
  updateTransformations(rootBone, context.worldPos, context.averagedDirs, context.preRotations);
  return context;
}

/**
 * 
 * @author Avaer Kazmer
 * @param parentBone 
 * @param worldPos 
 * @param averagedDirs 
 */
function calculateAverages(parentBone, worldPos, averagedDirs) {
  const averagedDir = new Vector3();
  const childBones = parentBone.children.filter(c => c.isBone);
  childBones.forEach((childBone) => {
    //average the child bone world pos
    const childBonePosWorld = worldPos[childBone.id];

    averagedDir.add(childBonePosWorld);
  });

  averagedDir.multiplyScalar(1 / (childBones.length));
  averagedDirs[parentBone.id] = averagedDir;

  childBones.forEach((childBone) => {
    calculateAverages(childBone, worldPos, averagedDirs);
  });
}

/**
 * 
 * @author Avaer Kazmer
 * @param parentBone 
 * @param worldPos 
 * @param averagedDirs 
 * @param preRotations 
 */
function updateTransformations(parentBone, worldPos, averagedDirs, preRotations) {

  const averagedDir = averagedDirs[parentBone.id];
  if (averagedDir) {

    //set quaternion
    parentBone.quaternion.copy(RESETQUAT);
    // parentBone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI*2));
    parentBone.updateMatrixWorld();

    //get the child bone position in local coordinates
    // var childBoneDir = parentBone.worldToLocal(averagedDir.clone()).normalize();

    //set direction to face child
    // setQuaternionFromDirection(childBoneDir, Y_AXIS, parentBone.quaternion)
    // console.log('new quaternion', parentBone.quaternion.toArray().join(','));
  }
  const preRot = preRotations[parentBone.id] || preRotations[parentBone.name];
  if (preRot) parentBone.quaternion.multiply(preRot);
  // parentBone.quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  parentBone.updateMatrixWorld();

  //set child bone position relative to the new parent matrix.
  const childBones = parentBone.children.filter(c => c.isBone);
  childBones.forEach((childBone) => {
    const childBonePosWorld = worldPos[childBone.id].clone();
    parentBone.worldToLocal(childBonePosWorld);
    childBone.position.copy(childBonePosWorld);
  });

  childBones.forEach((childBone) => {
    updateTransformations(childBone, worldPos, averagedDirs, preRotations);
  });
}

//borrowing this from utils.js , not sure how to import it
const t1 = new Vector3();
const t2 = new Vector3();
const t3 = new Vector3();
const m1 = new Matrix4();

/**
 * 
 * @author Avaer Kazmer
 * @param direction 
 * @param up 
 * @param target 
 * @returns 
 */
function setQuaternionFromDirection(direction, up, target) {
  const x = t1;
  const y = t2;
  const z = t3;
  const m = m1;
  const el = m1.elements;

  z.copy(direction);
  x.crossVectors(up, z);

  if (x.lengthSq() === 0) {
    // parallel
    if (Math.abs(up.z) === 1) {
      z.x += 0.0001;
    } else {
      z.z += 0.0001;
    }
    z.normalize();
    x.crossVectors(up, z);
  }

  x.normalize();
  y.crossVectors(z, x);

  el[0] = x.x; el[4] = y.x; el[8] = z.x;
  el[1] = x.y; el[5] = y.y; el[9] = z.y;
  el[2] = x.z; el[6] = y.z; el[10] = z.z;

  return target.setFromRotationMatrix(m);
}

/**
 * 
 * @author Avaer Kazmer
 * @param rootBone 
 * @param worldPos 
 */
function getOriginalWorldPositions(rootBone, worldPos) {
  const rootBoneWorldPos = rootBone.getWorldPosition(new Vector3())
  worldPos[rootBone.id] = rootBoneWorldPos;
  rootBone.children.forEach((child) => {
    child.isBone && getOriginalWorldPositions(child, worldPos)
  })
}

/**
 * 
 * @author Avaer Kazmer
 * @param direction 
 * @param parent 
 * @returns 
 */
function _worldToLocalDirection(direction, parent) {
  const inverseParent = new Matrix4().getInverse(parent.matrixWorld);
  direction.transformDirection(inverseParent);
  return direction;
}

/**
 * 
 * @author Avaer Kazmer
 * @param direction 
 * @param parent 
 * @returns 
 */
function _localToWorldDirection(direction, parent) {
  const parentMat = parent.matrixWorld;
  direction.transformDirection(parentMat);
  return direction;
}

export {
  fixSkeletonZForward, setQuaternionFromDirection
};
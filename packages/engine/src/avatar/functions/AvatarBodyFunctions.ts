import { VRMSpringBoneImporter } from "@pixiv/three-vrm";
import { Bone, Euler, Matrix4, Object3D, Quaternion, Scene, Vector3 } from 'three';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import Arm from '../components/IKArm';
import IKArmLeft from '../components/IKArmLeft';
import IKArmRight from '../components/IKArmRight';
import { IKAvatarLegs } from "../components/IKAvatarLegs";
import { IKAvatarRig } from "../components/IKAvatarRig";
import IKAvatarShoulders from '../components/IKAvatarShoulders';
import { Leg } from '../components/IKLeg';
import { LeftLeg } from '../components/IKLegLeft';
import { RightLeg } from '../components/IKLegRight';
import XRPose from "../components/XRPose";
import skeletonString from '../constants/Skeleton';
import { Side } from '../enums/Side';
import { AnimationMapping, copySkeleton, countCharacters, findArmature, findClosestParentBone, findEye, findFinger, findFoot, findFurthestParentBone, findHand, findHead, findHips, findShoulder, findSpine, getTailBones, importSkeleton } from '../functions/AvatarMathFunctions';
import { fixSkeletonZForward } from '../functions/SkeletonUtils';
import { copyTransform, getWorldPosition, getWorldQuaternion, updateMatrix, updateMatrixMatrixWorld, updateMatrixWorld } from "./UnityHelpers";

const localMatrix = new Matrix4();

export const upRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 0.5);
export const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
export const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI * 0.5);

const z180Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
const bankLeftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI/2);
const bankRightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI/2);

const localVector = new Vector3();
const localVector2 = new Vector3();
const forwardVector = new Vector3(0, 0, 1);

const stepRate = 0.2;
const stepHeight = 0.2;
const stepMinDistance = 0;
const stepMaxDistance = 0.25;
const stepRestitutionDistance = 0.8;
const minHmdVelocityTimeFactor = 0.015;
const maxVelocity = 0.015;
const velocityRestitutionFactor = 25;
const crossStepFactor = 0.9;
const zeroVector = new Vector3();
const oneVector = new Vector3(1, 1, 1);
const downHalfRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);

const localVector3 = new Vector3();
const localVector4 = new Vector3();
const localVector5 = new Vector3();
const localVector6 = new Vector3();
const localQuaternion = new Quaternion();
const localQuaternion2 = new Quaternion();
const localQuaternion3 = new Quaternion();
const localEuler = new Euler();
const localMatrix2 = new Matrix4();
const localMatrix3 = new Matrix4();

const FINGER_SPECS = [
  [2, 'thumb0'],
  [3, 'thumb1'],
  [4, 'thumb2'],

  // [6, 'indexFinger0'],
  [7, 'indexFinger1'],
  [8, 'indexFinger2'],
  [9, 'indexFinger3'],

  // [11, 'middleFinger0'],
  [12, 'middleFinger1'],
  [13, 'middleFinger2'],
  [14, 'middleFinger3'],

  // [16, 'ringFinger0'],
  [17, 'ringFinger1'],
  [18, 'ringFinger2'],
  [19, 'ringFinger3'],

  // [21, 'littleFinger0'],
  [22, 'littleFinger1'],
  [23, 'littleFinger2'],
  [24, 'littleFinger3'],
];

const _makeFingers = () => {
  const result = Array(25);
  for (let i = 0; i < result.length; i++) {
    result[i] = new Object3D();
  }
  return result;
};

export const initializeAvatarRig = (entity) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);
  avatarRig.options = { top: true, bottom: true, visemes: true, hair: true, fingers: true }
  const model = (() => {
    let o = avatarRig.object;
    if (!o) {
      const object = new Scene();

      const skinnedMesh = new Object3D();
      skinnedMesh["isSkinnedMesh"] = true;
      skinnedMesh["skeleton"] = null;
      skinnedMesh["bind"] = (skeleton) => {
        skinnedMesh["skeleton"] = skeleton;
      };
      skinnedMesh["bind"](importSkeleton(skeletonString));
      object.add(skinnedMesh);

      const hips = findHips(skinnedMesh["skeleton"]);
      const armature = findArmature(hips);
      object.add(armature);

      o = object;
    }
    return o;
  })();
  avatarRig.model = model;

  model.updateMatrixWorld(true);
  const skinnedMeshes = [];
  model.traverse(o => {
    if (o.isSkinnedMesh) {
      skinnedMeshes.push(o);
    }
  });
  skinnedMeshes.sort((a, b) => b.skeleton.bones.length - a.skeleton.bones.length);
  avatarRig.skinnedMeshes = skinnedMeshes;

  const skeletonSkinnedMesh = skinnedMeshes.find(o => o.skeleton.bones[0].parent) || null;
  const skeleton = skeletonSkinnedMesh && skeletonSkinnedMesh.skeleton;
  // console.log('got skeleton', skinnedMeshes, skeleton, _exportSkeleton(skeleton));
  const poseSkeletonSkinnedMesh = skeleton ? skinnedMeshes.find(o => o.skeleton !== skeleton && o.skeleton.bones.length >= skeleton.bones.length) : null;
  const poseSkeleton = poseSkeletonSkinnedMesh && poseSkeletonSkinnedMesh.skeleton;
  if (poseSkeleton) {
    copySkeleton(poseSkeleton, skeleton);
    poseSkeletonSkinnedMesh.bind(skeleton);
  }

  const _getOptional = o => o || new Bone();
  const _ensureParent = (o, parent?) => {
    if (!o.parent) {
      if (!parent) {
        parent = new Bone();
      }
      parent.add(o);
    }
    return o.parent;
  };

  const tailBones = getTailBones(skeleton);
  // const tailBones = skeleton.bones.filter(bone => bone.children.length === 0);
  const Eye_L = findEye(tailBones, true);
  const Eye_R = findEye(tailBones, false);
  const Head = findHead(tailBones);
  const Neck = Head.parent;
  const Chest = Neck.parent;
  const Hips = findHips(skeleton);
  const Spine = findSpine(Chest, Hips);
  const Left_shoulder = findShoulder(tailBones, true);
  const Left_wrist = findHand(Left_shoulder);
  const Left_thumb2 = _getOptional(findFinger(Left_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02l|l_thumb3|thumb002l/i));
  const Left_thumb1 = _ensureParent(Left_thumb2);
  const Left_thumb0 = _ensureParent(Left_thumb1, Left_wrist);
  const Left_indexFinger3 = _getOptional(findFinger(Left_wrist, /index(?:finger)?3|index_distal|index02l|indexfinger3_l|index002l/i));
  const Left_indexFinger2 = _ensureParent(Left_indexFinger3);
  const Left_indexFinger1 = _ensureParent(Left_indexFinger2, Left_wrist);
  const Left_middleFinger3 = _getOptional(findFinger(Left_wrist, /middle(?:finger)?3|middle_distal|middle02l|middlefinger3_l|middle002l/i));
  const Left_middleFinger2 = _ensureParent(Left_middleFinger3);
  const Left_middleFinger1 = _ensureParent(Left_middleFinger2, Left_wrist);
  const Left_ringFinger3 = _getOptional(findFinger(Left_wrist, /ring(?:finger)?3|ring_distal|ring02l|ringfinger3_l|ring002l/i));
  const Left_ringFinger2 = _ensureParent(Left_ringFinger3);
  const Left_ringFinger1 = _ensureParent(Left_ringFinger2, Left_wrist);
  const Left_littleFinger3 = _getOptional(findFinger(Left_wrist, /little(?:finger)?3|pinky3|little_distal|little02l|lifflefinger3_l|little002l/i));
  const Left_littleFinger2 = _ensureParent(Left_littleFinger3);
  const Left_littleFinger1 = _ensureParent(Left_littleFinger2, Left_wrist);
  const Left_elbow = Left_wrist.parent;
  const Left_arm = Left_elbow.parent;
  const Right_shoulder = findShoulder(tailBones, false);
  const Right_wrist = findHand(Right_shoulder);
  const Right_thumb2 = _getOptional(findFinger(Right_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02r|r_thumb3|thumb002r/i));
  const Right_thumb1 = _ensureParent(Right_thumb2);
  const Right_thumb0 = _ensureParent(Right_thumb1, Right_wrist);
  const Right_indexFinger3 = _getOptional(findFinger(Right_wrist, /index(?:finger)?3|index_distal|index02r|indexfinger3_r|index002r/i));
  const Right_indexFinger2 = _ensureParent(Right_indexFinger3);
  const Right_indexFinger1 = _ensureParent(Right_indexFinger2, Right_wrist);
  const Right_middleFinger3 = _getOptional(findFinger(Right_wrist, /middle(?:finger)?3|middle_distal|middle02r|middlefinger3_r|middle002r/i));
  const Right_middleFinger2 = _ensureParent(Right_middleFinger3);
  const Right_middleFinger1 = _ensureParent(Right_middleFinger2, Right_wrist);
  const Right_ringFinger3 = _getOptional(findFinger(Right_wrist, /ring(?:finger)?3|ring_distal|ring02r|ringfinger3_r|ring002r/i));
  const Right_ringFinger2 = _ensureParent(Right_ringFinger3);
  const Right_ringFinger1 = _ensureParent(Right_ringFinger2, Right_wrist);
  const Right_littleFinger3 = _getOptional(findFinger(Right_wrist, /little(?:finger)?3|pinky3|little_distal|little02r|lifflefinger3_r|little002r/i));
  const Right_littleFinger2 = _ensureParent(Right_littleFinger3);
  const Right_littleFinger1 = _ensureParent(Right_littleFinger2, Right_wrist);
  const Right_elbow = Right_wrist.parent;
  const Right_arm = Right_elbow.parent;
  const Left_ankle = findFoot(tailBones, true);
  const Left_knee = Left_ankle.parent;
  const Left_leg = Left_knee.parent;
  const Right_ankle = findFoot(tailBones, false);
  const Right_knee = Right_ankle.parent;
  const Right_leg = Right_knee.parent;
  const modelBones = {
    Hips,
    Spine,
    Chest,
    Neck,
    Head,
    /* Eye_L,
    Eye_R, */

    Left_shoulder,
    Left_arm,
    Left_elbow,
    Left_wrist,
    Left_thumb2,
    Left_thumb1,
    Left_thumb0,
    Left_indexFinger3,
    Left_indexFinger2,
    Left_indexFinger1,
    Left_middleFinger3,
    Left_middleFinger2,
    Left_middleFinger1,
    Left_ringFinger3,
    Left_ringFinger2,
    Left_ringFinger1,
    Left_littleFinger3,
    Left_littleFinger2,
    Left_littleFinger1,
    Left_leg,
    Left_knee,
    Left_ankle,

    Right_shoulder,
    Right_arm,
    Right_elbow,
    Right_wrist,
    Right_thumb2,
    Right_thumb1,
    Right_thumb0,
    Right_indexFinger3,
    Right_indexFinger2,
    Right_indexFinger1,
    Right_middleFinger3,
    Right_middleFinger2,
    Right_middleFinger1,
    Right_ringFinger3,
    Right_ringFinger2,
    Right_ringFinger1,
    Right_littleFinger3,
    Right_littleFinger2,
    Right_littleFinger1,
    Right_leg,
    Right_knee,
    Right_ankle,
  };
  avatarRig.modelBones = modelBones;
  for (const k in modelBones) {
    if (!modelBones[k]) {
      console.warn('missing bone', k);
    }
  }
  const armature = findArmature(Hips);

  const _getEyePosition = () => {
    if (Eye_L && Eye_R) {
      return Eye_L.getWorldPosition(new Vector3())
        .add(Eye_R.getWorldPosition(new Vector3()))
        .divideScalar(2);
    } else {
      const neckToHeadDiff = Head.getWorldPosition(new Vector3()).sub(Neck.getWorldPosition(new Vector3()));
      if (neckToHeadDiff.z < 0) {
        neckToHeadDiff.z *= -1;
      }
      return Head.getWorldPosition(new Vector3()).add(neckToHeadDiff);
    }
  };
  // const eyeDirection = _getEyePosition().sub(Head.getWorldPosition(new Vector3()));
  const leftArmDirection = Left_wrist.getWorldPosition(new Vector3()).sub(Head.getWorldPosition(new Vector3()));
  const flipZ = leftArmDirection.x < 0;//eyeDirection.z < 0;
  const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(armature.quaternion);
  const flipY = armatureDirection.z < -0.5;
  const legDirection = new Vector3(0, 0, -1).applyQuaternion(Left_leg.getWorldQuaternion(new Quaternion()).premultiply(armature.quaternion.clone().invert()));
  const flipLeg = legDirection.y < 0.5;
  // console.log('flip', flipZ, flipY, flipLeg);
  avatarRig.flipZ = flipZ;
  avatarRig.flipY = flipY;
  avatarRig.flipLeg = flipLeg;

  const armatureQuaternion = armature.quaternion.clone();
  const armatureMatrixInverse = armature.matrixWorld.clone().invert();
  armature.position.set(0, 0, 0);
  armature.quaternion.set(0, 0, 0, 1);
  armature.scale.set(1, 1, 1);
  armature.updateMatrix();

  Head.traverse(o => {
    o.savedPosition = o.position.clone();
    o.savedMatrixWorld = o.matrixWorld.clone();
  });

  const allHairBones = [];
  const _recurseAllHairBones = bones => {
    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];
      if (/hair/i.test(bone.name)) {
        allHairBones.push(bone);
      }
      _recurseAllHairBones(bone.children);
    }
  };
  _recurseAllHairBones(skeleton.bones);
  const hairBones = tailBones.filter(bone => /hair/i.test(bone.name)).map(bone => {
    for (; bone; bone = bone.parent) {
      if (bone.parent === Head) {
        return bone;
      }
    }
    return null;
  }).filter(bone => bone);
  avatarRig.allHairBones = allHairBones;
  avatarRig.hairBones = hairBones;

  avatarRig.springBoneManager = null;
  var springBoneManagerPromise = null;
  if (avatarRig.options.hair) {
    new Promise((accept, reject) => {
      let object;
      if (!avatarRig.object) {
        object = {};
      }
      if (!object.parser) {
        object.parser = {
          json: {
            extensions: {},
          },
        };
      }
      if (!object.parser.json.extensions) {
        object.parser.json.extensions = {};
      }
      if (!object.parser.json.extensions.VRM) {
        object.parser.json.extensions.VRM = {
          secondaryAnimation: {
            boneGroups: avatarRig.hairBones.map(hairBone => {
              const boneIndices = [];
              const _recurse = bone => {
                boneIndices.push(avatarRig.allHairBones.indexOf(bone));
                if (bone.children.length > 0) {
                  _recurse(bone.children[0]);
                }
              };
              _recurse(hairBone);
              return {
                comment: hairBone.name,
                stiffiness: 0.5,
                gravityPower: 0.2,
                gravityDir: {
                  x: 0,
                  y: -1,
                  z: 0
                },
                dragForce: 0.3,
                center: -1,
                hitRadius: 0.02,
                bones: boneIndices,
                colliderGroups: [],
              };
            }),
          },
        };
        object.parser.getDependency = async (type, nodeIndex) => {
          if (type === 'node') {
            return avatarRig.allHairBones[nodeIndex];
          } else {
            throw new Error('unsupported type');
          }
        };
      }

      springBoneManagerPromise = new VRMSpringBoneImporter().import(object)
        .then(springBoneManager => {
          avatarRig.springBoneManager = springBoneManager;
        });
    });
  }

  const findFingerBone = (r, left) => {
    const fingerTipBone = tailBones
      .filter(bone => r.test(bone.name) && findClosestParentBone(bone, bone => bone === modelBones.Left_wrist || bone === modelBones.Right_wrist))
      .sort((a, b) => {
        const aName = a.name.replace(r, '');
        const aLeftBalance = countCharacters(aName, /l/i) - countCharacters(aName, /r/i);
        const bName = b.name.replace(r, '');
        const bLeftBalance = countCharacters(bName, /l/i) - countCharacters(bName, /r/i);
        if (!left) {
          return aLeftBalance - bLeftBalance;
        } else {
          return bLeftBalance - aLeftBalance;
        }
      });
    const fingerRootBone = fingerTipBone.length > 0 ? findFurthestParentBone(fingerTipBone[0], bone => r.test(bone.name)) : null;
    return fingerRootBone;
  };
  const fingerBones = {
    left: {
      thumb: findFingerBone(/thumb/gi, true),
      index: findFingerBone(/index/gi, true),
      middle: findFingerBone(/middle/gi, true),
      ring: findFingerBone(/ring/gi, true),
      little: findFingerBone(/little/gi, true) || findFingerBone(/pinky/gi, true),
    },
    right: {
      thumb: findFingerBone(/thumb/gi, false),
      index: findFingerBone(/index/gi, false),
      middle: findFingerBone(/middle/gi, false),
      ring: findFingerBone(/ring/gi, false),
      little: findFingerBone(/little/gi, false) || findFingerBone(/pinky/gi, false),
    },
  };
  avatarRig.fingerBones = fingerBones;

  const preRotations = {};
  const _ensurePrerotation = k => {
    const boneName = modelBones[k].name;
    if (!preRotations[boneName]) {
      preRotations[boneName] = new Quaternion();
    }
    return preRotations[boneName];
  };
  if (flipY) {
    _ensurePrerotation('Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
  }
  if (flipZ) {
    _ensurePrerotation('Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  }
  if (flipLeg) {
    ['Left_leg', 'Right_leg'].forEach(k => {
      _ensurePrerotation(k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
    });
  }

  const _recurseBoneAttachments = o => {
    for (const child of o.children) {
      if (child.isBone) {
        _recurseBoneAttachments(child);
      } else {
        child.matrix
          .premultiply(localMatrix.compose(localVector.set(0, 0, 0), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI), localVector2.set(1, 1, 1)))
          .decompose(child.position, child.quaternion, child.scale);
      }
    }
  };
  _recurseBoneAttachments(modelBones['Hips']);

  const qrArm = flipZ ? Left_arm : Right_arm;
  const qrElbow = flipZ ? Left_elbow : Right_elbow;
  const qrWrist = flipZ ? Left_wrist : Right_wrist;
  const qr = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
        new Vector3(0, 0, 0),
        qrElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
          .sub(qrArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
          .applyQuaternion(armatureQuaternion),
        new Vector3(0, 1, 0),
      ))
    );
  const qr2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
        new Vector3(0, 0, 0),
        qrWrist.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
          .sub(qrElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
          .applyQuaternion(armatureQuaternion),
        new Vector3(0, 1, 0),
      ))
    );
  const qlArm = flipZ ? Right_arm : Left_arm;
  const qlElbow = flipZ ? Right_elbow : Left_elbow;
  const qlWrist = flipZ ? Right_wrist : Left_wrist;
  const ql = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
        new Vector3(0, 0, 0),
        qlElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
          .sub(qlArm.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
          .applyQuaternion(armatureQuaternion),
        new Vector3(0, 1, 0),
      ))
    );
  const ql2 = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
    .premultiply(
      new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(
        new Vector3(0, 0, 0),
        qlWrist.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse)
          .sub(qlElbow.getWorldPosition(new Vector3()).applyMatrix4(armatureMatrixInverse))
          .applyQuaternion(armatureQuaternion),
        new Vector3(0, 1, 0),
      ))
    );

  _ensurePrerotation('Right_arm')
    .multiply(qr.clone().invert());
  _ensurePrerotation('Right_elbow')
    .multiply(qr.clone())
    .premultiply(qr2.clone().invert());
  _ensurePrerotation('Left_arm')
    .multiply(ql.clone().invert());
  _ensurePrerotation('Left_elbow')
    .multiply(ql.clone())
    .premultiply(ql2.clone().invert());

  _ensurePrerotation('Left_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
  _ensurePrerotation('Right_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));

  for (const k in preRotations) {
    preRotations[k].invert();
  }
  fixSkeletonZForward(armature.children[0], {
    preRotations,
  });
  model.traverse(o => {
    if (o.isSkinnedMesh) {
      o.bind((o.skeleton.bones.length === skeleton.bones.length && o.skeleton.bones.every((bone, i) => bone === skeleton.bones[i])) ? skeleton : o.skeleton);
    }
  });
  if (flipY) {
    modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
  }
  if (!flipZ) {
    /* ['Left_arm', 'Right_arm'].forEach((name, i) => {
      const bone = modelBones[name];
      if (bone) {
        bone.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), (i === 0 ? 1 : -1) * Math.PI*0.25));
      }
    }); */
  } else {
    modelBones.Hips.quaternion.premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
  }
  modelBones.Right_arm.quaternion.premultiply(qr.clone().invert());
  modelBones.Right_elbow.quaternion
    .premultiply(qr)
    .premultiply(qr2.clone().invert());
  modelBones.Left_arm.quaternion.premultiply(ql.clone().invert());
  modelBones.Left_elbow.quaternion
    .premultiply(ql)
    .premultiply(ql2.clone().invert());
  model.updateMatrixWorld(true);

  Hips.traverse(bone => {
    if (bone.isBone) {
      bone.initialQuaternion = bone.quaternion.clone();
    }
  });

  const _averagePoint = points => {
    const result = new Vector3();
    for (let i = 0; i < points.length; i++) {
      result.add(points[i]);
    }
    result.divideScalar(points.length);
    return result;
  };
  const eyePosition = _getEyePosition();


  addComponent(entity, XRPose);
  const pose = getMutableComponent(entity, XRPose);

  pose.head = new Object3D();
  pose.leftHand = new Object3D();
  pose.leftHand.pointer = 0;
  pose.leftHand.grip = 0;
  pose.leftHand.fingers = _makeFingers();
  pose.leftHand.leftThumb0 = pose.leftHand.fingers[1];
  pose.leftHand.leftThumb1 = pose.leftHand.fingers[2];
  pose.leftHand.leftThumb2 = pose.leftHand.fingers[3];
  pose.leftHand.leftIndexFinger1 = pose.leftHand.fingers[6];
  pose.leftHand.leftIndexFinger2 = pose.leftHand.fingers[7];
  pose.leftHand.leftIndexFinger3 = pose.leftHand.fingers[8];
  pose.leftHand.leftMiddleFinger1 = pose.leftHand.fingers[11];
  pose.leftHand.leftMiddleFinger2 = pose.leftHand.fingers[12];
  pose.leftHand.leftMiddleFinger3 = pose.leftHand.fingers[13];
  pose.leftHand.leftRingFinger1 = pose.leftHand.fingers[16];
  pose.leftHand.leftRingFinger2 = pose.leftHand.fingers[17];
  pose.leftHand.leftRingFinger3 = pose.leftHand.fingers[18];
  pose.leftHand.leftLittleFinger1 = pose.leftHand.fingers[21];
  pose.leftHand.leftLittleFinger2 = pose.leftHand.fingers[22];
  pose.leftHand.leftLittleFinger3 = pose.leftHand.fingers[23];

  pose.rightHand = new Object3D();
  pose.rightHand.pointer = 0;
  pose.rightHand.grip = 0;
  pose.rightHand.fingers = _makeFingers();
  pose.rightHand.rightThumb0 = pose.rightHand.fingers[1];
  pose.rightHand.rightThumb1 = pose.rightHand.fingers[2];
  pose.rightHand.rightThumb2 = pose.rightHand.fingers[3];
  pose.rightHand.rightIndexFinger1 = pose.rightHand.fingers[6];
  pose.rightHand.rightIndexFinger2 = pose.rightHand.fingers[7];
  pose.rightHand.rightIndexFinger3 = pose.rightHand.fingers[8];
  pose.rightHand.rightMiddleFinger1 = pose.rightHand.fingers[11];
  pose.rightHand.rightMiddleFinger2 = pose.rightHand.fingers[12];
  pose.rightHand.rightMiddleFinger3 = pose.rightHand.fingers[13];
  pose.rightHand.rightRingFinger1 = pose.rightHand.fingers[16];
  pose.rightHand.rightRingFinger2 = pose.rightHand.fingers[17];
  pose.rightHand.rightRingFinger3 = pose.rightHand.fingers[18];
  pose.rightHand.rightLittleFinger1 = pose.rightHand.fingers[21];
  pose.rightHand.rightLittleFinger2 = pose.rightHand.fingers[22];
  pose.rightHand.rightLittleFinger3 = pose.rightHand.fingers[23];

  pose.floorHeight = 0;

  // Oculus uses a different reference position -> 0 is the reference head position if the user is standing in the middle of the room. 
  // In OpenVR, the 0 position is the ground position and the user is then at (0, playerHeightHmd, 0) if he is in the middle of the room, so I need to correct this for shoulder calculation 
  // this.vrSystemOffsetHeight = 0.0;
  pose.referencePlayerHeightHmd = 1.7;
  pose.referencePlayerWidthWrist = 1.39;
  pose.playerHeightHmd = 1.70;
  pose.playerWidthWrist = 1.39;
  pose
  addComponent(entity, IKAvatarShoulders);

  addComponent(entity, IKAvatarLegs);
  const avatarLegs = getMutableComponent(entity, IKAvatarLegs);

  const fingerBoneMap = {
    left: [
      {
        bones: [avatarRig.pose.vrTransforms.leftHand.leftThumb0, avatarRig.pose.vrTransforms.leftHand.leftThumb1, avatarRig.pose.vrTransforms.leftHand.leftThumb2],
        finger: 'thumb',
      },
      {
        bones: [avatarRig.pose.vrTransforms.leftHand.leftIndexFinger1, avatarRig.pose.vrTransforms.leftHand.leftIndexFinger2, avatarRig.pose.vrTransforms.leftHand.leftIndexFinger3],
        finger: 'index',
      },
      {
        bones: [avatarRig.pose.vrTransforms.leftHand.leftMiddleFinger1, avatarRig.pose.vrTransforms.leftHand.leftMiddleFinger2, avatarRig.pose.vrTransforms.leftHand.leftMiddleFinger3],
        finger: 'middle',
      },
      {
        bones: [avatarRig.pose.vrTransforms.leftHand.leftRingFinger1, avatarRig.pose.vrTransforms.leftHand.leftRingFinger2, avatarRig.pose.vrTransforms.leftHand.leftRingFinger3],
        finger: 'ring',
      },
      {
        bones: [avatarRig.pose.vrTransforms.leftHand.leftLittleFinger1, avatarRig.pose.vrTransforms.leftHand.leftLittleFinger2, avatarRig.pose.vrTransforms.leftHand.leftLittleFinger3],
        finger: 'little',
      },
    ],
    right: [
      {
        bones: [avatarRig.pose.vrTransforms.rightHand.rightThumb0, avatarRig.pose.vrTransforms.rightHand.rightThumb1, avatarRig.pose.vrTransforms.rightHand.rightThumb2],
        finger: 'thumb',
      },
      {
        bones: [avatarRig.pose.vrTransforms.rightHand.rightIndexFinger1, avatarRig.pose.vrTransforms.rightHand.rightIndexFinger2, avatarRig.pose.vrTransforms.rightHand.rightIndexFinger3],
        finger: 'index',
      },
      {
        bones: [avatarRig.pose.vrTransforms.rightHand.rightMiddleFinger1, avatarRig.pose.vrTransforms.rightHand.rightMiddleFinger2, avatarRig.pose.vrTransforms.rightHand.rightMiddleFinger3],
        finger: 'middle',
      },
      {
        bones: [avatarRig.pose.vrTransforms.rightHand.rightRingFinger1, avatarRig.pose.vrTransforms.rightHand.rightRingFinger2, avatarRig.pose.vrTransforms.rightHand.rightRingFinger3],
        finger: 'ring',
      },
      {
        bones: [avatarRig.pose.vrTransforms.rightHand.rightLittleFinger1, avatarRig.pose.vrTransforms.rightHand.rightLittleFinger2, avatarRig.pose.vrTransforms.rightHand.rightLittleFinger3],
        finger: 'little',
      },
    ],
  };
  avatarRig.fingerBoneMap = fingerBoneMap;

  const _getOffset = (bone, parent = bone.parent) => bone.getWorldPosition(new Vector3()).sub(parent.getWorldPosition(new Vector3()));

  const avatarShoulders = getMutableComponent(entity, IKAvatarShoulders)

  avatarShoulders.spine.position.copy(_getOffset(modelBones.Spine));
  avatarShoulders.transform.position.copy(_getOffset(modelBones.Chest, modelBones.Spine));
  avatarShoulders.neck.position.copy(_getOffset(modelBones.Neck));
  avatarShoulders.head.position.copy(_getOffset(modelBones.Head));
  avatarShoulders.eyes.position.copy(eyePosition.clone().sub(Head.getWorldPosition(new Vector3())));

  avatarShoulders.leftShoulderAnchor.position.copy(_getOffset(modelBones.Left_shoulder));
  avatarShoulders.leftArm.upperArm.position.copy(_getOffset(modelBones.Left_arm));
  avatarShoulders.leftArm.lowerArm.position.copy(_getOffset(modelBones.Left_elbow));
  avatarShoulders.leftArm.hand.position.copy(_getOffset(modelBones.Left_wrist));
  avatarShoulders.leftArm.thumb2.position.copy(_getOffset(modelBones.Left_thumb2));
  avatarShoulders.leftArm.thumb1.position.copy(_getOffset(modelBones.Left_thumb1));
  avatarShoulders.leftArm.thumb0.position.copy(_getOffset(modelBones.Left_thumb0));
  avatarShoulders.leftArm.indexFinger3.position.copy(_getOffset(modelBones.Left_indexFinger3));
  avatarShoulders.leftArm.indexFinger2.position.copy(_getOffset(modelBones.Left_indexFinger2));
  avatarShoulders.leftArm.indexFinger1.position.copy(_getOffset(modelBones.Left_indexFinger1));
  avatarShoulders.leftArm.middleFinger3.position.copy(_getOffset(modelBones.Left_middleFinger3));
  avatarShoulders.leftArm.middleFinger2.position.copy(_getOffset(modelBones.Left_middleFinger2));
  avatarShoulders.leftArm.middleFinger1.position.copy(_getOffset(modelBones.Left_middleFinger1));
  avatarShoulders.leftArm.ringFinger3.position.copy(_getOffset(modelBones.Left_ringFinger3));
  avatarShoulders.leftArm.ringFinger2.position.copy(_getOffset(modelBones.Left_ringFinger2));
  avatarShoulders.leftArm.ringFinger1.position.copy(_getOffset(modelBones.Left_ringFinger1));
  avatarShoulders.leftArm.littleFinger3.position.copy(_getOffset(modelBones.Left_littleFinger3));
  avatarShoulders.leftArm.littleFinger2.position.copy(_getOffset(modelBones.Left_littleFinger2));
  avatarShoulders.leftArm.littleFinger1.position.copy(_getOffset(modelBones.Left_littleFinger1));

  avatarShoulders.rightShoulderAnchor.position.copy(_getOffset(modelBones.Right_shoulder));
  avatarShoulders.rightArm.upperArm.position.copy(_getOffset(modelBones.Right_arm));
  avatarShoulders.rightArm.lowerArm.position.copy(_getOffset(modelBones.Right_elbow));
  avatarShoulders.rightArm.hand.position.copy(_getOffset(modelBones.Right_wrist));
  avatarShoulders.rightArm.thumb2.position.copy(_getOffset(modelBones.Right_thumb2));
  avatarShoulders.rightArm.thumb1.position.copy(_getOffset(modelBones.Right_thumb1));
  avatarShoulders.rightArm.thumb0.position.copy(_getOffset(modelBones.Right_thumb0));
  avatarShoulders.rightArm.indexFinger3.position.copy(_getOffset(modelBones.Right_indexFinger3));
  avatarShoulders.rightArm.indexFinger2.position.copy(_getOffset(modelBones.Right_indexFinger2));
  avatarShoulders.rightArm.indexFinger1.position.copy(_getOffset(modelBones.Right_indexFinger1));
  avatarShoulders.rightArm.middleFinger3.position.copy(_getOffset(modelBones.Right_middleFinger3));
  avatarShoulders.rightArm.middleFinger2.position.copy(_getOffset(modelBones.Right_middleFinger2));
  avatarShoulders.rightArm.middleFinger1.position.copy(_getOffset(modelBones.Right_middleFinger1));
  avatarShoulders.rightArm.ringFinger3.position.copy(_getOffset(modelBones.Right_ringFinger3));
  avatarShoulders.rightArm.ringFinger2.position.copy(_getOffset(modelBones.Right_ringFinger2));
  avatarShoulders.rightArm.ringFinger1.position.copy(_getOffset(modelBones.Right_ringFinger1));
  avatarShoulders.rightArm.littleFinger3.position.copy(_getOffset(modelBones.Right_littleFinger3));
  avatarShoulders.rightArm.littleFinger2.position.copy(_getOffset(modelBones.Right_littleFinger2));
  avatarShoulders.rightArm.littleFinger1.position.copy(_getOffset(modelBones.Right_littleFinger1));

  avatarLegs.leftLeg.upperLeg.position.copy(_getOffset(modelBones.Left_leg));
  avatarLegs.leftLeg.lowerLeg.position.copy(_getOffset(modelBones.Left_knee));
  avatarLegs.leftLeg.foot.position.copy(_getOffset(modelBones.Left_ankle));

  avatarLegs.rightLeg.upperLeg.position.copy(_getOffset(modelBones.Right_leg));
  avatarLegs.rightLeg.lowerLeg.position.copy(_getOffset(modelBones.Right_knee));
  avatarLegs.rightLeg.foot.position.copy(_getOffset(modelBones.Right_ankle));

  avatarShoulders.hips.updateMatrixWorld();

  avatarRig.height = eyePosition.clone().sub(_averagePoint([modelBones.Left_ankle.getWorldPosition(new Vector3()), modelBones.Right_ankle.getWorldPosition(new Vector3())])).y;
  avatarRig.shoulderWidth = modelBones.Left_arm.getWorldPosition(new Vector3()).distanceTo(modelBones.Right_arm.getWorldPosition(new Vector3()));
  avatarRig.leftArmLength = avatarShoulders.leftArm.armLength;
  avatarRig.rightArmLength = avatarShoulders.rightArm.armLength;
  const indexDistance = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
    .distanceTo(modelBones.Left_wrist.getWorldPosition(new Vector3()));
  const handWidth = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
    .distanceTo(modelBones.Left_littleFinger1.getWorldPosition(new Vector3()));
  avatarRig.handOffsetLeft = new Vector3(handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
  avatarRig.handOffsetRight = new Vector3(-handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
  avatarRig.eyeToHipsOffset = modelBones.Hips.getWorldPosition(new Vector3()).sub(eyePosition);

  const _makeInput = () => {
    const result = new Object3D();
    result["pointer"] = 0;
    result["grip"] = 0;
    result["enabled"] = false;
    return result;
  };
  avatarRig.inputs = {
    hmd: _makeInput(),
    leftGamepad: _makeInput(),
    rightGamepad: _makeInput(),
  };
  avatarRig.sdkInputs = {
    hmd: avatarRig.pose.vrTransforms.head,
    leftGamepad: avatarRig.pose.vrTransforms.leftHand,
    rightGamepad: avatarRig.pose.vrTransforms.rightHand,
  };
  avatarRig.sdkInputs.hmd.scaleFactor = 1;
  avatarRig.lastModelScaleFactor = 1;
  avatarRig.outputs = {
    eyes: avatarShoulders.eyes,
    head: avatarShoulders.head,
    hips: avatarLegs.hips,
    spine: avatarShoulders.spine,
    chest: avatarShoulders.transform,
    neck: avatarShoulders.neck,
    leftShoulder: avatarShoulders.leftShoulderAnchor,
    leftUpperArm: avatarShoulders.leftArm.upperArm,
    leftLowerArm: avatarShoulders.leftArm.lowerArm,
    leftHand: avatarShoulders.leftArm.hand,
    rightShoulder: avatarShoulders.rightShoulderAnchor,
    rightUpperArm: avatarShoulders.rightArm.upperArm,
    rightLowerArm: avatarShoulders.rightArm.lowerArm,
    rightHand: avatarShoulders.rightArm.hand,
    leftUpperLeg: avatarLegs.leftLeg.upperLeg,
    leftLowerLeg: avatarLegs.leftLeg.lowerLeg,
    leftFoot: avatarLegs.leftLeg.foot,
    rightUpperLeg: avatarLegs.rightLeg.upperLeg,
    rightLowerLeg: avatarLegs.rightLeg.lowerLeg,
    rightFoot: avatarLegs.rightLeg.foot,
    leftThumb2: avatarShoulders.rightArm.thumb2,
    leftThumb1: avatarShoulders.rightArm.thumb1,
    leftThumb0: avatarShoulders.rightArm.thumb0,
    leftIndexFinger3: avatarShoulders.rightArm.indexFinger3,
    leftIndexFinger2: avatarShoulders.rightArm.indexFinger2,
    leftIndexFinger1: avatarShoulders.rightArm.indexFinger1,
    leftMiddleFinger3: avatarShoulders.rightArm.middleFinger3,
    leftMiddleFinger2: avatarShoulders.rightArm.middleFinger2,
    leftMiddleFinger1: avatarShoulders.rightArm.middleFinger1,
    leftRingFinger3: avatarShoulders.rightArm.ringFinger3,
    leftRingFinger2: avatarShoulders.rightArm.ringFinger2,
    leftRingFinger1: avatarShoulders.rightArm.ringFinger1,
    leftLittleFinger3: avatarShoulders.rightArm.littleFinger3,
    leftLittleFinger2: avatarShoulders.rightArm.littleFinger2,
    leftLittleFinger1: avatarShoulders.rightArm.littleFinger1,
    rightThumb2: avatarShoulders.leftArm.thumb2,
    rightThumb1: avatarShoulders.leftArm.thumb1,
    rightThumb0: avatarShoulders.leftArm.thumb0,
    rightIndexFinger3: avatarShoulders.leftArm.indexFinger3,
    rightIndexFinger2: avatarShoulders.leftArm.indexFinger2,
    rightIndexFinger1: avatarShoulders.leftArm.indexFinger1,
    rightMiddleFinger3: avatarShoulders.leftArm.middleFinger3,
    rightMiddleFinger2: avatarShoulders.leftArm.middleFinger2,
    rightMiddleFinger1: avatarShoulders.leftArm.middleFinger1,
    rightRingFinger3: avatarShoulders.leftArm.ringFinger3,
    rightRingFinger2: avatarShoulders.leftArm.ringFinger2,
    rightRingFinger1: avatarShoulders.leftArm.ringFinger1,
    rightLittleFinger3: avatarShoulders.leftArm.littleFinger3,
    rightLittleFinger2: avatarShoulders.leftArm.littleFinger2,
    rightLittleFinger1: avatarShoulders.leftArm.littleFinger1,
  };
  avatarRig.modelBoneOutputs = {
    Hips: avatarRig.outputs.hips,
    Spine: avatarRig.outputs.spine,
    Chest: avatarRig.outputs.chest,
    Neck: avatarRig.outputs.neck,
    Head: avatarRig.outputs.head,

    Left_shoulder: avatarRig.outputs.rightShoulder,
    Left_arm: avatarRig.outputs.rightUpperArm,
    Left_elbow: avatarRig.outputs.rightLowerArm,
    Left_wrist: avatarRig.outputs.rightHand,
    Left_thumb2: avatarRig.outputs.leftThumb2,
    Left_thumb1: avatarRig.outputs.leftThumb1,
    Left_thumb0: avatarRig.outputs.leftThumb0,
    Left_indexFinger3: avatarRig.outputs.leftIndexFinger3,
    Left_indexFinger2: avatarRig.outputs.leftIndexFinger2,
    Left_indexFinger1: avatarRig.outputs.leftIndexFinger1,
    Left_middleFinger3: avatarRig.outputs.leftMiddleFinger3,
    Left_middleFinger2: avatarRig.outputs.leftMiddleFinger2,
    Left_middleFinger1: avatarRig.outputs.leftMiddleFinger1,
    Left_ringFinger3: avatarRig.outputs.leftRingFinger3,
    Left_ringFinger2: avatarRig.outputs.leftRingFinger2,
    Left_ringFinger1: avatarRig.outputs.leftRingFinger1,
    Left_littleFinger3: avatarRig.outputs.leftLittleFinger3,
    Left_littleFinger2: avatarRig.outputs.leftLittleFinger2,
    Left_littleFinger1: avatarRig.outputs.leftLittleFinger1,
    Left_leg: avatarRig.outputs.rightUpperLeg,
    Left_knee: avatarRig.outputs.rightLowerLeg,
    Left_ankle: avatarRig.outputs.rightFoot,

    Right_shoulder: avatarRig.outputs.leftShoulder,
    Right_arm: avatarRig.outputs.leftUpperArm,
    Right_elbow: avatarRig.outputs.leftLowerArm,
    Right_wrist: avatarRig.outputs.leftHand,
    Right_thumb2: avatarRig.outputs.rightThumb2,
    Right_thumb1: avatarRig.outputs.rightThumb1,
    Right_thumb0: avatarRig.outputs.rightThumb0,
    Right_indexFinger3: avatarRig.outputs.rightIndexFinger3,
    Right_indexFinger2: avatarRig.outputs.rightIndexFinger2,
    Right_indexFinger1: avatarRig.outputs.rightIndexFinger1,
    Right_middleFinger3: avatarRig.outputs.rightMiddleFinger3,
    Right_middleFinger2: avatarRig.outputs.rightMiddleFinger2,
    Right_middleFinger1: avatarRig.outputs.rightMiddleFinger1,
    Right_ringFinger3: avatarRig.outputs.rightRingFinger3,
    Right_ringFinger2: avatarRig.outputs.rightRingFinger2,
    Right_ringFinger1: avatarRig.outputs.rightRingFinger1,
    Right_littleFinger3: avatarRig.outputs.rightLittleFinger3,
    Right_littleFinger2: avatarRig.outputs.rightLittleFinger2,
    Right_littleFinger1: avatarRig.outputs.rightLittleFinger1,
    Right_leg: avatarRig.outputs.leftUpperLeg,
    Right_knee: avatarRig.outputs.leftLowerLeg,
    Right_ankle: avatarRig.outputs.leftFoot,
  };

  if (avatarRig.options.visemes) {
    const vrmExtension = avatarRig.object && avatarRig.object.userData && avatarRig.object.userData.gltfExtensions && avatarRig.object.userData.gltfExtensions.VRM;
    const blendShapes = vrmExtension && vrmExtension.blendShapeMaster && vrmExtension.blendShapeMaster.blendShapeGroups;
    // ["Neutral", "A", "I", "U", "E", "O", "Blink", "Blink_L", "Blink_R", "Angry", "Fun", "Joy", "Sorrow", "Surprised"]
    const _getVrmBlendShapeIndex = r => {
      if (Array.isArray(blendShapes)) {
        const shape = blendShapes.find(blendShape => r.test(blendShape.name));
        if (shape && shape.binds && shape.binds.length > 0 && typeof shape.binds[0].index === 'number') {
          return shape.binds[0].index;
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
    avatarRig.skinnedMeshesVisemeMappings = avatarRig.skinnedMeshes.map(o => {
      const { morphTargetDictionary, morphTargetInfluences } = o;
      if (morphTargetDictionary && morphTargetInfluences) {
        const aaIndex = _getVrmBlendShapeIndex(/^a$/i) || morphTargetDictionary['vrc.v_aa'] || null;
        const blinkLeftIndex = _getVrmBlendShapeIndex(/^(?:blink_l|blinkleft)$/i) || morphTargetDictionary['vrc.blink_left'] || null;
        const blinkRightIndex = _getVrmBlendShapeIndex(/^(?:blink_r|blinkright)$/i) || morphTargetDictionary['vrc.blink_right'] || null;
        return [
          morphTargetInfluences,
          aaIndex,
          blinkLeftIndex,
          blinkRightIndex,
        ];
      } else {
        return null;
      }
    });
  } else {
    avatarRig.skinnedMeshesVisemeMappings = [];
  }

  initAvatarShoulders(entity);
  initAvatarLegs(entity);

  avatarRig.animationMappings = [
    new AnimationMapping('mixamorigHips.quaternion', avatarRig.outputs.hips.quaternion, false),
    new AnimationMapping('mixamorigSpine.quaternion', avatarRig.outputs.spine.quaternion, false),
    // new AnimationMapping('mixamorigSpine1.quaternion', null, false),
    new AnimationMapping('mixamorigSpine2.quaternion', avatarRig.outputs.chest.quaternion, false),
    new AnimationMapping('mixamorigNeck.quaternion', avatarRig.outputs.neck.quaternion, false),
    new AnimationMapping('mixamorigHead.quaternion', avatarRig.outputs.head.quaternion, false),

    new AnimationMapping('mixamorigLeftShoulder.quaternion', avatarRig.outputs.rightShoulder.quaternion, true),
    new AnimationMapping('mixamorigLeftArm.quaternion', avatarRig.outputs.rightUpperArm.quaternion, true),
    new AnimationMapping('mixamorigLeftForeArm.quaternion', avatarRig.outputs.rightLowerArm.quaternion, true),
    new AnimationMapping('mixamorigLeftHand.quaternion', avatarRig.outputs.leftHand.quaternion, true),
    new AnimationMapping('mixamorigLeftHandMiddle1.quaternion', avatarRig.outputs.leftMiddleFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandMiddle2.quaternion', avatarRig.outputs.leftMiddleFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandMiddle3.quaternion', avatarRig.outputs.leftMiddleFinger3.quaternion, true),
    new AnimationMapping('mixamorigLeftHandThumb1.quaternion', avatarRig.outputs.leftThumb0.quaternion, true),
    new AnimationMapping('mixamorigLeftHandThumb2.quaternion', avatarRig.outputs.leftThumb1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandThumb3.quaternion', avatarRig.outputs.leftThumb2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandIndex1.quaternion', avatarRig.outputs.leftIndexFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandIndex2.quaternion', avatarRig.outputs.leftIndexFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandIndex3.quaternion', avatarRig.outputs.leftIndexFinger3.quaternion, true),
    new AnimationMapping('mixamorigLeftHandRing1.quaternion', avatarRig.outputs.leftRingFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandRing2.quaternion', avatarRig.outputs.leftRingFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandRing3.quaternion', avatarRig.outputs.leftRingFinger3.quaternion, true),
    new AnimationMapping('mixamorigLeftHandPinky1.quaternion', avatarRig.outputs.leftLittleFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandPinky2.quaternion', avatarRig.outputs.leftLittleFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandPinky3.quaternion', avatarRig.outputs.leftLittleFinger3.quaternion, true),

    new AnimationMapping('mixamorigRightShoulder.quaternion', avatarRig.outputs.leftShoulder.quaternion, true),
    new AnimationMapping('mixamorigRightArm.quaternion', avatarRig.outputs.leftUpperArm.quaternion, true),
    new AnimationMapping('mixamorigRightForeArm.quaternion', avatarRig.outputs.leftLowerArm.quaternion, true),
    new AnimationMapping('mixamorigRightHand.quaternion', avatarRig.outputs.rightHand.quaternion, true),
    new AnimationMapping('mixamorigRightHandMiddle1.quaternion', avatarRig.outputs.rightMiddleFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandMiddle2.quaternion', avatarRig.outputs.rightMiddleFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandMiddle3.quaternion', avatarRig.outputs.rightMiddleFinger3.quaternion, true),
    new AnimationMapping('mixamorigRightHandThumb1.quaternion', avatarRig.outputs.rightThumb0.quaternion, true),
    new AnimationMapping('mixamorigRightHandThumb2.quaternion', avatarRig.outputs.rightThumb1.quaternion, true),
    new AnimationMapping('mixamorigRightHandThumb3.quaternion', avatarRig.outputs.rightThumb2.quaternion, true),
    new AnimationMapping('mixamorigRightHandIndex1.quaternion', avatarRig.outputs.rightIndexFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandIndex2.quaternion', avatarRig.outputs.rightIndexFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandIndex3.quaternion', avatarRig.outputs.rightIndexFinger3.quaternion, true),
    new AnimationMapping('mixamorigRightHandRing1.quaternion', avatarRig.outputs.rightRingFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandRing2.quaternion', avatarRig.outputs.rightRingFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandRing3.quaternion', avatarRig.outputs.rightRingFinger3.quaternion, true),
    new AnimationMapping('mixamorigRightHandPinky1.quaternion', avatarRig.outputs.rightLittleFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandPinky2.quaternion', avatarRig.outputs.rightLittleFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandPinky3.quaternion', avatarRig.outputs.rightLittleFinger3.quaternion, true),

    new AnimationMapping('mixamorigRightUpLeg.quaternion', avatarRig.outputs.leftUpperLeg.quaternion, false),
    new AnimationMapping('mixamorigRightLeg.quaternion', avatarRig.outputs.leftLowerLeg.quaternion, false),
    new AnimationMapping('mixamorigRightFoot.quaternion', avatarRig.outputs.leftFoot.quaternion, false),
    // new AnimationMapping('mixamorigRightToeBase.quaternion', null, false),

    new AnimationMapping('mixamorigLeftUpLeg.quaternion', avatarRig.outputs.rightUpperLeg.quaternion, false),
    new AnimationMapping('mixamorigLeftLeg.quaternion', avatarRig.outputs.rightLowerLeg.quaternion, false),
    new AnimationMapping('mixamorigLeftFoot.quaternion', avatarRig.outputs.rightFoot.quaternion, false),
    // new AnimationMapping('mixamorigLeftToeBase.quaternion', null, false),
  ];
}

const updateIKArm = (entity, side: Side) => {
  const armIK = getMutableComponent(entity, side === Side.Left ? IKArmLeft : IKArmRight);
  const avatarShoulders = getMutableComponent(entity, IKAvatarShoulders);

  updateMatrixWorld(armIK.transform);
  updateMatrixWorld(armIK.upperArm);

  const upperArmPosition = getWorldPosition(armIK.upperArm, localVector);
  const handRotation = armIK.target.quaternion;
  const handPosition = localVector2.copy(armIK.target.position);

  const shoulderRotation = getWorldQuaternion(avatarShoulders.transform, localQuaternion);
  const shoulderRotationInverse = localQuaternion2.copy(shoulderRotation).invert();

  const hypotenuseDistance = armIK.upperArmLength;
  const directDistance = upperArmPosition.distanceTo(handPosition) / 2;
  const offsetDistance = hypotenuseDistance > directDistance ? Math.sqrt(hypotenuseDistance * hypotenuseDistance - directDistance * directDistance) : 0;
  const offsetDirection = localVector3.copy(handPosition).sub(upperArmPosition)
    .normalize()
    .cross(localVector4.set(-1, 0, 0).applyQuaternion(shoulderRotation));

  const targetEuler = localEuler.setFromQuaternion(
    localQuaternion3
      .multiplyQuaternions(handRotation, shoulderRotationInverse)
      .premultiply(z180Quaternion),
    'XYZ'
  );
  if (side === Side.Left) {
    const yFactor = Math.min(Math.max((targetEuler.y + Math.PI * 0.1) / (Math.PI / 2), 0), 1);
    targetEuler.z = Math.min(Math.max(targetEuler.z, -Math.PI / 2), 0);
    targetEuler.z = (targetEuler.z * (1 - yFactor)) + (-Math.PI / 2 * yFactor);
  } else {
    const yFactor = Math.min(Math.max((-targetEuler.y - Math.PI * 0.1) / (Math.PI / 2), 0), 1);
    targetEuler.z = Math.min(Math.max(targetEuler.z, 0), Math.PI / 2);
    targetEuler.z = (targetEuler.z * (1 - yFactor)) + (Math.PI / 2 * yFactor);
  }
  offsetDirection
    .applyQuaternion(shoulderRotationInverse)
    .applyAxisAngle(forwardVector, targetEuler.z)
    .applyQuaternion(shoulderRotation);

  const elbowPosition = localVector4.copy(upperArmPosition).add(handPosition).divideScalar(2)
    .add(localVector5.copy(offsetDirection).multiplyScalar(offsetDistance));
  const upVector = localVector5.set(side === Side.Left ? -1 : 1, 0, 0).applyQuaternion(shoulderRotation);
  armIK.upperArm.quaternion.setFromRotationMatrix(
    localMatrix.lookAt(
      zeroVector,
      localVector6.copy(elbowPosition).sub(upperArmPosition),
      upVector
    )
  )
    .multiply(side === Side.Left ? rightRotation : leftRotation)
    .premultiply(getWorldQuaternion(armIK.upperArm.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.upperArm);

  // this.arm.lowerArm.position = elbowPosition;
  armIK.lowerArm.quaternion.setFromRotationMatrix(
    localMatrix.lookAt(
      zeroVector,
      localVector6.copy(handPosition).sub(elbowPosition),
      upVector
    )
  )
    .multiply(side === Side.Left ? rightRotation : leftRotation)
    .premultiply(getWorldQuaternion(armIK.lowerArm.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.lowerArm);

  // this.arm.hand.position = handPosition;
  armIK.hand.quaternion.copy(armIK.target.quaternion)
    .multiply(side === Side.Left ? bankRightRotation : bankLeftRotation)
    .premultiply(getWorldQuaternion(armIK.hand.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.hand);

  for (const fingerSpec of FINGER_SPECS) {
    const [index, key] = fingerSpec;
    armIK[key].quaternion.copy(armIK.target.fingers[index].quaternion);
    updateMatrixMatrixWorld(armIK[key]);
  }
}

export const updateAvatarShoulders = (entity, delta) => {
  const shoulders = getMutableComponent(entity, IKAvatarShoulders);
  shoulders.spine.quaternion.set(0, 0, 0, 1);

  // Update hips

  let hmdRotation = localQuaternion.copy(shoulders.head.quaternion)
  .multiply(z180Quaternion);
let hmdEuler = localEuler.setFromQuaternion(hmdRotation, 'YXZ');
hmdEuler.x = 0;
hmdEuler.z = 0;
let hmdXYRotation = localQuaternion2.setFromEuler(hmdEuler);

const headPosition = localVector.copy(shoulders.head.position)
  .sub(localVector2.copy(shoulders.eyes.position).applyQuaternion(hmdRotation));
const neckPosition = headPosition.sub(localVector2.copy(shoulders.head.position).applyQuaternion(hmdRotation));
const chestPosition = neckPosition.sub(localVector2.copy(shoulders.neck.position).applyQuaternion(hmdXYRotation));
const spinePosition = chestPosition.sub(localVector2.copy(shoulders.transform.position).applyQuaternion(hmdXYRotation));
const hipsPosition = spinePosition.sub(localVector2.copy(shoulders.spine.position).applyQuaternion(hmdXYRotation));

shoulders.hips.position.copy(hipsPosition);
if (shoulders.rig?.legsManager?.enabled) {
  shoulders.hips.quaternion.copy(hmdXYRotation);
}
updateMatrix(shoulders.hips);
shoulders.hips.matrixWorld.copy(shoulders.hips.matrix);
updateMatrixWorld(shoulders.spine);
updateMatrixWorld(shoulders.transform);

// Update 
  
  shoulders.leftShoulderAnchor.quaternion.set(0, 0, 0, 1);
  shoulders.rightShoulderAnchor.quaternion.set(0, 0, 0, 1);


  const hipsRotation = localQuaternion.copy(shoulders.hips.quaternion)
    .multiply(z180Quaternion);
  const hipsRotationInverse = localQuaternion2.copy(hipsRotation)
    .invert();

  const distanceLeftHand = localVector.copy(shoulders.leftHand.position)
    .sub(shoulders.head.position)
    .applyQuaternion(hipsRotationInverse);
  const distanceRightHand = localVector2.copy(shoulders.rightHand.position)
    .sub(shoulders.head.position)
    .applyQuaternion(hipsRotationInverse);

  distanceLeftHand.y = 0;
  distanceRightHand.y = 0;

  const leftBehind = distanceLeftHand.z > 0;
  const rightBehind = distanceRightHand.z > 0;
  if (leftBehind) {
    distanceLeftHand.z *= rightBehind ? -2 : -1;
  }
  if (rightBehind) {
    distanceRightHand.z *= leftBehind ? -2 : -1;
  }

  const combinedDirection = localVector.addVectors(distanceLeftHand.normalize(), distanceRightHand.normalize());
  const angleY = Math.atan2(combinedDirection.x, combinedDirection.z);

  shoulders.transform.quaternion.setFromEuler(localEuler.set(0, angleY, 0, 'YXZ'))
    .premultiply(
      localQuaternion.copy(shoulders.hips.quaternion)
      .multiply(z180Quaternion)
    );

  shoulders.transform.quaternion
    .premultiply(getWorldQuaternion(shoulders.transform.parent, localQuaternion).invert());
  updateMatrixMatrixWorld(shoulders.transform);
  updateMatrixWorld(shoulders.leftShoulderAnchor);
  updateMatrixWorld(shoulders.rightShoulderAnchor);
  

  hmdRotation = localQuaternion.copy(shoulders.head.quaternion)
    .multiply(z180Quaternion);

  hmdEuler = localEuler.setFromQuaternion(hmdRotation, 'YXZ');
  hmdEuler.x = 0;
  hmdEuler.z = 0;
  hmdXYRotation = localQuaternion2.setFromEuler(hmdEuler);

  shoulders.neck.quaternion.copy(hmdXYRotation)
    .premultiply(getWorldQuaternion(shoulders.neck.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(shoulders.neck);

  shoulders.head.quaternion.copy(hmdRotation)
    .premultiply(getWorldQuaternion(shoulders.head.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(shoulders.head);

  updateMatrixWorld(shoulders.eyes);

  updateIKArm(entity, Side.Left);
  updateIKArm(entity, Side.Right);
}

export const initAvatarShoulders = (entity: Entity) => {
  if(hasComponent(entity, IKAvatarShoulders)) return console.log("Tried to init avatar shoulders but already init")
    addComponent(entity, IKAvatarShoulders);
  const avatarShoulders = getMutableComponent(entity, IKAvatarShoulders);

  avatarShoulders.transform = new Object3D();
  avatarShoulders.hips = new Object3D();
  avatarShoulders.spine = new Object3D();
  avatarShoulders.neck = new Object3D();
  avatarShoulders.head = new Object3D();
  avatarShoulders.eyes = new Object3D();

  avatarShoulders.hips.add(avatarShoulders.spine);
  avatarShoulders.spine.add(avatarShoulders.transform);
  avatarShoulders.transform.add(avatarShoulders.neck);
  avatarShoulders.neck.add(avatarShoulders.head);
  avatarShoulders.head.add(avatarShoulders.eyes);

  avatarShoulders.leftShoulderAnchor = new Object3D();
  avatarShoulders.transform.add(avatarShoulders.leftShoulderAnchor);
  avatarShoulders.rightShoulderAnchor = new Object3D();
  avatarShoulders.transform.add(avatarShoulders.rightShoulderAnchor);

  avatarShoulders.leftArm = (hasComponent(entity, IKArmLeft) ? getComponent(entity, IKArmLeft) : addComponent(entity, IKArmLeft)) as Arm;
  avatarShoulders.rightArm = (hasComponent(entity, IKArmRight) ? getComponent(entity, IKArmRight) : addComponent(entity, IKArmRight)) as Arm;

  initArm(entity, Side.Left);
  initArm(entity, Side.Right);

  avatarShoulders.leftShoulderAnchor.add(avatarShoulders.leftArm.transform);
  avatarShoulders.rightShoulderAnchor.add(avatarShoulders.rightArm.transform);}

const initArm = (entity, armSide) => {
  const Arm = armSide === Side.Left ? IKArmLeft : IKArmRight;
  addComponent(entity, Arm);
  const arm = getMutableComponent(entity, Arm);
  arm.transform = new Object3D();
  arm.upperArm = new Object3D();
  arm.lowerArm = new Object3D();
  arm.hand = new Object3D();
  arm.thumb0 = new Object3D();
  arm.thumb1 = new Object3D();
  arm.thumb2 = new Object3D();
  arm.indexFinger1 = new Object3D();
  arm.indexFinger2 = new Object3D();
  arm.indexFinger3 = new Object3D();
  arm.middleFinger1 = new Object3D();
  arm.middleFinger2 = new Object3D();
  arm.middleFinger3 = new Object3D();
  arm.ringFinger1 = new Object3D();
  arm.ringFinger2 = new Object3D();
  arm.ringFinger3 = new Object3D();
  arm.littleFinger1 = new Object3D();
  arm.littleFinger2 = new Object3D();
  arm.littleFinger3 = new Object3D();

  arm.transform.add(arm.upperArm);
  arm.upperArm.add(arm.lowerArm);
  arm.lowerArm.add(arm.hand);

  arm.hand.add(arm.thumb0);
  arm.thumb0.add(arm.thumb1);
  arm.thumb1.add(arm.thumb2);

  arm.hand.add(arm.indexFinger1);
  arm.indexFinger1.add(arm.indexFinger2);
  arm.indexFinger2.add(arm.indexFinger3);

  arm.hand.add(arm.middleFinger1);
  arm.middleFinger1.add(arm.middleFinger2);
  arm.middleFinger2.add(arm.middleFinger3);

  arm.hand.add(arm.ringFinger1);
  arm.ringFinger1.add(arm.ringFinger2);
  arm.ringFinger2.add(arm.ringFinger3);

  arm.hand.add(arm.littleFinger1);
  arm.littleFinger1.add(arm.littleFinger2);
  arm.littleFinger2.add(arm.littleFinger3);

  arm.target = arm.hand; // TODO: Consolidate?

  arm.upperArmLength = getWorldPosition(arm.lowerArm, localVector).distanceTo(getWorldPosition(arm.upperArm, localVector2));
  arm.lowerArmLength = getWorldPosition(arm.hand, localVector).distanceTo(getWorldPosition(arm.lowerArm, localVector2));
  arm.armLength = arm.upperArmLength + arm.lowerArmLength;
}

export const initAvatarLegs = (entity) => {
  const rig = getMutableComponent(entity, IKAvatarRig);
  const shoulders = getMutableComponent(entity, IKAvatarShoulders);
  const pose = getMutableComponent(entity, XRPose);

  if (!hasComponent(entity, IKAvatarLegs))
    addComponent(entity, IKAvatarLegs);
  const avatarLegs = getMutableComponent(entity, IKAvatarLegs);

  avatarLegs.hips = shoulders.hips;
  if(!hasComponent(entity, LeftLeg)){
    avatarLegs.leftLeg = addComponent(entity, LeftLeg) as any;
  }
  if(!hasComponent(entity, RightLeg)){
    avatarLegs.rightLeg = addComponent(entity, RightLeg)  as any;
  }

  avatarLegs.hips.add(avatarLegs.leftLeg.transform);
  avatarLegs.hips.add(avatarLegs.rightLeg.transform);

  avatarLegs.legSeparation = 0;
  avatarLegs.lastHmdPosition = new Vector3();

  avatarLegs.hmdVelocity = new Vector3();
  avatarLegs.legSeparation = getWorldPosition(avatarLegs.leftLeg.upperLeg, localVector)
    .distanceTo(getWorldPosition(avatarLegs.rightLeg.upperLeg, localVector2));
  avatarLegs.lastHmdPosition.copy(pose.head.position);
  initLeg(entity, Side.Left);
  initLeg(entity, Side.Right);
  resetAvatarLegs(entity);
};

export const resetAvatarLegs = (entity: Entity) => {
  const avatarLegs = getMutableComponent(entity, IKAvatarLegs);
  const rig = getMutableComponent(entity, IKAvatarRig);

  copyTransform(avatarLegs.leftLeg.upperLeg, rig.modelBones.Right_leg);
  copyTransform(avatarLegs.leftLeg.lowerLeg, rig.modelBones.Right_knee);
  copyTransform(avatarLegs.leftLeg.foot, rig.modelBones.Right_ankle);
  avatarLegs.leftLeg.foot.getWorldPosition(avatarLegs.leftLeg.foot["stickTransform"].position);
  avatarLegs.leftLeg.foot.getWorldQuaternion(avatarLegs.leftLeg.foot["stickTransform"].quaternion);

  copyTransform(avatarLegs.rightLeg.upperLeg, rig.modelBones.Left_leg);
  copyTransform(avatarLegs.rightLeg.lowerLeg, rig.modelBones.Left_knee);
  copyTransform(avatarLegs.rightLeg.foot, rig.modelBones.Left_ankle);
  avatarLegs.rightLeg.foot.getWorldPosition(avatarLegs.rightLeg.foot["stickTransform"].position);
  avatarLegs.rightLeg.foot.getWorldQuaternion(avatarLegs.rightLeg.foot["stickTransform"].quaternion);
};

export const updateAvatarLegs = (entity: Entity, delta) => {
  const avatarLegs = getMutableComponent(entity, IKAvatarLegs);
  const pose = getMutableComponent(entity, XRPose);

    updateMatrixWorld(avatarLegs.leftLeg.transform);
    updateMatrixWorld(avatarLegs.leftLeg.upperLeg);
    updateMatrixWorld(avatarLegs.leftLeg.lowerLeg);
    updateMatrixWorld(avatarLegs.leftLeg.foot);

    updateMatrixWorld(avatarLegs.rightLeg.transform);
    updateMatrixWorld(avatarLegs.rightLeg.upperLeg);
    updateMatrixWorld(avatarLegs.rightLeg.lowerLeg);
    updateMatrixWorld(avatarLegs.rightLeg.foot);

    avatarLegs.hmdVelocity.copy(pose.head.position).sub(avatarLegs.lastHmdPosition);

    const floorHeight = pose.floorHeight;

    const hipsFloorPosition = localVector.copy(avatarLegs.hips.position);
    hipsFloorPosition.y = floorHeight;
    const hipsFloorEuler = localEuler.setFromQuaternion(avatarLegs.hips.quaternion, 'YXZ');
    hipsFloorEuler.x = 0;
    hipsFloorEuler.z = 0;
    const planeMatrix = localMatrix.compose(hipsFloorPosition, localQuaternion.setFromEuler(hipsFloorEuler), oneVector);
    const planeMatrixInverse = localMatrix2.copy(planeMatrix).invert();

    const fakePosition = localVector2;
    const fakeScale = localVector3;

    const leftFootPosition = localVector4;
    const leftFootRotation = localQuaternion;
    localMatrix3.compose(avatarLegs.leftLeg.foot["stickTransform"].position, avatarLegs.leftLeg.foot["stickTransform"].quaternion, oneVector)
      .premultiply(planeMatrixInverse)
      .decompose(leftFootPosition, leftFootRotation, fakeScale);

    const rightFootPosition = localVector5;
    const rightFootRotation = localQuaternion2;
    localMatrix3.compose(avatarLegs.rightLeg.foot["stickTransform"].position, avatarLegs.rightLeg.foot["stickTransform"].quaternion, oneVector)
      .premultiply(planeMatrixInverse)
      .decompose(rightFootPosition, rightFootRotation, fakeScale);

    // rotation
    const maxTiltAngleFactor = 0.1;
      const leftFootEuler = localEuler.setFromQuaternion(leftFootRotation, 'YXZ');
      leftFootEuler.x = 0;
      leftFootEuler.z = 0;
      if (leftFootEuler.y < -Math.PI * maxTiltAngleFactor) {
        leftFootEuler.y = -Math.PI * maxTiltAngleFactor;
      }
      if (leftFootEuler.y > Math.PI * maxTiltAngleFactor) {
        leftFootEuler.y = Math.PI * maxTiltAngleFactor;
      }
      localMatrix3.compose(zeroVector, localQuaternion3.setFromEuler(leftFootEuler), oneVector)
        .premultiply(planeMatrix)
        .decompose(fakePosition, avatarLegs.leftLeg.foot["stickTransform"].quaternion, fakeScale);

      const rightFootEuler = localEuler.setFromQuaternion(rightFootRotation, 'YXZ');
      rightFootEuler.x = 0;
      rightFootEuler.z = 0;
      if (rightFootEuler.y < -Math.PI * maxTiltAngleFactor) {
        rightFootEuler.y = -Math.PI * maxTiltAngleFactor;
      }
      if (rightFootEuler.y > Math.PI * maxTiltAngleFactor) {
        rightFootEuler.y = Math.PI * maxTiltAngleFactor;
      }
      localMatrix3.compose(zeroVector, localQuaternion3.setFromEuler(rightFootEuler), oneVector)
        .premultiply(planeMatrix)
        .decompose(fakePosition, avatarLegs.rightLeg.foot["stickTransform"].quaternion, fakeScale);

        const rig = getMutableComponent(entity, IKAvatarRig);

    // step
    const _getLegStepFactor = leg => {
      if (leg.stepping) {
        const scaledStepRate = stepRate
          * Math.max(localVector2.set(avatarLegs.hmdVelocity.x, 0, avatarLegs.hmdVelocity.z).length() / rig.height, minHmdVelocityTimeFactor);
        return Math.min(Math.max(leg["stepFactor"] + scaledStepRate * delta, 0), 1);
      } else {
        return 0;
      }
    };
    avatarLegs.leftLeg["stepFactor"] = _getLegStepFactor(avatarLegs.leftLeg);
    avatarLegs.rightLeg["stepFactor"] = _getLegStepFactor(avatarLegs.rightLeg);

    const leftCanStep = !avatarLegs.leftLeg.stepping && (!avatarLegs.rightLeg.stepping || avatarLegs.rightLeg["stepFactor"] >= crossStepFactor);
    const rightCanStep = !avatarLegs.rightLeg.stepping && (!avatarLegs.leftLeg.stepping || avatarLegs.leftLeg["stepFactor"] >= crossStepFactor);
    const maxStepAngleFactor = 0;
    if (leftCanStep || rightCanStep) {
      let leftStepDistance = 0;
      let leftStepAngleDiff = 0;
      if (leftCanStep) {
        const leftDistance = Math.sqrt(leftFootPosition.x * leftFootPosition.x + leftFootPosition.z * leftFootPosition.z);
        const leftAngleDiff = Math.atan2(leftFootPosition.x, leftFootPosition.z);
        if (leftDistance < rig.height * stepMinDistance) {
          leftStepDistance = leftDistance;
        } else if (leftDistance > rig.height * stepMaxDistance) {
          leftStepDistance = leftDistance;
        }
        if (leftAngleDiff > -Math.PI * maxStepAngleFactor) {
          leftStepAngleDiff = leftAngleDiff;
        } else if (leftAngleDiff < -Math.PI + Math.PI * maxStepAngleFactor) {
          leftStepAngleDiff = leftAngleDiff;
        }
      }
      let rightStepDistance = 0;
      let rightStepAngleDiff = 0;
      if (rightCanStep) {
        const rightDistance = Math.sqrt(rightFootPosition.x * rightFootPosition.x + rightFootPosition.z * rightFootPosition.z);
        const rightAngleDiff = Math.atan2(rightFootPosition.x, rightFootPosition.z);
        if (rightDistance < rig.height * stepMinDistance) {
          rightStepDistance = rightDistance;
        } else if (rightDistance > rig.height * stepMaxDistance) {
          rightStepDistance = rightDistance;
        }
        if (rightAngleDiff < Math.PI * maxStepAngleFactor) {
          rightStepAngleDiff = rightAngleDiff;
        } else if (rightAngleDiff > Math.PI - Math.PI * maxStepAngleFactor) {
          rightStepAngleDiff = rightAngleDiff;
        }
      }

      const _stepLeg = leg => {
        const footDistance = avatarLegs.legSeparation * stepRestitutionDistance;
        leg.foot["startTransform"].position.copy(leg.foot["stickTransform"].position);
        leg.foot["endTransform"].position.copy(hipsFloorPosition)
          .add(localVector6.set((leg.left ? -1 : 1) * footDistance, 0, 0).applyQuaternion(leg.foot["stickTransform"].quaternion));
        const velocityVector = localVector6.set(avatarLegs.hmdVelocity.x, 0, avatarLegs.hmdVelocity.z);
        const velocityVectorLength = velocityVector.length();
        if (velocityVectorLength > maxVelocity * rig.height) {
          velocityVector.multiplyScalar(maxVelocity * rig.height / velocityVectorLength);
        }
        velocityVector.multiplyScalar(velocityRestitutionFactor);
        leg.foot["endTransform"].position.add(velocityVector);
        leg.foot["startHmdFloorTransform"].position.set(pose.head.position.x, 0, pose.head.position.z);
        leg.stepping = true;
      };

      if ((leftStepDistance !== 0 || leftStepAngleDiff !== 0) &&
        (rightStepDistance === 0 || Math.abs(leftStepDistance * avatarLegs.leftLeg.balance) >= Math.abs(rightStepDistance * avatarLegs.rightLeg.balance)) &&
        (rightStepAngleDiff === 0 || Math.abs(leftStepAngleDiff * avatarLegs.leftLeg.balance) >= Math.abs(rightStepAngleDiff * avatarLegs.rightLeg.balance))) {
        _stepLeg(avatarLegs.leftLeg);
        avatarLegs.leftLeg.balance = 0;
        avatarLegs.rightLeg.balance = 1;
      } else if (rightStepDistance !== 0 || rightStepAngleDiff !== 0) {
        _stepLeg(avatarLegs.rightLeg);
        avatarLegs.rightLeg.balance = 0;
        avatarLegs.leftLeg.balance = 1;
      }
    }

    // position
    if (avatarLegs.leftLeg.stepping) {
      avatarLegs.leftLeg.foot["stickTransform"].position.copy(avatarLegs.leftLeg.foot["startTransform"].position)
        .lerp(avatarLegs.leftLeg.foot["endTransform"].position, avatarLegs.leftLeg["stepFactor"])
        .add(localVector6.set(0, Math.sin(avatarLegs.leftLeg["stepFactor"] * Math.PI) * stepHeight * rig.height, 0));

      if (avatarLegs.leftLeg["stepFactor"] >= 1) {
        avatarLegs.leftLeg.stepping = false;
      }
    } else {
      const targetPosition = localVector6.copy(avatarLegs.leftLeg.foot["stickTransform"].position);
      targetPosition.y = floorHeight;
      avatarLegs.leftLeg.foot["stickTransform"].position.lerp(targetPosition, 0.2);
    }
    if (avatarLegs.rightLeg.stepping) {
      avatarLegs.rightLeg.foot["stickTransform"].position.copy(avatarLegs.rightLeg.foot["startTransform"].position)
        .lerp(avatarLegs.rightLeg.foot["endTransform"].position, avatarLegs.rightLeg["stepFactor"])
        .add(localVector6.set(0, Math.sin(avatarLegs.rightLeg["stepFactor"] * Math.PI) * stepHeight * rig.height, 0));
      if (avatarLegs.rightLeg["stepFactor"] >= 1) {
        avatarLegs.rightLeg.stepping = false;
      }
    } else {
      const targetPosition = localVector6.copy(avatarLegs.rightLeg.foot["stickTransform"].position);
      targetPosition.y = floorHeight;
      avatarLegs.rightLeg.foot["stickTransform"].position.lerp(targetPosition, 0.2);
    }

    updateLeg(entity, Side.Left);
    updateLeg(entity, Side.Right);
  
  avatarLegs.lastHmdPosition.copy(pose.head.position);
};

const initLeg = (entity: Entity, legSide: Side) => {  
  const leg = getMutableComponent(entity, legSide === Side.Right ? RightLeg : LeftLeg) as Leg<any>;

  const avatarLegs = getMutableComponent(entity, IKAvatarLegs);

  leg.transform = new Object3D();
  leg.upperLeg = new Object3D();
  leg.lowerLeg = new Object3D();
  leg.foot = new Object3D();
  leg.foot["stickTransform"] = new Object3D();
  leg.foot["startTransform"] = new Object3D();
  leg.foot["endTransform"] = new Object3D();
  leg.foot["startHmdFloorTransform"] = new Object3D();

  leg.transform.add(leg.upperLeg);
  leg.upperLeg.add(leg.lowerLeg);
  leg.lowerLeg.add(leg.foot);

  leg.upperLegLength = 0;
  leg.lowerLegLength = 0;
  leg.legLength = 0;
  leg.eyesToUpperLegOffset = new Vector3();

  leg.avatarLegs = avatarLegs;

  leg.stepping = false;

  leg.balance = 1;

  leg.upperLegLength = leg.lowerLeg.position.length();
  leg.lowerLegLength = leg.foot.position.length();
  leg.legLength = leg.upperLegLength + leg.lowerLegLength;

  const avatarShoulders = getMutableComponent(entity, IKAvatarShoulders);
  getWorldPosition(leg.upperLeg, leg.eyesToUpperLegOffset)
    .sub(getWorldPosition(avatarShoulders.eyes, localVector));
}

const updateLeg = (entity, legSide) => {
  const leg = getMutableComponent(entity, legSide === Side.Right ? RightLeg : LeftLeg) as Leg<any>;

  const footPosition = localVector.copy(leg.foot["stickTransform"].position);
  const upperLegPosition = getWorldPosition(leg.upperLeg, localVector2);

  const footRotation = leg.foot["stickTransform"].quaternion;
  const hypotenuseDistance = leg.upperLegLength;
  const verticalDistance = Math.abs(upperLegPosition.y - leg.foot["stickTransform"].position.y) * leg.upperLegLength / leg.legLength;
  const offsetDistance = hypotenuseDistance > verticalDistance ? Math.sqrt(hypotenuseDistance * hypotenuseDistance - verticalDistance * verticalDistance) : 0;

  const lowerLegPosition = localVector4.copy(upperLegPosition).add(footPosition).divideScalar(2)
    .add(
      localVector5.copy(footPosition).sub(upperLegPosition)
        .cross(localVector6.set(1, 0, 0).applyQuaternion(footRotation))
        .normalize()
        .multiplyScalar(offsetDistance)
    );

    leg.upperLeg.quaternion.setFromRotationMatrix(
    localMatrix.lookAt(
      zeroVector,
      localVector5.copy(upperLegPosition).sub(lowerLegPosition),
      localVector6.set(0, 0, 1).applyQuaternion(footRotation)
    )
  )
    .multiply(downHalfRotation)
    .premultiply(getWorldQuaternion(leg.transform, localQuaternion2).invert());
  updateMatrixMatrixWorld(leg.upperLeg);

  leg.lowerLeg.quaternion.setFromRotationMatrix(
    localMatrix.lookAt(
      zeroVector,
      localVector5.copy(lowerLegPosition).sub(footPosition),
      localVector6.set(0, 0, 1).applyQuaternion(footRotation)
    )
  )
    .multiply(downHalfRotation)
    .premultiply(getWorldQuaternion(leg.upperLeg, localQuaternion2).invert());
    updateMatrixMatrixWorld(leg.lowerLeg);

  leg.foot.quaternion.copy(footRotation)
    .multiply(downHalfRotation)
    .premultiply(getWorldQuaternion(leg.lowerLeg, localQuaternion2).invert());
  updateMatrixMatrixWorld(leg.foot);
}
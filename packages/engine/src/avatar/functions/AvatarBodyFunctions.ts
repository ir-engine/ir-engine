import { Bone, Euler, Matrix4, Object3D, Quaternion, Scene, Skeleton, Vector3 } from 'three';
import { SIXDOFType } from '../../common/types/NumericalTypes';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from '../../input/components/Input';
import { BaseInput } from '../../input/enums/BaseInput';
import IKArm from '../components/IKArm';
import IKArmLeft from '../components/IKArmLeft';
import IKArmRight from '../components/IKArmRight';
import { IKAvatarRig } from "../components/IKAvatarRig";
import IKLeg from '../components/IKLeg';
import IKLegLeft from '../components/IKLegLeft';
import IKLegRight from '../components/IKLegRight';
import XRPose from "../components/XRPose";
import skeletonString from '../constants/Skeleton';
import { Side } from '../enums/Side';
import { fixSkeletonZForward } from '../functions/SkeletonUtils';
import { copyTransform, getWorldPosition, getWorldQuaternion, updateMatrix, updateMatrixMatrixWorld, updateMatrixWorld } from "./UnityHelpers";

const localMatrix = new Matrix4();

const localVector = new Vector3();
const localVector2 = new Vector3();

const upRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 0.5);
const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI * 0.5);

const z180Quaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI);
const bankLeftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
const bankRightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2);

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

export const getOptional = o => o || new Bone();

export const ensureParent = (o, parent?) => {
  if (!o.parent) {
    if (!parent) {
      parent = new Bone();
    }
    parent.add(o);
  }
  return o.parent;
};

export const recurseBoneAttachments = o => {
  for (const child of o.children) {
    if (child.isBone) {
      recurseBoneAttachments(child);
    } else {
      child.matrix
        .premultiply(localMatrix.compose(localVector.set(0, 0, 0), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI), localVector2.set(1, 1, 1)))
        .decompose(child.position, child.quaternion, child.scale);
    }
  }
};

const findFingerBone = (modelBones, tailBones, r, left) => {
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

const _getEyePosition = (Head, Neck, Eye_L, Eye_R) => {
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

const _averagePoint = points => {
  const result = new Vector3();
  for (let i = 0; i < points.length; i++) {
    result.add(points[i]);
  }
  result.divideScalar(points.length);
  return result;
};

export const _ensurePrerotation = (modelBones, preRotations, k) => {
  const boneName = modelBones[k].name;
  if (!preRotations[boneName]) {
    preRotations[boneName] = new Quaternion();
  }
  return preRotations[boneName];
};

const getModel = (() => {
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

  return object as Object3D;
});

export const retargetSkeleton = (entity, model, options) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);
    // Create a new default model using the imported skeleton string
    // if(!model) model = getModel();

    // Update the transforms of this model and children, force immediate
    model.updateMatrixWorld(true);
  
    // New array of skinned meshes
    const skinnedMeshes = [];
  
    // Any skinned meshes? There will be one from default model
    model.traverse(o => {
      if ((o as any).isSkinnedMesh) {
        skinnedMeshes.push(o);
      }
    });


  avatarRig.transform = new Object3D();
  avatarRig.hips = new Object3D();
  avatarRig.spine = new Object3D();
  avatarRig.neck = new Object3D();
  avatarRig.head = new Object3D();
  avatarRig.eyes = new Object3D();

  avatarRig.hips.add(avatarRig.spine);
  avatarRig.spine.add(avatarRig.transform);
  avatarRig.transform.add(avatarRig.neck);
  avatarRig.neck.add(avatarRig.head);
  avatarRig.head.add(avatarRig.eyes);

  avatarRig.leftShoulderAnchor = new Object3D();
  avatarRig.transform.add(avatarRig.leftShoulderAnchor);
  avatarRig.rightShoulderAnchor = new Object3D();
  avatarRig.transform.add(avatarRig.rightShoulderAnchor);
  
    // get the skeleton of the model
    const skeleton = skinnedMeshes.find(o => o.skeleton.bones[0].parent).skeleton;
  
    const modelBones = createModelBones(skeleton);
  
    const armature = findArmature(modelBones.Hips);
  
    
    // If our left arm is less than 0 degree on x, flip the Z
    const leftArmDirection = modelBones.Left_wrist.getWorldPosition(new Vector3()).sub(modelBones.Head.getWorldPosition(new Vector3()));
    const flipZ = leftArmDirection.x < 0;
  
    // If the armature iz < .05 on z, flip the Y
    const armatureDirection = new Vector3(0, 1, 0).applyQuaternion(armature.quaternion);
    const flipY = armatureDirection.z < -0.5;
  
    const legDirection = new Vector3(0, 0, -1).applyQuaternion(modelBones.Left_leg.getWorldQuaternion(new Quaternion()).premultiply(armature.quaternion.clone().invert()));
    const flipLeg = legDirection.y < 0.5;
  
    const armatureQuaternion = armature.quaternion.clone();
    const armatureMatrixInverse = armature.matrixWorld.clone().invert();
  
    armature.position.set(0, 0, 0);
    armature.quaternion.set(0, 0, 0, 1);
    armature.scale.set(1, 1, 1);
    armature.updateMatrix();
  
    modelBones.Head.traverse(o => {
      o.savedPosition = o.position.clone();
      o.savedMatrixWorld = o.matrixWorld.clone();
    });
    const tailBones = getTailBones(skeleton);
  
    const fingerBones = {
      left: {
        thumb: findFingerBone(modelBones, tailBones, /thumb/gi, true),
        index: findFingerBone(modelBones, tailBones, /index/gi, true),
        middle: findFingerBone(modelBones, tailBones, /middle/gi, true),
        ring: findFingerBone(modelBones, tailBones, /ring/gi, true),
        little: findFingerBone(modelBones, tailBones, /little/gi, true) || findFingerBone(modelBones, tailBones, /pinky/gi, true),
      },
      right: {
        thumb: findFingerBone(modelBones, tailBones, /thumb/gi, false),
        index: findFingerBone(modelBones, tailBones, /index/gi, false),
        middle: findFingerBone(modelBones, tailBones, /middle/gi, false),
        ring: findFingerBone(modelBones, tailBones, /ring/gi, false),
        little: findFingerBone(modelBones, tailBones, /little/gi, false) || findFingerBone(modelBones, tailBones, /pinky/gi, false),
      },
    };
  
    const preRotations = {};
  
    if (flipY) {
      _ensurePrerotation(modelBones, preRotations, 'Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
    }
    if (flipZ) {
      _ensurePrerotation(modelBones, preRotations, 'Hips').premultiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI));
    }
    if (flipLeg) {
      ['Left_leg', 'Right_leg'].forEach(k => {
        _ensurePrerotation(modelBones, preRotations, k).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2));
      });
    }
  
    recurseBoneAttachments(modelBones['Hips']);
  
    const qrArm = flipZ ? modelBones.Left_arm : modelBones.Right_arm;
    const qrElbow = flipZ ? modelBones.Left_elbow : modelBones.Right_elbow;
    const qrWrist = flipZ ? modelBones.Left_wrist : modelBones.Right_wrist;
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
    const qlArm = flipZ ? modelBones.Right_arm : modelBones.Left_arm;
    const qlElbow = flipZ ? modelBones.Right_elbow : modelBones.Left_elbow;
    const qlWrist = flipZ ? modelBones.Right_wrist : modelBones.Left_wrist;
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
  
    _ensurePrerotation(modelBones, preRotations, 'Right_arm')
      .multiply(qr.clone().invert());
    _ensurePrerotation(modelBones, preRotations, 'Right_elbow')
      .multiply(qr.clone())
      .premultiply(qr2.clone().invert());
    _ensurePrerotation(modelBones, preRotations, 'Left_arm')
      .multiply(ql.clone().invert());
    _ensurePrerotation(modelBones, preRotations, 'Left_elbow')
      .multiply(ql.clone())
      .premultiply(ql2.clone().invert());
  
    _ensurePrerotation(modelBones, preRotations, 'Left_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
    _ensurePrerotation(modelBones, preRotations, 'Right_leg').premultiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
  
    for (const k in preRotations) {
      preRotations[k].invert();
    }
    fixSkeletonZForward(armature.children[0], {
      preRotations,
    });
    model.traverse((o: any) => {
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
  
    modelBones.Hips.traverse(bone => {
      if (bone.isBone) {
        bone.initialQuaternion = bone.quaternion.clone();
      }
    });
    const eyePosition = _getEyePosition(modelBones.Head, modelBones.Neck, modelBones.Eye_L, modelBones.Eye_R);

    avatarRig.fingerBones = fingerBones;
    avatarRig.flipZ = flipZ;
    avatarRig.flipY = flipY;
    avatarRig.flipLeg = flipLeg;
    avatarRig.skinnedMeshes = skinnedMeshes;
    avatarRig.model = model;
    avatarRig.modelBones = modelBones;
    avatarRig.options = options;
    avatarRig.spine.position.copy(_getOffset(modelBones.Spine));
    avatarRig.transform.position.copy(_getOffset(modelBones.Chest, modelBones.Spine));
    avatarRig.neck.position.copy(_getOffset(modelBones.Neck));
    avatarRig.head.position.copy(_getOffset(modelBones.Head));
    avatarRig.eyes.position.copy(eyePosition.clone().sub(modelBones.Head.getWorldPosition(new Vector3())));
    avatarRig.height = eyePosition.clone().sub(_averagePoint([modelBones.Left_ankle.getWorldPosition(new Vector3()), modelBones.Right_ankle.getWorldPosition(new Vector3())])).y;

    avatarRig.leftShoulderAnchor.position.copy(_getOffset(modelBones.Left_shoulder));
    const indexDistance = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
    .distanceTo(modelBones.Left_wrist.getWorldPosition(new Vector3()));
  const handWidth = modelBones.Left_indexFinger1.getWorldPosition(new Vector3())
    .distanceTo(modelBones.Left_littleFinger1.getWorldPosition(new Vector3()));
  avatarRig.handOffsetLeft = new Vector3(handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
  avatarRig.handOffsetRight = new Vector3(-handWidth * 0.7, -handWidth * 0.75, indexDistance * 0.5);
  avatarRig.eyeToHipsOffset = modelBones.Hips.getWorldPosition(new Vector3()).sub(eyePosition);

    return { skinnedMeshes, modelBones }
  }

export const setupXRPose = (entity) => {
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
}

export const setupAvatarOuputs = (entity) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);

  const leftArm = getMutableComponent(entity, IKArmLeft);
  const rightArm = getMutableComponent(entity, IKArmLeft);
  const leftLeg = getComponent(entity, IKLegLeft);
  const rightLeg = getComponent(entity, IKLegRight);

  const outputs = {
    eyes: avatarRig.eyes,
    head: avatarRig.head,
    hips: avatarRig.hips,
    spine: avatarRig.spine,
    chest: avatarRig.transform,
    neck: avatarRig.neck,
    leftShoulder: avatarRig.leftShoulderAnchor,
    leftUpperArm: leftArm.upperArm,
    leftLowerArm: leftArm.lowerArm,
    leftHand: leftArm.hand,
    rightShoulder: avatarRig.rightShoulderAnchor,
    rightUpperArm: rightArm.upperArm,
    rightLowerArm: rightArm.lowerArm,
    rightHand: rightArm.hand,
    leftUpperLeg: leftLeg.upperLeg,
    leftLowerLeg: leftLeg.lowerLeg,
    leftFoot: leftLeg.foot,
    rightUpperLeg: rightLeg.upperLeg,
    rightLowerLeg: rightLeg.lowerLeg,
    rightFoot: rightLeg.foot,
    leftThumb2: rightArm.thumb2,
    leftThumb1: rightArm.thumb1,
    leftThumb0: rightArm.thumb0,
    leftIndexFinger3: rightArm.indexFinger3,
    leftIndexFinger2: rightArm.indexFinger2,
    leftIndexFinger1: rightArm.indexFinger1,
    leftMiddleFinger3: rightArm.middleFinger3,
    leftMiddleFinger2: rightArm.middleFinger2,
    leftMiddleFinger1: rightArm.middleFinger1,
    leftRingFinger3: rightArm.ringFinger3,
    leftRingFinger2: rightArm.ringFinger2,
    leftRingFinger1: rightArm.ringFinger1,
    leftLittleFinger3: rightArm.littleFinger3,
    leftLittleFinger2: rightArm.littleFinger2,
    leftLittleFinger1: rightArm.littleFinger1,
    rightThumb2: leftArm.thumb2,
    rightThumb1: leftArm.thumb1,
    rightThumb0: leftArm.thumb0,
    rightIndexFinger3: leftArm.indexFinger3,
    rightIndexFinger2: leftArm.indexFinger2,
    rightIndexFinger1: leftArm.indexFinger1,
    rightMiddleFinger3: leftArm.middleFinger3,
    rightMiddleFinger2: leftArm.middleFinger2,
    rightMiddleFinger1: leftArm.middleFinger1,
    rightRingFinger3: leftArm.ringFinger3,
    rightRingFinger2: leftArm.ringFinger2,
    rightRingFinger1: leftArm.ringFinger1,
    rightLittleFinger3: leftArm.littleFinger3,
    rightLittleFinger2: leftArm.littleFinger2,
    rightLittleFinger1: leftArm.littleFinger1,
  };

  const animationMappings = [
    new AnimationMapping('mixamorigHips.quaternion', outputs.hips.quaternion, false),
    new AnimationMapping('mixamorigSpine.quaternion', outputs.spine.quaternion, false),
    // new AnimationMapping('mixamorigSpine1.quaternion', null, false),
    new AnimationMapping('mixamorigSpine2.quaternion', outputs.chest.quaternion, false),
    new AnimationMapping('mixamorigNeck.quaternion', outputs.neck.quaternion, false),
    new AnimationMapping('mixamorigHead.quaternion', outputs.head.quaternion, false),

    new AnimationMapping('mixamorigLeftShoulder.quaternion', outputs.rightShoulder.quaternion, true),
    new AnimationMapping('mixamorigLeftArm.quaternion', outputs.rightUpperArm.quaternion, true),
    new AnimationMapping('mixamorigLeftForeArm.quaternion', outputs.rightLowerArm.quaternion, true),
    new AnimationMapping('mixamorigLeftHand.quaternion', outputs.leftHand.quaternion, true),
    new AnimationMapping('mixamorigLeftHandMiddle1.quaternion', outputs.leftMiddleFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandMiddle2.quaternion', outputs.leftMiddleFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandMiddle3.quaternion', outputs.leftMiddleFinger3.quaternion, true),
    new AnimationMapping('mixamorigLeftHandThumb1.quaternion', outputs.leftThumb0.quaternion, true),
    new AnimationMapping('mixamorigLeftHandThumb2.quaternion', outputs.leftThumb1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandThumb3.quaternion', outputs.leftThumb2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandIndex1.quaternion', outputs.leftIndexFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandIndex2.quaternion', outputs.leftIndexFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandIndex3.quaternion', outputs.leftIndexFinger3.quaternion, true),
    new AnimationMapping('mixamorigLeftHandRing1.quaternion', outputs.leftRingFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandRing2.quaternion', outputs.leftRingFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandRing3.quaternion', outputs.leftRingFinger3.quaternion, true),
    new AnimationMapping('mixamorigLeftHandPinky1.quaternion', outputs.leftLittleFinger1.quaternion, true),
    new AnimationMapping('mixamorigLeftHandPinky2.quaternion', outputs.leftLittleFinger2.quaternion, true),
    new AnimationMapping('mixamorigLeftHandPinky3.quaternion', outputs.leftLittleFinger3.quaternion, true),

    new AnimationMapping('mixamorigRightShoulder.quaternion', outputs.leftShoulder.quaternion, true),
    new AnimationMapping('mixamorigRightArm.quaternion', outputs.leftUpperArm.quaternion, true),
    new AnimationMapping('mixamorigRightForeArm.quaternion', outputs.leftLowerArm.quaternion, true),
    new AnimationMapping('mixamorigRightHand.quaternion', outputs.rightHand.quaternion, true),
    new AnimationMapping('mixamorigRightHandMiddle1.quaternion', outputs.rightMiddleFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandMiddle2.quaternion', outputs.rightMiddleFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandMiddle3.quaternion', outputs.rightMiddleFinger3.quaternion, true),
    new AnimationMapping('mixamorigRightHandThumb1.quaternion', outputs.rightThumb0.quaternion, true),
    new AnimationMapping('mixamorigRightHandThumb2.quaternion', outputs.rightThumb1.quaternion, true),
    new AnimationMapping('mixamorigRightHandThumb3.quaternion', outputs.rightThumb2.quaternion, true),
    new AnimationMapping('mixamorigRightHandIndex1.quaternion', outputs.rightIndexFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandIndex2.quaternion', outputs.rightIndexFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandIndex3.quaternion', outputs.rightIndexFinger3.quaternion, true),
    new AnimationMapping('mixamorigRightHandRing1.quaternion', outputs.rightRingFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandRing2.quaternion', outputs.rightRingFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandRing3.quaternion', outputs.rightRingFinger3.quaternion, true),
    new AnimationMapping('mixamorigRightHandPinky1.quaternion', outputs.rightLittleFinger1.quaternion, true),
    new AnimationMapping('mixamorigRightHandPinky2.quaternion', outputs.rightLittleFinger2.quaternion, true),
    new AnimationMapping('mixamorigRightHandPinky3.quaternion', outputs.rightLittleFinger3.quaternion, true),

    new AnimationMapping('mixamorigRightUpLeg.quaternion', outputs.leftUpperLeg.quaternion, false),
    new AnimationMapping('mixamorigRightLeg.quaternion', outputs.leftLowerLeg.quaternion, false),
    new AnimationMapping('mixamorigRightFoot.quaternion', outputs.leftFoot.quaternion, false),
    // new AnimationMapping('mixamorigRightToeBase.quaternion', null, false),

    new AnimationMapping('mixamorigLeftUpLeg.quaternion', outputs.rightUpperLeg.quaternion, false),
    new AnimationMapping('mixamorigLeftLeg.quaternion', outputs.rightLowerLeg.quaternion, false),
    new AnimationMapping('mixamorigLeftFoot.quaternion', outputs.rightFoot.quaternion, false),
    // new AnimationMapping('mixamorigLeftToeBase.quaternion', null, false),
  ];

  avatarRig.outputs = outputs;
  avatarRig.animationMappings = animationMappings;
}

export const setupVisemes = (entity, skinnedMeshes) => {
  const avatarRig = getMutableComponent (entity, IKAvatarRig);
  let skinnedMeshesVisemeMappings = [];
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
    skinnedMeshesVisemeMappings = skinnedMeshes.map(o => {
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
  

  avatarRig.skinnedMeshesVisemeMappings = skinnedMeshesVisemeMappings;
}

const _getOffset = (bone, parent = bone.parent) => bone.getWorldPosition(new Vector3()).sub(parent.getWorldPosition(new Vector3()));

export const initializeAvatarRig = (entity, model) => {
  const options = { top: true, bottom: true, visemes: true, hair: true, fingers: true }
  if(!hasComponent(entity, IKAvatarRig)) addComponent(entity, IKAvatarRig);

  const { skinnedMeshes, modelBones } = retargetSkeleton(entity, model, options);
  initAvatarShoulders(entity, modelBones);

  setupXRPose(entity);

  initAvatarLegs(entity, modelBones);

  setupAvatarOuputs(entity);
  if(options.visemes){
    setupVisemes(entity, skinnedMeshes);
  }
}

const updateIKArm = (entity, side: Side) => {

  const armIK = getMutableComponent(entity, side === Side.Left ? IKArmLeft : IKArmRight);

  updateMatrixWorld(armIK.transform);
  updateMatrixWorld(armIK.upperArm);

  const input = getMutableComponent(entity, Input);
  const inputs = input.data.get(side == Side.Left ? BaseInput.XR_LEFT_HAND : BaseInput.XR_RIGHT_HAND)?.value as SIXDOFType;
  if(inputs === undefined || armIK.hand) return // TODO: SOLVE THIS
  // TODO: Remove new vector3 ref
  armIK.hand.position.set(inputs.x, inputs.y, inputs.z);
  armIK.hand.quaternion.set(inputs.qY, inputs.qW, inputs.qZ, inputs.qW);

  const upperArmPosition = getWorldPosition(armIK.upperArm, localVector);
  const handRotation = armIK.hand.quaternion;
  const handPosition = localVector2.copy(armIK.hand.position);

  const shoulderRotation = getWorldQuaternion(armIK.transform, localQuaternion);
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

  armIK.hand.quaternion.copy(new Quaternion(inputs.qX, inputs.qY, inputs.qZ, inputs.qW))
    .multiply(side === Side.Left ? bankRightRotation : bankLeftRotation)
    .premultiply(getWorldQuaternion(armIK.hand.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.hand);

  for (const fingerSpec of FINGER_SPECS) {
    const [index, key] = fingerSpec;
    // if(!armIK[key]) return console.log("No finger for index, key", index, key);
    // if(!armIK.hand || !armIK.hand.fingers) return console.log("No finger on target for index");
    // armIK[key].quaternion.copy(armIK.hand.fingers[index].quaternion);
    if(armIK[key])
    {
      updateMatrixMatrixWorld(armIK[key]);
    } else {
      console.log("armIK[key] does not exist: ", key);
    }
  }
}

export const updateAvatarShoulders = (entity, delta) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);
  const pose = getMutableComponent(entity, XRPose);

  avatarRig.spine.quaternion.set(0, 0, 0, 1);

  // Update hips
  let hmdRotation = localQuaternion.copy(avatarRig.head.quaternion)
    .multiply(z180Quaternion);
  let hmdEuler = localEuler.setFromQuaternion(hmdRotation, 'YXZ');
  hmdEuler.x = 0;
  hmdEuler.z = 0;
  let hmdXYRotation = localQuaternion2.setFromEuler(hmdEuler);

  const headPosition = localVector.copy(avatarRig.head.position)
    .sub(localVector2.copy(avatarRig.eyes.position).applyQuaternion(hmdRotation));
  const neckPosition = headPosition.sub(localVector2.copy(avatarRig.head.position).applyQuaternion(hmdRotation));
  const chestPosition = neckPosition.sub(localVector2.copy(avatarRig.neck.position).applyQuaternion(hmdXYRotation));
  const spinePosition = chestPosition.sub(localVector2.copy(avatarRig.transform.position).applyQuaternion(hmdXYRotation));
  const hipsPosition = spinePosition.sub(localVector2.copy(avatarRig.spine.position).applyQuaternion(hmdXYRotation));

  avatarRig.hips.position.copy(hipsPosition);
  avatarRig.hips.quaternion.copy(hmdXYRotation);

  updateMatrix(avatarRig.hips);
  avatarRig.hips.matrixWorld.copy(avatarRig.hips.matrix);
  updateMatrixWorld(avatarRig.spine);
  updateMatrixWorld(avatarRig.transform);

  // Update 

  avatarRig.leftShoulderAnchor.quaternion.set(0, 0, 0, 1);
  avatarRig.rightShoulderAnchor.quaternion.set(0, 0, 0, 1);


  const hipsRotation = localQuaternion.copy(avatarRig.hips.quaternion)
    .multiply(z180Quaternion);
  const hipsRotationInverse = localQuaternion2.copy(hipsRotation)
    .invert();

  const distanceLeftHand = localVector.copy(pose.leftHand.position)
    .sub(avatarRig.head.position)
    .applyQuaternion(hipsRotationInverse);
  const distanceRightHand = localVector2.copy(pose.rightHand.position)
    .sub(avatarRig.head.position)
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

  avatarRig.transform.quaternion.setFromEuler(localEuler.set(0, angleY, 0, 'YXZ'))
    .premultiply(
      localQuaternion.copy(avatarRig.hips.quaternion)
        .multiply(z180Quaternion)
    );

  avatarRig.transform.quaternion
    .premultiply(getWorldQuaternion(avatarRig.transform.parent, localQuaternion).invert());
  updateMatrixMatrixWorld(avatarRig.transform);
  updateMatrixWorld(avatarRig.leftShoulderAnchor);
  updateMatrixWorld(avatarRig.rightShoulderAnchor);


  hmdRotation = localQuaternion.copy(avatarRig.head.quaternion)
    .multiply(z180Quaternion);

  hmdEuler = localEuler.setFromQuaternion(hmdRotation, 'YXZ');
  hmdEuler.x = 0;
  hmdEuler.z = 0;
  hmdXYRotation = localQuaternion2.setFromEuler(hmdEuler);

  avatarRig.neck.quaternion.copy(hmdXYRotation)
    .premultiply(getWorldQuaternion(avatarRig.neck.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(avatarRig.neck);

  avatarRig.head.quaternion.copy(hmdRotation)
    .premultiply(getWorldQuaternion(avatarRig.head.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(avatarRig.head);

  updateMatrixWorld(avatarRig.eyes);

  updateIKArm(entity, Side.Left);
  updateIKArm(entity, Side.Right);
}

export const initAvatarShoulders = (entity: Entity, modelBones) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);

  const leftArm = (hasComponent(entity, IKArmLeft) ? getComponent(entity, IKArmLeft) : addComponent(entity, IKArmLeft)) as IKArm;
  const rightArm = (hasComponent(entity, IKArmRight) ? getComponent(entity, IKArmRight) : addComponent(entity, IKArmRight)) as IKArm;

  initArm(entity, Side.Left);
  initArm(entity, Side.Right);

  avatarRig.leftShoulderAnchor.add(leftArm.transform);
  avatarRig.rightShoulderAnchor.add(rightArm.transform);

  leftArm.upperArm.position.copy(_getOffset(modelBones.Left_arm));
  leftArm.lowerArm.position.copy(_getOffset(modelBones.Left_elbow));
  leftArm.hand.position.copy(_getOffset(modelBones.Left_wrist));
  leftArm.thumb2.position.copy(_getOffset(modelBones.Left_thumb2));
  leftArm.thumb1.position.copy(_getOffset(modelBones.Left_thumb1));
  leftArm.thumb0.position.copy(_getOffset(modelBones.Left_thumb0));
  leftArm.indexFinger3.position.copy(_getOffset(modelBones.Left_indexFinger3));
  leftArm.indexFinger2.position.copy(_getOffset(modelBones.Left_indexFinger2));
  leftArm.indexFinger1.position.copy(_getOffset(modelBones.Left_indexFinger1));
  leftArm.middleFinger3.position.copy(_getOffset(modelBones.Left_middleFinger3));
  leftArm.middleFinger2.position.copy(_getOffset(modelBones.Left_middleFinger2));
  leftArm.middleFinger1.position.copy(_getOffset(modelBones.Left_middleFinger1));
  leftArm.ringFinger3.position.copy(_getOffset(modelBones.Left_ringFinger3));
  leftArm.ringFinger2.position.copy(_getOffset(modelBones.Left_ringFinger2));
  leftArm.ringFinger1.position.copy(_getOffset(modelBones.Left_ringFinger1));
  leftArm.littleFinger3.position.copy(_getOffset(modelBones.Left_littleFinger3));
  leftArm.littleFinger2.position.copy(_getOffset(modelBones.Left_littleFinger2));
  leftArm.littleFinger1.position.copy(_getOffset(modelBones.Left_littleFinger1));

  avatarRig.rightShoulderAnchor.position.copy(_getOffset(modelBones.Right_shoulder));
  rightArm.upperArm.position.copy(_getOffset(modelBones.Right_arm));
  rightArm.lowerArm.position.copy(_getOffset(modelBones.Right_elbow));
  rightArm.hand.position.copy(_getOffset(modelBones.Right_wrist));
  rightArm.thumb2.position.copy(_getOffset(modelBones.Right_thumb2));
  rightArm.thumb1.position.copy(_getOffset(modelBones.Right_thumb1));
  rightArm.thumb0.position.copy(_getOffset(modelBones.Right_thumb0));
  rightArm.indexFinger3.position.copy(_getOffset(modelBones.Right_indexFinger3));
  rightArm.indexFinger2.position.copy(_getOffset(modelBones.Right_indexFinger2));
  rightArm.indexFinger1.position.copy(_getOffset(modelBones.Right_indexFinger1));
  rightArm.middleFinger3.position.copy(_getOffset(modelBones.Right_middleFinger3));
  rightArm.middleFinger2.position.copy(_getOffset(modelBones.Right_middleFinger2));
  rightArm.middleFinger1.position.copy(_getOffset(modelBones.Right_middleFinger1));
  rightArm.ringFinger3.position.copy(_getOffset(modelBones.Right_ringFinger3));
  rightArm.ringFinger2.position.copy(_getOffset(modelBones.Right_ringFinger2));
  rightArm.ringFinger1.position.copy(_getOffset(modelBones.Right_ringFinger1));
  rightArm.littleFinger3.position.copy(_getOffset(modelBones.Right_littleFinger3));
  rightArm.littleFinger2.position.copy(_getOffset(modelBones.Right_littleFinger2));
  rightArm.littleFinger1.position.copy(_getOffset(modelBones.Right_littleFinger1));

  avatarRig.shoulderWidth = modelBones.Left_arm.getWorldPosition(new Vector3()).distanceTo(modelBones.Right_arm.getWorldPosition(new Vector3()));
  avatarRig.leftArmLength = leftArm.armLength;
  avatarRig.rightArmLength = rightArm.armLength;
}

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
  arm.upperArmLength = getWorldPosition(arm.lowerArm, localVector).distanceTo(getWorldPosition(arm.upperArm, localVector2));
  arm.lowerArmLength = getWorldPosition(arm.hand, localVector).distanceTo(getWorldPosition(arm.lowerArm, localVector2));
  arm.armLength = arm.upperArmLength + arm.lowerArmLength;
}

export const initAvatarLegs = (entity, modelBones) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);
  const pose = getMutableComponent(entity, XRPose);

  const leftLeg = (hasComponent(entity, IKLegLeft) ?
    getComponent(entity, IKLegLeft) :
    addComponent(entity, IKLegLeft)) as IKLeg<any>;

  const rightLeg = (hasComponent(entity, IKLegRight) ?
    getComponent(entity, IKLegRight) :
    addComponent(entity, IKLegRight)) as IKLeg<any>;

    initLeg(entity, Side.Left);
    initLeg(entity, Side.Right);

  avatarRig.hips.add(leftLeg.transform);
  avatarRig.hips.add(rightLeg.transform);

  avatarRig.lastHmdPosition = new Vector3();
  avatarRig.lastHmdPosition.copy(pose.head.position);
  avatarRig.hmdVelocity = new Vector3();
  avatarRig.legSeparation = 0;
  // avatarRig.legSeparation = getWorldPosition(leftLeg.upperLeg, localVector)
  //   .distanceTo(getWorldPosition(rightLeg.upperLeg, localVector2));

  // resetAvatarLegs(entity);

  leftLeg.upperLeg.position.copy(_getOffset(modelBones.Left_leg));
  leftLeg.lowerLeg.position.copy(_getOffset(modelBones.Left_knee));
  leftLeg.foot.position.copy(_getOffset(modelBones.Left_ankle));

  rightLeg.upperLeg.position.copy(_getOffset(modelBones.Right_leg));
  rightLeg.lowerLeg.position.copy(_getOffset(modelBones.Right_knee));
  rightLeg.foot.position.copy(_getOffset(modelBones.Right_ankle));

  avatarRig.hips.updateMatrixWorld();

};

export const resetAvatarLegs = (entity: Entity) => {
  const leftLeg = (hasComponent(entity, IKLegLeft) ?
    getComponent(entity, IKLegLeft) :
    addComponent(entity, IKLegLeft)) as IKLeg<any>;

  const rightLeg = (hasComponent(entity, IKLegRight) ?
    getComponent(entity, IKLegRight) :
    addComponent(entity, IKLegRight)) as IKLeg<any>;

  const avatarRig = getMutableComponent(entity, IKAvatarRig);

  copyTransform(leftLeg.upperLeg, avatarRig.modelBones.Right_leg);
  copyTransform(leftLeg.lowerLeg, avatarRig.modelBones.Right_knee);
  copyTransform(leftLeg.foot, avatarRig.modelBones.Right_ankle);

  leftLeg.foot.getWorldPosition(leftLeg.foot["stickTransform"].position);
  leftLeg.foot.getWorldQuaternion(leftLeg.foot["stickTransform"].quaternion);

  copyTransform(rightLeg.upperLeg, avatarRig.modelBones.Left_leg);
  copyTransform(rightLeg.lowerLeg, avatarRig.modelBones.Left_knee);
  copyTransform(rightLeg.foot, avatarRig.modelBones.Left_ankle);

  rightLeg.foot.getWorldPosition(rightLeg.foot["stickTransform"].position);
  rightLeg.foot.getWorldQuaternion(rightLeg.foot["stickTransform"].quaternion);
};

export const updateAvatarLegs = (entity: Entity, delta) => {
  const avatarRig = getMutableComponent(entity, IKAvatarRig);

  const leftLeg = getMutableComponent(entity, IKLegLeft) as IKLeg<any>;
  const rightLeg = getMutableComponent(entity, IKLegRight) as IKLeg<any>;

  const pose = getMutableComponent(entity, XRPose);

  updateMatrixWorld(leftLeg.transform);
  updateMatrixWorld(leftLeg.upperLeg);
  updateMatrixWorld(leftLeg.lowerLeg);
  updateMatrixWorld(leftLeg.foot);

  updateMatrixWorld(rightLeg.transform);
  updateMatrixWorld(rightLeg.upperLeg);
  updateMatrixWorld(rightLeg.lowerLeg);
  updateMatrixWorld(rightLeg.foot);

  avatarRig.hmdVelocity.copy(pose.head.position).sub(avatarRig.lastHmdPosition);

  const floorHeight = pose.floorHeight;

  const hipsFloorPosition = localVector.copy(avatarRig.hips.position);
  hipsFloorPosition.y = floorHeight;
  const hipsFloorEuler = localEuler.setFromQuaternion(avatarRig.hips.quaternion, 'YXZ');
  hipsFloorEuler.x = 0;
  hipsFloorEuler.z = 0;
  const planeMatrix = localMatrix.compose(hipsFloorPosition, localQuaternion.setFromEuler(hipsFloorEuler), oneVector);
  const planeMatrixInverse = localMatrix2.copy(planeMatrix).invert();

  const fakePosition = localVector2;
  const fakeScale = localVector3;

  const leftFootPosition = localVector4;
  const leftFootRotation = localQuaternion;
  localMatrix3.compose(leftLeg.foot["stickTransform"].position, leftLeg.foot["stickTransform"].quaternion, oneVector)
    .premultiply(planeMatrixInverse)
    .decompose(leftFootPosition, leftFootRotation, fakeScale);

  const rightFootPosition = localVector5;
  const rightFootRotation = localQuaternion2;
  localMatrix3.compose(rightLeg.foot["stickTransform"].position, rightLeg.foot["stickTransform"].quaternion, oneVector)
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
    .decompose(fakePosition, leftLeg.foot["stickTransform"].quaternion, fakeScale);

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
    .decompose(fakePosition, rightLeg.foot["stickTransform"].quaternion, fakeScale);

  const rig = getMutableComponent(entity, IKAvatarRig);

  // step
  const _getLegStepFactor = leg => {
    if (leg.stepping) {
      const scaledStepRate = stepRate
        * Math.max(localVector2.set(avatarRig.hmdVelocity.x, 0, avatarRig.hmdVelocity.z).length() / rig.height, minHmdVelocityTimeFactor);
      return Math.min(Math.max(leg["stepFactor"] + scaledStepRate * delta, 0), 1);
    } else {
      return 0;
    }
  };
  leftLeg["stepFactor"] = _getLegStepFactor(leftLeg);
  rightLeg["stepFactor"] = _getLegStepFactor(rightLeg);

  const leftCanStep = !leftLeg.stepping && (!rightLeg.stepping || rightLeg["stepFactor"] >= crossStepFactor);
  const rightCanStep = !rightLeg.stepping && (!leftLeg.stepping || leftLeg["stepFactor"] >= crossStepFactor);
  const maxStepAngleFactor = 0;
  if (leftCanStep || rightCanStep) {
    let leftStepDistance = 0;
    let leftStepAngleDiff = 0;
    if (leftCanStep) {
      const leftDistance = Math.sqrt(leftFootPosition.x * leftFootPosition.x + leftFootPosition.z * leftFootPosition.z);
      const leftAngleDiff = Math.atan2(leftFootPosition.x, leftFootPosition.z);
      if (leftDistance < rig.height * stepMinDistance || leftDistance > rig.height * stepMaxDistance) {
        leftStepDistance = leftDistance;
      }
      if (leftAngleDiff > -Math.PI * maxStepAngleFactor || leftAngleDiff < -Math.PI + Math.PI * maxStepAngleFactor) {
        leftStepAngleDiff = leftAngleDiff;
      }
    }
    let rightStepDistance = 0;
    let rightStepAngleDiff = 0;
    if (rightCanStep) {
      const rightDistance = Math.sqrt(rightFootPosition.x * rightFootPosition.x + rightFootPosition.z * rightFootPosition.z);
      const rightAngleDiff = Math.atan2(rightFootPosition.x, rightFootPosition.z);
      if (rightDistance < rig.height * stepMinDistance || rightDistance > rig.height * stepMaxDistance) {
        rightStepDistance = rightDistance;
      }
      if (rightAngleDiff < Math.PI * maxStepAngleFactor || rightAngleDiff > Math.PI - Math.PI * maxStepAngleFactor) {
        rightStepAngleDiff = rightAngleDiff;
      }
    }

    const _stepLeg = leg => {
      const footDistance = avatarRig.legSeparation * stepRestitutionDistance;
      leg.foot["startTransform"].position.copy(leg.foot["stickTransform"].position);
      leg.foot["endTransform"].position.copy(hipsFloorPosition)
        .add(localVector6.set((leg.left ? -1 : 1) * footDistance, 0, 0).applyQuaternion(leg.foot["stickTransform"].quaternion));
      const velocityVector = localVector6.set(avatarRig.hmdVelocity.x, 0, avatarRig.hmdVelocity.z);
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
      (rightStepDistance === 0 || Math.abs(leftStepDistance * leftLeg.balance) >= Math.abs(rightStepDistance * rightLeg.balance)) &&
      (rightStepAngleDiff === 0 || Math.abs(leftStepAngleDiff * leftLeg.balance) >= Math.abs(rightStepAngleDiff * rightLeg.balance))) {
      _stepLeg(leftLeg);
      leftLeg.balance = 0;
      rightLeg.balance = 1;
    } else if (rightStepDistance !== 0 || rightStepAngleDiff !== 0) {
      _stepLeg(rightLeg);
      rightLeg.balance = 0;
      leftLeg.balance = 1;
    }
  }

  // position
  if (leftLeg.stepping) {
    leftLeg.foot["stickTransform"].position.copy(leftLeg.foot["startTransform"].position)
      .lerp(leftLeg.foot["endTransform"].position, leftLeg["stepFactor"])
      .add(localVector6.set(0, Math.sin(leftLeg["stepFactor"] * Math.PI) * stepHeight * rig.height, 0));

    if (leftLeg["stepFactor"] >= 1) {
      leftLeg.stepping = false;
    }
  } else {
    const targetPosition = localVector6.copy(leftLeg.foot["stickTransform"].position);
    targetPosition.y = floorHeight;
    leftLeg.foot["stickTransform"].position.lerp(targetPosition, 0.2);
  }
  if (rightLeg.stepping) {
    rightLeg.foot["stickTransform"].position.copy(rightLeg.foot["startTransform"].position)
      .lerp(rightLeg.foot["endTransform"].position, rightLeg["stepFactor"])
      .add(localVector6.set(0, Math.sin(rightLeg["stepFactor"] * Math.PI) * stepHeight * rig.height, 0));
    if (rightLeg["stepFactor"] >= 1) {
      rightLeg.stepping = false;
    }
  } else {
    const targetPosition = localVector6.copy(rightLeg.foot["stickTransform"].position);
    targetPosition.y = floorHeight;
    rightLeg.foot["stickTransform"].position.lerp(targetPosition, 0.2);
  }

  updateLeg(entity, Side.Left);
  updateLeg(entity, Side.Right);

  avatarRig.lastHmdPosition.copy(pose.head.position);
};

const initLeg = (entity: Entity, legSide: Side) => {
  const leg = getMutableComponent(entity, legSide === Side.Left ? IKLegLeft : IKLegRight) as IKLeg<any>;

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

  leg.eyesToUpperLegOffset = new Vector3();

  leg.stepping = false;

  leg.balance = 1;

  leg.upperLegLength = leg.lowerLeg.position.length();
  leg.lowerLegLength = leg.foot.position.length();
  leg.legLength = leg.upperLegLength + leg.lowerLegLength;

  const avatarRig = getMutableComponent(entity, IKAvatarRig);
  getWorldPosition(leg.upperLeg, leg.eyesToUpperLegOffset)
    .sub(getWorldPosition(avatarRig.eyes, localVector));
}

const updateLeg = (entity, legSide) => {
  const leg = getMutableComponent(entity, legSide === Side.Right ? IKLegLeft : IKLegLeft) as IKLeg<any>;

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

export const createModelBones = (skeleton) => {
  const tailBones = getTailBones(skeleton);
  const Eye_L = findEye(tailBones, true);
  const Eye_R = findEye(tailBones, false);
  const Head = findHead(tailBones);
  const Neck = Head.parent;
  const Chest = Neck.parent;
  const Hips = findHips(skeleton);
  const Spine = findSpine(Chest, Hips);
  const Left_shoulder = findShoulder(tailBones, true);
  const Left_wrist = findHand(Left_shoulder);
  const Left_thumb2 = getOptional(findFinger(Left_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02l|l_thumb3|thumb002l/i));
  const Left_thumb1 = ensureParent(Left_thumb2);
  const Left_thumb0 = ensureParent(Left_thumb1, Left_wrist);
  const Left_indexFinger3 = getOptional(findFinger(Left_wrist, /index(?:finger)?3|index_distal|index02l|indexfinger3_l|index002l/i));
  const Left_indexFinger2 = ensureParent(Left_indexFinger3);
  const Left_indexFinger1 = ensureParent(Left_indexFinger2, Left_wrist);
  const Left_middleFinger3 = getOptional(findFinger(Left_wrist, /middle(?:finger)?3|middle_distal|middle02l|middlefinger3_l|middle002l/i));
  const Left_middleFinger2 = ensureParent(Left_middleFinger3);
  const Left_middleFinger1 = ensureParent(Left_middleFinger2, Left_wrist);
  const Left_ringFinger3 = getOptional(findFinger(Left_wrist, /ring(?:finger)?3|ring_distal|ring02l|ringfinger3_l|ring002l/i));
  const Left_ringFinger2 = ensureParent(Left_ringFinger3);
  const Left_ringFinger1 = ensureParent(Left_ringFinger2, Left_wrist);
  const Left_littleFinger3 = getOptional(findFinger(Left_wrist, /little(?:finger)?3|pinky3|little_distal|little02l|lifflefinger3_l|little002l/i));
  const Left_littleFinger2 = ensureParent(Left_littleFinger3);
  const Left_littleFinger1 = ensureParent(Left_littleFinger2, Left_wrist);
  const Left_elbow = Left_wrist.parent;
  const Left_arm = Left_elbow.parent;
  const Right_shoulder = findShoulder(tailBones, false);
  const Right_wrist = findHand(Right_shoulder);
  const Right_thumb2 = getOptional(findFinger(Right_wrist, /thumb3_end|thumb2_|handthumb3|thumb_distal|thumb02r|r_thumb3|thumb002r/i));
  const Right_thumb1 = ensureParent(Right_thumb2);
  const Right_thumb0 = ensureParent(Right_thumb1, Right_wrist);
  const Right_indexFinger3 = getOptional(findFinger(Right_wrist, /index(?:finger)?3|index_distal|index02r|indexfinger3_r|index002r/i));
  const Right_indexFinger2 = ensureParent(Right_indexFinger3);
  const Right_indexFinger1 = ensureParent(Right_indexFinger2, Right_wrist);
  const Right_middleFinger3 = getOptional(findFinger(Right_wrist, /middle(?:finger)?3|middle_distal|middle02r|middlefinger3_r|middle002r/i));
  const Right_middleFinger2 = ensureParent(Right_middleFinger3);
  const Right_middleFinger1 = ensureParent(Right_middleFinger2, Right_wrist);
  const Right_ringFinger3 = getOptional(findFinger(Right_wrist, /ring(?:finger)?3|ring_distal|ring02r|ringfinger3_r|ring002r/i));
  const Right_ringFinger2 = ensureParent(Right_ringFinger3);
  const Right_ringFinger1 = ensureParent(Right_ringFinger2, Right_wrist);
  const Right_littleFinger3 = getOptional(findFinger(Right_wrist, /little(?:finger)?3|pinky3|little_distal|little02r|lifflefinger3_r|little002r/i));
  const Right_littleFinger2 = ensureParent(Right_littleFinger3);
  const Right_littleFinger1 = ensureParent(Right_littleFinger2, Right_wrist);
  const Right_elbow = Right_wrist.parent;
  const Right_arm = Right_elbow.parent;
  const Left_ankle = findFoot(tailBones, true);
  const Left_knee = Left_ankle.parent;
  const Left_leg = Left_knee.parent;
  const Right_ankle = findFoot(tailBones, false);
  const Right_knee = Right_ankle.parent;
  const Right_leg = Right_knee.parent;

  return {
    Hips,
    Spine,
    Chest,
    Neck,
    Head,
    Eye_L,
    Eye_R,

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
}

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

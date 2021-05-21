import { Euler, Matrix4, Object3D, Quaternion, Vector3 } from 'three';
import { localMatrix } from './AvatarMathFunctions';
import { Entity } from "../../ecs/classes/Entity";
import { addComponent, getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { AvatarLegs } from "../components/AvatarLegs";
import { getWorldPosition, copyTransform, updateMatrixWorld, getWorldQuaternion, updateMatrixMatrixWorld, updateMatrix } from "./UnityHelpers";
import { RightLeg } from '../components/RightLeg';
import { LeftLeg } from '../components/LeftLeg';
import { Leg } from '../components/Leg';
import LeftArm from '../components/LeftArm';
import RightArm from '../components/RightArm';

import AvatarShoulders from '../components/AvatarShoulders';
import XRArmIK from '../components/XRArmIK';
import LeftXRArmIK from '../components/LeftXRArmIK';
import RightXRArmIK from '../components/RightXRArmIK';
import Arm from '../components/Arm';

export const upRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 0.5);
export const leftRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI * 0.5);
export const rightRotation = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), -Math.PI * 0.5);

const rightVector = new Vector3(1, 0, 0);
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
const upHalfRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);

const localVector3 = new Vector3();
const localVector4 = new Vector3();
const localVector5 = new Vector3();
const localVector6 = new Vector3();
const localVector7 = new Vector3();
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

export const initXRArmIK = (entity: Entity, armSide: Side, target) => {
  const shoulders = getComponent(entity, AvatarShoulders);
  const armIK = getMutableComponent(entity, armSide === Side.Left ? LeftXRArmIK : RightXRArmIK) as XRArmIK;

  const arm =
    hasComponent(entity, armSide === Side.Left ? LeftArm : RightArm) ? 
    getMutableComponent(entity, armSide === Side.Left ? LeftArm : RightArm) :
    addComponent(entity, armSide === Side.Left ? LeftArm : RightArm);
    
  getMutableComponent(entity, armSide === Side.Left ? LeftXRArmIK : RightXRArmIK) as XRArmIK;

  armIK.arm = arm;
  armIK.shoulder = shoulders;
  armIK.shoulderPoser = shoulders;
  armIK.target = target;

  armIK.upperArmLength = getWorldPosition(armIK.arm.lowerArm, localVector).distanceTo(getWorldPosition(armIK.arm.upperArm, localVector2));
  armIK.lowerArmLength = getWorldPosition(armIK.arm.hand, localVector).distanceTo(getWorldPosition(armIK.arm.lowerArm, localVector2));
  armIK.armLength = armIK.upperArmLength + armIK.lowerArmLength;
}

export const updateXRArmIK = (entity, side: Side) => {
  const armIK = getMutableComponent(entity, side === Side.Left ? LeftXRArmIK : RightXRArmIK);

  updateMatrixWorld(armIK.arm.transform);
  updateMatrixWorld(armIK.arm.upperArm);

  const upperArmPosition = getWorldPosition(armIK.arm.upperArm, localVector);
  const handRotation = armIK.target.quaternion;
  const handPosition = localVector2.copy(armIK.target.position);

  const shoulderRotation = getWorldQuaternion(armIK.shoulder.transform, localQuaternion);
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
  if (armIK.side === Side.Left) {
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
  const upVector = localVector5.set(armIK.side === Side.Left ? -1 : 1, 0, 0).applyQuaternion(shoulderRotation);
  armIK.arm.upperArm.quaternion.setFromRotationMatrix(
    localMatrix.lookAt(
      zeroVector,
      localVector6.copy(elbowPosition).sub(upperArmPosition),
      upVector
    )
  )
    .multiply(armIK.side === Side.Left ? rightRotation : leftRotation)
    .premultiply(getWorldQuaternion(armIK.arm.upperArm.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.arm.upperArm);

  // this.arm.lowerArm.position = elbowPosition;
  armIK.arm.lowerArm.quaternion.setFromRotationMatrix(
    localMatrix.lookAt(
      zeroVector,
      localVector6.copy(handPosition).sub(elbowPosition),
      upVector
    )
  )
    .multiply(armIK.side === Side.Left ? rightRotation : leftRotation)
    .premultiply(getWorldQuaternion(armIK.arm.lowerArm.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.arm.lowerArm);

  // this.arm.hand.position = handPosition;
  armIK.arm.hand.quaternion.copy(armIK.target.quaternion)
    .multiply(armIK.side === Side.Left ? bankRightRotation : bankLeftRotation)
    .premultiply(getWorldQuaternion(armIK.arm.hand.parent, localQuaternion3).invert());
  updateMatrixMatrixWorld(armIK.arm.hand);

  for (const fingerSpec of FINGER_SPECS) {
    const [index, key] = fingerSpec;
    armIK.arm[key].quaternion.copy(armIK.target.fingers[index].quaternion);
    updateMatrixMatrixWorld(armIK.arm[key]);
  }
}

export const updateShoulders = (shoulders: AvatarShoulders) => {
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
}

export const initAvatarShoulders = (entity: Entity) => {
  if(!hasComponent(entity, AvatarShoulders))
    addComponent(entity, AvatarShoulders);
  const avatarShoulders = getMutableComponent(entity, AvatarShoulders);

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

  avatarShoulders.leftArm = (hasComponent(entity, LeftArm) ? getComponent(entity, LeftArm) : addComponent(entity, LeftArm)) as Arm;
  avatarShoulders.rightArm = (hasComponent(entity, RightArm) ? getComponent(entity, RightArm) : addComponent(entity, RightArm)) as Arm;

  initArm(entity, Side.Left);
  initArm(entity, Side.Right);

  avatarShoulders.leftShoulderAnchor.add(avatarShoulders.leftArm.transform);
  avatarShoulders.rightShoulderAnchor.add(avatarShoulders.rightArm.transform);
  
  avatarShoulders.leftArmIk = (hasComponent(entity, LeftXRArmIK) ? getComponent(entity, LeftXRArmIK) : addComponent(entity, LeftXRArmIK)) as XRArmIK;
  avatarShoulders.leftArmIk.shoulderPoser = avatarShoulders.shoulderPoser;
  
  avatarShoulders.leftArmIk = (hasComponent(entity, LeftXRArmIK) ? getComponent(entity, LeftXRArmIK) : addComponent(entity, LeftXRArmIK)) as XRArmIK;
  avatarShoulders.leftArmIk.shoulderPoser = avatarShoulders.shoulderPoser;
  
  initXRArmIK(entity, Side.Left, avatarShoulders.leftHand);
  initXRArmIK(entity, Side.Right, avatarShoulders.rightHand);
}

const initArm = (entity, armSide) => {
  const Arm = armSide === Side.Left ? LeftArm : RightArm;
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
}

export const setupAvatarLegs = (entity, rig) => {
  if (!hasComponent(entity, AvatarLegs))
    addComponent(entity, AvatarLegs);
  const avatarLegs = getMutableComponent(entity, AvatarLegs);

  avatarLegs.hips = rig.shoulderTransforms.hips;
  if(!hasComponent(entity, LeftLeg)){
    avatarLegs.leftLeg = addComponent(entity, LeftLeg) as any;
  }
  if(!hasComponent(entity, RightLeg)){
    avatarLegs.rightLeg = addComponent(entity, RightLeg)  as any;
  }

  avatarLegs.hips.add(avatarLegs.leftLeg.transform);
  avatarLegs.hips.add(avatarLegs.rightLeg.transform);

  avatarLegs.rig = rig;
  avatarLegs.poseManager = rig.poseManager;

  avatarLegs.legSeparation = 0;
  avatarLegs.lastHmdPosition = new Vector3();

  avatarLegs.hmdVelocity = new Vector3();

  avatarLegs.enabled = true;
  avatarLegs.lastEnabled = false;

  avatarLegs.legSeparation = getWorldPosition(avatarLegs.leftLeg.upperLeg, localVector)
    .distanceTo(getWorldPosition(avatarLegs.rightLeg.upperLeg, localVector2));
  avatarLegs.lastHmdPosition.copy(avatarLegs.poseManager.vrTransforms.head.position);
  initLeg(entity, Side.Left);
  initLeg(entity, Side.Right);
  resetAvatarLegs(entity);
};

export const resetAvatarLegs = (entity: Entity) => {
  const avatarLegs = getMutableComponent(entity, AvatarLegs);

  copyTransform(avatarLegs.leftLeg.upperLeg, avatarLegs.rig.modelBones.Right_leg);
  copyTransform(avatarLegs.leftLeg.lowerLeg, avatarLegs.rig.modelBones.Right_knee);
  copyTransform(avatarLegs.leftLeg.foot, avatarLegs.rig.modelBones.Right_ankle);
  avatarLegs.leftLeg.foot.getWorldPosition(avatarLegs.leftLeg.foot["stickTransform"].position);
  avatarLegs.leftLeg.foot.getWorldQuaternion(avatarLegs.leftLeg.foot["stickTransform"].quaternion);

  copyTransform(avatarLegs.rightLeg.upperLeg, avatarLegs.rig.modelBones.Left_leg);
  copyTransform(avatarLegs.rightLeg.lowerLeg, avatarLegs.rig.modelBones.Left_knee);
  copyTransform(avatarLegs.rightLeg.foot, avatarLegs.rig.modelBones.Left_ankle);
  avatarLegs.rightLeg.foot.getWorldPosition(avatarLegs.rightLeg.foot["stickTransform"].position);
  avatarLegs.rightLeg.foot.getWorldQuaternion(avatarLegs.rightLeg.foot["stickTransform"].quaternion);
};

export const updateAvatarLegs = (entity: Entity) => {
  const avatarLegs = getMutableComponent(entity, AvatarLegs);
  if (avatarLegs.enabled) {
    if (!avatarLegs.lastEnabled) {
      resetAvatarLegs(entity);
    }

    updateMatrixWorld(avatarLegs.leftLeg.transform);
    updateMatrixWorld(avatarLegs.leftLeg.upperLeg);
    updateMatrixWorld(avatarLegs.leftLeg.lowerLeg);
    updateMatrixWorld(avatarLegs.leftLeg.foot);

    updateMatrixWorld(avatarLegs.rightLeg.transform);
    updateMatrixWorld(avatarLegs.rightLeg.upperLeg);
    updateMatrixWorld(avatarLegs.rightLeg.lowerLeg);
    updateMatrixWorld(avatarLegs.rightLeg.foot);

    const now = Date.now();

    avatarLegs.hmdVelocity.copy(avatarLegs.poseManager.vrTransforms.head.position).sub(avatarLegs.lastHmdPosition);

    const floorHeight = avatarLegs.poseManager.vrTransforms.floorHeight;

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


    // step
    const _getLegStepFactor = leg => {
      if (leg.stepping) {
        const timeDiff = now - leg.lastStepTimestamp;
        leg.lastStepTimestamp = now;

        const scaledStepRate = stepRate
          * Math.max(localVector2.set(avatarLegs.hmdVelocity.x, 0, avatarLegs.hmdVelocity.z).length() / avatarLegs.rig.height, minHmdVelocityTimeFactor);
        return Math.min(Math.max(leg["stepFactor"] + scaledStepRate * timeDiff, 0), 1);
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
        if (leftDistance < avatarLegs.rig.height * stepMinDistance) {
          leftStepDistance = leftDistance;
        } else if (leftDistance > avatarLegs.rig.height * stepMaxDistance) {
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
        if (rightDistance < avatarLegs.rig.height * stepMinDistance) {
          rightStepDistance = rightDistance;
        } else if (rightDistance > avatarLegs.rig.height * stepMaxDistance) {
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
        if (velocityVectorLength > maxVelocity * avatarLegs.rig.height) {
          velocityVector.multiplyScalar(maxVelocity * avatarLegs.rig.height / velocityVectorLength);
        }
        velocityVector.multiplyScalar(velocityRestitutionFactor);
        leg.foot["endTransform"].position.add(velocityVector);
        leg.foot["startHmdFloorTransform"].position.set(avatarLegs.poseManager.vrTransforms.head.position.x, 0, avatarLegs.poseManager.vrTransforms.head.position.z);

        leg.lastStepTimestamp = now;
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
        .add(localVector6.set(0, Math.sin(avatarLegs.leftLeg["stepFactor"] * Math.PI) * stepHeight * avatarLegs.rig.height, 0));

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
        .add(localVector6.set(0, Math.sin(avatarLegs.rightLeg["stepFactor"] * Math.PI) * stepHeight * avatarLegs.rig.height, 0));
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
  }
  avatarLegs.lastHmdPosition.copy(avatarLegs.poseManager.vrTransforms.head.position);
  avatarLegs.lastEnabled = avatarLegs.enabled;
};

export enum Side {
  Left,
  Right
}

export const initLeg = (entity: Entity, legSide: Side) => {  
  const leg = getMutableComponent(entity, legSide === Side.Right ? RightLeg : LeftLeg) as Leg<any>;
  
  const avatarLegs = getMutableComponent(entity, AvatarLegs);

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
  leg.lastStepTimestamp = 0;

  leg.balance = 1;

  leg.upperLegLength = leg.lowerLeg.position.length();
  leg.lowerLegLength = leg.foot.position.length();
  leg.legLength = leg.upperLegLength + leg.lowerLegLength;

  getWorldPosition(leg.upperLeg, leg.eyesToUpperLegOffset)
    .sub(getWorldPosition(leg.avatarLegs.rig.shoulderTransforms.eyes, localVector));
}

export const updateLeg = (entity, legSide) => {
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
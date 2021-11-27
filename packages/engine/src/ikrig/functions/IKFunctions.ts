// References:
// https://youtu.be/OMmXo3Jejxk
// https://github.com/sketchpunk/FunWithWebGL2/tree/master/lesson_137_ik_rigs

// @ts-nocheck
import { IKRigComponentType, PointData } from '../components/IKRigComponent'
import { Bone, Object3D, Quaternion, Vector3, Matrix4 } from 'three'
import {
  IKPoseComponent,
  IKPoseComponentType,
  IKPoseLimbData,
  IKPoseLookTwist,
  IKPoseSpineData
} from '../components/IKPoseComponent'
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from '../../ikrig/constants/Vector3Constants'
import { addChain, addPoint } from './RigFunctions'
import Pose, { PoseBoneLocalState } from '../classes/Pose'
import { Chain } from '../classes/Chain'
import { solveThreeBone } from './IKSolvers'
import { glMatrix, mat4 } from 'gl-matrix'

const tempMat = new Matrix4()
const tempQuat1 = new Quaternion()
const tempQuat2 = new Quaternion()
const tempVec1 = new Vector3()
const tempVec2 = new Vector3()
const tempVec3 = new Vector3()
const tempVec4 = new Vector3()

/**
 * Used when we know three sides of the triangle, and want to find the missing angle.
 * cos(C) = (a^2 + b^2 - c^2) / 2ab
 * @param aLen Length of side a
 * @param bLen Length of side b
 * @param cLen Length of side c
 * @returns Angle C in radians
 */
export function cosSSS(aLen: number, bLen: number, cLen: number): number {
  // The Angle between A and B with C being the opposite length of the angle.
  let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen)
  if (v < -1) v = -1
  // Clamp to prevent NaN Errors
  else if (v > 1) v = 1
  return Math.acos(v)
}

/**
 * Auto Setup the Points and Chains based on Known Skeleton Structures.
 * @param rig
 */
export function setupMixamoIKRig(rig: IKRigComponentType): void {
  rig.points = {}
  rig.chains = {}

  addPoint(rig, 'hip', 'Hips')
  addPoint(rig, 'head', 'Head')
  addPoint(rig, 'neck', 'Neck')
  addPoint(rig, 'chest', 'Spine2')
  addPoint(rig, 'foot_l', 'LeftFoot')
  addPoint(rig, 'foot_r', 'RightFoot')
  addChain(rig, 'arm_r', ['RightArm', 'RightForeArm'], 'RightHand') //"x",
  addChain(rig, 'arm_l', ['LeftArm', 'LeftForeArm'], 'LeftHand') //"x",
  addChain(rig, 'leg_r', ['RightUpLeg', 'RightLeg'], 'RightFoot') //"z",
  addChain(rig, 'leg_l', ['LeftUpLeg', 'LeftLeg'], 'LeftFoot') //"z",
  addChain(rig, 'spine', ['Spine', 'Spine1', 'Spine2']) //, "y"

  rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.arm_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.arm_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_l.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.leg_r.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.arm_r.setOffsets(RIGHT, BACK, rig.tpose)
  rig.chains.arm_l.setOffsets(LEFT, BACK, rig.tpose)
}

/**
 * Auto Setup the Points and Chains based on Known Skeleton Structures.
 * @param rig
 */
export function setupTRexIKRig(rig: IKRigComponentType): void {
  rig.points = {}
  rig.chains = {}
  // TODO:Fix

  addPoint(rig, 'hip', 'hip')
  addPoint(rig, 'head', 'face_joint')
  addPoint(rig, 'foot_l', 'LeftFoot')
  addPoint(rig, 'foot_r', 'RightFoot')

  addPoint(rig, 'wing_l', 'left_wing')
  addPoint(rig, 'wing_r', 'right_wing')

  addChain(rig, 'leg_r', ['RightUpLeg', 'RightKnee', 'RightShin'], 'RightFoot', solveThreeBone)
  addChain(rig, 'leg_l', ['LeftUpLeg', 'LeftKnee', 'LeftShin'], 'LeftFoot', solveThreeBone)
  addChain(rig, 'spine', ['Spine', 'Spine1'])
  addChain(rig, 'tail', ['tail_1', 'tail_2', 'tail_3', 'tail_4', 'tail_5', 'tail_6', 'tail_7'])
  // TODO: create set_leg_lmt and apply?
  // set_leg_lmt(entity, null, -0.1 )

  rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_l.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.leg_r.setOffsets(DOWN, FORWARD, rig.tpose)
}

/**
 * Compute the IK pose based on the original pose
 * @param rig
 * @param ikPose
 */
export function computeIKPose(rig: IKRigComponentType, ikPose: IKPoseComponentType): void {
  updatePoseBonesFromSkeleton(rig)

  computeHip(rig, ikPose)

  computeLimb(rig.pose, rig.chains.leg_l, ikPose.leg_l)
  computeLimb(rig.pose, rig.chains.leg_r, ikPose.leg_r)

  computeLookTwist(rig, rig.points.foot_l, ikPose.foot_l, FORWARD, UP) // Look = Fwd, Twist = Up
  computeLookTwist(rig, rig.points.foot_r, ikPose.foot_r, FORWARD, UP)

  computeSpine(rig, rig.chains.spine, ikPose, UP, FORWARD)

  computeLimb(rig.pose, rig.chains.arm_l, ikPose.arm_l)
  computeLimb(rig.pose, rig.chains.arm_r, ikPose.arm_r)

  computeLookTwist(rig, rig.points.head, ikPose.head, FORWARD, UP)
}

const rootParentWorldInverseMatrix = new Matrix4()
const boneModelMatrix = new Matrix4()

/**
 * Update pose bones from animated skeleton bones
 *
 * Takes the actual positions relative to the parent of the root bone and applies this transform to the new pose
 * @param rig
 */
function updatePoseBonesFromSkeleton(rig: IKRigComponentType): void {
  // todo cache
  const { rootParent } = rig
  rootParent.updateWorldMatrix(true, true)

  if (!rootParent) return

  rootParentWorldInverseMatrix.copy(rootParent.matrixWorld).invert()

  for (let i = 0; i < rig.pose.skeleton.bones.length; i++) {
    const bone = rig.pose.skeleton.bones[i]
    const pose = rig.pose.bones[i]

    boneModelMatrix.multiplyMatrices(rootParentWorldInverseMatrix, bone.matrixWorld)
    boneModelMatrix.decompose(pose.world.position, pose.world.quaternion, pose.world.scale)

    pose.local.position.copy(bone.position)
    pose.local.quaternion.copy(bone.quaternion)
    pose.local.scale.copy(bone.scale)
  }
}

/**
 * Computes Hip IK and stores it in the ikPose
 * @param rig Skeleton rig data
 * @param ikPose Pose to save computed data into
 */
export function computeHip(rig: IKRigComponentType, ikPose: IKPoseComponentType) {
  // First thing we need is the Hip bone from the Animated Pose
  // Plus what the hip's Bind Pose as well.
  // We use these two states to determine what change the animation did to the tpose.

  const boneInfo = rig.points.hip, // Rig Hip Info
    poseBoneInfo = rig.pose.bones[boneInfo.index], // Animated Pose Bone
    bindBoneInfo = rig.tpose.bones[boneInfo.index] // TPose Bone

  // Lets create the Quaternion Inverse Direction based on the
  // TBone's World Space rotation. We don't really know the orientation
  // of the bone's starting rotation and our targets will have their own
  // orientation, so by doing this we can easily say no matter what the
  // default direction of the hip, we want to say all hips bones point
  // at the FORWARD axis and the tail of the bone points UP.

  const quatInverse = bindBoneInfo.world.invQuaternion
  const altForward = tempVec1.copy(FORWARD).applyQuaternion(quatInverse)
  const altUp = tempVec2.copy(UP).applyQuaternion(quatInverse)
  const poseForward = tempVec3.copy(altForward).applyQuaternion(poseBoneInfo.world.quaternion)
  const poseUp = tempVec4.copy(altUp).applyQuaternion(poseBoneInfo.world.quaternion)

  // With our directions known between our TPose and Animated Pose, Next we
  // start to calculate the Swing and Twist Values to swing our TPose into
  // The animation direction

  const bindFwd = tempVec1.copy(FORWARD).applyQuaternion(bindBoneInfo.world.quaternion)

  const swing = tempQuat1
    .setFromUnitVectors(bindFwd, poseForward) // First we create a swing rotation from one dir to the other.
    .multiply(bindBoneInfo.world.quaternion) // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

  // A new Up direction based on only swing.
  const swingUp = tempVec2.copy(UP).applyQuaternion(swing)
  let twist = swingUp.angleTo(poseUp) // Swing + Pose have same Fwd, Use Angle between both UPs for twist

  // The difference between Pose UP and Swing UP is what makes up our twist since they both
  // share the same forward access. The issue is that we do not know if that twist is in the Negative direction
  // or positive. So by computing the Swing Left Direction, we can use the Dot Product to determine
  // if swing UP is Over 90 Degrees, if so then its a positive twist else its negative.
  const dot = swingUp.cross(poseForward).dot(poseUp)
  if (dot >= 0) twist = -twist

  // Save all the info we need to our IK Pose.
  ikPose.hip.bind_height = bindBoneInfo.local.position.y // The Bind Pose Height of the Hip, Helps with scaling.
  ikPose.hip.movement.copy(poseBoneInfo.world.position).sub(bindBoneInfo.world.position) // How much movement did the hip do between Bind and Animated.
  ikPose.hip.dir.copy(poseForward) // Pose Forward is the direction we want the Hip to Point to.
  ikPose.hip.twist = twist // How Much Twisting to Apply after pointing in the correct direction.
}

/**
 * Computes Limbs IK
 * @param pose
 * @param chain
 * @param ikLimb
 */
export function computeLimb(pose: Pose, chain: Chain, ikLimb) {
  // Limb IK tends to be fairly easy to determine. What you need is the direction the end effector is in
  // relation to the beginning of the limb chain, like the Shoulder for an arm chain. After you have the
  // direction, you can use it to get the distance. Distance is important to create a scale value based on
  // the length of the chain. Since an arm or leg's length can vary between models, if you normalize the
  // distance, it becomes easy to translate it to other models. The last bit of info is we need the direction
  // that the joint needs to point. In this example, we precompute the Quaternion Inverse Dir for each chain
  // based on the bind pose. We can transform that direction with the Animated rotation to give us where the
  // joint direction has moved to.

  // TODO: Our bones are getting further apart, so we need to figure out why
  const boneA = pose.bones[chain.first()], // First Bone
    boneB = pose.bones[chain.end_idx] // END Bone, which is not part of the chain (Hand,Foot)

  const aToBVector = tempVec1.subVectors(boneB.world.position, boneA.world.position) // Direction from First Bone to Final Bone ( IK Direction )

  // Compute the final IK Information needed for the Limb
  ikLimb.lengthScale = aToBVector.length() / chain.length // Normalize the distance base on the length of the Chain.
  ikLimb.dir.copy(aToBVector).normalize() // We also normalize the direction to the end effector.

  // We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
  const leftDir = tempVec2.copy(chain.altUp).applyQuaternion(boneA.world.quaternion).cross(aToBVector) // We need left to realign up
  ikLimb.jointDirection.copy(aToBVector).cross(leftDir).normalize() // Recalc Up, make it orthogonal to LEFT and FWD
}

/**
 * Computes twist for the feet and head bones
 * @param rig
 * @param boneInfo
 * @param ik
 * @param lookDirection
 * @param twistDirection
 */
export function computeLookTwist(
  rig: IKRigComponentType,
  boneInfo: PointData,
  ik: IKPoseLookTwist,
  lookDirection: Vector3,
  twistDirection: Vector3
) {
  const pose = rig.pose.bones[boneInfo.index],
    bind = rig.tpose.bones[boneInfo.index] // TPose Bone

  // First compute the Quaternion Invert Directions based on the Defined
  // Directions that was passed into the function. Most often, your look
  // direction is FORWARD and the Direction used to determine twist is UP.
  // But there are times we need the directions to be different depending
  // on how we view the bone in certain situations.

  const invQuat = bind.world.invQuaternion
  const altLookDirection = tempVec1.copy(lookDirection).applyQuaternion(invQuat),
    altTwistDirection = tempVec2.copy(twistDirection).applyQuaternion(invQuat)

  ik.lookDirection.copy(altLookDirection).applyQuaternion(pose.world.quaternion)
  ik.twistDirection.copy(altTwistDirection).applyQuaternion(pose.world.quaternion)
}

/**
 * Computes spine IK pose
 * @param rig
 * @param chain
 * @param ikPose
 * @param lookDirection
 * @param twistDirection
 */
export function computeSpine(
  rig: IKRigComponentType,
  chain: Chain,
  ikPose: IKPoseComponentType,
  lookDirection: Vector3,
  twistDirection: Vector3
): void {
  const idx_ary = [chain.first(), chain.last()],
    lookDir = tempVec1,
    twistDir = tempVec2

  let j = 0,
    poseBone: PoseBoneLocalState,
    bindBone: PoseBoneLocalState

  for (const i of idx_ary) {
    // First get reference to the Bones
    bindBone = rig.tpose.bones[i]
    poseBone = rig.pose.bones[i]

    // Create Quat Inverse Direction
    // Transform the Inv Dir by the Animated Pose to get their direction

    const quatInverse = bindBone.world.invQuaternion
    lookDir.copy(lookDirection).applyQuaternion(quatInverse).applyQuaternion(poseBone.world.quaternion)
    twistDir.copy(twistDirection).applyQuaternion(quatInverse).applyQuaternion(poseBone.world.quaternion)

    // Save IK
    ikPose.spine[j].lookDirection.copy(lookDir)
    ikPose.spine[j].twistDirection.copy(twistDir)
    j++
  }
}

/**
 * Applies updated pose to given rig
 * @param targetRig will be modified
 * @param ikPose
 */
export function applyIKPoseToIKRig(targetRig: IKRigComponentType, ikPose: IKPoseComponentType): void {
  applyHip(ikPose, targetRig)

  applyLimb(ikPose, targetRig, targetRig.chains.leg_l, ikPose.leg_l)
  applyLimb(ikPose, targetRig, targetRig.chains.leg_r, ikPose.leg_r)

  applyLookTwist(ikPose, targetRig, 'foot_l', FORWARD, UP)
  applyLookTwist(ikPose, targetRig, 'foot_r', FORWARD, UP)
  applySpine(ikPose, targetRig, targetRig.chains.spine, ikPose.spine, UP, FORWARD)

  if (targetRig.chains.arm_l) applyLimb(ikPose, targetRig, targetRig.chains.arm_l, ikPose.arm_l)
  if (targetRig.chains.arm_r) applyLimb(ikPose, targetRig, targetRig.chains.arm_r, ikPose.arm_r)

  applyLookTwist(ikPose, targetRig, 'head', FORWARD, UP)

  // update real bones with calculated
  applyPoseToRig(targetRig)
}

/**
 * update skeleton bones by pose bones states
 * @param targetRig
 */
export function applyPoseToRig(targetRig: IKRigComponentType) {
  for (let i = 0; i < targetRig.pose.bones.length; i++) {
    const poseBone = targetRig.pose.bones[i]
    const armatureBone = poseBone.bone

    armatureBone.position.copy(poseBone.local.position)
    armatureBone.quaternion.copy(poseBone.local.quaternion)
    armatureBone.scale.copy(poseBone.local.scale)
  }
  targetRig.pose.skeleton.update()
}

/**
 * Applies hip of the ik pose to ik rig
 * @param ikPose
 * @param rig
 */
export function applyHip(ikPose: ReturnType<typeof IKPoseComponent.get>, rig: IKRigComponentType) {
  // First step is we need to get access to the Rig's TPose and Pose Hip Bone.
  // The idea is to transform our Bind Pose into a New Pose based on IK Data
  const boneInfo = rig.points.hip
  const bind = rig.tpose.bones[boneInfo.index]

  // Apply IK Swing & Twist ( HANDLE ROTATION )
  // When we compute the IK Hip, We used quaternion invert direction and defined that
  // the hip always points in the FORWARD Axis, so We can use that to quicky get Swing Rotation
  // Take note that vegeta and roborex's Hips are completely different but by using that inverse
  // direction trick, we are easily able to apply the same movement to both.

  const parentRotation = rig.tpose.getParentRotation(boneInfo.index)

  const q = tempQuat1
    .setFromUnitVectors(FORWARD, ikPose.hip.dir) // Create Swing Rotation
    .multiply(bind.world.quaternion) // Apply it to our WS Rotation

  // If There is a Twist Value, Apply that as a PreMultiplication.
  if (ikPose.hip.twist != 0) q.premultiply(tempQuat2.setFromAxisAngle(ikPose.hip.dir, ikPose.hip.twist))

  // In the end, we need to convert to local space. Simply premul by the inverse of the parent
  // pmul_invert(q, parentRotation)
  q.premultiply(tempQuat2.copy(parentRotation).invert())

  // TRANSLATION
  const h_scl = bind.world.position.y / ikPose.hip.bind_height // Create Scale value from Src's Hip Height and Target's Hip Height
  const position = tempVec1
    .copy(ikPose.hip.movement)
    .multiplyScalar(h_scl) // Scale the Translation Differnce to Match this Models Scale
    .add(bind.world.position) // Then Add that change to the TPose Position

  // MAYBE we want to keep the stride distance exact, we can reset the XZ positions
  // BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
  // our source is taller then our targets, this will cause our target legs to always
  // straighten out.
  // position.x = ikPose.hip.movement.x;
  // position.z = ikPose.hip.movement.z;

  const pose = rig.pose.bones[boneInfo.index]
  pose.local.quaternion.copy(q) // Save LS rotation to pose
  pose.local.position.copy(position) // Save LS rotation to pose

  pose.world.position.copy(rig.pose.bones[boneInfo.index].local.position)
  pose.world.quaternion.copy(rig.pose.bones[boneInfo.index].local.quaternion)
}

/**
 * Applies limbs of the ik pose to ik rig
 * @param ikPose
 * @param rig
 * @param chain
 * @param limb
 * @param grounding
 */
export function applyLimb(
  ikPose: ReturnType<typeof IKPoseComponent.get>,
  rig: IKRigComponentType,
  chain: Chain,
  limb: IKPoseLimbData,
  grounding = 0
) {
  // Setup IK Target
  const bindBoneData = rig.pose.bones[chain.first()]
  const bindBone = bindBoneData.bone

  const parentTransform = {
    position: tempVec1,
    quaternion: tempQuat1,
    scale: tempVec2
  }
  const childTransform = {
    position: tempVec3,
    quaternion: tempQuat2,
    scale: tempVec4
  }

  //bindBone.parent.matrixWorld.decompose(parentTransform.position, parentTransform.quaternion, parentTransform.scale)
  //bindBone.matrixWorld.decompose(childTransform.position, childTransform.quaternion, childTransform.scale)

  rig.pose.get_parent_world(chain.first(), parentTransform, childTransform)

  // How much of the Chain length to use to calc End Effector
  // let len = (rig.leg_len_lmt || chain.len) * limb.len_scale
  let len = chain.length * limb.lengthScale

  // this.target.from_pos_dir( c_tran.pos, limb.dir, limb.joint_dir, len );	// Setup IK Target
  targetFromPosDir(ikPose, childTransform.position, limb.dir, limb.jointDirection, len)

  //////////

  // TODO: test it, currently not used in apply (same as in original lib example)
  if (grounding) applyGrounding(ikPose, grounding)

  // --------- IK Solver
  chain.ikSolver(chain, rig.tpose, rig.pose, ikPose.axis, ikPose.length, parentTransform)

  // apply calculated positions to "real" bones
  chain.chainBones.forEach(({ index: boneIndex }) => {
    const poseBone = rig.pose.bones[boneIndex]

    poseBone.bone.position.copy(poseBone.local.position)
    poseBone.bone.quaternion.copy(poseBone.local.quaternion)
    poseBone.bone.scale.copy(poseBone.local.scale)
  })
}

/**
 *
 * @param ikPose will be modified
 * @param pos
 * @param dir
 * @param up_dir
 * @param len_scl
 */
function targetFromPosDir(
  ikPose: IKPoseComponentType,
  pos: Vector3,
  dir: Vector3,
  up_dir: Vector3,
  len_scl: number
): void {
  ikPose.startPosition.copy(pos)
  ikPose.endPosition
    .copy(dir)
    .multiplyScalar(len_scl) // Compute End Effector
    .add(pos)

  const len_sqr = ikPose.startPosition.distanceToSquared(ikPose.endPosition)
  ikPose.length = Math.sqrt(len_sqr)

  ikPose.axis.fromDirection(dir, up_dir) // Target Axis
}

/**
 * Apply look/twist part of the pose to the target rig
 * @param ikPose
 * @param rig apply the pose to this rig
 * @param boneName
 * @param lookDirection
 * @param twistDirection
 * @returns
 */
export function applyLookTwist(
  ikPose: IKPoseComponentType,
  rig: IKRigComponentType,
  boneName: string,
  lookDirection: Vector3,
  twistDirection: Vector3
) {
  // First we need to get the WS Rotation of the parent to the Foot
  // Then Add the Foot's LS Bind rotation. The idea is to see where
  // the foot will currently be if it has yet to have any rotation
  // applied to it.
  const boneInfo = rig.points[boneName],
    ik: IKPoseLookTwist = ikPose[boneName]

  const bind = rig.tpose.bones[boneInfo.index]

  const rootQuaternion = rig.pose.getParentRotation(boneInfo.index)
  const childRotation = tempQuat1.copy(rootQuaternion).multiply(bind.local.quaternion)

  // Next we need to get the Foot's Quaternion Inverse Direction
  // Which matches up with the same Directions used to calculate the IK
  // information.
  const quatInverse = bind.world.invQuaternion

  const altLookDirection = tempVec1.copy(lookDirection).applyQuaternion(quatInverse),
    altTwistDirection = tempVec2.copy(twistDirection).applyQuaternion(quatInverse)

  // After the HIP was moved and The Limb IK is complete, This is where
  // the ALT Look Direction currently points to.
  const currentLookDirection = tempVec3.copy(altLookDirection).applyQuaternion(childRotation)

  // Now we start building out final rotation that we
  // want to apply to the bone to get it pointing at the
  // right direction and twisted to match the original animation.
  const rotation = tempQuat2.setFromUnitVectors(currentLookDirection, ik.lookDirection) // Create our Swing Rotation
  rotation.multiply(childRotation) // Then Apply to our foot

  // Now we need to know where the Twist Direction points to after
  // swing rotation has been applied. Then use it to compute our twist rotation.
  const currentTwistDirection = altTwistDirection.applyQuaternion(rotation)
  const twist = tempQuat1.setFromUnitVectors(currentTwistDirection, ik.twistDirection)
  rotation.premultiply(twist) // Apply Twist

  rotation.premultiply(tempQuat1.copy(rootQuaternion).invert()) // To Local Space

  rig.pose.setBone(boneInfo.index, rotation) // Save to pose.
}

/**
 * Keep the feet on the ground
 * @param ikPose
 * @param yLimit
 */
export function applyGrounding(ikPose: IKPoseComponentType, yLimit: number): void {
  // Once we have out IK Target setup, We can use its data to test various things
  // First we can test if the end effector is below the height limit. Each foot
  // may need a different off the ground offset since the bones rarely touch the floor
  // perfectly.

  // Where on the line between the Start and end Points would work for our
  // Y Limit. An easy solution is to find the SCALE based on doing a 1D Scale
  //operation on the Y Values only. Whatever scale value we get with Y we can use on X and Z
  const a = ikPose.startPosition,
    b = ikPose.endPosition,
    s = (yLimit - a.y) / (b.y - a.y) // Normalize Limit Value in the Max/Min Range of Y.

  // Change the end effector of our target
  ikPose.endPosition.set((b.x - a.x) * s + a.x, yLimit, (b.z - a.z) * s + a.z)

  // Since we changed the end effector, lets update the Sqr Length and Length of our target
  // This is normally computed by our IK Target when we set it, but since I didn't bother
  // to create a method to update the end effector, we need to do these extra updates.
  const distance = ikPose.startPosition.distanceTo(ikPose.endPosition)
  ikPose.length = distance
}

/**
 * Apply the pose to the target rig
 * @param ikPose
 * @param rig
 * @param chain
 * @param ik
 * @param lookDirection
 * @param twistDirection
 */
export function applySpine(
  ikPose: IKPoseComponentType,
  rig: IKRigComponentType,
  chain: Chain,
  ik: IKPoseSpineData,
  lookDirection: Vector3,
  twistDirection: Vector3
) {
  // For the spine, we have the start and end IK directions. Since spines can have various
  // amount of bones, the simplest solution is to lerp from start to finish. The first
  // spine bone is important to control offsets from the hips, and the final one usually
  // controls the chest which dictates where the arms and head are going to be located.
  // Anything between is how the spine would kind of react.
  // Since we are building up the Skeleton, We look at the pose object to know where the Hips
  // currently exist in World Space.

  const boneInfo = rig.pose.bones[chain.first()]
  const parentInfo = rig.pose.bones[boneInfo.p_idx]

  // TODO: rig.pose.get_parent_world( chain.first() )

  // Copy bone to our transform variables to work on them
  ikPose.spineParentPosition.copy(parentInfo.local.position)
  ikPose.spineChildPosition.copy(boneInfo.local.position)

  ikPose.spineParentQuaternion.copy(parentInfo.local.quaternion)
  ikPose.spineChildQuaternion.copy(boneInfo.local.quaternion)

  ikPose.spineParentScale.copy(parentInfo.local.scale)
  ikPose.spineChildScale.copy(boneInfo.local.scale)

  const cnt = chain.cnt - 1

  for (let i = 0; i <= cnt; i++) {
    // Prepare for the Iteration
    const boneIndex = chain.chainBones[i].index // Bone Index
    const boneBind = rig.tpose.bones[boneIndex] // Bind Values of the Bone
    const t = i / cnt // ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently

    // Get bone in WS that has yet to have any rotation applied
    // childTransform.setFromAdd(parentTransform, bind);

    // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
    const v = tempVec1
      .copy(ikPose.spineParentScale)
      .multiply(boneBind.local.position) // parent.scale * child.position;
      .applyQuaternion(ikPose.spineParentQuaternion) //Vec3.transformQuat( v, tp.quaternion, v );
    ikPose.spineChildPosition.copy(ikPose.spineParentPosition).add(v) // Vec3.add( tp.position, v, this.position );

    // SCALE - parent.scale * child.scale
    ikPose.spineChildScale.copy(ikPose.spineParentScale).multiply(boneBind.local.scale)

    // ROTATION - parent.quaternion * child.quaternion
    ikPose.spineChildQuaternion.copy(ikPose.spineParentQuaternion).multiply(boneBind.local.quaternion)

    // Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
    const invQuat = boneBind.world.invQuaternion
    const altLook = tempVec3.copy(lookDirection).applyQuaternion(invQuat)
    const altTwist = tempVec4.copy(twistDirection).applyQuaternion(invQuat)

    const currentLook = altLook.applyQuaternion(ikPose.spineChildQuaternion) // What direction is the bone point looking now, without any extra rotation

    // Lerp our Target IK Directions for this bone
    const ikLook = tempVec1.lerpVectors(ik[0].lookDirection, ik[1].lookDirection, t)
    const ikTwist = tempVec2.lerpVectors(ik[0].twistDirection, ik[1].twistDirection, t)

    const rotation = tempQuat2
      .setFromUnitVectors(currentLook, ikLook) // Create our Swing Rotation
      .multiply(ikPose.spineChildQuaternion) // Then Apply to our Bone, so its now swong to match the swing direction.

    const currentTwist = altTwist.applyQuaternion(rotation) // Get our Current Twist Direction from Our Swing Rotation
    const quat = tempQuat1.setFromUnitVectors(currentTwist, ikTwist) // Create our twist rotation
    rotation.premultiply(quat) // Apply Twist so now it matches our IK Twist direction

    const spineParentQuaternionInverse = tempQuat1.copy(ikPose.spineParentQuaternion).invert()

    rotation.premultiply(spineParentQuaternionInverse) // To Local Space

    rig.pose.setBone(boneIndex, rotation) // Save result to bone.
    // rig.pose.bones[boneIndex].bone.setRotationFromQuaternion(rotation) // Save result to bone.
    // rig.pose.bones[boneIndex].local.quaternion.copy(rotation) // Save result to bone.

    if (t != 1) {
      // ORIGINAL CODE is
      // this.add(ikPose.spineParentQuaternion, rotation, boneBindValue.position, boneBindValue.scale); // Compute the WS Transform for the next bone in the chain.
      const parentScaleChildPosition = tempVec1
        .copy(ikPose.spineParentScale)
        .multiply(boneBind.local.position)
        .applyQuaternion(ikPose.spineParentQuaternion)
      // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
      // TODO: Multiplied in proper order?
      ikPose.spineParentPosition.copy(ikPose.spineParentPosition).add(parentScaleChildPosition)
      // SCALE - parent.scale * child.scale
      ikPose.spineParentScale.multiply(boneBind.local.scale)
      // ROTATION - parent.quaternion * child.quaternion
      ikPose.spineParentQuaternion.multiply(rotation)
    }
  }
}

/**
 *
 * @param pose
 * @param dir
 * @param boneNames
 */
export function alignChain(pose: Pose, dir: Vector3, boneNames: string[]) {
  const aEnd = boneNames.length - 1 // End Index

  for (let i = 0; i <= aEnd; i++) {
    let bone: Object3D = pose.skeleton.bones.find((bone) => (bone.name = boneNames[i])) // Bone Reference

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Up direction is where we need the bone to point to.
    // We then get the bone's current forward direction, use it
    // to get its left, then finish it off by recalculating
    // fwd to make it orthogonal. Want to try to keep the orientation
    // while ( fwd, lft ) realigning the up direction.
    const childWorldQ = tempQuat1
    bone.getWorldQuaternion(childWorldQ)

    const forwardDir = tempVec1.copy(FORWARD).applyQuaternion(childWorldQ) // Find Bone's Forward World Direction
    const leftDir = tempVec2.crossVectors(upDir, forwardDir).normalize() // Get World Left
    forwardDir.crossVectors(leftDir, upDir).normalize() // Realign Forward
    const upDir = tempVec3.copy(dir)

    const finalRotation = tempQuat2
    tempMat.makeBasis(leftDir, upDir, forwardDir)
    finalRotation.setFromRotationMatrix(tempMat) // Create Rotation from rot Matrix

    if (finalRotation.dot(childWorldQ) < 0) negateQuat(finalRotation) // Do a Inverted rotation check, negate it if under zero.

    const parentWorldQ = tempQuat1
    bone.getWorldQuaternion(parentWorldQ)

    //r.pmul( q.from_invert( pt.rot ) );		// Move rotation to local space
    pmulInvert(finalRotation, parentWorldQ) // Move rotation to local space
    // pose.set_bone( bone.idx, finalRotation );					// Update Pose with new ls rotation
    bone.setRotationFromQuaternion(finalRotation)

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // If not the last bone, take then the new rotation to calc the next parents
    // world space transform for the next bone on the list.
    if (i != aEnd) {
      // pt.add( finalRotation, bone.local.pos, bone.local.scl );
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
      // const t = new Vector3().copy(childWorldP).add(new Vector3().copy(childWorldS).multiply(bone.position))
      // transformQuat(t, childWorldQ)

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // SCALE - parent.scale * child.scale
      const parentWorldS = tempVec1
      bone.getWorldScale(parentWorldS)
      parentWorldS.multiply(bone.scale)

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // ROTATION - parent.rotation * child.rotation
      parentWorldQ.multiply(finalRotation)
      const parentWorldP = tempVec2
      bone.getWorldPosition(parentWorldP)

      bone = pose.bones.find((bone) => (bone.name = boneNames[i + 1])).bone as Object3D // Bone Reference
      bone.position.copy(parentWorldP)
      bone.quaternion.copy(parentWorldQ)
      bone.scale.copy(parentWorldS)
    }
  }
  pose.skeleton.update()
}

export function pmulInvert(qOut: Quaternion, q: Quaternion) {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // q.invert()
  let ax = q.x,
    ay = q.y,
    az = q.z,
    aw = q.w
  const dot = ax * ax + ay * ay + az * az + aw * aw

  if (dot == 0) {
    ax = ay = az = aw = 0
  } else {
    const dotInv = 1.0 / dot
    ax = -ax * dotInv
    ay = -ay * dotInv
    az = -az * dotInv
    aw = aw * dotInv
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Quat.mul( a, b );
  const bx = qOut.x,
    by = qOut.y,
    bz = qOut.z,
    bw = qOut.w
  qOut.x = ax * bw + aw * bx + ay * bz - az * by
  qOut.y = ay * bw + aw * by + az * bx - ax * bz
  qOut.z = az * bw + aw * bz + ax * by - ay * bx
  qOut.w = aw * bw - ax * bx - ay * by - az * bz
}

export function negateQuat(q: Quaternion): Quaternion {
  q.x = -q.x
  q.y = -q.y
  q.z = -q.z
  q.w = -q.w
  return q
}

export function spinBoneForward(pose: Pose, foot: string) {
  // TODO: check if this function is used
  console.warn('spin_bone_forward is not tested')
  const v = tempVec1,
    q = tempQuat1,
    boneState = pose.getBone(foot)
  const b = boneState.bone

  const parentWorldQuaternion = tempQuat2
  b.parent.getWorldQuaternion(parentWorldQuaternion)

  b.position.copy(v).add(tempVec2.set(0, boneState.length, 0))

  v.multiply(scl)
  v.applyQuaternion(rot)

  // v.sub( b.position );							// Get The direction to the tail
  v.x = 0 // Flatten vector to 2D by removing Y Position
  v.normalize() // Make it a unit vector
  q.setFromUnitVectors(v, FORWARD) // Rotation needed to point the foot forward.
  q.multiply(b.quaternion) // Move WS Foot to point forward
  pmulInvert(q, b.quaternion) // To Local Space
  pose.setBone(boneState.idx, q) // Save to Pose
}

export function pmulAxisAngle(out, axis, angle) {
  const half = angle * 0.5,
    s = Math.sin(half),
    ax = axis.x * s, // A Quat based on Axis Angle
    ay = axis.y * s,
    az = axis.z * s,
    aw = Math.cos(half),
    bx = out.x, // B of mul
    by = out.y,
    bz = out.z,
    bw = out.w

  // Quat.mul( a, b );
  out.x = ax * bw + aw * bx + ay * bz - az * by
  out.y = ay * bw + aw * by + az * bx - ax * bz
  out.z = az * bw + aw * bz + ax * by - ay * bx
  out.w = aw * bw - ax * bx - ay * by - az * bz
}

export function alignBoneForward(pose: Pose, b_name: string) {
  // TODO: check if this function is used
  console.warn('spin_bone_forward is not tested')
  const v = tempVec1,
    q = tempQuat1,
    boneState = pose.getBone(b_name)
  const b = boneState.bone

  const parentWorldQuaternion = tempQuat2
  b.parent.getWorldQuaternion(parentWorldQuaternion)

  fromQuat(v, b.quaternion, UP) // Get Bone's WS UP Direction

  q.setFromUnitVectors(v, FORWARD) // Difference between Current UP and WS Forward
  q.multiply(b.quaternion) // PreMul Difference to Current Rotation
  pmulInvert(q, parentWorldQuaternion) // Convert to Local Space

  pose.setBone(boneState.idx, q) // Save to Pose
}

function fromQuat(out: Vector3, q: Quaternion, v: Vector3) {
  const qx = q.x,
    qy = q.y,
    qz = q.z,
    qw = q.w,
    vx = v.x,
    vy = v.y,
    vz = v.z,
    x1 = qy * vz - qz * vy,
    y1 = qz * vx - qx * vz,
    z1 = qx * vy - qy * vx,
    x2 = qw * x1 + qy * z1 - qz * y1,
    y2 = qw * y1 + qz * x1 - qx * z1,
    z2 = qw * z1 + qx * y1 - qy * x1

  out.x = vx + 2 * x2
  out.y = vy + 2 * y2
  out.z = vz + 2 * z2
  return out
}

/**
 * Create a swing/twist components based on the given input quaternions
 * Ref: http://allenchou.net/2018/05/game-math-swing-twist-interpolation-sterp/
 * @param source
 * @param target
 * @param forward
 * @param up
 * @param out {swing: Quaternion, twist: number}
 * @returns
 */
export function computeSwingAndTwist(
  source: Quaternion,
  target: Quaternion,
  forward: Vector3,
  up: Vector3,
  out: { swing: Quaternion; twist: number }
) {
  const quatInverse = tempQuat1.copy(target).invert(),
    altForward = tempVec1.copy(forward).applyQuaternion(quatInverse),
    altUp = tempVec2.copy(up).applyQuaternion(quatInverse)

  const poseForward = altForward.applyQuaternion(source),
    poseUp = altUp.applyQuaternion(source)

  const swing = tempQuat1
    .setFromUnitVectors(forward, poseForward) // First we create a swing rotation from one dir to the other.
    .multiply(target) // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

  // a new Up direction based on only swing.
  const swingUp = tempVec3.copy(up).applyQuaternion(swing)
  let twist = swingUp.angleTo(poseUp)

  const vec3Dot = swingUp.cross(poseForward).dot(poseUp)
  if (vec3Dot >= 0) twist = -twist

  out.swing.copy(swing)
  out.twist = twist
}

/**
 * Applies swing/twist rotation to the target quaternion
 * @param target
 * @param swing
 * @param twist
 * @param originalForward
 */
export function applySwingAndTwist(target: Quaternion, swing: Quaternion, twist: number, originalForward: Vector3) {
  const p = tempQuat1.copy(target)
  target.premultiply(swing) // PreMultiply our swing rotation to our target's current rotation.

  target.premultiply(tempQuat2.setFromAxisAngle(originalForward, twist))

  pmulInvert(target, p)
}

/**
 * Convert world coordinates to model coordinates with root transform
 * @param position will be modified
 * @param quaternion will be modified
 * @param scale will be modified
 * @param rootTransform
 */
export function worldToModel(
  position: Vector3,
  quaternion: Quaternion,
  scale: Vector3,
  rootTransform: { position: Vector3; quaternion: Quaternion; invQuaternion: Quaternion; scale: Vector3 }
): void {
  const rootRotationInverted = rootTransform.invQuaternion
  position.sub(rootTransform.position).applyQuaternion(rootRotationInverted).divide(rootTransform.scale)
  quaternion.premultiply(rootRotationInverted)
  scale.divide(rootTransform.scale)
}

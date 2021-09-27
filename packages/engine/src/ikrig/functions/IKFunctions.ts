// @ts-nocheck
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { IKRigComponent, IKRigComponentType, PointData } from '../components/IKRigComponent'
import { Bone, Object3D, Quaternion, SkinnedMesh, Vector3 } from 'three'
import {
  IKPoseComponent,
  IKPoseComponentType,
  IKPoseLimbData,
  IKPoseLookTwist,
  IKPoseSpineData
} from '../components/IKPoseComponent'
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from '../../ikrig/constants/Vector3Constants'
import { addChain, addPoint } from './RigFunctions'
import { Entity } from '../../ecs/classes/Entity'
import Pose, { PoseBoneLocalState } from '../classes/Pose'
import { Chain } from '../classes/Chain'
import { solveLimb, solveThreeBone } from './IKSolvers'

const aToBVector = new Vector3()
const boneAWorldPos = new Vector3()
const boneBWorldPos = new Vector3()
const COLOR = {
  black: 0x000000,
  white: 0xffffff,
  red: 0xff0000,
  green: 0x00ff00,
  blue: 0x0000ff,
  fuchsia: 0xff00ff,
  cyan: 0x00ffff,
  yellow: 0xffff00,
  orange: 0xff8000
}

// let Debug
// export function initDebug() {
//   Debug = debug.init()
//   return Debug
// }

// Hold the IK Information, then apply it to a Rig
export function lawCosinesSSS(aLen: number, bLen: number, cLen: number): number {
  // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
  // The Angle between A and B with C being the opposite length of the angle.
  let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen)
  if (v < -1) v = -1
  // Clamp to prevent NaN Errors
  else if (v > 1) v = 1
  return Math.acos(v)
}

export function setupMixamoIKRig(entity: Entity, rig: ReturnType<typeof IKRigComponent.get>) {
  // console.log('setupMixamoIKRig', rig)
  rig.points = {}
  rig.chains = {}
  //-----------------------------------------
  // Auto Setup the Points and Chains based on
  // Known Skeleton Structures.

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

export function setupTRexIKRig(entity: Entity, rig: ReturnType<typeof IKRigComponent.get>) {
  // console.log('setupTRexIKRig', rig)
  rig.points = {}
  rig.chains = {}
  //-----------------------------------------
  // Auto Setup the Points and Chains based on
  // Known Skeleton Structures.
  // TODO:Fix

  addPoint(rig, 'hip', 'hip')
  addPoint(rig, 'head', 'face_joint')
  addPoint(rig, 'foot_l', 'LeftFoot')
  addPoint(rig, 'foot_r', 'RightFoot')

  addPoint(rig, 'wing_l', 'left_wing')
  addPoint(rig, 'wing_r', 'right_wing')

  addChain(rig, 'leg_r', ['RightUpLeg', 'RightKnee', 'RightShin'], 'RightFoot', solveThreeBone) //"z",
  addChain(rig, 'leg_l', ['LeftUpLeg', 'LeftKnee', 'LeftShin'], 'LeftFoot', solveThreeBone) // "z",
  addChain(rig, 'spine', ['Spine', 'Spine1'])
  addChain(rig, 'tail', ['tail_1', 'tail_2', 'tail_3', 'tail_4', 'tail_5', 'tail_6', 'tail_7'])
  // TODO: create set_leg_lmt and apply?
  // set_leg_lmt(entity, null, -0.1 )

  rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_l.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.leg_r.setOffsets(DOWN, FORWARD, rig.tpose)

  // Add some Spring Movement to specific bones
  // e.add_com( "BoneSpring" )
  //   .add( rig.get_chain_indices( "tail" ), 2.9, 0.9, -0.1 )
  //   .add( rig.points.wing_l.idx, 3.0, 0.9 )
  //   .add( rig.points.wing_r.idx, 3.0, 0.9 );
}

export function computeIKPose(rig: IKRigComponentType, ikPose: IKPoseComponentType) {
  updatePoseBonesFromSkeleton(rig)

  computeHip(rig, ikPose)

  computeLimb(rig.pose, rig.chains.leg_l, ikPose.leg_l)
  computeLimb(rig.pose, rig.chains.leg_r, ikPose.leg_r)
  //
  computeLookTwist(rig, rig.points.foot_l, ikPose.foot_l, FORWARD, UP) // Look = Fwd, Twist = Up
  computeLookTwist(rig, rig.points.foot_r, ikPose.foot_r, FORWARD, UP)

  computeSpine(rig, rig.chains.spine, ikPose, UP, FORWARD)

  computeLimb(rig.pose, rig.chains.arm_l, ikPose.arm_l)
  computeLimb(rig.pose, rig.chains.arm_r, ikPose.arm_r)

  computeLookTwist(rig, rig.points.head, ikPose.head, FORWARD, UP)
}

/**
 * update pose bones states from animated skeleton bones,
 * @param rig
 */
function updatePoseBonesFromSkeleton(rig: IKRigComponentType) {
  const skeletonTransform = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    quaternionInverted: new Quaternion(),
    scale: new Vector3()
  }
  const rootBone = rig.pose.skeleton.bones.find((b) => !(b.parent instanceof Bone))
  if (rootBone.parent) {
    rootBone.parent.getWorldPosition(skeletonTransform.position)
    rootBone.parent.getWorldQuaternion(skeletonTransform.quaternion)
    rootBone.parent.getWorldScale(skeletonTransform.scale)
    skeletonTransform.quaternionInverted = skeletonTransform.quaternion.clone().invert()
  }
  const boneWorldPosition = new Vector3(),
    boneWorldRotation = new Quaternion(),
    boneWorldScale = new Vector3()

  for (let i = 0; i < rig.pose.skeleton.bones.length; i++) {
    const bone = rig.pose.skeleton.bones[i]
    const pose = rig.pose.bones[i]

    bone.getWorldPosition(boneWorldPosition)
    bone.getWorldQuaternion(boneWorldRotation)
    bone.getWorldScale(boneWorldScale)
    worldToModel(boneWorldPosition, boneWorldRotation, boneWorldScale, skeletonTransform)

    pose.world.position.copy(boneWorldPosition)
    pose.world.quaternion.copy(boneWorldRotation)
    pose.world.scale.copy(boneWorldScale)

    pose.local.position.copy(bone.position)
    pose.local.quaternion.copy(bone.quaternion)
    pose.local.scale.copy(bone.scale)
  }
}

export function computeHip(rig: ReturnType<typeof IKRigComponent.get>, ik_pose) {
  // First thing we need is the Hip bone from the Animated Pose
  // Plus what the hip's Bind Pose as well.
  // We use these two states to determine what change the animation did to the tpose.

  // ORIGINAL
  // let b_info	= rig.points.hip,					// Rig Hip Info
  // pose 	= rig.pose.bones[ b_info.idx ],		// Animated Pose Bone
  // bind 	= rig.tpose.bones[ b_info.idx ];	// TPose Bone

  const boneInfo = rig.points.hip,
    poseBoneInfo = rig.pose.bones[boneInfo.index],
    bindBoneInfo = rig.tpose.bones[boneInfo.index] // TPose Bone
  const poseBone = poseBoneInfo.bone,
    bindBone = bindBoneInfo.bone

  // Lets create the Quaternion Inverse Direction based on the
  // TBone's World Space rotation. We don't really know the orientation
  // of the bone's starting rotation and our targets will have their own
  // orientation, so by doing this we can easily say no matter what the
  // default direction of the hip, we want to say all hips bones point
  // at the FORWARD axis and the tail of the bone points UP.

  // ORIGINAL
  // let q_inv 		= Quat.invert( bind.world.rot ),				// This part can be optimized out and Saved into the Rig Hip's Data.
  // alt_fwd		= Vec3.transform_quat( Vec3.FORWARD, q_inv ),
  // alt_up		= Vec3.transform_quat( Vec3.UP, q_inv );

  // let pose_fwd 	= Vec3.transform_quat( alt_fwd, pose.world.rot ),
  // 	pose_up 	= Vec3.transform_quat( alt_up, pose.world.rot );

  const quatInverse = bindBoneInfo.world.quaternion.clone().invert(),
    altForward = FORWARD.clone().applyQuaternion(quatInverse),
    altUp = UP.clone().applyQuaternion(quatInverse)

  const poseForward = altForward.clone().applyQuaternion(poseBoneInfo.world.quaternion),
    poseUp = altUp.clone().applyQuaternion(poseBoneInfo.world.quaternion)

  /* VISUAL DEBUG TPOSE AND ANIMATED POSE DIRECTIONS 	*/

  // const poseBoneWorldPosition = poseBoneInfo.world.position.clone()
  // const poseBoneWorldPosition = new Vector3()
  // poseBone.getWorldPosition(poseBoneWorldPosition)

  // Debug.setLine( poseBoneWorldPosition, new Vector3().copy(poseBoneWorldPosition).add(FORWARD), COLOR.white );
  // Debug.setLine( poseBoneWorldPosition, new Vector3().copy(poseBoneWorldPosition).add(UP), COLOR.white );
  // Debug.setLine( poseBoneWorldPosition, new Vector3().copy( poseForward).multiplyScalar(0.8 ).add( poseBoneWorldPosition ), COLOR.orange );
  // Debug.setLine( poseBoneWorldPosition, new Vector3().copy( poseUp).multiplyScalar(0.8 ).add( poseBoneWorldPosition ), COLOR.orange );

  // With our directions known between our TPose and Animated Pose, Next we
  // start to calculate the Swing and Twist Values to swing our TPose into
  // The animation direction
  // ORIGINAL
  // let swing = Quat.unit_vecs( Vec3.FORWARD, pose_fwd )	// First we create a swing rotation from one dir to the other.
  // 		.mul( bind.world.rot );		// Then we apply it to the TBone Rotation, this will do a FWD Swing which will create
  // 									// a new Up direction based on only swing.
  // 	let swing_up	= Vec3.transform_quat( Vec3.UP, swing ),
  // 		twist		= Vec3.angle( swing_up, pose_up );		// Swing + Pose have same Fwd, Use Angle between both UPs for twist
  const bind_fwd = FORWARD.clone().applyQuaternion(bindBoneInfo.world.quaternion)
  const swing = new Quaternion()
    .setFromUnitVectors(bind_fwd, poseForward) // First we create a swing rotation from one dir to the other.
    .multiply(bindBoneInfo.world.quaternion) // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

  // a new Up direction based on only swing.
  const swing_up = UP.clone().applyQuaternion(swing)
  let twist = swing_up.angleTo(poseUp) // Swing + Pose have same Fwd, Use Angle between both UPs for twist

  // The difference between Pose UP and Swing UP is what makes up our twist since they both
  // share the same forward access. The issue is that we do not know if that twist is in the Negative direction
  // or positive. So by computing the Swing Left Direction, we can use the Dot Product to determine
  // if swing UP is Over 90 Degrees, if so then its a positive twist else its negative.
  // ORIGINAL
  // let swing_lft = Vec3.cross( swing_up, pose_fwd );
  // // App.Debug.ln( pos, Vec3.scale( swing_lft, 1.5 ).add( pos ), "orange" );
  // if( Vec3.dot( swing_lft, pose_up ) >= 0 ) twist = -twist;
  const swing_lft = swing_up.clone().cross(poseForward)
  const vec3Dot = swing_lft.clone().dot(poseUp)
  // Debug.setLine( position, Vector3.scale( swing_lft, 1.5 ).add( position ), "orange" );
  if (vec3Dot >= 0) twist = -twist

  // Save all the info we need to our IK Pose.
  // ORIGINAL
  // ik_pose.hip.bind_height	= bind.world.pos.y;	// The Bind Pose Height of the Hip, Helps with scaling.
  // ik_pose.hip.movement.from_sub( pose.world.pos, bind.world.pos );	// How much movement did the hip do between Bind and Animated.
  // ik_pose.hip.dir.copy( pose_fwd );	// Pose Forward is the direction we want the Hip to Point to.
  // ik_pose.hip.twist = twist;	// How Much Twisting to Apply after pointing in the correct direction.

  ik_pose.hip.bind_height = bindBoneInfo.local.position.y // The Bind Pose Height of the Hip, Helps with scaling.
  ik_pose.hip.movement.copy(poseBoneInfo.world.position).sub(bindBoneInfo.world.position) // How much movement did the hip do between Bind and Animated.
  ik_pose.hip.dir.copy(poseForward) // Pose Forward is the direction we want the Hip to Point to.
  ik_pose.hip.twist = twist // How Much Twisting to Apply after pointing in the correct direction.
}

export function computeLimb(pose: Pose, chain: Chain, ik_limb) {
  // Limb IK tends to be fairly easy to determine. What you need is the direction the end effector is in
  // relation to the beginning of the limb chain, like the Shoulder for an arm chain. After you have the
  // direction, you can use it to get the distance. Distance is important to create a scale value based on
  // the length of the chain. Since an arm or leg's length can vary between models, if you normalize the
  // distance, it becomes easy to translate it to other models. The last bit of info is we need the direction
  // that the joint needs to point. In this example, we precompute the Quaternion Inverse Dir for each chain
  // based on the bind pose. We can transform that direction with the Animated rotation to give us where the
  // joint direction has moved to.
  // ORIGINAL CODE:
  // let boneA	= pose.bones[ chain.first() ],	// First Bone
  // boneB	= pose.bones[ chain.end_idx ],	// END Bone, which is not part of the chain (Hand,Foot)
  // ab_dir	= Vec3.sub( boneB.world.pos, boneA.world.pos ),	// Direction from First Bone to Final Bone ( IK Direction )
  // ab_len	= ab_dir.len();
  // TODO: Our bones are getting further apart, so we need to figure out why
  const boneA = pose.bones[chain.first()],
    boneB = pose.bones[chain.end_idx] // END Bone, which is not part of the chain (Hand,Foot)

  // vDir = v2 - v1
  aToBVector.subVectors(boneB.world.position, boneA.world.position)

  // Compute the final IK Information needed for the Limb
  // ORIGINAL CODE
  // ik_limb.len_scale = ab_len / chain.len;	// Normalize the distance base on the length of the Chain.
  // ik_limb.dir.copy( ab_dir.norm() );		// We also normalize the direction to the end effector.
  ik_limb.lengthScale = aToBVector.length() / chain.length // Normalize the distance base on the length of the Chain.
  ik_limb.dir.copy(aToBVector).normalize() // We also normalize the direction to the end effector.

  // We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
  // ORIGINAL CODE:
  // let j_dir	= Vec3.transform_quat( chain.alt_up, boneA.world.rot );
  // let lft_dir	= Vec3.cross( j_dir, ab_dir );					// We need left to realign up
  // ik_limb.joint_dir.from_cross( ab_dir, lft_dir ).norm(); 	// Recalc Up, make it orthogonal to LEFT and FWD
  const jointDir = new Vector3().copy(chain.altUp).applyQuaternion(boneA.world.quaternion)
  const lft_dir = new Vector3().copy(jointDir).cross(aToBVector) // We need left to realign up
  ik_limb.jointDirection = new Vector3().copy(aToBVector).cross(lft_dir).normalize() // Recalc Up, make it orthogonal to LEFT and FWD
}
export function computeLookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
  const pose = rig.pose.bones[boneInfo.index],
    bind = rig.tpose.bones[boneInfo.index] // TPose Bone

  // First compute the Quaternion Invert Directions based on the Defined
  // Directions that was passed into the function. Most often, your look
  // direction is FORWARD and the Direction used to determine twist is UP.
  // But there are times we need the directions to be different depending
  // on how we view the bone in certain situations.

  const quatInverse = bind.world.quaternion.clone().invert(),
    altLookDirection = new Vector3().copy(lookDirection).applyQuaternion(quatInverse),
    altTwistDirection = new Vector3().copy(twistDirection).applyQuaternion(quatInverse)

  const pose_look_dir = new Vector3().copy(altLookDirection).applyQuaternion(pose.world.quaternion),
    pose_twist_dir = new Vector3().copy(altTwistDirection).applyQuaternion(pose.world.quaternion)

  ik.lookDirection.copy(pose_look_dir)
  ik.twistDirection.copy(pose_twist_dir)
}

export function computeSpine(
  rig: IKRigComponentType,
  chain: Chain,
  ik_pose: IKPoseComponentType,
  lookDirection: Vector3,
  twistDirection: Vector3
): void {
  const idx_ary = [chain.first(), chain.last()],
    quatInverse = new Quaternion(),
    v_look_dir = new Vector3(),
    v_twist_dir = new Vector3()
  let j = 0,
    poseBone: PoseBoneLocalState,
    bindBone: PoseBoneLocalState

  for (const i of idx_ary) {
    // First get reference to the Bones
    bindBone = rig.tpose.bones[i]
    poseBone = rig.pose.bones[i]

    // Create Quat Inverse Direction
    // Transform the Inv Dir by the Animated Pose to get their direction
    quatInverse.copy(bindBone.world.quaternion).invert()
    v_look_dir.copy(lookDirection).applyQuaternion(quatInverse).applyQuaternion(poseBone.world.quaternion)
    v_twist_dir.copy(twistDirection).applyQuaternion(quatInverse).applyQuaternion(poseBone.world.quaternion)

    // Save IK
    ik_pose.spine[j].lookDirection.copy(v_look_dir)
    ik_pose.spine[j].twistDirection.copy(v_twist_dir)
    j++
  }
}
// How to visualize the IK Pose Informaation to get an Idea of what we're looking at.
export function visualizeHip(rig: IKRigComponentType, ik) {
  rig.pose.bones[rig.points.hip.index].bone.getWorldPosition(boneAWorldPos)
  // Debug.setPoint(boneAWorldPos, COLOR.orange, 6, 6).setLine(
  //   boneAWorldPos,
  //   new Vector3().copy(ik.hip.dir).multiplyScalar(0.2).add(boneAWorldPos),
  //   COLOR.cyan,
  //   null,
  //   true
  // )
}

export function visualizeLimb(pose, chain, ik) {
  const poseBone = pose.bones[chain.first()].bone
  poseBone.getWorldPosition(boneAWorldPos)
  const len = chain.length * ik.lengthScale,
    posA = boneAWorldPos,
    posB = new Vector3().copy(ik.dir).multiplyScalar(len).add(posA),
    posC = new Vector3().copy(ik.jointDirection).multiplyScalar(0.2).add(posA) // Direction of Joint

  // Debug.setPoint(posA, COLOR.yellow, 6, 4)
  //   .setPoint(posB, COLOR.orange, 6, 4)
  //   .setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
  //   .setLine(posA, posC, COLOR.yellow, null, true)
}

export function visualizeLookTwist(rig, boneInfo, ik) {
  const position = new Vector3()
  rig.pose.bones[boneInfo.index].getWorldPosition(position)
  // Debug.setPoint(position, COLOR.cyan, 1, 2.5) // Foot Position
  //   .setLine(position, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // IK.DIR
  //   .setLine(position, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // RESULT OF IK.TWIST
}

export function visualizeSpine(rig: IKRigComponentType, chain, ik_ary) {
  const ws = new Vector3(0, 0, 0),
    index = [chain.first(), chain.last()]
  let ik

  for (let i = 0; i < 2; i++) {
    const poseBone = rig.pose.bones[index[i]].bone

    poseBone.getWorldPosition(ws)
    ik = ik_ary[i]

    // Debug.setPoint(ws, COLOR.orange, 1, 2)
    //   .setLine(ws, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(ws), COLOR.yellow, null)
    //   .setLine(ws, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(ws), COLOR.orange, null)
  }
}

/**
 *
 * @param targetRig will be modified
 * @param ikPose
 */
export function applyIKPoseToIKRig(targetRig: IKRigComponentType, ikPose: IKPoseComponentType): void {
  // // update pose offset
  // const rootQuaternion = new Quaternion()
  // const rootPosition = new Vector3()
  // const rootScale = new Vector3()
  //
  // const poseRoot = targetRig.pose.bones[0].bone.parent
  // poseRoot.getWorldQuaternion(rootQuaternion)
  // poseRoot.getWorldPosition(rootPosition)
  // poseRoot.getWorldScale(rootScale)
  // targetRig.pose.setOffset(rootQuaternion, rootPosition, rootScale)
  //
  // const tposeRoot = targetRig.tpose.bones[0].bone.parent
  // tposeRoot.getWorldQuaternion(rootQuaternion)
  // tposeRoot.getWorldPosition(rootPosition)
  // tposeRoot.getWorldScale(rootScale)
  // targetRig.tpose.setOffset(rootQuaternion, rootPosition, rootScale)

  // console.log('~~~ APPLY RIG', targetRig['name'])
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

  const q = new Quaternion()
    .setFromUnitVectors(FORWARD, ikPose.hip.dir) // Create Swing Rotation
    .multiply(bind.world.quaternion) // Apply it to our WS Rotation

  // If There is a Twist Value, Apply that as a PreMultiplication.
  if (ikPose.hip.twist != 0) q.premultiply(new Quaternion().setFromAxisAngle(ikPose.hip.dir, ikPose.hip.twist))

  // In the end, we need to convert to local space. Simply premul by the inverse of the parent
  // pmul_invert(q, parentRotation)
  q.premultiply(parentRotation.clone().invert())

  // TRANSLATION
  const h_scl = bind.world.position.y / ikPose.hip.bind_height // Create Scale value from Src's Hip Height and Target's Hip Height
  const position = new Vector3()
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

// this.apply_limb( rig, rig.chains.leg_l, this.leg_l );
// apply_limb( ikPose, rig, chain, limb, grounding=0 ){
// 	let p_tran = new Transform(),
// 		c_tran = new Transform();

// 	rig.pose.get_parent_world( chain.first(), p_tran, c_tran );
// 	let len = ( rig.leg_len_lmt || chain.len ) * limb.len_scale;
// 	this.target.from_pos_dir( c_tran.pos, limb.dir, limb.joint_dir, len );	// Setup IK Target
// 	if( grounding ) this.apply_grounding( grounding );
// 	let solver = chain.ik_solver || "limb";
// 	this.target[ solver ]( chain, rig.tpose, rig.pose, p_tran );
// }

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

  const p_tran = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    scale: new Vector3()
  }
  const c_tran = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    scale: new Vector3()
  }
  bindBone.parent.getWorldPosition(p_tran.position)
  bindBone.parent.getWorldQuaternion(p_tran.quaternion)
  bindBone.parent.getWorldScale(p_tran.scale)
  bindBone.getWorldPosition(c_tran.position)
  bindBone.getWorldQuaternion(c_tran.quaternion)
  bindBone.getWorldScale(c_tran.scale)

  const expectedVars = {
    p_tran: {
      pos: new Vector3(0, 0, 0.005501061677932739),
      rot: new Quaternion(0.0012618519831448793, -0.017835982143878937, -0.011710396967828274, 0.9997715353965759),
      scl: new Vector3(1, 1, 1)
    },
    c_tran: {
      pos: new Vector3(0.08992571383714676, -0.06811448186635971, -0.000022773630917072296),
      rot: new Quaternion(-0.997866153717041, 0.010610141791403294, -0.01851150207221508, 0.061707753688097),
      scl: new Vector3(1, 1, 0.9999760985374451)
    }
  }

  rig.pose.get_parent_world(chain.first(), p_tran, c_tran)

  // How much of the Chain length to use to calc End Effector
  // let len = (rig.leg_len_lmt || chain.len) * limb.len_scale
  let len = chain.length * limb.lengthScale
  const preTargetVars = {
    len,
    c_tran: {
      position: c_tran.position.clone(),
      quaternion: c_tran.quaternion.clone(),
      scale: c_tran.scale.clone()
    },
    p_tran: {
      position: p_tran.position.clone(),
      quaternion: p_tran.quaternion.clone(),
      scale: p_tran.scale.clone()
    },
    limbDir: limb.dir.clone(),
    limbJointDir: limb.jointDirection.clone()
  }

  // this.target.from_pos_dir( c_tran.pos, limb.dir, limb.joint_dir, len );	// Setup IK Target
  targetFromPosDir(ikPose, c_tran.position, limb.dir, limb.jointDirection, len)

  //////////

  const preGroundingVars = {
    target: {
      axis: {
        x: ikPose.axis.x.clone(),
        y: ikPose.axis.y.clone(),
        z: ikPose.axis.z.clone()
      },
      end_pos: ikPose.endPosition.clone(),
      len: ikPose.length,
      start_pos: ikPose.startPosition.clone()
    }
  }

  // TODO: test it, currently not used in apply (same as in original lib example)
  if (grounding) applyGrounding(ikPose, grounding)

  // --------- IK Solver
  chain.ikSolver(chain, rig.tpose, rig.pose, ikPose.axis, ikPose.length, p_tran)

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

function from_mul(out: Quaternion, a: Quaternion, b: Quaternion) {
  const ax = a.x,
    ay = a.y,
    az = a.z,
    aw = a.w,
    bx = b.x,
    by = b.y,
    bz = b.z,
    bw = b.w

  out.x = ax * bw + aw * bx + ay * bz - az * by
  out.y = ay * bw + aw * by + az * bx - ax * bz
  out.z = az * bw + aw * bz + ax * by - ay * bx
  out.w = aw * bw - ax * bx - ay * by - az * bz
}

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
  // ORIGINAL CODE
  // let bind 	= rig.tpose.bones[ b_info.idx ],
  // pose 	= rig.pose.bones[ b_info.idx ];
  const boneInfo = rig.points[boneName],
    ik: IKPoseLookTwist = ikPose[boneName]

  const bind = rig.tpose.bones[boneInfo.index],
    pose = rig.pose.bones[boneInfo.index]

  // ORIGINAL CODE
  // let p_rot 	= rig.pose.get_parent_rot( b_info.idx );
  // let c_rot 	= Quat.mul( p_rot, bind.local.rot );
  const rootQuaternion = rig.pose.getParentRotation(boneInfo.index)

  const childRotation = new Quaternion().copy(rootQuaternion).multiply(bind.local.quaternion)

  // Next we need to get the Foot's Quaternion Inverse Direction
  // Which matches up with the same Directions used to calculate the IK
  // information.
  // ORIGINAL CODE
  // let q_inv 			= Quat.invert( bind.world.rot ),
  // alt_look_dir	= Vec3.transform_quat( look_dir, q_inv ),
  // alt_twist_dir	= Vec3.transform_quat( twist_dir, q_inv );
  const quatInverse = bind.world.quaternion.clone().invert()

  const altLookDirection = new Vector3().copy(lookDirection).applyQuaternion(quatInverse),
    altTwistDirection = new Vector3().copy(twistDirection).applyQuaternion(quatInverse)

  // After the HIP was moved and The Limb IK is complete, This is where
  // the ALT Look Direction currently points to.
  // ORIGNAL CODE
  // 	let now_look_dir = Vec3.transform_quat( alt_look_dir, c_rot );
  const currentLookDirection = new Vector3().copy(altLookDirection).applyQuaternion(childRotation)

  // Now we start building out final rotation that we
  // want to apply to the bone to get it pointing at the
  // right direction and twisted to match the original animation.
  // ORIGINAL CODE
  // let rot = Quat
  // .unit_vecs( now_look_dir, ik.look_dir )	// Create our Swing Rotation
  // .mul( c_rot );							// Then Apply to our foot
  const rotation = new Quaternion().setFromUnitVectors(currentLookDirection, ik.lookDirection) // Create our Swing Rotation
  const rotation0X = rotation.clone()
  rotation.multiply(childRotation) // Then Apply to our foot

  const rotation0 = rotation.clone()

  // Now we need to know where the Twist Direction points to after
  // swing rotation has been applied. Then use it to compute our twist rotation.
  // ORIGINAL CODE
  // let now_twist_dir	= Vec3.transform_quat( alt_twist_dir, rot );
  // let twist 			= Quat.unit_vecs( now_twist_dir, ik.twist_dir  );
  // rot.pmul( twist );	// Apply Twist
  const currentTwistDirection = new Vector3().copy(altTwistDirection).applyQuaternion(rotation)
  const twist = new Quaternion().setFromUnitVectors(currentTwistDirection, ik.twistDirection)
  rotation.premultiply(twist) // Apply Twist
  const rotation1 = rotation.clone()

  // const boneParentQuaternionInverse = new Quaternion()
  // pose.parent.getWorldQuaternion(boneParentQuaternionInverse)
  // boneParentQuaternionInverse.invert()

  rotation.premultiply(rootQuaternion.clone().invert()) // To Local Space

  rig.pose.setBone(boneInfo.index, rotation) // Save to pose.

  const rotationFinal = rotation.clone()

  return {
    rootQuaternion,
    childRotation,
    rotation0X,
    rotation0,
    rotation1,
    rotationFinal,
    currentLookDirection,
    ikLookDirection: ik.lookDirection
  }
}

export function applyGrounding(ikPose: IKPoseComponentType, y_lmt: number): void {
  // Once we have out IK Target setup, We can use its data to test various things
  // First we can test if the end effector is below the height limit. Each foot
  // may need a different off the ground offset since the bones rarely touch the floor
  // perfectly.
  // if (this.target.endPosition.y >= y_lmt)
  // 	return;

  /* DEBUG IK TARGET */
  // const posA = ikPose.startPosition.add(new Vector3(-1, 0, 0)),
  //   posB = ikPose.endPosition.add(new Vector3(-1, 0, 0))

  // Debug.setPoint(posA, COLOR.yellow, 0.05, 6)
  //   .setPoint(posB, COLOR.white, 0.05, 6)
  //   .setLine(posA, posB, COLOR.yellow, COLOR.white, true)

  // Where on the line between the Start and end Points would work for our
  // Y Limit. An easy solution is to find the SCALE based on doing a 1D Scale
  //operation on the Y Values only. Whatever scale value we get with Y we can use on X and Z
  const a = ikPose.startPosition,
    b = ikPose.endPosition,
    s = (y_lmt - a.y) / (b.y - a.y) // Normalize Limit Value in the Max/Min Range of Y.

  // Change the end effector of our target
  ikPose.endPosition.set((b.x - a.x) * s + a.x, y_lmt, (b.z - a.z) * s + a.z)

  /* DEBUG NEW END EFFECTOR */
  // Debug.setPoint((ikPose as any).target.endPosition.add(new Vector3(-1, 0, 0)), 'orange', 0.05, 6)

  // Since we changed the end effector, lets update the Sqr Length and Length of our target
  // This is normally computed by our IK Target when we set it, but since I didn't bother
  // to create a method to update the end effector, we need to do these extra updates.
  const distance = ikPose.startPosition.distanceTo(ikPose.endPosition)
  ikPose.length = distance
}

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
  const bone = boneInfo.bone
  const parentInfo = rig.pose.bones[boneInfo.p_idx]

  // TODO: rig.pose.get_parent_world( chain.first() )

  // Copy bone to our transform variables to work on them
  ikPose.spineParentPosition.copy(parentInfo.local.position)
  ikPose.spineChildPosition.copy(boneInfo.local.position)

  ikPose.spineParentQuaternion.copy(parentInfo.local.quaternion)
  ikPose.spineChildQuaternion.copy(boneInfo.local.quaternion)

  ikPose.spineParentScale.copy(parentInfo.local.scale)
  ikPose.spineChildScale.copy(boneInfo.local.scale)

  const cnt = chain.cnt - 1,
    ikLook = new Vector3(),
    ikTwist = new Vector3(),
    altLook = new Vector3(),
    altTwist = new Vector3(),
    rotation = new Quaternion()

  let t: number,
    boneIndex: number,
    boneBind: PoseBoneLocalState,
    currentLook = new Vector3(),
    currentTwist = new Vector3(),
    quat = new Quaternion()

  for (let i = 0; i <= cnt; i++) {
    // Prepare for the Iteration
    boneIndex = chain.chainBones[i].index // Bone Index
    boneBind = rig.tpose.bones[boneIndex] // Bind Values of the Bone
    t = i / cnt // ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently

    // Lerp our Target IK Directions for this bone
    ikLook.lerpVectors(ik[0].lookDirection, ik[1].lookDirection, t)
    ikTwist.lerpVectors(ik[0].twistDirection, ik[1].twistDirection, t)

    // Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
    quat.copy(boneBind.world.quaternion).invert()

    altLook.copy(lookDirection).applyQuaternion(quat)
    altTwist.copy(twistDirection).applyQuaternion(quat)

    // Get bone in WS that has yet to have any rotation applied
    // childTransform.setFromAdd(parentTransform, bind);

    // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
    const v: Vector3 = new Vector3()
      .copy(ikPose.spineParentScale)
      .multiply(boneBind.local.position) // parent.scale * child.position;
      .applyQuaternion(ikPose.spineParentQuaternion) //Vec3.transformQuat( v, tp.quaternion, v );
    ikPose.spineChildPosition.copy(ikPose.spineParentPosition).add(v) // Vec3.add( tp.position, v, this.position );

    // SCALE - parent.scale * child.scale
    ikPose.spineChildScale.copy(ikPose.spineParentScale).multiply(boneBind.local.scale)

    // ROTATION - parent.quaternion * child.quaternion
    ikPose.spineChildQuaternion.copy(ikPose.spineParentQuaternion).multiply(boneBind.local.quaternion)

    currentLook = altLook.applyQuaternion(ikPose.spineChildQuaternion) // What direction is the bone point looking now, without any extra rotation

    rotation
      .setFromUnitVectors(currentLook, ikLook) // Create our Swing Rotation
      .multiply(ikPose.spineChildQuaternion) // Then Apply to our Bone, so its now swong to match the swing direction.

    currentTwist = new Vector3().copy(altTwist).applyQuaternion(rotation) // Get our Current Twist Direction from Our Swing Rotation
    quat.setFromUnitVectors(currentTwist, ikTwist) // Create our twist rotation
    rotation.premultiply(quat) // Apply Twist so now it matches our IK Twist direction

    const spineParentQuaternionInverse = new Quaternion().copy(ikPose.spineParentQuaternion).invert()

    rotation.premultiply(spineParentQuaternionInverse) // To Local Space

    rig.pose.setBone(boneIndex, rotation) // Save result to bone.
    // rig.pose.bones[boneIndex].bone.setRotationFromQuaternion(rotation) // Save result to bone.
    // rig.pose.bones[boneIndex].local.quaternion.copy(rotation) // Save result to bone.

    if (t != 1) {
      // ORIGINAL CODE is
      // this.add(ikPose.spineParentQuaternion, rotation, boneBindValue.position, boneBindValue.scale); // Compute the WS Transform for the next bone in the chain.
      const parentScaleChildPosition = new Vector3()
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

export function align_chain(pose: Pose, dir: Vector3, b_names: string[]) {
  const aEnd = b_names.length - 1, // End Index
    forwardDir = new Vector3(), // Forward
    upDir = new Vector3().copy(dir), // Up
    leftDir = new Vector3(), // Left
    finalRotation = new Quaternion() // Final Rotation

  const parentWorldQ = new Quaternion()
  const parentWorldP = new Vector3()
  const parentWorldS = new Vector3()

  const childWorldQ = new Quaternion()
  const childWorldP = new Vector3()
  const childWorldS = new Vector3()
  for (let i = 0; i <= aEnd; i++) {
    let bone: Object3D = pose.skeleton.bones.find((bone) => (bone.name = b_names[i])) // Bone Reference

    bone.getWorldQuaternion(parentWorldQ)
    bone.getWorldPosition(parentWorldP)
    bone.getWorldScale(parentWorldS)

    bone.getWorldQuaternion(childWorldQ)
    bone.getWorldPosition(childWorldP)
    bone.getWorldScale(childWorldS)

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Up direction is where we need the bone to point to.
    // We then get the bone's current forward direction, use it
    // to get its left, then finish it off by recalculating
    // fwd to make it orthogonal. Want to try to keep the orientation
    // while ( fwd, lft ) realigning the up direction.
    // Original code
    // f.from_quat( ct.rot, Vec3.FORWARD ); 		// Find Bone's Forward World Direction
    // leftDir.from_cross( upDir, forwardDir ).norm();				// Get World Left
    // forwardDir.from_cross( leftDir, upDir ).norm();				// Realign Forward
    forwardDir.copy(FORWARD).applyQuaternion(childWorldQ)
    leftDir.copy(upDir).cross(forwardDir).normalize()
    forwardDir.copy(leftDir).cross(upDir).normalize()

    from_axis(finalRotation, leftDir, upDir, forwardDir) // Create Rotation from 3x3 rot Matrix
    const tempQuat = new Quaternion().copy(finalRotation)

    if (tempQuat.dot(childWorldQ) < 0) negate(finalRotation) // Do a Inverted rotation check, negate it if under zero.

    //r.pmul( q.from_invert( pt.rot ) );		// Move rotation to local space
    pmul_invert(finalRotation, parentWorldQ) // Move rotation to local space
    // pose.set_bone( bone.idx, finalRotation );					// Update Pose with new ls rotation
    bone.setRotationFromQuaternion(finalRotation)

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // If not the last bone, take then the new rotation to calc the next parents
    // world space transform for the next bone on the list.
    if (i != aEnd) {
      // pt.add( finalRotation, bone.local.pos, bone.local.scl );
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // POSITION - parent.position + ( parent.rotation * ( parent.scale * child.position ) )
      const t = new Vector3().copy(childWorldP).add(new Vector3().copy(childWorldS).multiply(bone.position))
      transform_quat(t, childWorldQ)

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // SCALE - parent.scale * child.scale
      parentWorldS.multiply(bone.scale)

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // ROTATION - parent.rotation * child.rotation
      parentWorldQ.multiply(finalRotation)

      bone = pose.bones.find((bone) => (bone.name = b_names[i + 1])).bone as Object3D // Bone Reference
      bone.position.copy(parentWorldP)
      bone.quaternion.copy(parentWorldQ)
      bone.scale.copy(parentWorldS)
    }
  }
  pose.skeleton.update()
}

function transform_quat(out, q) {
  const qx = q.z,
    qy = q.x,
    qz = q.z,
    qw = q.w,
    vx = out.z,
    vy = out.x,
    vz = out.z,
    x1 = qy * vz - qz * vy,
    y1 = qz * vx - qx * vz,
    z1 = qx * vy - qy * vx,
    x2 = qw * x1 + qy * z1 - qz * y1,
    y2 = qw * y1 + qz * x1 - qx * z1,
    z2 = qw * z1 + qx * y1 - qy * x1

  out.z = vx + 2 * x2
  out.x = vy + 2 * y2
  out.z = vz + 2 * z2
}

export function pmul_invert(qO, q) {
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
    const dot_inv = 1.0 / dot
    ax = -ax * dot_inv
    ay = -ay * dot_inv
    az = -az * dot_inv
    aw = aw * dot_inv
  }

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // Quat.mul( a, b );
  const bx = qO.x,
    by = qO.y,
    bz = qO.z,
    bw = qO.w
  qO.x = ax * bw + aw * bx + ay * bz - az * by
  qO.y = ay * bw + aw * by + az * bx - ax * bz
  qO.z = az * bw + aw * bz + ax * by - ay * bx
  qO.w = aw * bw - ax * bx - ay * by - az * bz
}

export function negate(q) {
  q.x = -q.x
  q.y = -q.y
  q.z = -q.z
  q.w = -q.w
  return q
}

export function from_axis(out, xAxis, yAxis, zAxis) {
  const m00 = xAxis.x,
    m01 = xAxis.y,
    m02 = xAxis.z,
    m10 = yAxis.x,
    m11 = yAxis.y,
    m12 = yAxis.z,
    m20 = zAxis.x,
    m21 = zAxis.y,
    m22 = zAxis.z,
    t = m00 + m11 + m22
  let x, y, z, w, s

  if (t > 0.0) {
    s = Math.sqrt(t + 1.0)
    w = s * 0.5 // |w| >= 0.5
    s = 0.5 / s
    x = (m12 - m21) * s
    y = (m20 - m02) * s
    z = (m01 - m10) * s
  } else if (m00 >= m11 && m00 >= m22) {
    s = Math.sqrt(1.0 + m00 - m11 - m22)
    x = 0.5 * s // |x| >= 0.5
    s = 0.5 / s
    y = (m01 + m10) * s
    z = (m02 + m20) * s
    w = (m12 - m21) * s
  } else if (m11 > m22) {
    s = Math.sqrt(1.0 + m11 - m00 - m22)
    y = 0.5 * s // |y| >= 0.5
    s = 0.5 / s
    x = (m10 + m01) * s
    z = (m21 + m12) * s
    w = (m20 - m02) * s
  } else {
    s = Math.sqrt(1.0 + m22 - m00 - m11)
    z = 0.5 * s // |z| >= 0.5
    s = 0.5 / s
    x = (m20 + m02) * s
    y = (m21 + m12) * s
    w = (m01 - m10) * s
  }

  out.x = x
  out.y = y
  out.z = z
  out.w = w
  return out
}

export function mul(out: Quaternion, q: Quaternion) {
  const ax = out.x,
    ay = out.y,
    az = out.z,
    aw = out.w,
    bx = q.x,
    by = q.y,
    bz = q.z,
    bw = q.w
  out.x = ax * bw + aw * bx + ay * bz - az * by
  out.y = ay * bw + aw * by + az * bx - ax * bz
  out.z = az * bw + aw * bz + ax * by - ay * bx
  out.w = aw * bw - ax * bx - ay * by - az * bz
}

export function spin_bone_forward(pose: Pose, foot: string) {
  // TODO: check if this function is used
  console.warn('spin_bone_forward is not tested')
  const v = new Vector3(),
    q = new Quaternion(),
    boneState = pose.getBone(foot)
  const b = boneState.bone

  const parentWorldQuaternion = new Quaternion()
  b.parent.getWorldQuaternion(parentWorldQuaternion)

  b.position.copy(v).add(new Vector3(0, boneState.length, 0))

  v.multiply(this.scl)
  //from_mul(v, v, this.scl)
  transform_quat(v, this.rot)
  // v.add( b.position );

  // v.sub( b.position );							// Get The direction to the tail
  v.x = 0 // Flatten vector to 2D by removing Y Position
  v.normalize() // Make it a unit vector
  from_unit_vecs(q, v, FORWARD) // Rotation needed to point the foot forward.
  mul(q, b.quaternion) // Move WS Foot to point forward
  pmul_invert(q, b.quaternion) // To Local Space
  pose.setBone(boneState.idx, q) // Save to Pose
}

export function from_unit_vecs(out, a, b) {
  // Using unit vectors, Shortest rotation from Direction A to Direction B
  // http://glmatrix.net/docs/quat.js.html#line548
  // http://physicsforgames.blogspot.com/2010/03/Quat-tricks.html
  const dot = new Vector3().copy(a).dot(b)

  if (dot < -0.999999) {
    const tmp = new Vector3().copy(LEFT).cross(a)
    if (tmp.length() < 0.000001) cross(UP, a, tmp)
    out.from_axis_angle(tmp.normalize(), Math.PI)
  } else if (dot > 0.999999) {
    out.x = 0
    out.y = 0
    out.z = 0
    out.w = 1
  } else {
    const v = new Vector3().copy(a).cross(b)
    out.x = v.x
    out.y = v.y
    out.z = v.z
    out.w = 1 + dot
    out.normalize()
  }
}

export function cross(a, b, out) {
  const ax = a.x,
    ay = a.y,
    az = a.z,
    bx = b.x,
    by = b.y,
    bz = b.z

  out = out || new Vector3()
  out.x = ay * bz - az * by
  out.y = az * bx - ax * bz
  out.z = ax * by - ay * bx
}

export function pmul_axis_angle(out, axis, angle) {
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

export function align_bone_forward(pose: Pose, b_name: string) {
  // TODO: check if this function is used
  console.warn('spin_bone_forward is not tested')
  const v = new Vector3(),
    q = new Quaternion(),
    boneState = pose.getBone(b_name)
  const b = boneState.bone

  const parentWorldQuaternion = new Quaternion()
  b.parent.getWorldQuaternion(parentWorldQuaternion)

  from_quat(v, b.quaternion, UP) // Get Bone's WS UP Direction

  from_unit_vecs(q, v, FORWARD) // Difference between Current UP and WS Forward
  mul(q, b.quaternion) // PreMul Difference to Current Rotation
  pmul_invert(q, parentWorldQuaternion) // Convert to Local Space

  pose.setBone(boneState.idx, q) // Save to Pose
}

function from_quat(out, q, v) {
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

export function computeSwingAndTwist(source: Quaternion, target: Quaternion, forward, up) {
  const quatInverse = target.clone().invert(),
    altForward = forward.clone().applyQuaternion(quatInverse),
    altUp = up.clone().applyQuaternion(quatInverse)

  const poseForward = altForward.clone().applyQuaternion(source),
    poseUp = altUp.clone().applyQuaternion(source)

  const swing = new Quaternion()
    .setFromUnitVectors(forward, poseForward) // First we create a swing rotation from one dir to the other.
    .multiply(target) // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

  // a new Up direction based on only swing.
  const swing_up = up.clone().applyQuaternion(swing)
  let twist = swing_up.angleTo(poseUp)

  const swing_lft = swing_up.clone().cross(poseForward)
  const vec3Dot = swing_lft.clone().dot(poseUp)
  if (vec3Dot >= 0) twist = -twist

  return { swing, twist }
}

export function applySwingAndTwist(target: Quaternion, swing: Quaternion, twist: number, originalForward: Vector3) {
  const p = target.clone()
  target.premultiply(swing) // PreMultiply our swing rotation to our target's current rotation.

  const twistQ = new Quaternion().setFromAxisAngle(originalForward, twist)
  target.premultiply(twistQ)

  pmul_invert(target, p)
}

/**
 * convert world coordinates to model coordinates with root transform
 * @param position will be modified
 * @param quaternion will be modified
 * @param scale will be modified
 * @param rootTransform
 */
export function worldToModel(
  position: Vector3,
  quaternion: Quaternion,
  scale: Vector3,
  rootTransform: { position: Vector3; quaternion: Quaternion; scale: Vector3 }
): void {
  const rootRotationInverted = rootTransform.quaternion.clone().invert()
  position.sub(rootTransform.position).applyQuaternion(rootRotationInverted).divide(rootTransform.scale)
  quaternion.premultiply(rootRotationInverted)
  scale.divide(rootTransform.scale)
}

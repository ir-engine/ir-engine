import { getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import Pose from '@xrengine/engine/src/ikrig/classes/Pose'
import IKRig from '@xrengine/engine/src/ikrig/components/IKRig'
import { Bone, Object3D, Quaternion, Vector3 } from 'three'
import { IKPose } from '../components/IKPose'
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from '@xrengine/engine/src/ikrig/constants/Vector3Constants'
import debug from '@xrengine/engine/src/ikrig/classes/Debug'

const tempQ = new Quaternion()
const aToBDirection = new Vector3()
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

let Debug
export function initDebug() {
  Debug = debug.init()
  return Debug
}

// Hold the IK Information, then apply it to a Rig
export function LawCosinesSSS(aLen, bLen, cLen) {
  // Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
  // The Angle between A and B with C being the opposite length of the angle.
  let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen)
  if (v < -1) v = -1
  // Clamp to prevent NaN Errors
  else if (v > 1) v = 1
  return Math.acos(v)
}

export function setupIKRig(rig: IKRig) {
  //-----------------------------------------
  // Auto Setup the Points and Chains based on
  // Known Skeleton Structures.
  rig
    .addPoint('hip', 'Hips')
    .addPoint('head', 'Head')
    .addPoint('neck', 'Neck')
    .addPoint('chest', 'Spine2')
    .addPoint('foot_l', 'LeftFoot')
    .addPoint('foot_r', 'RightFoot')

    .addChain('arm_r', ['RightArm', 'RightForeArm'], 'RightHand') //"x",
    .addChain('arm_l', ['LeftArm', 'LeftForeArm'], 'LeftHand') //"x",
    .addChain('leg_r', ['RightUpLeg', 'RightLeg'], 'RightFoot') //"z",
    .addChain('leg_l', ['LeftUpLeg', 'LeftLeg'], 'LeftFoot') //"z",
    .addChain('spine', ['Spine', 'Spine1', 'Spine2']) //, "y"

  rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.arm_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.arm_r.computeLengthFromBones(rig.tpose.bones)

  rig.chains.leg_l.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.leg_r.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.arm_r.setOffsets(RIGHT, BACK, rig.tpose)
  rig.chains.arm_l.setOffsets(LEFT, BACK, rig.tpose)
}

export function computeHip(rig, ik_pose) {
  // First thing we need is the Hip bone from the Animated Pose
  // Plus what the hip's Bind Pose as well.
  // We use these two states to determine what change the animation did to the tpose.

  // ORIGINAL
  // let b_info	= rig.points.hip,					// Rig Hip Info
  // pose 	= rig.pose.bones[ b_info.idx ],		// Animated Pose Bone
  // bind 	= rig.tpose.bones[ b_info.idx ];	// TPose Bone

  const boneInfo = rig.points.hip,
    poseBone: Bone = rig.pose.bones[boneInfo.index],
    bindBone: Bone = rig.tpose.bones[boneInfo.index] // TPose Bone

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

  const bindBoneWorldQuaternion = new Quaternion()
  bindBone.getWorldQuaternion(bindBoneWorldQuaternion)
  const quatInverse = new Quaternion().copy(bindBoneWorldQuaternion).invert(),
    altForward = new Vector3().copy(FORWARD).applyQuaternion(quatInverse),
    altUp = new Vector3().copy(UP).applyQuaternion(quatInverse)

  const poseBoneForwardWorldQuaternion = new Quaternion()
  poseBone.getWorldQuaternion(poseBoneForwardWorldQuaternion)
  const poseBoneUpWorldQuaternion = new Quaternion()
  poseBone.getWorldQuaternion(poseBoneUpWorldQuaternion)

  const poseForward = new Vector3().copy(altForward).applyQuaternion(poseBoneForwardWorldQuaternion),
    poseUp = new Vector3().copy(altUp).applyQuaternion(poseBoneForwardWorldQuaternion)

  /* VISUAL DEBUG TPOSE AND ANIMATED POSE DIRECTIONS 	*/

  const poseBoneWorldPosition = new Vector3()
  poseBone.getWorldPosition(poseBoneWorldPosition)

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
  const swing = new Quaternion()
    .setFromUnitVectors(FORWARD, poseForward) // First we create a swing rotation from one dir to the other.
    .multiply(bindBone.quaternion) // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

  // a new Up direction based on only swing.
  const swing_up = new Vector3().copy(UP).applyQuaternion(swing)
  // TODO: Make sure this isn't flipped
  let twist = swing_up.angleTo(poseUp) // Swing + Pose have same Fwd, Use Angle between both UPs for twist

  // The difference between Pose UP and Swing UP is what makes up our twist since they both
  // share the same forward access. The issue is that we do not know if that twist is in the Negative direction
  // or positive. So by computing the Swing Left Direction, we can use the Dot Product to determine
  // if swing UP is Over 90 Degrees, if so then its a positive twist else its negative.
  // TODO: did we cross in right order?
  // ORIGINAL
  // let swing_lft = Vec3.cross( swing_up, pose_fwd );
  // // App.Debug.ln( pos, Vec3.scale( swing_lft, 1.5 ).add( pos ), "orange" );
  // if( Vec3.dot( swing_lft, pose_up ) >= 0 ) twist = -twist;
  const swing_lft = new Vector3().copy(swing_up).cross(poseForward)
  const vec3Dot = new Vector3().copy(swing_lft).dot(poseUp)
  // Debug.setLine( position, Vector3.scale( swing_lft, 1.5 ).add( position ), "orange" );
  if (vec3Dot >= 0) twist = -twist

  const posePosition = new Vector3(),
    bindPosition = new Vector3()

  poseBone.getWorldPosition(posePosition)
  bindBone.getWorldPosition(bindPosition)

  // Save all the info we need to our IK Pose.
  // ORIGINAL
  // ik_pose.hip.bind_height	= bind.world.pos.y;	// The Bind Pose Height of the Hip, Helps with scaling.
  // ik_pose.hip.movement.from_sub( pose.world.pos, bind.world.pos );	// How much movement did the hip do between Bind and Animated.
  // ik_pose.hip.dir.copy( pose_fwd );	// Pose Forward is the direction we want the Hip to Point to.
  // ik_pose.hip.twist = twist;	// How Much Twisting to Apply after pointing in the correct direction.

  ik_pose.hip.bind_height = bindPosition.y // The Bind Pose Height of the Hip, Helps with scaling.
  // TODO: Right subtract order?
  ik_pose.hip.movement.copy(posePosition).sub(bindPosition) // How much movement did the hip do between Bind and Animated.
  ik_pose.hip.dir.copy(poseForward) // Pose Forward is the direction we want the Hip to Point to.
  ik_pose.hip.twist = twist // How Much Twisting to Apply after pointing in the correct direction.
}

export function computeLimb(pose, chain, ik_limb) {
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
  const boneA = pose.bones[chain.first()] as Bone,
    boneB = pose.bones[chain.end_idx] as Bone // END Bone, which is not part of the chain (Hand,Foot)

  // Set some temp bone positions for manipulation
  boneB.getWorldPosition(boneBWorldPos)
  boneA.getWorldPosition(boneAWorldPos)

  // vDir = v2 - v1
  aToBDirection.subVectors(boneBWorldPos, boneAWorldPos)

  // Compute the final IK Information needed for the Limb
  // ORIGINAL CODE
  // ik_limb.len_scale = ab_len / chain.len;	// Normalize the distance base on the length of the Chain.
  // ik_limb.dir.copy( ab_dir.norm() );		// We also normalize the direction to the end effector.
  ik_limb.lengthScale = aToBDirection.length() / chain.length // Normalize the distance base on the length of the Chain.
  ik_limb.dir.copy(aToBDirection).normalize() // We also normalize the direction to the end effector.

  // We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
  // ORIGINAL CODE:
  // let j_dir	= Vec3.transform_quat( chain.alt_up, boneA.world.rot );
  // let lft_dir	= Vec3.cross( j_dir, ab_dir );					// We need left to realign up
  // ik_limb.joint_dir.from_cross( ab_dir, lft_dir ).norm(); 	// Recalc Up, make it orthogonal to LEFT and FWD
  const boneAWorldQuat = new Quaternion()
  boneA.getWorldQuaternion(boneAWorldQuat)
  const jointDir = new Vector3().copy(chain.altUp).applyQuaternion(boneAWorldQuat)

  const lft_dir = new Vector3().copy(jointDir).cross(aToBDirection) // We need left to realign up
  ik_limb.jointDirection = new Vector3().copy(aToBDirection).cross(lft_dir).normalize() // Recalc Up, make it orthogonal to LEFT and FWD
}
export function computeLookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
  const pose = rig.pose.bones[boneInfo.index],
    bind = rig.tpose.bones[boneInfo.index] // TPose Bone

  // First compute the Quaternion Invert Directions based on the Defined
  // Directions that was passed into the function. Most often, your look
  // direction is FORWARD and the Direction used to determine twist is UP.
  // But there are times we need the directions to be different depending
  // on how we view the bone in certain situations.
  const quatInverse = bind.quaternion.invert(),
    altLookDirection = new Vector3().copy(lookDirection).applyQuaternion(quatInverse),
    altTwistDirection = new Vector3().copy(twistDirection).applyQuaternion(quatInverse)

  const pose_look_dir = new Vector3().copy(altLookDirection).applyQuaternion(pose.quaternion),
    pose_twist_dir = new Vector3().copy(altTwistDirection).applyQuaternion(pose.quaternion)

  ik.lookDirection.copy(pose_look_dir)
  ik.twistDirection.copy(pose_twist_dir)
}

export function computeSpine(rig, chain, ik_pose, lookDirection, twistDirection) {
  const idx_ary = [chain.first(), chain.last()],
    quatInverse = new Quaternion(),
    v_look_dir = new Vector3(),
    v_twist_dir = new Vector3()
  let j = 0,
    poseBone,
    bineBone

  const poseBoneWorldQuaternion = new Quaternion()
  const poseBoneWorldPosition = new Vector3()

  for (const i of idx_ary) {
    // First get reference to the Bones
    bineBone = rig.tpose.bones[i]
    poseBone = rig.pose.bones[i]
    poseBone.getWorldQuaternion(poseBoneWorldQuaternion)
    poseBone.getWorldPosition(poseBoneWorldPosition)

    // Create Quat Inverse Direction
    // TODO: CHeck this math
    // Transform the Inv Dir by the Animated Pose to get their direction
    bineBone.getWorldQuaternion(quatInverse)
    quatInverse.invert()
    v_look_dir.copy(lookDirection).applyQuaternion(quatInverse).applyQuaternion(poseBoneWorldQuaternion)
    v_twist_dir.copy(twistDirection).applyQuaternion(quatInverse).applyQuaternion(poseBoneWorldQuaternion)

    // Save IK
    ik_pose.spine[j].lookDirection.copy(v_look_dir)
    ik_pose.spine[j].twistDirection.copy(v_twist_dir)
    j++
  }
}
// How to visualize the IK Pose Informaation to get an Idea of what we're looking at.
export function visualizeHip(rig, ik) {
  rig.pose.bones[rig.points.hip.index].getWorldPosition(boneAWorldPos)
  Debug.setPoint(boneAWorldPos, COLOR.orange, 6, 6).setLine(
    boneAWorldPos,
    new Vector3().copy(ik.hip.dir).multiplyScalar(0.2).add(boneAWorldPos),
    COLOR.cyan,
    null,
    true
  )
}

export function visualizeLimb(pose, chain, ik) {
  const poseBone = pose.bones[chain.first()]
  poseBone.getWorldPosition(boneAWorldPos)
  const len = chain.length * ik.lengthScale,
    posA = boneAWorldPos,
    posB = new Vector3().copy(ik.dir).multiplyScalar(len).add(posA),
    posC = new Vector3().copy(ik.jointDirection).multiplyScalar(0.2).add(posA) // Direction of Joint

  Debug.setPoint(posA, COLOR.yellow, 6, 4)
    .setPoint(posB, COLOR.orange, 6, 4)
    .setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
    .setLine(posA, posC, COLOR.yellow, null, true)
}

export function visualizeLookTwist(rig, boneInfo, ik) {
  const position = new Vector3()
  rig.pose.bones[boneInfo.index].getWorldPosition(position)
  Debug.setPoint(position, COLOR.cyan, 1, 2.5) // Foot Position
    .setLine(position, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // IK.DIR
    .setLine(position, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // RESULT OF IK.TWIST
}

export function visualizeSpine(rig, chain, ik_ary) {
  const ws = new Vector3(0, 0, 0),
    index = [chain.first(), chain.last()]
  let ik

  for (let i = 0; i < 2; i++) {
    const poseBone = rig.pose.bones[index[i]]

    poseBone.getWorldPosition(ws)
    ik = ik_ary[i]

    Debug.setPoint(ws, COLOR.orange, 1, 2)
      .setLine(ws, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(ws), COLOR.yellow, null)
      .setLine(ws, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(ws), COLOR.orange, null)
  }
}

export function applyHip(pose: IKPose) {
  pose.targetRigs.forEach((rig) => {
    // First step is we need to get access to the Rig's TPose and Pose Hip Bone.
    // The idea is to transform our Bind Pose into a New Pose based on IK Data
    const boneInfo = rig.points.hip
    const bind = rig.tpose.bones[boneInfo.index]

    // Get the IK pose from the source rig
    const ikPose = rig.sourcePose

    // Apply IK Swing & Twist ( HANDLE ROTATION )
    // When we compute the IK Hip, We used quaternion invert direction and defined that
    // the hip always points in the FORWARD Axis, so We can use that to quicky get Swing Rotation
    // Take note that vegeta and roborex's Hips are completely different but by using that inverse
    // direction trick, we are easily able to apply the same movement to both.

    const parentRotation = new Quaternion()
    if (rig.pose.bones[boneInfo.index].parent) {
      rig.pose.bones[boneInfo.index].parent.getWorldQuaternion(parentRotation)
    } else {
      rig.pose.bones[boneInfo.index].getWorldQuaternion(parentRotation)
    }

    const b_rot = new Quaternion()
    bind.getWorldQuaternion(b_rot)

    const q = new Quaternion()
      .setFromUnitVectors(FORWARD, ikPose.hip.dir) // Create Swing Rotation
      .multiply(b_rot) // Apply it to our WS Rotation

    // If There is a Twist Value, Apply that as a PreMultiplication.
    // TODO: Uncomment and fix me

    if (ikPose.hip.twist != 0) q.premultiply(new Quaternion().setFromAxisAngle(ikPose.hip.dir, ikPose.hip.twist))
    // In the end, we need to convert to local space. Simply premul by the inverse of the parent

    pmul_invert(q, parentRotation)

    const bindWorldPosition = new Vector3()
    bind.getWorldPosition(bindWorldPosition)

    // TRANSLATION
    const h_scl = bindWorldPosition.y / ikPose.hip.bind_height // Create Scale value from Src's Hip Height and Target's Hip Height
    const position = new Vector3()
      .copy(ikPose.hip.movement)
      .multiplyScalar(h_scl) // Scale the Translation Differnce to Match this Models Scale
      .add(bindWorldPosition) // Then Add that change to the TPose Position

    // MAYBE we want to keep the stride distance exact, we can reset the XZ positions
    // BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
    // our source is taller then our targets, this will cause our target legs to always
    // straighten out.
    // position.x = ikPose.hip.movement.x;
    // position.z = ikPose.hip.movement.z;
    rig.pose.bones[boneInfo.index].setRotationFromQuaternion(q) // Save LS rotation to pose
    rig.pose.bones[boneInfo.index].position.copy(position) // Save LS rotation to pose
  })
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

export function applyLimb(ikPose: IKPose, chain, limb, grounding = 0) {
  ikPose.targetRigs.forEach((rig) => {
    // solve for ik
    // Using law of cos SSS, so need the length of all sides of the triangle
    const bind_a = rig.tpose.bones.find((bone) =>
        bone.name.toLowerCase().includes(chain.chainBones[0].ref.name.toLowerCase())
      ), // Bone Reference from Bind
      bind_b = rig.tpose.bones.find((bone) =>
        bone.name.toLowerCase().includes(chain.chainBones[1].ref.name.toLowerCase())
      ),
      pose_a = rig.pose.bones.find((bone) =>
        bone.name.toLowerCase().includes(chain.chainBones[0].ref.name.toLowerCase())
      ), // Bone Reference from Pose
      pose_b = rig.pose.bones.find((bone) =>
        bone.name.toLowerCase().includes(chain.chainBones[1].ref.name.toLowerCase())
      )

    const bindAIndex = rig.tpose.bones.findIndex((bone) =>
      bone.name.toLowerCase().includes(chain.chainBones[0].ref.name.toLowerCase())
    )
    const bindBIndex = rig.tpose.bones.findIndex((bone) =>
      bone.name.toLowerCase().includes(chain.chainBones[1].ref.name.toLowerCase())
    )

    const bindBone = rig.tpose.bones.find((bone) =>
      bone.name.toLowerCase().includes(chain.chainBones[0].ref.name.toLowerCase())
    )

    // How much of the Chain length to use to calc End Effector
    const len = chain.length * limb.lengthScale

    // Setup IK Target
    // First, set the IK start point, which is the bind bone's defaultposition
    ikPose.startPosition.copy(bindBone.position)
    // Set the end position by copying the limb direction, multiplying by length factor and adding bone position
    ikPose.endPosition
      .copy(limb.dir)
      .multiplyScalar(len) // Compute End Effector
      .add(bindBone.position)

    // Set the length for our IK solve to be the distance between start and end positions
    ikPose.length = ikPose.startPosition.distanceTo(ikPose.endPosition)

    // Set the axis from the direction
    ikPose.axis.fromDirection(limb.dir, limb.jointDirection) // Target Axis

    // We will need to re-enable
    // if (grounding)
    //  	applyGrounding(entity, grounding);

    const aLen = bind_a.length,
      bLen = bind_b.length,
      cLen = ikPose.length

    let rad
    const outRot = new Quaternion()

    // FIRST BONE - Aim then rotate by the angle.
    // Aim the first bone toward the target oriented with the bend direction.
    // this._aim_bone2( chain, tpose, p_wt, rot );		// Aim the first bone toward the target oriented with the bend direction.
    const parentWorldPosition = new Vector3(),
      parentWorldQuaternion = new Quaternion(),
      parentWorldScale = new Vector3()

    if (bind_a.parent.type === 'Bone') {
      pose_a.parent.getWorldPosition(parentWorldPosition)
      pose_a.parent.getWorldQuaternion(parentWorldQuaternion)
      pose_a.parent.getWorldScale(parentWorldScale)
    } else {
      pose_a.getWorldPosition(parentWorldPosition)
      pose_a.getWorldQuaternion(parentWorldQuaternion)
      pose_a.getWorldScale(parentWorldScale)
    }
    // IK SOLVER
    // ORIGINAL CODE:
    // let rot	= Quat.mul( p_wt.rot, tpose.get_local_rot( chain.first() ) ),	// Get World Space Rotation for Bone
    // dir	= Vec3.transform_quat( chain.alt_fwd, rot );					// Get Bone's WS Forward Dir
    const rot = new Quaternion().copy(parentWorldQuaternion).multiply(bind_a.quaternion)
    //Swing
    const dir = new Vector3().copy(chain.altForward).applyQuaternion(rot) // Get Bone's WS Forward Dir

    // TODO: Check the original reference and make sure this is valid
    // Swing
    // ORIGINAL CODE
    // let q = Quat.unit_vecs( dir, this.axis.z );
    //	out.from_mul( q, rot );
    const q = new Quaternion().setFromUnitVectors(dir, ikPose.axis.z)
    outRot.copy(q).multiply(rot)

    dir.copy(chain.altUp).applyQuaternion(outRot) // After Swing, Whats the UP Direction
    let twist = dir.angleTo(ikPose.axis.y) // Get difference between Swing Up and Target Up

    if (twist <= 0.00017453292) twist = 0
    else {
      dir.cross(ikPose.axis.z) // Get Swing LEFT, used to test if twist is on the negative side.
      if (dir.dot(ikPose.axis.y) >= 0) twist = -twist
    }

    // ???? Why does this fix it??? This should be enabled
    pmul_axis_angle(outRot, ikPose.axis.z, twist)
    // END SOLVER

    const bindAWorldQuaternion = new Quaternion()
    bind_a.getWorldQuaternion(bindAWorldQuaternion)
    // const poseBWorldQuaternion = new Quaternion();

    // const boneParentQuaternionInverse = new Quaternion();
    // tposeBone.parent.getWorldQuaternion(boneParentQuaternionInverse);
    // boneParentQuaternionInverse.invert();

    rad = LawCosinesSSS(aLen, cLen, bLen) // Get the Angle between First Bone and Target.
    pmul_axis_angle(outRot, ikPose.axis.x, -rad) // Rotate it by the target's x-axis .pmul( tmp.from_axis_angle( this.axis.x, rad ) )
    pmul_invert(outRot, parentWorldQuaternion) // Convert to Local Space in temp to save WS rot for next bone.
    // Get the Angle between First Bone and Target.
    // tempQ.setFromAxisAngle(ikPose.target.axis.x, rad)	// Use the Target's X axis for quaternion along with the angle from SSS
    // .premultiply(quaternion) // Premultiply by original value
    // 	.premultiply(boneParentQuaternionInverse);							// Convert to Bone's Local Space by multiply invert of parent bone quaternion
    // Save result to bone.
    rig.pose.bones[bindAIndex].setRotationFromQuaternion(outRot)

    const poseAWorldQuaternion = new Quaternion()

    pose_a.getWorldQuaternion(poseAWorldQuaternion)

    // TODO
    // Transform.add handles this with some positional magic
    // this.add(pose_a, parentWorldPosition, parentWorldQuaternion, parentWorldScale);

    // /SECOND BONE
    // Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from
    // the other direction. Ex. L->R 70 degNotrees == R->L 110 degrees
    rad = Math.PI - LawCosinesSSS(aLen, bLen, cLen)
    poseAWorldQuaternion.multiply(outRot)

    outRot.copy(poseAWorldQuaternion).multiply(bind_b.quaternion) // Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
    pmul_axis_angle(outRot, ikPose.axis.x, rad) // Rotate it by the target's x-axis
    pmul_invert(outRot, poseAWorldQuaternion) // Convert to Bone's Local Space

    rig.pose.bones[bindBIndex].setRotationFromQuaternion(outRot)
  })
}

function from_mul(out, a, b) {
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

export function applyLookTwist(entity, boneInfo, ik, lookDirection, twistDirection) {
  const rig = getComponent(entity, IKRig)

  // First we need to get the WS Rotation of the parent to the Foot
  // Then Add the Foot's LS Bind rotation. The idea is to see where
  // the foot will currently be if it has yet to have any rotation
  // applied to it.
  // ORIGINAL CODE
  // let bind 	= rig.tpose.bones[ b_info.idx ],
  // pose 	= rig.pose.bones[ b_info.idx ];

  const bind = rig.tpose.bones[boneInfo.index],
    pose = rig.pose.bones[boneInfo.index]

  // ORIGINAL CODE
  // let p_rot 	= rig.pose.get_parent_rot( b_info.idx );
  // let c_rot 	= Quat.mul( p_rot, bind.local.rot );
  const rootQuaternion = rig.pose.getParentRoot(boneInfo.index)

  const childRotation = new Quaternion().copy(rootQuaternion).multiply(bind.quaternion)

  // Next we need to get the Foot's Quaternion Inverse Direction
  // Which matches up with the same Directions used to calculate the IK
  // information.
  // ORIGINAL CODE
  // let q_inv 			= Quat.invert( bind.world.rot ),
  // alt_look_dir	= Vec3.transform_quat( look_dir, q_inv ),
  // alt_twist_dir	= Vec3.transform_quat( twist_dir, q_inv );
  const quatInverse = new Quaternion()
  bind.getWorldQuaternion(quatInverse)
  quatInverse.invert()

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
  const rotation = new Quaternion()
    .setFromUnitVectors(currentLookDirection, ik.lookDirection) // Create our Swing Rotation
    .multiply(childRotation) // Then Apply to our foot

  // Now we need to know where the Twist Direction points to after
  // swing rotation has been applied. Then use it to compute our twist rotation.
  // ORIGINAL CODE
  // let now_twist_dir	= Vec3.transform_quat( alt_twist_dir, rot );
  // let twist 			= Quat.unit_vecs( now_twist_dir, ik.twist_dir  );
  // rot.pmul( twist );	// Apply Twist
  const currentTwistDirection = new Vector3().copy(altTwistDirection).applyQuaternion(rotation)
  const twist = new Quaternion().setFromUnitVectors(currentTwistDirection, ik.twistDirection)
  rotation.premultiply(twist) // Apply Twist
  const boneParentQuaternionInverse = new Quaternion()
  bind.parent.getWorldQuaternion(boneParentQuaternionInverse)
  boneParentQuaternionInverse.invert()

  rotation.premultiply(boneParentQuaternionInverse) // To Local Space
  rig.pose.bones[boneInfo.index].setRotationFromQuaternion(rotation) // Save result to bone.
}

export function applyGrounding(entity, y_lmt) {
  const ik: any = getComponent(entity, IKPose)

  // Once we have out IK Target setup, We can use its data to test various things
  // First we can test if the end effector is below the height limit. Each foot
  // may need a different off the ground offset since the bones rarely touch the floor
  // perfectly.
  // if (this.target.endPosition.y >= y_lmt)
  // 	return;

  /* DEBUG IK TARGET */
  const tar = (ik as any).target,
    posA = tar.startPosition.add(new Vector3(-1, 0, 0)),
    posB = tar.endPosition.add(new Vector3(-1, 0, 0))

  Debug.setPoint(posA, COLOR.yellow, 0.05, 6)
    .setPoint(posB, COLOR.white, 0.05, 6)
    .setLine(posA, posB, COLOR.yellow, COLOR.white, true)

  // Where on the line between the Start and end Points would work for our
  // Y Limit. An easy solution is to find the SCALE based on doing a 1D Scale
  //operation on the Y Values only. Whatever scale value we get with Y we can use on X and Z
  const a = (ik as any).target.startPosition,
    b = (ik as any).target.endPosition,
    s = (y_lmt - a.y) / (b.y - a.y) // Normalize Limit Value in the Max/Min Range of Y.

  // Change the end effector of our target
  ;(ik as any).target.endPosition.set((b.x - a.x) * s + a.x, y_lmt, (b.z - a.z) * s + a.z)

  /* DEBUG NEW END EFFECTOR */
  Debug.setPoint((ik as any).target.endPosition.add(new Vector3(-1, 0, 0)), 'orange', 0.05, 6)

  // Since we changed the end effector, lets update the Sqr Length and Length of our target
  // This is normally computed by our IK Target when we set it, but since I didn't bother
  // to create a method to update the end effector, we need to do these extra updates.
  const distance = (ik as any).target.startPosition.distanceTo((ik as any).target.endPosition)
  ;(ik as any).target.length = distance
}

export function applySpine(entity, chain, ik, lookDirection, twistDirection) {
  const ikPose = getComponent(entity, IKPose)
  ikPose.targetRigs.forEach((rig) => {
    // For the spine, we have the start and end IK directions. Since spines can have various
    // amount of bones, the simplest solution is to lerp from start to finish. The first
    // spine bone is important to control offsets from the hips, and the final one usually
    // controls the chest which dictates where the arms and head are going to be located.
    // Anything between is how the spine would kind of react.
    // Since we are building up the Skeleton, We look at the pose object to know where the Hips
    // currently exist in World Space.

    const bone = rig.pose.bones[chain.first()]
    const boneParent = bone.parent

    // Fix this, since tempV is dead and we use this nowhere
    ;(boneParent as Bone).getWorldPosition(ik.tempV)

    // Copy bone to our transform variables to work on them
    ikPose.spineParentPosition.copy(boneParent.position)
    ikPose.spineChildPosition.copy(bone.position)

    ikPose.spineParentQuaternion.copy(boneParent.quaternion)
    ikPose.spineChildQuaternion.copy(bone.quaternion)

    ikPose.spineParentScale.copy(boneParent.scale)
    ikPose.spineChildScale.copy(bone.scale)

    const cnt = chain.cnt - 1,
      ikLook = new Vector3(),
      ikTwist = new Vector3(),
      altLook = new Vector3(),
      altTwist = new Vector3(),
      rotation = new Quaternion()

    let t,
      boneIndex,
      boneBindValue,
      currentLook = new Vector3(),
      currentTwist = new Vector3(),
      quat = new Quaternion()

    for (let i = 0; i <= cnt; i++) {
      // Prepare for the Iteration
      boneIndex = chain.chainBones[i].index // Bone Index
      boneBindValue = rig.tpose.bones[boneIndex] // Bind Values of the Bone
      t = i / cnt // ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently

      // Lerp our Target IK Directions for this bone
      ikLook.lerpVectors(ik[0].lookDirection, ik[1].lookDirection, t)
      ikTwist.lerpVectors(ik[0].twistDirection, ik[1].twistDirection, t)

      // Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
      boneBindValue.getWorldQuaternion(quat)
      quat = quat.invert()

      // TODO: Did we do this right?
      altLook.copy(lookDirection).applyQuaternion(quat)
      altTwist.copy(twistDirection).applyQuaternion(quat)

      // Get bone in WS that has yet to have any rotation applied
      // childTransform.setFromAdd(parentTransform, bind);

      // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
      // TODO: Make sure this matrix isn't flipped
      const v: Vector3 = new Vector3()
        .copy(ikPose.spineParentScale)
        .multiply(boneBindValue.position) // parent.scale * child.position;
        .applyQuaternion(ikPose.spineParentQuaternion) //Vec3.transformQuat( v, tp.quaternion, v );
      ikPose.spineChildPosition.copy(ikPose.spineParentPosition).add(v) // Vec3.add( tp.position, v, this.position );

      // SCALE - parent.scale * child.scale
      // TODO: not flipped, right?
      ikPose.spineChildScale.copy(ikPose.spineParentScale).multiply(boneBindValue.scale)

      // ROTATION - parent.quaternion * child.quaternion
      ikPose.spineChildQuaternion.copy(ikPose.spineParentQuaternion).multiply(boneBindValue.quaternion)

      currentLook = altLook.applyQuaternion(ikPose.spineChildQuaternion) // What direction is the bone point looking now, without any extra rotation

      rotation
        .setFromUnitVectors(currentLook, ikLook) // Create our Swing Rotation
        .multiply(ikPose.spineChildQuaternion) // Then Apply to our Bone, so its now swong to match the swing direction.

      currentTwist = new Vector3().copy(altTwist).applyQuaternion(rotation) // Get our Current Twist Direction from Our Swing Rotation
      quat.setFromUnitVectors(currentTwist, ikTwist) // Create our twist rotation
      rotation.premultiply(quat) // Apply Twist so now it matches our IK Twist direction

      const spineParentQuaternionInverse = new Quaternion().copy(ikPose.spineParentQuaternion).invert()

      rotation.premultiply(spineParentQuaternionInverse) // To Local Space
      rig.pose.bones[boneIndex].setRotationFromQuaternion(rotation) // Save result to bone.

      if (t != 1) {
        // ORIGINAL CODE is
        // this.add(ikPose.spineParentQuaternion, rotation, boneBindValue.position, boneBindValue.scale); // Compute the WS Transform for the next bone in the chain.
        const parentScaleChildPosition = new Vector3()
          .copy(ikPose.spineParentScale)
          .multiply(boneBindValue.position)
          .applyQuaternion(ikPose.spineParentQuaternion)
        // POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
        // TODO: Multiplied in proper order?
        ikPose.spineParentPosition.copy(ikPose.spineParentPosition).add(parentScaleChildPosition)
        // SCALE - parent.scale * child.scale
        ikPose.spineParentScale.multiply(boneBindValue.scale)
        // ROTATION - parent.quaternion * child.quaternion
        ikPose.spineParentQuaternion.multiply(rotation)
      }
    }
  })
}

export function align_chain(pose, dir, b_names) {
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

      bone = pose.bones.find((bone) => (bone.name = b_names[i + 1])) as Object3D // Bone Reference
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

export function mul(out, q) {
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

export function spin_bone_forward(pose, foot) {
  const v = new Vector3(),
    q = new Quaternion(),
    b = pose.get_bone(foot)

  const parentWorldQuaternion = new Quaternion()
  b.parent.getWorldQuaternion(parentWorldQuaternion)

  b.position.copy(v).add(new Vector3(0, b.len, 0))

  from_mul(v, v, this.scl)
  transform_quat(v, this.rot)
  // v.add( b.position );

  // v.sub( b.position );							// Get The direction to the tail
  v.x = 0 // Flatten vector to 2D by removing Y Position
  v.normalize() // Make it a unit vector
  from_unit_vecs(q, v, FORWARD) // Rotation needed to point the foot forward.
  mul(q, b.quaternion) // Move WS Foot to point forward
  pmul_invert(q, b.quaternion) // To Local Space
  pose.set_bone(b.idx, q) // Save to Pose
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

export function align_bone_forward(pose, b_name) {
  const v = new Vector3(),
    q = new Quaternion(),
    b = pose.get_bone(b_name)

  const parentWorldQuaternion = new Quaternion()
  b.parent.getWorldQuaternion(parentWorldQuaternion)

  from_quat(v, b.quaternion, UP) // Get Bone's WS UP Direction

  from_unit_vecs(q, v, FORWARD) // Difference between Current UP and WS Forward
  mul(q, b.quaternion) // PreMul Difference to Current Rotation
  pmul_invert(q, parentWorldQuaternion) // Convert to Local Space

  pose.set_bone(b.idx, q) // Save to Pose
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

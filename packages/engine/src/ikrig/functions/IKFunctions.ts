import { getMutableComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import Pose from "@xrengine/engine/src/ikrig/classes/Pose";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import { Bone, Quaternion, Vector3 } from "three";
import { IKPose } from "../components/IKPose";
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from "@xrengine/engine/src/ikrig/constants/Vector3Constants";
import debug from "@xrengine/engine/src/ikrig/classes/Debug";

let tempQ = new Quaternion();
var aToBDirection = new Vector3();
var boneAWorldPos = new Vector3();
var boneBWorldPos = new Vector3();
let COLOR = {
	"black": 0x000000,
	"white": 0xffffff,
	"red": 0xff0000,
	"green": 0x00ff00,
	"blue": 0x0000ff,
	"fuchsia": 0xff00ff,
	"cyan": 0x00ffff,
	"yellow": 0xffff00,
	"orange": 0xff8000,
};

var Debug;
export function initDebug(){
	Debug = debug.init();
	return Debug;
}

// Hold the IK Information, then apply it to a Rig
export function LawCosinesSSS(aLen, bLen, cLen) {
	// Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
	// The Angle between A and B with C being the opposite length of the angle.
	let v = (aLen * aLen + bLen * bLen - cLen * cLen) / (2 * aLen * bLen);
	if (v < -1) v = -1;	// Clamp to prevent NaN Errors
	else if (v > 1) v = 1;
	return Math.acos(v);
}

export function setupIKRig(rig: IKRig){
			//-----------------------------------------
			// Auto Setup the Points and Chains based on
			// Known Skeleton Structures.
			rig
				.addPoint("hip", "Hips")
				.addPoint("head", "Head")
				.addPoint("neck", "Neck")
				.addPoint("chest", "Spine2")
				.addPoint("foot_l", "LeftFoot")
				.addPoint("foot_r", "RightFoot")

				.addChain("arm_r", ["RightArm", "RightForeArm"], "RightHand") //"x",
				.addChain("arm_l", ["LeftArm", "LeftForeArm"], "LeftHand") //"x", 
				.addChain("leg_r", ["RightUpLeg", "RightLeg"], "RightFoot") //"z", 
				.addChain("leg_l", ["LeftUpLeg", "LeftLeg"], "LeftFoot")  //"z", 
				.addChain("spine", ["Spine", "Spine1", "Spine2"]); //, "y"

			rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones);
			rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones);
			rig.chains.arm_l.computeLengthFromBones(rig.tpose.bones);
			rig.chains.arm_r.computeLengthFromBones(rig.tpose.bones);

			rig.chains.leg_l.setOffsets(DOWN, FORWARD, rig.tpose);
			rig.chains.leg_r.setOffsets(DOWN, FORWARD, rig.tpose);
			rig.chains.arm_r.setOffsets(RIGHT, BACK, rig.tpose);
			rig.chains.arm_l.setOffsets(LEFT, BACK, rig.tpose);
}

export function computeHip(rig, ik_pose) {
	// First thing we need is the Hip bone from the Animated Pose
	// Plus what the hip's Bind Pose as well.
	// We use these two states to determine what change the animation did to the tpose.

	// ORIGINAL
	// let b_info	= rig.points.hip,					// Rig Hip Info
	// pose 	= rig.pose.bones[ b_info.idx ],		// Animated Pose Bone
	// bind 	= rig.tpose.bones[ b_info.idx ];	// TPose Bone

	let boneInfo = rig.points.hip,
		poseBone: Bone = rig.pose.bones[boneInfo.index],
		bindBone: Bone = rig.tpose.bones[boneInfo.index]; // TPose Bone

		
	console.log("boneInfo", boneInfo);
	console.log("poseBone", poseBone);
	console.log("bindBone", bindBone);

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
	let quatInverse = new Quaternion().copy(bindBone.quaternion).invert(),
		forwardOffset = new Vector3().copy(FORWARD).applyQuaternion(quatInverse),
		upOffset = new Vector3().copy(UP).applyQuaternion(quatInverse);


	let directionHipShouldPoint = new Vector3().copy(forwardOffset).applyQuaternion(poseBone.quaternion),
		hipUpDir = new Vector3().copy(upOffset).applyQuaternion(poseBone.quaternion);
	console.log("quatInverse", quatInverse);
	console.log("forwardOffset", forwardOffset);
	console.log("upOffset", upOffset);

	console.log("pose_fwd is", directionHipShouldPoint);
	console.log("pose_up is", hipUpDir);


	// With our directions known between our TPose and Animated Pose, Next we
	// start to calculate the Swing and Twist Values to swing our TPose into
	// The animation direction
	// ORIGINAL
	// let swing = Quat.unit_vecs( Vec3.FORWARD, pose_fwd )	// First we create a swing rotation from one dir to the other.
	// 		.mul( bind.world.rot );		// Then we apply it to the TBone Rotation, this will do a FWD Swing which will create
	// 									// a new Up direction based on only swing.
	// 	let swing_up	= Vec3.transform_quat( Vec3.UP, swing ),
	// 		twist		= Vec3.angle( swing_up, pose_up );		// Swing + Pose have same Fwd, Use Angle between both UPs for twist
	let swing = new Quaternion().setFromUnitVectors(FORWARD, directionHipShouldPoint) // First we create a swing rotation from one dir to the other.
		.multiply(bindBone.quaternion); // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

	// a new Up direction based on only swing.
	let swing_up = new Vector3().copy(UP).applyQuaternion(swing),
		// TODO: Make sure this isn't flipped
		twist = swing_up.angleTo(hipUpDir); // Swing + Pose have same Fwd, Use Angle between both UPs for twist

	// The difference between Pose UP and Swing UP is what makes up our twist since they both
	// share the same forward access. The issue is that we do not know if that twist is in the Negative direction
	// or positive. So by computing the Swing Left Direction, we can use the Dot Product to determine
	// if swing UP is Over 90 Degrees, if so then its a positive twist else its negative.
	// TODO: did we cross in right order?
	// ORIGINAL
	// let swing_lft = Vec3.cross( swing_up, pose_fwd );
	// // App.Debug.ln( pos, Vec3.scale( swing_lft, 1.5 ).add( pos ), "orange" );
	// if( Vec3.dot( swing_lft, pose_up ) >= 0 ) twist = -twist; 
	let swing_lft = new Vector3().copy(swing_up).cross(directionHipShouldPoint);
	let vec3Dot = new Vector3().copy(swing_lft).dot(hipUpDir);
	// Debug.setLine( position, Vector3.scale( swing_lft, 1.5 ).add( position ), "orange" );
	if (vec3Dot >= 0)
		twist = -twist;

	let posePosition = new Vector3(),
		bindPosition = new Vector3();

	poseBone.getWorldPosition(posePosition);
	bindBone.getWorldPosition(bindPosition);

	console.log("pose.position", poseBone);
	console.log("bind.position", bindBone);
	console.log("ik_pose.hip.bind_height", ik_pose.hip.bind_height);

	// Save all the info we need to our IK Pose.
	// ORIGINAL
	// ik_pose.hip.bind_height	= bind.world.pos.y;	// The Bind Pose Height of the Hip, Helps with scaling.
	// ik_pose.hip.movement.from_sub( pose.world.pos, bind.world.pos );	// How much movement did the hip do between Bind and Animated.
	// ik_pose.hip.dir.copy( pose_fwd );	// Pose Forward is the direction we want the Hip to Point to.
	// ik_pose.hip.twist = twist;	// How Much Twisting to Apply after pointing in the correct direction.
	ik_pose.hip.bind_height = bindBone.position.y; // The Bind Pose Height of the Hip, Helps with scaling.
	// TODO: Right subtract order?
	ik_pose.hip.movement.copy(posePosition).sub(bindPosition); // How much movement did the hip do between Bind and Animated.
	ik_pose.hip.dir.copy(directionHipShouldPoint); // Pose Forward is the direction we want the Hip to Point to.
	ik_pose.hip.twist = twist; // How Much Twisting to Apply after pointing in the correct direction.
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
	let boneA = pose.bones[chain.first()] as Bone,
		boneB = pose.bones[chain.end_idx] as Bone; // END Bone, which is not part of the chain (Hand,Foot)

	// Set some temp bone positions for manipulation
	boneB.getWorldPosition(boneBWorldPos);
	boneA.getWorldPosition(boneAWorldPos);

	// vDir = v2 - v1
	aToBDirection.subVectors(boneBWorldPos, boneAWorldPos);

	// Compute the final IK Information needed for the Limb
	// ORIGINAL CODE
	// ik_limb.len_scale = ab_len / chain.len;	// Normalize the distance base on the length of the Chain.
	// ik_limb.dir.copy( ab_dir.norm() );		// We also normalize the direction to the end effector.
	ik_limb.lengthScale = aToBDirection.length() / chain.length; // Normalize the distance base on the length of the Chain.
	ik_limb.dir.copy(aToBDirection).normalize(); // We also normalize the direction to the end effector.

	// We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
	// ORIGINAL CODE:
	// let j_dir	= Vec3.transform_quat( chain.alt_up, boneA.world.rot );
	// let lft_dir	= Vec3.cross( j_dir, ab_dir );					// We need left to realign up
	// ik_limb.joint_dir.from_cross( ab_dir, lft_dir ).norm(); 	// Recalc Up, make it orthogonal to LEFT and FWD
	const boneAWorldQuat = new Quaternion();
	boneA.getWorldQuaternion(boneAWorldQuat);
	let jointDir = new Vector3().copy(chain.upOffset).applyQuaternion(boneAWorldQuat);

	let lft_dir = new Vector3().copy(jointDir).cross(aToBDirection); // We need left to realign up
	ik_limb.jointDirection = new Vector3().copy(aToBDirection).cross(lft_dir).normalize(); // Recalc Up, make it orthogonal to LEFT and FWD

}
export function computeLookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
	let pose = rig.pose.bones[boneInfo.index],
		bind = rig.tpose.bones[boneInfo.index]; // TPose Bone

	// First compute the Quaternion Invert Directions based on the Defined
	// Directions that was passed into the function. Most often, your look
	// direction is FORWARD and the Direction used to determine twist is UP.
	// But there are times we need the directions to be different depending
	// on how we view the bone in certain situations.
	let quatInverse = bind.quaternion.invert(),
		altLookDirection = new Vector3().copy(lookDirection).applyQuaternion(quatInverse),
		altTwistDirection =  new Vector3().copy(twistDirection).applyQuaternion(quatInverse);

	let pose_look_dir =  new Vector3().copy(altLookDirection).applyQuaternion(pose.quaternion),
		pose_twist_dir =  new Vector3().copy(altTwistDirection).applyQuaternion(pose.quaternion);

	ik.lookDirection.copy(pose_look_dir);
	ik.twistDirection.copy(pose_twist_dir);
}

export function computeSpine(rig, chain, ik_pose, lookDirection, twistDirection) {
	let idx_ary = [chain.first(), chain.last()],
		quatInverse = new Quaternion(),
		v_look_dir = new Vector3(),
		v_twist_dir = new Vector3(),
		j = 0,
		poseBone, bineBone;

		let poseBoneWorldQuaternion = new Quaternion();
		let poseBoneWorldPosition = new Vector3();

	for (let i of idx_ary) {
		// First get reference to the Bones
		bineBone = rig.tpose.bones[i];
		poseBone = rig.pose.bones[i];
		poseBone.getWorldQuaternion(poseBoneWorldQuaternion);
		poseBone.getWorldPosition(poseBoneWorldPosition);

		// Create Quat Inverse Direction
		// TODO: CHeck this math
		// Transform the Inv Dir by the Animated Pose to get their direction
		bineBone.getWorldQuaternion(quatInverse)
		quatInverse.invert();
		v_look_dir.copy(lookDirection)
			.applyQuaternion(quatInverse)
			.applyQuaternion(poseBoneWorldQuaternion);
		v_twist_dir.copy(twistDirection)
			.applyQuaternion(quatInverse)
			.applyQuaternion(poseBoneWorldQuaternion);

			Debug.setPoint( poseBoneWorldQuaternion, "green", 0.03, 6 );
			Debug.setLine( poseBoneWorldQuaternion, new Vector3().copy(v_look_dir).multiplyScalar(1 ).add(poseBoneWorldPosition), "red" );

		// Save IK
		ik_pose.spine[j].lookDirection.copy(v_look_dir);
		ik_pose.spine[j].twistDirection.copy(v_twist_dir);
		j++;
	}

}
// How to visualize the IK Pose Informaation to get an Idea of what we're looking at.
export function visualizeHip(rig, ik) {

	rig.pose.bones[rig.points.hip.index].getWorldPosition(boneAWorldPos);
	Debug
		.setPoint(boneAWorldPos, COLOR.orange, 6, 6)
		.setLine(boneAWorldPos, new Vector3().copy(ik.hip.dir).multiplyScalar(0.20).add(boneAWorldPos), COLOR.cyan, null, true);
}

export function visualizeLimb(pose, chain, ik) {
	const poseBone = pose.bones[chain.first()];
	poseBone.getWorldPosition(boneAWorldPos);
	let len = chain.length * ik.lengthScale,
		posA = boneAWorldPos,
		posB = new Vector3().copy(ik.dir).multiplyScalar(len).add(posA),
		posC = new Vector3().copy(ik.jointDirection).multiplyScalar(0.2).add(posA); // Direction of Joint

	Debug
		.setPoint(posA, COLOR.yellow, 6, 4)
		.setPoint(posB, COLOR.orange, 6, 4)
		.setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
		.setLine(posA, posC, COLOR.yellow, null, true);
}

export function visualizeLookTwist(rig, boneInfo, ik) {
	let position = new Vector3();
	rig.pose.bones[boneInfo.index].getWorldPosition(position);
	Debug
		.setPoint(position, COLOR.cyan, 1, 2.5) // Foot Position
		.setLine(position, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // IK.DIR
		.setLine(position, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(position), COLOR.cyan, null, true); // RESULT OF IK.TWIST
}

export function visualizeSpine(rig, chain, ik_ary) {
	let ws = new Vector3(0,0,0), ik, index = [chain.first(), chain.last()];

	for (let i = 0; i < 2; i++) {
		const poseBone = rig.pose.bones[index[i]];

		poseBone.getWorldPosition(ws);
		ik = ik_ary[i];

		Debug
			.setPoint(ws, COLOR.orange, 1, 2)
			.setLine(ws, new Vector3().copy(ik.lookDirection).multiplyScalar(0.2).add(ws), COLOR.yellow, null)
			.setLine(ws, new Vector3().copy(ik.twistDirection).multiplyScalar(0.2).add(ws), COLOR.orange, null);
	}
}

export function applyHip(entity) {
	let rig = getMutableComponent(entity, IKRig);

	// First step is we need to get access to the Rig's TPose and Pose Hip Bone.
	// The idea is to transform our Bind Pose into a New Pose based on IK Data
	let boneInfo = rig.points.hip;
	if (!boneInfo) return console.warn("boneInfo is null");
	console.log("boneInfo is", boneInfo);
	let bind = rig.tpose.bones[boneInfo.index];


	let ikPose = getMutableComponent(entity, IKPose);

	// Apply IK Swing & Twist ( HANDLE ROTATION )
	// When we compute the IK Hip, We used quaternion invert direction and defined that
	// the hip always points in the FORWARD Axis, so We can use that to quicky get Swing Rotation
	// Take note that vegeta and roborex's Hips are completely different but by using that inverse
	// direction trick, we are easily able to apply the same movement to both.
	let parentRoot = rig.pose.getParentRoot(boneInfo.index); // Incase the Hip isn't the Root bone, but in our example they are.
	console.log("parentRoot after setting it is", parentRoot);

	// TODO: is this flipped?
	let b_rot = new Quaternion().copy(parentRoot).multiply(bind.quaternion); // Add LS rotation of the hip to the WS Parent to get its WS Rot.
	let q = new Quaternion()
		.setFromUnitVectors(FORWARD, ikPose.hip.dir) // Create Swing Rotation
		.multiply(b_rot); // Apply it to our WS Rotation



	// If There is a Twist Value, Apply that as a PreMultiplication.
	// TODO: Uncomment and fix me
	if (ikPose.hip.twist != 0) q.premultiply(new Quaternion().setFromAxisAngle(ikPose.hip.dir, ikPose.hip.twist));
	// In the end, we need to convert to local space. Simply premul by the inverse of the parent
	q.premultiply(new Quaternion().copy(parentRoot).invert());

	rig.pose.setBone(boneInfo.index, q); // Save LS rotation to pose

	console.log(bind);

	let bindWorldPosition = new Vector3();
	bind.getWorldPosition(bindWorldPosition);
	console.log("ikPose.hip.movement is", ikPose.hip.movement);
	// TRANSLATION
	let h_scl = bindWorldPosition.y / ikPose.hip.bind_height; // Create Scale value from Src's Hip Height and Target's Hip Height
	let position = new Vector3().copy(ikPose.hip.movement).multiplyScalar(h_scl) // Scale the Translation Differnce to Match this Models Scale
		.add(bindWorldPosition); // Then Add that change to the TPose Position


	// MAYBE we want to keep the stride distance exact, we can reset the XZ positions
	// BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
	// our source is taller then our targets, this will cause our target legs to always
	// straighten out.
	position.x = ikPose.hip.movement.x;
	position.z = ikPose.hip.movement.z;
	rig.pose.setBone(boneInfo.index, null, position); // Save Position to Pose
	return;

}

export function applyLimb(entity, chain, limb, grounding = 0) {
	// TODO: Needs more detail, especially at end!
	let rig = getMutableComponent(entity, IKRig);
	let ikPose = getMutableComponent(entity, IKPose);

	console.log("rig.pose is", rig.pose);
	console.log("chain", chain);
	let bone = rig.pose.bones[chain.first()];
	// Set the transform data onto the pose
	// How much of the Chain length to use to calc End Effector
	let len = (chain.length) * limb.lengthScale;

	// Next we pass our into to the Target which does a some pre computations that solvers may need.
	// Original code:
	// fromPositionAndDirection(bone.position, limb.dir, limb.jointDirection, len);

	 // Setup IK Target
	ikPose.target.startPosition.copy(bone.position);
	console.log("limb", limb);
	console.log("bone", bone);
	console.log("position, dir, up_dir, len_scl");
	console.log(bone.position, limb.dir, limb.jointDirection, len)
	ikPose.target.endPosition = new Vector3().copy(limb.dir).multiplyScalar( len)	// Compute End Effector
		.add(bone.position);
		ikPose.target.length = bone.position.distanceTo(ikPose.target.endPosition)

		ikPose.target.axis.fromDirection(limb.dir, limb.jointDirection); // Target Axis

	// if (grounding)
	// 	applyGrounding(entity, grounding);


	// solve for ik
	console.log("tpose.bones", rig.tpose.bones);
	console.log("chain.chainBones[0]", chain.chainBones[0])

	// Using law of cos SSS, so need the length of all sides of the triangle
	const bind_a = rig.tpose.bones[chain.chainBones[0].index],	// Bone Reference from Bind
		bind_b = rig.tpose.bones[chain.chainBones[1].index],
		pose_a = rig.pose.bones[chain.chainBones[0].index],		// Bone Reference from Pose
		pose_b = rig.pose.bones[chain.chainBones[1].index]

	const bindAIndex = chain.chainBones[0].index;
	const bindBIndex = chain.chainBones[1].index;

	console.log("bind_a is", bind_a)
	let
		aLen = bind_a.length,
		bLen = bind_b.length,
		cLen = ikPose.target.length;
	let quaternion = new Quaternion();
	let rad;

	// Aim then rotate by the angle.
	// Aim the first bone toward the target oriented with the bend direction.

	// TODO: Is this the right mult order?
	const tposeBone = rig.tpose.bones[chain.first()];
	const tposeQuaternion = tposeBone.quaternion;

	let parentWorldPosition = new Vector3(),
		parentWorldQuaternion = new Quaternion(),
		parentWorldScale = new Vector3();

	bone.parent.getWorldPosition(parentWorldPosition);
	bone.parent.getWorldQuaternion(parentWorldQuaternion);
	bone.parent.getWorldScale(parentWorldScale);


	// ORIGINAL CODE:
	// let rot	= Quat.mul( p_wt.rot, tpose.get_local_rot( chain.first() ) ),	// Get World Space Rotation for Bone
	// dir	= Vec3.transform_quat( chain.alt_fwd, rot );					// Get Bone's WS Forward Dir
	let rot = new Quaternion().copy(parentWorldQuaternion).multiply(tposeQuaternion);
	console.log("chain is", chain);
	//Swing
	let dir = new Vector3()
	.copy(chain.forwardOffset)
	.applyQuaternion(rot);					// Get Bone's WS Forward Dir

	// TODO: Check the original reference and make sure this is valid
	const q = new Quaternion();
	q.setFromUnitVectors(dir, ikPose.target.axis.z);
	quaternion = quaternion.copy(q).multiply(rot);

	dir = new Vector3().copy(chain.upOffset).applyQuaternion(quaternion);				// After Swing, Whats the UP Direction
	let twist = dir.angleTo(ikPose.target.axis.y);	// Get difference between Swing Up and Target Up

	if (twist <= 0.00017453292) twist = 0;
	else {
		dir.cross(ikPose.target.axis.z);	// Get Swing LEFT, used to test if twist is on the negative side.
		if (new Vector3().copy(dir).dot(ikPose.target.axis.y) >= 0) twist = -twist;
	}

	tempQ.setFromAxisAngle(ikPose.target.axis.z, twist);	// Apply Twist
	quaternion.premultiply(tempQ);

	const boneParentQuaternionInverse = new Quaternion();
	bone.parent.getWorldQuaternion(boneParentQuaternionInverse);
	boneParentQuaternionInverse.invert();
	rad = LawCosinesSSS(aLen, cLen, bLen);				// Get the Angle between First Bone and Target.
	tempQ.setFromAxisAngle(ikPose.target.axis.x, -rad)	// Use the Target's X axis for quaternion along with the angle from SSS
		.premultiply(quaternion) // Premultiply by original value
		.premultiply(boneParentQuaternionInverse);							// Convert to Bone's Local Space by multiply invert of parent bone quaternion

	rig.pose.setBone(bindAIndex, quaternion);						// Save result to bone.

	pose_a.parent.setFromWorldPosition = parentWorldPosition;
	
	// TODO
	// Transform.add handles this with some positional magic
	// this.add(pose_a, parentWorldPosition, parentWorldQuaternion, parentWorldScale);

	// SECOND BONE
	// Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
	// the other direction. Ex. L->R 70 degrees == R->L 110 degrees
	rad = Math.PI - LawCosinesSSS(aLen, bLen, cLen);

	quaternion.copy(pose_a.quaternion).multiply(bind_b.quaternion)		// Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
		// TODO: remove alloc
		.premultiply(new Quaternion().setFromAxisAngle(ikPose.target.axis.x, rad))				// Rotate it by the target's x-axis

		.premultiply(pose_a.quaternion.invert());					// Convert to Bone's Local Space

	rig.pose.setBone(bindBIndex, quaternion);

	pose_b.position.copy(pose_a.position);
	pose_b.quaternion.copy(pose_a.quaternion);
	pose_b.scale.copy(pose_a.scale);

	// this.add(pose_b, quaternion, bind_b.position, bind_b.scale);
}

export function applyLookTwist(entity, boneInfo, ik, lookDirection, twistDirection) {
	let rig = getMutableComponent(entity, IKRig);

	// First we need to get the WS Rotation of the parent to the Foot
	// Then Add the Foot's LS Bind rotation. The idea is to see where
	// the foot will currently be if it has yet to have any rotation
	// applied to it.
	// ORIGINAL CODE
	// let bind 	= rig.tpose.bones[ b_info.idx ],
	// pose 	= rig.pose.bones[ b_info.idx ];


	let bind = rig.tpose.bones[boneInfo.index],
		pose = rig.pose.bones[boneInfo.index];

		console.log("boneInfo.index is", boneInfo.index);

	// ORIGINAL CODE
	// let p_rot 	= rig.pose.get_parent_rot( b_info.idx );
	// let c_rot 	= Quat.mul( p_rot, bind.local.rot );
	let rootQuaternion = rig.pose.getParentRoot(boneInfo.index);
	console.log("parentRoot is", rootQuaternion);

	let childRotation = new Quaternion().copy(rootQuaternion).multiply(bind.quaternion);

	// Next we need to get the Foot's Quaternion Inverse Direction
	// Which matches up with the same Directions used to calculate the IK
	// information.
	// ORIGINAL CODE
	// let q_inv 			= Quat.invert( bind.world.rot ),
	// alt_look_dir	= Vec3.transform_quat( look_dir, q_inv ),
	// alt_twist_dir	= Vec3.transform_quat( twist_dir, q_inv );
	const quatInverse = new Quaternion();
	bind.getWorldQuaternion(quatInverse);
	quatInverse.invert();

	let altLookDirection = new Vector3().copy(lookDirection).applyQuaternion(quatInverse),
		altTwistDirection = new Vector3().copy(twistDirection).applyQuaternion(quatInverse);

	// After the HIP was moved and The Limb IK is complete, This is where 
	// the ALT Look Direction currently points to.
	// ORIGNAL CODE
	// 	let now_look_dir = Vec3.transform_quat( alt_look_dir, c_rot );
	let currentLookDirection = new Vector3().copy(altLookDirection).applyQuaternion(childRotation);

	// Now we start building out final rotation that we
	// want to apply to the bone to get it pointing at the
	// right direction and twisted to match the original animation.
	// ORIGINAL CODE
	// let rot = Quat
	// .unit_vecs( now_look_dir, ik.look_dir )	// Create our Swing Rotation
	// .mul( c_rot );							// Then Apply to our foot
	let rotation = new Quaternion()
		.setFromUnitVectors(currentLookDirection, ik.lookDirection) // Create our Swing Rotation
		.multiply(childRotation); // Then Apply to our foot

	// Now we need to know where the Twist Direction points to after 
	// swing rotation has been applied. Then use it to compute our twist rotation.
	// ORIGINAL CODE
	// let now_twist_dir	= Vec3.transform_quat( alt_twist_dir, rot );
	// let twist 			= Quat.unit_vecs( now_twist_dir, ik.twist_dir  );
	// rot.pmul( twist );	// Apply Twist
	let currentTwistDirection = new Vector3().copy(altTwistDirection).applyQuaternion(rotation);
	let twist = new Quaternion().setFromUnitVectors(currentTwistDirection, ik.twistDirection);
	rotation.premultiply(twist); // Apply Twist
	const boneParentQuaternionInverse = new Quaternion();
	bind.parent.getWorldQuaternion(boneParentQuaternionInverse);
	boneParentQuaternionInverse.invert();

	rotation.premultiply(boneParentQuaternionInverse); // To Local Space
	rig.pose.setBone(boneInfo.index, rotation); // Save to pose.		
}

export function applyGrounding(entity, y_lmt) {
	let ik = getMutableComponent(entity, IKPose);

	console.log("Appylying grounding");
	// Once we have out IK Target setup, We can use its data to test various things
	// First we can test if the end effector is below the height limit. Each foot
	// may need a different off the ground offset since the bones rarely touch the floor
	// perfectly.
	// if (this.target.endPosition.y >= y_lmt)
	// 	return;

	/* DEBUG IK TARGET */
	let tar = ik.target,
		posA = tar.startPosition.add(new Vector3(-1, 0, 0)),
		posB = tar.endPosition.add(new Vector3(-1, 0, 0));

	console.log("posA is", posA);
	console.log("posB is", posB);

	Debug
		.setPoint(posA, "yellow", 0.05, 6)
		.setPoint(posB, "white", 0.05, 6)
		.setLine(posA, posB, "yellow", "white", true);

	// Where on the line between the Start and end Points would work for our
	// Y Limit. An easy solution is to find the SCALE based on doing a 1D Scale
	//operation on the Y Values only. Whatever scale value we get with Y we can use on X and Z
	let a = ik.target.startPosition,
		b = ik.target.endPosition,
		s = (y_lmt - a.y) / (b.y - a.y); // Normalize Limit Value in the Max/Min Range of Y.


	// Change the end effector of our target
	ik.target.endPosition.set(
		(b.x - a.x) * s + a.x,
		y_lmt,
		(b.z - a.z) * s + a.z
	);

	/* DEBUG NEW END EFFECTOR */
	Debug.setPoint(ik.target.endPosition.add(new Vector3(-1, 0, 0)), "orange", 0.05, 6);

	// Since we changed the end effector, lets update the Sqr Length and Length of our target
	// This is normally computed by our IK Target when we set it, but since I didn't bother
	// to create a method to update the end effector, we need to do these extra updates.
	const distance = ik.target.startPosition.distanceTo(ik.target.endPosition);
	ik.target.length = distance;
}

export function applySpine(entity, chain, ik, lookDirection, twistDirection) {
	let rig = getMutableComponent(entity, IKRig);
	let ikPose = getMutableComponent(entity, IKPose);

	// For the spine, we have the start and end IK directions. Since spines can have various
	// amount of bones, the simplest solution is to lerp from start to finish. The first
	// spine bone is important to control offsets from the hips, and the final one usually
	// controls the chest which dictates where the arms and head are going to be located.
	// Anything between is how the spine would kind of react.
	// Since we are building up the Skeleton, We look at the pose object to know where the Hips
	// currently exist in World Space.

	console.log("chain.first()", chain.first());
	console.log("rig.pose.bones", rig.pose.bones);
	const bone = rig.pose.bones[chain.first()];
	const boneParent = bone.parent;

	// Fix this, since tempV is dead and we use this nowhere
	(boneParent as Bone).getWorldPosition(ik.tempV);

	// Copy bone to our transform variables to work on them
	ikPose.spineParentPosition.copy(boneParent.position);
	ikPose.spineChildPosition.copy(bone.position);

	ikPose.spineParentQuaternion.copy(boneParent.quaternion);
	ikPose.spineChildQuaternion.copy(bone.quaternion);

	ikPose.spineParentScale.copy(boneParent.scale);
	ikPose.spineChildScale.copy(bone.scale);

	let cnt = chain.cnt - 1,
		ikLook = new Vector3(),
		ikTwist = new Vector3(),
		altLook = new Vector3(),
		altTwist = new Vector3(),
		currentLook = new Vector3(),
		currentTwist = new Vector3(),
		quat = new Quaternion(),
		rotation = new Quaternion();

	let t, boneIndex, boneBindValue;

	for (let i = 0; i <= cnt; i++) {
		// Prepare for the Iteration
		boneIndex = chain.chainBones[i].index; // Bone Index
		boneBindValue = rig.tpose.bones[boneIndex]; // Bind Values of the Bone
		t = (i / cnt); // ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently

		// Lerp our Target IK Directions for this bone
		ikLook.lerpVectors(ik[0].lookDirection, ik[1].lookDirection, t);
		ikTwist.lerpVectors(ik[0].twistDirection, ik[1].twistDirection, t);

		// Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
		boneBindValue.getWorldQuaternion(quat);
		quat = quat.invert();

		// TODO: Did we do this right?
		altLook = lookDirection.applyQuaternion(quat);
		altTwist = twistDirection.applyQuaternion(quat);

		// Get bone in WS that has yet to have any rotation applied
		// childTransform.setFromAdd(parentTransform, bind);

		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// TODO: Make sure this matrix isn't flipped
		const v: Vector3 = new Vector3().copy(ikPose.spineParentScale)
			.multiply(boneBindValue.position) // parent.scale * child.position;
			.applyQuaternion(ikPose.spineParentQuaternion); //Vec3.transformQuat( v, tp.quaternion, v );
		ikPose.spineChildPosition.copy(ikPose.spineParentPosition).add(v); // Vec3.add( tp.position, v, this.position );

		// SCALE - parent.scale * child.scale
		// TODO: not flipped, right?
		ikPose.spineChildScale.copy(ikPose.spineParentScale).multiply(boneBindValue.scale);

		// ROTATION - parent.quaternion * child.quaternion
		ikPose.spineChildQuaternion.copy(ikPose.spineParentQuaternion).multiply(boneBindValue.quaternion);

		currentLook = altLook.applyQuaternion(ikPose.spineChildQuaternion); // What direction is the bone point looking now, without any extra rotation

		rotation
			.setFromUnitVectors(currentLook, ikLook) // Create our Swing Rotation
			.multiply(ikPose.spineChildQuaternion); // Then Apply to our Bone, so its now swong to match the swing direction.

		currentTwist = new Vector3().copy(altTwist).applyQuaternion(rotation); // Get our Current Twist Direction from Our Swing Rotation
		quat.setFromUnitVectors(currentTwist, ikTwist); // Create our twist rotation
		rotation.premultiply(quat); // Apply Twist so now it matches our IK Twist direction

		const spineParentQuaternionInverse = new Quaternion().copy(ikPose.spineParentQuaternion).invert();

		rotation.premultiply(spineParentQuaternionInverse); // To Local Space

		rig.pose.setBone(boneIndex, rotation); // Save back to pose
		if (t != 1) {
			// ORIGINAL CODE is
			// this.add(ikPose.spineParentQuaternion, rotation, boneBindValue.position, boneBindValue.scale); // Compute the WS Transform for the next bone in the chain.
			const parentScaleChildPosition = new Vector3().copy(ikPose.spineParentScale).multiply(boneBindValue.position).applyQuaternion(ikPose.spineParentQuaternion)
			// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
			// TODO: Multiplied in proper order?
			ikPose.spineParentPosition.copy(ikPose.spineParentPosition).add(parentScaleChildPosition);
			// SCALE - parent.scale * child.scale
			ikPose.spineParentScale.multiply(boneBindValue.scale);
			// ROTATION - parent.quaternion * child.quaternion
			ikPose.spineParentQuaternion.multiply(rotation);
		}
	}
}
import { getMutableComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import { FORWARD, UP } from "@xrengine/engine/src/ikrig/math/Vector3Constants";
import { Bone, Quaternion, Vector3 } from "three";
import { Debug } from ".";
import { IKPose } from "./IKPose";

var aToBDirection = new Vector3();
var boneAWorld = new Vector3();
var boneBWorld = new Vector3();
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

 // Hold the IK Information, then apply it to a Rig
export function LawCosinesSSS( aLen, bLen, cLen ){
	// Law of Cosines - SSS : cos(C) = (a^2 + b^2 - c^2) / 2ab
	// The Angle between A and B with C being the opposite length of the angle.
	let v = ( aLen*aLen + bLen*bLen - cLen*cLen ) / ( 2 * aLen * bLen );
	if( v < -1 )		v = -1;	// Clamp to prevent NaN Errors
	else if( v > 1 )	v = 1;
	return Math.acos( v );
}


export function computeHip(rig, ik_pose) {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// First thing we need is the Hip bone from the Animated Pose
	// Plus what the hip's Bind Pose as well.
	// We use these two states to determine what change the animation did to the tpose.
	let boneInfo = rig.points.hip,
		pose = rig.pose.bones[boneInfo.index],
		bind = rig.tpose.bones[boneInfo.index]; // TPose Bone

	console.log("rig.points.hip is", rig.points.hip);
	console.log("boneInfo is", boneInfo);	

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Lets create the Quaternion Inverse Direction based on the
	// TBone's World Space rotation. We don't really know the orientation 
	// of the bone's starting rotation and our targets will have their own
	// orientation, so by doing this we can easily say no matter what the
	// default direction of the hip, we want to say all hips bones point 
	// at the FORWARD axis and the tail of the bone points UP.
	let quatInverse = bind.quaternion.invert(),
		alt_fwd = FORWARD.applyQuaternion(quatInverse),
		alt_up = UP.applyQuaternion(quatInverse);

	let pose_fwd = alt_fwd.applyQuaternion(pose.quaternion),
		pose_up = alt_up.applyQuaternion(pose.quaternion);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// With our directions known between our TPose and Animated Pose, Next we
	// start to calculate the Swing and Twist Values to swing our TPose into
	// The animation direction
	let swing = new Quaternion().setFromUnitVectors(FORWARD, pose_fwd) // First we create a swing rotation from one dir to the other.
		.multiply(bind.quaternion); // Then we apply it to the TBone Rotation, this will do a FWD Swing which will create

	// a new Up direction based on only swing.
	let swing_up = UP.applyQuaternion(swing),
		// TODO: Make sure this isn't flipped
		twist = swing_up.angleTo(pose_up); // Swing + Pose have same Fwd, Use Angle between both UPs for twist

	if (twist <= (0.01 * Math.PI / 180)) {
		twist = 0; // If Less the .01 Degree, dont bother twisting.
	} else {
		// The difference between Pose UP and Swing UP is what makes up our twist since they both
		// share the same forward access. The issue is that we do not know if that twist is in the Negative direction
		// or positive. So by computing the Swing Left Direction, we can use the Dot Product to determine
		// if swing UP is Over 90 Degrees, if so then its a positive twist else its negative.
		// TODO: did we cross in right order?
		let swing_lft = swing_up.cross(pose_fwd);
		// Debug.setLine( position, Vector3.scale( swing_lft, 1.5 ).add( position ), "orange" );
		if (swing_lft.dot(pose_up) >= 0)
			twist = -twist;
	}

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Save all the info we need to our IK Pose.
	ik_pose.hip.bind_height = bind.position.y; // The Bind Pose Height of the Hip, Helps with scaling.

	// TODO: Right subtract order?
	ik_pose.hip.movement = pose.position.sub(bind.position); // How much movement did the hip do between Bind and Animated.
	ik_pose.hip.dir.copy(pose_fwd); // Pose Forward is the direction we want the Hip to Point to.
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
	// TODO: Our bones are getting further apart, so we need to figure out why
	let boneA = pose.bones.find((bone) => bone.name === chain.first().name) as Bone,
		boneB = pose.bones[chain.end_idx] as Bone; // END Bone, which is not part of the chain (Hand,Foot)

	// Set some temp bone positions for manipulation
	boneB.getWorldPosition(boneBWorld);
	boneA.getWorldPosition(boneAWorld);

	// vDir = v2 - v1
	aToBDirection.subVectors(boneBWorld, boneAWorld);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Compute the final IK Information needed for the Limb
	ik_limb.lengthScale = aToBDirection.length() / chain.length; // Normalize the distance base on the length of the Chain.

	ik_limb.dir.copy(aToBDirection.normalize()); // We also normalize the direction to the end effector.

	// We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
	let j_dir = chain.alt_up.applyQuaternion(boneA.quaternion);
	let lft_dir = j_dir.cross(aToBDirection); // We need left to realign up
	ik_limb.jointDirection = aToBDirection.cross(lft_dir).normalize(); // Recalc Up, make it orthogonal to LEFT and FWD
}
export function computeLookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	let pose = rig.pose.bones[boneInfo.index],
		bind = rig.tpose.bones[boneInfo.index]; // TPose Bone

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// First compute the Quaternion Invert Directions based on the Defined
	// Directions that was passed into the function. Most often, your look
	// direction is FORWARD and the Direction used to determine twist is UP.
	// But there are times we need the directions to be different depending
	// on how we view the bone in certain situations.
	let quatInverse = bind.quaternion.invert(),
		altLookDirection = lookDirection.applyQuaternion(quatInverse),
		altTwistDirection = twistDirection.applyQuaternion(quatInverse);

	let pose_look_dir = altLookDirection.applyQuaternion(pose.quaternion),
		pose_twist_dir = altTwistDirection.applyQuaternion(pose.quaternion);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	ik.lookDirection.copy(pose_look_dir);
	ik.twistDirection.copy(pose_twist_dir);
}

export function computeSpine(rig, chain, ik_pose, lookDirection, twistDirection) {
	let idx_ary = [chain.first(), chain.last()],
		quatInverse = new Quaternion(),
		v_look_dir = new Vector3(),
		v_twist_dir = new Vector3(),
		j = 0,
		pose, bind;

	for (let i of idx_ary) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First get reference to the Bones
		bind = rig.tpose.bones.find(bone => bone.name === i.name);
		pose = rig.pose.bones.find(bone => bone.name === i.name);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Quat Inverse Direction
		// TODO: CHeck this math
		bind.getWorldQuaternion(quatInverse)
		quatInverse = new Quaternion().copy(quatInverse).invert();
		v_look_dir = lookDirection.applyQuaternion(quatInverse);
		v_twist_dir = twistDirection.applyQuaternion(quatInverse);

		// Transform the Inv Dir by the Animated Pose to get their direction
		v_look_dir = v_look_dir.applyQuaternion(pose.quaternion);
		v_twist_dir = v_twist_dir.applyQuaternion(pose.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Save IK
		ik_pose.spine[j].lookDirection.copy(v_look_dir);
		ik_pose.spine[j].twistDirection.copy(v_twist_dir);
		j++;
	}

}
// How to visualize the IK Pose Informaation to get an Idea of what we're looking at.
export function visualizeHip(rig, ik) {

	rig.pose.bones[rig.points.hip.index].getWorldPosition(boneAWorld);
	Debug
		.setPoint(boneAWorld, COLOR.orange, 6, 6)
		.setLine(boneAWorld, new Vector3().copy(ik.hip.dir).multiplyScalar(0.20).add(boneAWorld), COLOR.cyan, null, true);
}
export function visualizeLimb(pose, chain, ik) {
	const poseBone = pose.bones.find(bone => bone.name === chain.first().name);
	poseBone.getWorldPosition(boneAWorld);
	let len = chain.length * ik.lengthScale,
		posA = boneAWorld,
		posB = ik.dir.multiplyScalar(len).add(posA),
		posC = ik.jointDirection.multiplyScalar(0.2).add(posA); // Direction of Joint

	Debug
		.setPoint(posA, COLOR.yellow, 6, 4)
		.setPoint(posB, COLOR.orange, 6, 4)
		.setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
		.setLine(posA, posC, COLOR.yellow, null, true);
}
export function visualizeLookTwist(rig, boneInfo, ik) {
	let position = rig.pose.bones[boneInfo.index].position;
	Debug
		.setPoint(position, COLOR.cyan, 1, 2.5) // Foot Position
		.setLine(position, ik.lookDirection.multiplyScalar(0.2).add(position), COLOR.cyan, null, true) // IK.DIR
		.setLine(position, ik.twistDirection.multiplyScalar(0.2).add(position), COLOR.cyan, null, true); // RESULT OF IK.TWIST
}
export function visualizeSpine(rig, chain, ik_ary) {
	let ws, ik, index = [chain.first(), chain.last()];

	for (let i = 0; i < 2; i++) {
		const poseBones = rig.pose.bones.find(bone => bone.name === index[i].name);
		ws = poseBones.localToWorld(poseBones.position);
		ik = ik_ary[i];

		Debug
			.setPoint(ws, COLOR.orange, 1, 2)
			.setLine(ws, ik.lookDirection.multiplyScalar(0.2).add(ws), COLOR.yellow, null)
			.setLine(ws, ik.twistDirection.multiplyScalar(0.2).add(ws), COLOR.orange, null);
	}
}



export function applyHip(entity) {
	let rig = getMutableComponent(entity, IKRig);

	console.log("rig is");
	console.log(rig);
	console.log("Rig points are");
	console.log(rig.points);
	// First step is we need to get access to the Rig's TPose and Pose Hip Bone.
	// The idea is to transform our Bind Pose into a New Pose based on IK Data
	let boneInfo = rig.points.hip;
	if(!boneInfo) return console.warn("boneInfo is null");
	console.log("boneInfo is", boneInfo);
	let
		bind = rig.tpose.bones[boneInfo.index],
		pose = rig.pose.bones[boneInfo.index]; // Our Working Pose.


	let ikPose = getMutableComponent(entity, IKPose);





	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Apply IK Swing & Twist ( HANDLE ROTATION )
	// When we compute the IK Hip, We used quaternion invert direction and defined that
	// the hip always points in the FORWARD Axis, so We can use that to quicky get Swing Rotation
	// Take note that vegeta and roborex's Hips are completely different but by using that inverse
	// direction trick, we are easily able to apply the same movement to both.
	let parentRotation = rig.pose.getParentRotation(boneInfo.index); // Incase the Hip isn't the Root bone, but in our example they are.


	// TODO: is this flipped?
	let b_rot = parentRotation.multiply(bind.quaternion); // Add LS rotation of the hip to the WS Parent to get its WS Rot.
	let q = new Quaternion()
		.setFromUnitVectors(FORWARD, ikPose.hip.dir) // Create Swing Rotation
		.multiply(b_rot); // Apply it to our WS Rotation






	// If There is a Twist Value, Apply that as a PreMultiplication.
	// TODO: Uncomment and fix me
	if (ikPose.hip.twist != 0) q.setFromAxisAngle(ikPose.hip.dir, ikPose.hip.twist);
	// In the end, we need to convert to local space. Simply premul by the inverse of the parent
	q.premultiply(parentRotation.invert());

	rig.pose.setBone(boneInfo.index, q); // Save LS rotation to pose

	console.log(bind);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// TRANSLATION
	let h_scl = bind.localToWorld(bind.position).y / ikPose.hip.bind_height; // Create Scale value from Src's Hip Height and Target's Hip Height
	let position = ikPose.hip.movement.multiplyScalar(h_scl) // Scale the Translation Differnce to Match this Models Scale
		.add(bind.localToWorld(bind.position)); // Then Add that change to the TPose Position








	// MAYBE we want to keep the stride distance exact, we can reset the XZ positions
	// BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
	// our source is taller then our targets, this will cause our target legs to always
	// straighten out.
	//position.x = this.hip.movement.x;
	//position.z = this.hip.movement.z;
	rig.pose.setBone(boneInfo.index, null, position); // Save Position to Pose
}

let tempQ = new Quaternion();
export function applyLimb(entity, chain, limb, grounding = 0) {
	let rig = getMutableComponent(entity, IKRig);

	console.log("rig.pose is", rig.pose);
	console.log("chain", chain);

	const { parentTransform, childTransform } = rig.pose.getParentWorld(chain.first());

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// How much of the Chain length to use to calc End Effector
	let len = (chain.length) * limb.lengthScale;

	// Next we pass our into to the Target which does a some pre computations that solvers may need.
	this.target.fromPositionAndDirection(childTransform.position, limb.dir, limb.jointDirection, len); // Setup IK Target

	if (grounding)
		this.applyGrounding(grounding);

	
	const tpose = rig.tpose;
	const pose = rig.pose;
	const p_wt = parentTransform;
	
	// solve for ik
		console.log("tpose.bones", tpose.bones);
		console.log("chain.bones[0]", chain.bones[0])
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Using law of cos SSS, so need the length of all sides of the triangle
		const bind_a = tpose.bones[chain.bones[0].index],	// Bone Reference from Bind
			bind_b = tpose.bones[chain.bones[1].index],
			pose_a = pose.bones[chain.bones[0].index],		// Bone Reference from Pose
			pose_b = pose.bones[chain.bones[1].index]
		console.log("bind_a is", bind_a)
		let
			aLen = bind_a.length,
			bLen = bind_b.length,
			cLen = this.target.length;
			let quaternion = new Quaternion();
		let rad;





		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Aim then rotate by the angle.
		// Aim the first bone toward the target oriented with the bend direction.
		
		// TODO: Is this the right mult order?
		const t= tpose.bones[chain.first()];
		const tq = tpose.bones[chain.first()].quaternion;

		let rot	= p_wt.quaternion.multiply(tq )

		//Swing
		let dir = new Vector3().copy(chain.alt_fwd);

		dir = dir.applyQuaternion(rot);					// Get Bone's WS Forward Dir

		// TODO: Check the original reference and make sure this is valid
		const q = new Quaternion();
		q.setFromUnitVectors(dir, this.target.axis.z);
		quaternion = q.multiply(rot);

		dir = new Vector3().copy(chain.alt_up).applyQuaternion( quaternion);				// After Swing, Whats the UP Direction
		let twist = dir.angleTo(this.target.axis.y);	// Get difference between Swing Up and Target Up

		if (twist <= 0.00017453292) twist = 0;
		else {
			dir.cross(this.target.axis.z);	// Get Swing LEFT, used to test if twist is on the negative side.
			if (dir.dot(this.target.axis.y) >= 0) twist = -twist;
		}

		tempQ.copy(this.target.tempQ.setFromAxisAngle(this.target.axis.z, twist));	// Apply Twist
		quaternion = quaternion.premultiply(this.target.tempQ);

		rad = LawCosinesSSS(aLen, cLen, bLen);				// Get the Angle between First Bone and Target.
		
		this.target.tempQ = this.target.tempQ.setFromAxisAngle(this.target.axis.x, -rad)	// Use the Target's X axis for quaternion along with the angle from SSS
		
		this.target.tempQ = this.target.tempQ.premultiply(quaternion) // Premultiply by original value
		this.target.tempQ = this.target.tempQ.premultiply(p_wt.quaternion.inverse());							// Convert to Bone's Local Space by multiply invert of parent bone quaternion

		pose.setBone(bind_a.index, quaternion);						// Save result to bone.

		// TODO
		// Transform.add handles this with some positional magic
		this.add(pose_a, p_wt.position, p_wt.quaternion, p_wt.scale);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SECOND BONE
		// Need to rotate from Right to Left, So take the angle and subtract it from 180 to rotate from 
		// the other direction. Ex. L->R 70 degrees == R->L 110 degrees
		rad = Math.PI - LawCosinesSSS(aLen, bLen, cLen);

		quaternion = pose_a.quaternion.multiply(bind_b.quaternion)		// Add Bone 2's Local Bind Rotation to Bone 1's new World Rotation.
		// TODO: remove alloc
		.premultiply(new  Quaternion().setFromAxisAngle(this.target.axis.x, rad))				// Rotate it by the target's x-axis
		
		.premultiply(pose_a.quaternion.invert());					// Convert to Bone's Local Space

		pose.setBone(bind_b.index, quaternion);	
		
		pose_b.position.copy(pose_a.position);
		pose_b.quaternion.copy(pose_a.quaternion);
		pose_b.scale.copy(pose_a.scale);

		this.add(pose_b, quaternion, bind_b.position, bind_b.scale);
}

// Computing Transforms, Parent -> Child
export function add(t, cr, cp?, cs = null) {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
	// TODO: Multiplied in proper order?
	t.position.set(t.position.add(t.scale.multiply(cp).applyQuaternion(t.quaternion)));
	t.scale.multiply(cs);
	t.quaternion.multiply(cr);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// SCALE - parent.scale * child.scale

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// ROTATION - parent.quaternion * child.quaternion

	return t;
}

export function applyLookTwist(entity, boneInfo, ik, lookDirection, twistDirection) {
	let rig = getMutableComponent(entity, IKRig);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// First we need to get the WS Rotation of the parent to the Foot
	// Then Add the Foot's LS Bind rotation. The idea is to see where
	// the foot will currently be if it has yet to have any rotation
	// applied to it.
	let bind = rig.tpose.bones[boneInfo.index],
		pose = rig.pose.bones[boneInfo.index];

	let parentRotation = rig.pose.getParentRotation(boneInfo.index);
	let childRotation = parentRotation.multiply(bind.quaternion);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Next we need to get the Foot's Quaternion Inverse Direction
	// Which matches up with the same Directions used to calculate the IK
	// information.
	const q = new Quaternion();
	bind.getWorldQuaternion(q);
	let quatInverse = q.invert(),
		altLookDirection = lookDirection.applyQuaternion(quatInverse),
		altTwistDirection = twistDirection.applyQuaternion(quatInverse);

	// After the HIP was moved and The Limb IK is complete, This is where 
	// the ALT Look Direction currently points to.
	let currentLookDirection = altLookDirection.applyQuaternion(childRotation);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Now we start building out final rotation that we
	// want to apply to the bone to get it pointing at the
	// right direction and twisted to match the original animation.
	let rotation = new Quaternion()
		.setFromUnitVectors(currentLookDirection, ik.lookDirection) // Create our Swing Rotation
		.multiply(childRotation); // Then Apply to our foot



	// Now we need to know where the Twist Direction points to after 
	// swing rotation has been applied. Then use it to compute our twist rotation.
	let currentTwistDirection = altTwistDirection.applyQuaternion(rotation);
	let twist = new Quaternion().setFromUnitVectors(currentTwistDirection, ik.twistDirection);
	rotation.premultiply(twist); // Apply Twist


	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	rotation.premultiply(parentRotation.invert()); // To Local Space
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
	const distance = this.target.startPosition.distanceTo(this.target.endPosition);
	this.target.length = distance;
}

export function applySpine(entity, chain, ik, lookDirection, twistDirection) {
	let rig = getMutableComponent(entity, IKRig);

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
	(boneParent as Bone).getWorldPosition(this.tempV);

	let cnt = chain.cnt - 1,
		parentTransform = boneParent,
		childTransform = bone,
		ikLook = new Vector3(),
		ikTwist = new Vector3(),
		altLook = new Vector3(),
		altTwist = new Vector3(),
		currentLook = new Vector3(),
		currentTwist = new Vector3(),
		quat = new Quaternion(),
		rotation = new Quaternion();

	let t, index, bind;

	for (let i = 0; i <= cnt; i++) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Prepare for the Iteration
		index = chain.bones[i].index; // Bone Index
		bind = rig.tpose.bones[index]; // Bind Values of the Bone
		t = (i / cnt); // ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently



		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Lerp our Target IK Directions for this bone
		ikLook.lerpVectors(ik[0].lookDirection, ik[1].lookDirection, t);
		ikTwist.lerpVectors(ik[0].twistDirection, ik[1].twistDirection, t);

		// Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
		bind.getWorldQuaternion(quat);
		quat = quat.invert();

		// TODO: Did we do this right?
		altLook = lookDirection.applyQuaternion(quat);
		altTwist = twistDirection.applyQuaternion(quat);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Get bone in WS that has yet to have any rotation applied
		// childTransform.setFromAdd(parentTransform, bind);
		
		const parent = parentTransform;
		const child = bind;

		console.log("parent, child", parent, child)
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// TODO: Make sure this matrix isn't flipped
		const v: Vector3 = parent.scale.multiply(child.position); // parent.scale * child.position;
		v.applyQuaternion(parent.quaternion); //Vec3.transformQuat( v, tp.quaternion, v );
		childTransform.position.set(parent.position.add(v)); // Vec3.add( tp.position, v, this.position );

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// SCALE - parent.scale * child.scale
		// TODO: not flipped, right?
		childTransform.scale.set(parent.scale.multiply(child.scale));

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// ROTATION - parent.quaternion * child.quaternion
		childTransform.quaternion.set(parent.quaternion.multiply(child.quaternion));

		
		currentLook = altLook.applyQuaternion(childTransform.quaternion); // What direction is the bone point looking now, without any extra rotation

		rotation
			.setFromUnitVectors(currentLook, ikLook) // Create our Swing Rotation
			.multiply(childTransform.quaternion); // Then Apply to our Bone, so its now swong to match the swing direction.

		currentTwist = altTwist.applyQuaternion(rotation); // Get our Current Twist Direction from Our Swing Rotation
		quat.setFromUnitVectors(currentTwist, ikTwist); // Create our twist rotation
		rotation.premultiply(quat); // Apply Twist so now it matches our IK Twist direction

		rotation.premultiply(parentTransform.quaternion.invert()); // To Local Space


		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		rig.pose.setBone(index, rotation); // Save back to pose
		if (t != 1)
			this.add(parentTransform, rotation, bind.position, bind.scale); // Compute the WS Transform for the next bone in the chain.
	}
}
import { FORWARD, UP } from "@xrengine/engine/src/ikrig/math/Vector3Constants";
import { Bone, Quaternion, Vector3 } from "three";
import { Debug } from ".";

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

export function computeHip(rig, ik_pose) {
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// First thing we need is the Hip bone from the Animated Pose
	// Plus what the hip's Bind Pose as well.
	// We use these two states to determine what change the animation did to the tpose.
	let boneInfo = rig.points.hip,
		pose = rig.pose.bones[boneInfo.index],
		bind = rig.tpose.bones[boneInfo.index]; // TPose Bone

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

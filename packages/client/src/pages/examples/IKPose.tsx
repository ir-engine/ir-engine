import { Component } from "@xrengine/engine/src/ecs/classes/Component";
import IKTarget from "@xrengine/engine/src/ikrig/components/IKTarget";
import Transform from "@xrengine/engine/src/ikrig/math/Transform";
import { FORWARD, UP } from "@xrengine/engine/src/ikrig/math/Vector3Constants";
import { Quaternion, Vector3 } from "three";
import { Debug } from "./ikrig";

// Hold the IK Information, then apply it to a Rig

export class IKPose extends Component<IKPose> {
	target = new IKTarget(); // IK Solvers

	hip = {
		bind_height: 0,
		movement: new Vector3(),
		dir: new Vector3(),
		twist: 0,
	};

	foot_l = { lookDirection: new Vector3(), twistDirection: new Vector3() };
	foot_r = { lookDirection: new Vector3(), twistDirection: new Vector3() };

	// IK Data for limbs is first the Direction toward the End Effector,
	// The scaled length to the end effector, plus the direction that
	// the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
	// joint dir is UP
	leg_l = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };
	leg_r = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };
	arm_l = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };
	arm_r = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };

	spine = [
		{ lookDirection: new Vector3(), twistDirection: new Vector3() },
		{ lookDirection: new Vector3(), twistDirection: new Vector3() },
	];

	head = { lookDirection: new Vector3(), twistDirection: new Vector3() };

	applyRig(rig) {
		// this.applyHip(rig);

		// this.applyLimb(rig, rig.chains.leg_l, this.leg_l);
		// this.applyLimb(rig, rig.chains.leg_r, this.leg_r);

		// this.applyLookTwist(rig, rig.points.foot_l, this.foot_l, FORWARD, UP);
		// this.applyLookTwist(rig, rig.points.foot_r, this.foot_r, FORWARD, UP);

		// this.applySpline(rig, rig.chains.spine, this.spine, UP, FORWARD);

		if (rig.chains.arm_l)
			this.applyLimb(rig, rig.chains.arm_l, this.arm_l);
		if (rig.chains.arm_r)
			this.applyLimb(rig, rig.chains.arm_r, this.arm_r);

		// this.applyLookTwist(rig, rig.points.head, this.head, FORWARD, UP);
	}

	applyHip(rig) {
		console.log("rig is");
		console.log(rig);
		console.log("Rig points are");
		console.log(rig.points);

		// First step is we need to get access to the Rig's TPose and Pose Hip Bone.
		// The idea is to transform our Bind Pose into a New Pose based on IK Data
		let boneInfo = rig.points.hip;
		console.log("boneInfo is", boneInfo);
		let
			bind = rig.tpose.bones[boneInfo.index],
			pose = rig.pose.bones[boneInfo.index]; // Our Working Pose.







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
			.setFromUnitVectors(FORWARD, this.hip.dir) // Create Swing Rotation
			.multiply(b_rot); // Apply it to our WS Rotation






		// If There is a Twist Value, Apply that as a PreMultiplication.
		// TODO: Uncomment and fix me
		if (this.hip.twist != 0) q.setFromAxisAngle(this.hip.dir, this.hip.twist);
		// In the end, we need to convert to local space. Simply premul by the inverse of the parent
		q.premultiply(parentRotation.invert());

		rig.pose.setBone(boneInfo.index, q); // Save LS rotation to pose

		console.log(bind);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// TRANSLATION
		let h_scl = bind.localToWorld(bind.position).y / this.hip.bind_height; // Create Scale value from Src's Hip Height and Target's Hip Height
		let position = this.hip.movement.multiplyScalar(h_scl) // Scale the Translation Differnce to Match this Models Scale
			.add(bind.localToWorld(bind.position)); // Then Add that change to the TPose Position








		// MAYBE we want to keep the stride distance exact, we can reset the XZ positions
		// BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
		// our source is taller then our targets, this will cause our target legs to always
		// straighten out.
		//position.x = this.hip.movement.x;
		//position.z = this.hip.movement.z;
		rig.pose.setBone(boneInfo.index, null, position); // Save Position to Pose
	}


	applyLimb(rig, chain, limb, grounding = 0) {

		console.log("rig.pose is", rig.pose);
		console.log("chain", chain);

		const { parentTransform, childTransform } = rig.pose.getParentWorld(chain.first());

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// How much of the Chain length to use to calc End Effector
		let len = (rig.leg_len_lmt || chain.length) * limb.lengthScale;

		// Next we pass our into to the Target which does a some pre computations that solvers may need.
		this.target.fromPositionAndDirection(childTransform.position, limb.dir, limb.jointDirection, len); // Setup IK Target

		if (grounding)
			this.applyGrounding(grounding);

		// The IK Solver will update the pose with the results of the operation. We pass in the
		// parent for it to use it to return things back into local space.
		this.target["limb"](chain, rig.tpose, rig.pose, parentTransform);
	}

	applyLookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First we need to get the WS Rotation of the parent to the Foot
		// Then Add the Foot's LS Bind rotation. The idea is to see where
		// the foot will currently be if it has yet to have any rotation
		// applied to it.
		let bind = rig.tpose.bones[boneInfo.index],
			pose = rig.pose.bones[boneInfo.index];

		let parentRotation = rig.pose.getParentRotation(boneInfo.index);
		let childRotation = parentRotation.multiply(bind.local.quaternion);

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

	applyGrounding(y_lmt) {
		console.log("Appylying grounding");
		// Once we have out IK Target setup, We can use its data to test various things
		// First we can test if the end effector is below the height limit. Each foot
		// may need a different off the ground offset since the bones rarely touch the floor
		// perfectly.
		// if (this.target.endPosition.y >= y_lmt)
		// 	return;

		/* DEBUG IK TARGET */
		let tar = this.target,
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
		let a = this.target.startPosition,
			b = this.target.endPosition,
			s = (y_lmt - a.y) / (b.y - a.y); // Normalize Limit Value in the Max/Min Range of Y.


		// Change the end effector of our target
		this.target.endPosition.set(
			(b.x - a.x) * s + a.x,
			y_lmt,
			(b.z - a.z) * s + a.z
		);

		/* DEBUG NEW END EFFECTOR */
		Debug.setPoint(this.target.endPosition.add(new Vector3(-1, 0, 0)), "orange", 0.05, 6);

		// Since we changed the end effector, lets update the Sqr Length and Length of our target
		// This is normally computed by our IK Target when we set it, but since I didn't bother
		// to create a method to update the end effector, we need to do these extra updates.
		const distance = this.target.startPosition.distanceTo(this.target.endPosition);
		this.target.length = distance;
	}

	applySpline(rig, chain, ik, lookDirection, twistDirection) {
		// For the spline, we have the start and end IK directions. Since spines can have various
		// amount of bones, the simplest solution is to lerp from start to finish. The first
		// spine bone is important to control offsets from the hips, and the final one usually
		// controls the chest which dictates where the arms and head are going to be located.
		// Anything between is how the spine would kind of react.
		// Since we are building up the Skeleton, We look at the pose object to know where the Hips
		// currently exist in World Space.
		let cnt = chain.cnt - 1,
			parentTransform = rig.pose.getParentWorld(chain.first()),
			childTransform = new Transform(),
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
			childTransform.setFromAdd(parentTransform, bind); // Get bone in WS that has yet to have any rotation applied
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
				parentTransform.add(rotation, bind.local.position, bind.local.scale); // Compute the WS Transform for the next bone in the chain.
		}
	}
}

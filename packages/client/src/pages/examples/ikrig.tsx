import { System } from "@xrengine/engine/src/ecs/classes/System";
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { execute } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, getMutableComponent, hasComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import { registerSystem } from "@xrengine/engine/src/ecs/functions/SystemFunctions";
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType";
import Animation from "@xrengine/engine/src/ikrig/classes/Animation";
import Obj from "@xrengine/engine/src/ikrig/components/Obj";
import debug from "@xrengine/engine/src/ikrig/classes/Debug";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import IKTarget from "@xrengine/engine/src/ikrig/components/IKTarget";
import PoseAnimator from "@xrengine/engine/src/ikrig/classes/PoseAnimator";
import React, { useEffect } from "react";
import { AmbientLight, DirectionalLight, GridHelper, MeshPhongMaterial, PerspectiveCamera, Quaternion, Scene, SkeletonHelper, Vector3, WebGLRenderer } from "three";
import NetworkDebug from "../../components/NetworkDebug";
import ArmatureSystem from "@xrengine/engine/src/ikrig/systems/ArmatureSystem";
import Transform from "@xrengine/engine/src/ikrig/math/Transform";
import { LoadGLTF } from "@xrengine/engine/src/assets/functions/LoadGLTF";
import Armature from "@xrengine/engine/src/ikrig/components/Armature";
import { FORWARD, UP } from "@xrengine/engine/src/ikrig/math/Vector3Constants";

let gSrc, gModelA, gIKPose;

var Debug;

class RenderSystem extends System {
	updateType = SystemUpdateType.Fixed;

	/**
	 * Execute the camera system for different events of queries.\
	 * Called each frame by default.
	 *
	 * @param delta time since last frame.
	 */
	execute(delta: number): void {
		Engine.renderer.render(Engine.scene, Engine.camera);
	}
}

function init_3js() {
	const canvas = document.createElement("canvas");
	document.body.appendChild(canvas); // adds the canvas to the body element

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Setup Renderer
	let w = window.innerWidth,
		h = window.innerHeight;
	//App.renderer = new WebGLRenderer( { canvas: App.canvas, antialias:true } );
	let ctx = canvas.getContext("webgl2"); //, { alpha: false }
	Engine.renderer = new WebGLRenderer({ canvas: canvas, context: ctx, antialias: true });

	Engine.renderer.setClearColor(0x3a3a3a, 1);
	Engine.renderer.setSize(w, h);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	Engine.scene = new Scene();
	Engine.scene.add(new GridHelper(20, 20, 0x0c610c, 0x444444));

	Engine.camera = new PerspectiveCamera(45, w / h, 0.01, 1000);
	Engine.camera.position.set(0, 1, 5);

	Engine.scene.add(Engine.camera);
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Setup Lighting
	let light = new DirectionalLight(0xffffff, 1.0);
	light.position.set(4, 10, 1);
	Engine.scene.add(light);

	Engine.scene.add(new AmbientLight(0x404040));

	return true;
}

// #region IK CLASSES

// Hold the IK Information, then apply it to a Rig
class IKPose {
	target = new IKTarget();		// IK Solvers

	hip = {
		bind_height: 0,			// Use to help Scale movement.
		movement: new Vector3(),	// How Much Movement the Hip did in world space
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
		this.applyHip(rig);

		this.apply_limb(rig, rig.chains.leg_l, this.leg_l);
		this.apply_limb(rig, rig.chains.leg_r, this.leg_r);

		this.applyLookTwist(rig, rig.points.foot_l, this.foot_l, FORWARD, UP);
		this.applyLookTwist(rig, rig.points.foot_r, this.foot_r, FORWARD, UP);

		this.apply_spline(rig, rig.chains.spine, this.spine, UP, FORWARD);

		if (rig.chains.arm_l) this.apply_limb(rig, rig.chains.arm_l, this.arm_l);
		if (rig.chains.arm_r) this.apply_limb(rig, rig.chains.arm_r, this.arm_r);

		this.applyLookTwist(rig, rig.points.head, this.head, FORWARD, UP);
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
			bind = rig.tpose.bones[boneInfo.index],	// TPose which is our Bind Pose
			pose = rig.pose.bones[boneInfo.index];		// Our Working Pose.

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Apply IK Swing & Twist ( HANDLE ROTATION )
		// When we compute the IK Hip, We used quaternion invert direction and defined that
		// the hip always points in the FORWARD Axis, so We can use that to quicky get Swing Rotation
		// Take note that vegeta and roborex's Hips are completely different but by using that inverse
		// direction trick, we are easily able to apply the same movement to both.
		let parentRotation = rig.pose.getParentRotation(boneInfo.index);	// Incase the Hip isn't the Root bone, but in our example they are.
		
		// TODO: is this flipped?
		let b_rot = parentRotation.multiply(bind.local.quaternion);		// Add LS rotation of the hip to the WS Parent to get its WS Rot.
		let q = new Quaternion()
			.setFromUnitVectors(FORWARD, this.hip.dir)	// Create Swing Rotation
			.multiply(b_rot);								// Apply it to our WS Rotation

		// If There is a Twist Value, Apply that as a PreMultiplication.
		// TODO: Uncomment and fix me
		// if (this.hip.twist != 0) q.premultiplyAxisAngle(this.hip.dir, this.hip.twist);

		// In the end, we need to convert to local space. Simply premul by the inverse of the parent
		q.premultiply(parentRotation.invert());

		rig.pose.setBone(boneInfo.index, q); // Save LS rotation to pose

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// TRANSLATION
		let h_scl = bind.world.position.y / this.hip.bind_height;	// Create Scale value from Src's Hip Height and Target's Hip Height
		let position = this.hip.movement.multiplyScalar(h_scl)		// Scale the Translation Differnce to Match this Models Scale
			.add(bind.world.position);					// Then Add that change to the TPose Position

		// MAYBE we want to keep the stride distance exact, we can reset the XZ positions
		// BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
		// our source is taller then our targets, this will cause our target legs to always
		// straighten out.
		//position.x = this.hip.movement.x;
		//position.z = this.hip.movement.z;

		rig.pose.setBone(boneInfo.index, null, position);	// Save Position to Pose
	}
	

	apply_limb(rig, chain, limb, grounding = 0) {
		const { parentTransform, childTransform } = rig.pose.getParentWorld(chain.first());

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// How much of the Chain length to use to calc End Effector
		let len = (rig.leg_len_lmt || chain.length) * limb.lengthScale;

		// Next we pass our into to the Target which does a some pre computations that solvers may need.
		this.target.fromPositionAndDirection(childTransform.position, limb.dir, limb.jointDirection, len);	// Setup IK Target

		if (grounding) this.apply_grounding(grounding);

		// Each Chain is assigned a IK Solver that will bend the bones to the right places
		let solver = chain.ik_solver || "limb";

		// The IK Solver will update the pose with the results of the operation. We pass in the
		// parent for it to use it to return things back into local space.
		this.target[solver](chain, rig.tpose, rig.pose, parentTransform);
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
		let childRotation = parentRotation.multiply( bind.local.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Next we need to get the Foot's Quaternion Inverse Direction
		// Which matches up with the same Directions used to calculate the IK
		// information.
		let quatInverse = bind.world.quaternion.invert(),
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
			.setFromUnitVectors(currentLookDirection, ik.lookDirection)	// Create our Swing Rotation
			.multiply(childRotation);							// Then Apply to our foot

		// Now we need to know where the Twist Direction points to after 
		// swing rotation has been applied. Then use it to compute our twist rotation.
		let currentTwistDirection = altTwistDirection.applyQuaternion(rotation);
		let twist = new Quaternion().setFromUnitVectors(currentTwistDirection, ik.twistDirection);
		rotation.premultiply(twist);	// Apply Twist

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		rotation.premultiply(parentRotation.invert());				// To Local Space
		rig.pose.setBone(boneInfo.index, rotation);	// Save to pose.		
	}

	apply_grounding(y_lmt) {
		// Once we have out IK Target setup, We can use its data to test various things
		// First we can test if the end effector is below the height limit. Each foot
		// may need a different off the ground offset since the bones rarely touch the floor
		// perfectly.
		if (this.target.endPosition.y >= y_lmt) return;

		/* DEBUG IK TARGET */
		let tar = this.target,
			posA = tar.startPosition.add([-1, 0, 0]),
			posB = tar.endPosition.add([-1, 0, 0]);
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
			(b.x - a.x) * s + a.x, // We scale the 1D Range then apply it to the start
			y_lmt,
			(b.z - a.z) * s + a.z
		);

		/* DEBUG NEW END EFFECTOR */
		Debug.setPoint(this.target.endPosition.add([-1, 0, 0]), "orange", 0.05, 6);

		// Since we changed the end effector, lets update the Sqr Length and Length of our target
		// This is normally computed by our IK Target when we set it, but since I didn't bother
		// to create a method to update the end effector, we need to do these extra updates.
		const distance = this.target.startPosition.distance(this.target.endPosition);
		this.target.magnitudeSquared = distance * distance;
		this.target.length = distance;
	}

	apply_spline(rig, chain, ik, lookDirection, twistDirection) {
		// For the spline, we have the start and end IK directions. Since spines can have various
		// amount of bones, the simplest solution is to lerp from start to finish. The first
		// spine bone is important to control offsets from the hips, and the final one usually
		// controls the chest which dictates where the arms and head are going to be located.
		// Anything between is how the spine would kind of react.

		// Since we are building up the Skeleton, We look at the pose object to know where the Hips
		// currently exist in World Space.

		let cnt = chain.cnt - 1,								// How Many Spine Bones to deal with
			parentTransform = rig.pose.getParentWorld(chain.first()),	// World Space Transform of the spine's parent, usually the hips
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
			index = chain.bones[i].index;		// Bone Index
			bind = rig.tpose.bones[index];	// Bind Values of the Bone
			t = (i / cnt);// ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Lerp our Target IK Directions for this bone
			ikLook.lerpVectors(ik[0].lookDirection, ik[1].lookDirection, t);
			ikTwist.lerpVectors(ik[0].twistDirection, ik[1].twistDirection, t);

			// Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
			quat = bind.world.quaternion.invert();

			// TODO: Did we do this right?
			altLook = lookDirection.applyQuaternion(quat);
			altTwist = twistDirection.applyQuaternion(quat);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			childTransform.setFromAdd(parentTransform, bind.local);		// Get bone in WS that has yet to have any rotation applied
			currentLook = altLook.applyQuaternion(childTransform.quaternion);	// What direction is the bone point looking now, without any extra rotation

			rotation
				.setFromUnitVectors(currentLook, ikLook)	// Create our Swing Rotation
				.multiply(childTransform.quaternion);						// Then Apply to our Bone, so its now swong to match the swing direction.

			currentTwist = altTwist.applyQuaternion(rotation);		// Get our Current Twist Direction from Our Swing Rotation
			quat.setFromUnitVectors(currentTwist, ikTwist);	// Create our twist rotation
			rotation.premultiply(quat);								// Apply Twist so now it matches our IK Twist direction

			rotation.premultiply(parentTransform.quaternion.invert());				// To Local Space

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			rig.pose.setBone(index, rotation);						// Save back to pose
			if (t != 1) parentTransform.add(rotation, bind.local.position, bind.local.scale);	// Compute the WS Transform for the next bone in the chain.
		}
	}
}

// Read the current pose of a Rig then compute data to be saved to IK Pose.
class IKCompute {
	static run(e, ik_pose) {
		let rig = getMutableComponent(e, IKRig);
		rig.pose.updateWorld();	// First thing, We need to compute WS Transforms for all the bones.
		Debug.reset();			// For this example, Lets reset visual debug for every compute.

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		this.hip(rig, ik_pose);

		this.limb(rig.pose, rig.chains.leg_l, ik_pose.leg_l);
		this.limb(rig.pose, rig.chains.leg_r, ik_pose.leg_r);

		this.lookTwist(rig, rig.points.foot_l, ik_pose.foot_l, FORWARD, UP); // Look = Fwd, Twist = Up
		this.lookTwist(rig, rig.points.foot_r, ik_pose.foot_r, FORWARD, UP);

		this.spine(rig, rig.chains.spine, ik_pose, UP, FORWARD);

		this.limb(rig.pose, rig.chains.arm_l, ik_pose.arm_l);
		this.limb(rig.pose, rig.chains.arm_r, ik_pose.arm_r);

		this.lookTwist(rig, rig.points.head, ik_pose.head, FORWARD, UP);
	}

	static hip(rig, ik_pose) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First thing we need is the Hip bone from the Animated Pose
		// Plus what the hip's Bind Pose as well.
		// We use these two states to determine what change the animation did to the tpose.
		let boneInfo = rig.points.hip,					// Rig Hip Info
			pose = rig.pose.bones[boneInfo.index],		// Animated Pose Bone
			bind = rig.tpose.bones[boneInfo.index];	// TPose Bone

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Lets create the Quaternion Inverse Direction based on the
		// TBone's World Space rotation. We don't really know the orientation 
		// of the bone's starting rotation and our targets will have their own
		// orientation, so by doing this we can easily say no matter what the
		// default direction of the hip, we want to say all hips bones point 
		// at the FORWARD axis and the tail of the bone points UP.
		let quatInverse = bind.world.quaternion.invert(),				// This part can be optimized out and Saved into the Rig Hip's Data.
			alt_fwd = FORWARD.applyQuaternion(quatInverse),
			alt_up = UP.applyQuaternion( quatInverse);

		let pose_fwd = alt_fwd.applyQuaternion( pose.world.quaternion),
			pose_up = alt_up.applyQuaternion( pose.world.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// With our directions known between our TPose and Animated Pose, Next we
		// start to calculate the Swing and Twist Values to swing our TPose into
		// The animation direction

		let swing = new Quaternion().setFromUnitVectors(FORWARD, pose_fwd)	// First we create a swing rotation from one dir to the other.
			.multiply(bind.world.quaternion);		// Then we apply it to the TBone Rotation, this will do a FWD Swing which will create
		// a new Up direction based on only swing.
		let swing_up = UP.applyQuaternion( swing),
		// TODO: Make sure this isn't flipped
			twist = swing_up.angleTo(pose_up);		// Swing + Pose have same Fwd, Use Angle between both UPs for twist

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
			if (swing_lft.dot( pose_up) >= 0) twist = -twist;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Save all the info we need to our IK Pose.
		ik_pose.hip.bind_height = bind.world.position.y;	// The Bind Pose Height of the Hip, Helps with scaling.
		ik_pose.hip.movement.setFromSubtract(pose.world.position, bind.world.position);	// How much movement did the hip do between Bind and Animated.
		ik_pose.hip.dir.copy(pose_fwd);	// Pose Forward is the direction we want the Hip to Point to.
		ik_pose.hip.twist = twist;	// How Much Twisting to Apply after pointing in the correct direction.
	}

	static limb(pose, chain, ik_limb) {
		// Limb IK tends to be fairly easy to determine. What you need is the direction the end effector is in
		// relation to the beginning of the limb chain, like the Shoulder for an arm chain. After you have the
		// direction, you can use it to get the distance. Distance is important to create a scale value based on
		// the length of the chain. Since an arm or leg's length can vary between models, if you normalize the 
		// distance, it becomes easy to translate it to other models. The last bit of info is we need the direction
		// that the joint needs to point. In this example, we precompute the Quaternion Inverse Dir for each chain
		// based on the bind pose. We can transform that direction with the Animated rotation to give us where the
		// joint direction has moved to.

		let boneA = pose.bones[chain.first()],	// First Bone
			boneB = pose.bones[chain.end_idx],	// END Bone, which is not part of the chain (Hand,Foot)
			aToBDirection = boneB.world.position.subtract(boneA.world.position),	// Direction from First Bone to Final Bone ( IK Direction )
			aToBLength = aToBDirection.magnitude();									// Distance from First Bone to Final Bone 


		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Compute the final IK Information needed for the Limb
		ik_limb.lengthScale = aToBLength / chain.length;	// Normalize the distance base on the length of the Chain.
		ik_limb.dir.copy(aToBDirection.normalize());		// We also normalize the direction to the end effector.

		// We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
		let j_dir = chain.alt_up.applyQuaternion(boneA.world.quaternion);
		let lft_dir = j_dir.cross(aToBDirection);					// We need left to realign up
		ik_limb.jointDirection.setFromCross(aToBDirection, lft_dir).normalize(); 	// Recalc Up, make it orthogonal to LEFT and FWD
	}

	static lookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let pose = rig.pose.bones[boneInfo.index],	// Animated Pose Bone
			bind = rig.tpose.bones[boneInfo.index];	// TPose Bone

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First compute the Quaternion Invert Directions based on the Defined
		// Directions that was passed into the function. Most often, your look
		// direction is FORWARD and the Direction used to determine twist is UP.
		// But there are times we need the directions to be different depending
		// on how we view the bone in certain situations.
		let quatInverse = bind.world.quaternion.invert(),
			altLookDirection = lookDirection.applyQuaternion( quatInverse),
			altTwistDirection = twistDirection.applyQuaternion( quatInverse);

		let pose_look_dir = altLookDirection.applyQuaternion( pose.world.quaternion),
			pose_twist_dir = altTwistDirection.applyQuaternion( pose.world.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		ik.lookDirection.copy(pose_look_dir);
		ik.twistDirection.copy(pose_twist_dir);
	}

	static spine(rig, chain, ik_pose, lookDirection, twistDirection) {
		let idx_ary = [chain.first(), chain.last()], // First and Last Bone of the Chain.
			quatInverse = new Quaternion(),
			v_look_dir = new Vector3(),
			v_twist_dir = new Vector3(),
			j = 0,
			pose, bind;

		for (let i of idx_ary) {
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// First get reference to the Bones
			bind = rig.tpose.bones[i];
			pose = rig.pose.bones[i];

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Create Quat Inverse Direction
			quatInverse = bind.world.quaternion.invert();
			v_look_dir = lookDirection.applyQuaternion(quatInverse);
			v_twist_dir = twistDirection.applyQuaternion(quatInverse);

			// Transform the Inv Dir by the Animated Pose to get their direction
			v_look_dir = v_look_dir.applyQuaternion(pose.world.quaternion);
			v_twist_dir = v_twist_dir.applyQuaternion(pose.world.quaternion);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Save IK
			ik_pose.spine[j].lookDirection.copy(v_look_dir);
			ik_pose.spine[j].twistDirection.copy(v_twist_dir);
			j++;
		}

	}

}

// How to visualize the IK Pose Informaation to get an Idea of what we're looking at.
class IKVisualize {
	static run(e, ik) {
		let rig = getMutableComponent(e, IKRig);
		this.hip(rig, ik);

		this.limb(rig.pose, rig.chains.leg_l, ik.leg_l);
		this.limb(rig.pose, rig.chains.leg_r, ik.leg_r);
		this.limb(rig.pose, rig.chains.arm_l, ik.arm_l);
		this.limb(rig.pose, rig.chains.arm_r, ik.arm_r);

		this.lookTwist(rig, rig.points.foot_l, ik.foot_l, FORWARD, UP);
		this.lookTwist(rig, rig.points.foot_r, ik.foot_r, FORWARD, UP);

		this.spine(rig, rig.chains.spine, ik.spine);

		this.lookTwist(rig, rig.points.head, ik.head, FORWARD, UP);
	}

	static hip(rig, ik) {
		let ws = rig.pose.bones[rig.points.hip.index].world;
		Debug
			.setPoint(ws.position, COLOR.orange, 6, 6)
			.setLine(ws.position, ik.hip.dir.multiplyScalar(0.20).add(ws.position), COLOR.cyan, null, true);
	}

	static limb(pose, chain, ik) {
		let len = chain.length * ik.lengthScale,
			posA = pose.bones[chain.first()].world.position,		// Starting Point in Limb
			posB = ik.dir.multiplyScalar(len).add(posA),		// Direction + Length to End Effector
			posC = ik.jointDirection.multiplyScalar(0.2).add(posA);	// Direction of Joint

		Debug
			.setPoint(posA, COLOR.yellow, 6, 4)
			.setPoint(posB, COLOR.orange, 6, 4)
			.setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
			.setLine(posA, posC, COLOR.yellow, null, true);
	}

	// Was Originally called Foot.
	static lookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
		let position = rig.pose.bones[boneInfo.index].world.position;
		Debug
			.setPoint(position, COLOR.cyan, 1, 2.5)												   		// Foot Position
			.setLine(position, ik.lookDirection.multiplyScalar(0.2).add(position), COLOR.cyan, null, true)		// IK.DIR
			.setLine(position, ik.twistDirection.multiplyScalar(0.2).add(position), COLOR.cyan, null, true);	// RESULT OF IK.TWIST
	}

	static spine(rig, chain, ik_ary) {
		let ws, ik, index = [chain.first(), chain.last()];

		for (let i = 0; i < 2; i++) {
			ws = rig.pose.bones[index[i]].world;
			ik = ik_ary[i];

			Debug
				.setPoint(ws.position, COLOR.orange, 1, 2)
				.setLine(ws.position, ik.lookDirection.multiplyScalar(0.2).add(ws.position), COLOR.yellow, null)
				.setLine(ws.position, ik.twistDirection.multiplyScalar(0.2).add(ws.position), COLOR.orange, null);
		}
	}
}

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

async function loadSource(source) {

	const entity = createEntity();
	if(!hasComponent(entity, Armature)){
		addComponent(entity, Armature);
	}
	if(!hasComponent(entity, Obj)){
		addComponent(entity, Obj);
	}

	const o = getMutableComponent(entity, Obj);

	const model = await LoadGLTF(source);

	console.log("Loading source");
	console.log(model.scene);

	const skinnedMeshes = [];
	model.scene.traverse(node => {
		if(node.skeleton !== undefined){
			skinnedMeshes.push(node);
		}
	})

	const sortedSkins = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length });
	console.log("Sorted skins are ", sortedSkins);
	o.setReference(sortedSkins[0]);

	loadBonesInto( entity );

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	const b = getMutableComponent(entity, Armature).getRoot();
	o.ref.add( b );
	Engine.scene.add( new SkeletonHelper( b ) );

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	Engine.scene.add( o.ref );

	// let anim = new Animation(Gltf.getAnimation(json, bin));
	let poseManager = new PoseAnimator();
	addComponent(entity, IKRig);
	let rig = getMutableComponent(entity, IKRig);
	
	rig.init(null, true, IKRig.ARM_MIXAMO)
		.RecomputeFromTPose(); // Mesh requires a few bits to be recomputed because of Mixamo Scaling

	poseManager.rootIndex = 0;	// Get Rid of Motion from The Hip
	poseManager.rootZ = 1;	// Mixamo stuff is 90 degress off, so forward is Y :(

	gSrc = entity;
}

class IKRigSystem extends System {
	execute () {
		this.queryResults.ikrigs.all?.forEach((entity) => {
			let rig = getMutableComponent(entity, IKRig);
			// poseManager.tick(deltaTime).update(anim, rig.pose);
			rig.apply_pose();
			//-----------------------------
			IKCompute.run(gSrc, gIKPose);
			IKVisualize.run(gSrc, gIKPose);

			if(gModelA !== undefined){
			const ikrig = getMutableComponent(gModelA, IKRig);
			gIKPose.applyRig(ikrig);
			ikrig.apply_pose();
			}
		})
	}
}

IKRigSystem.queries = {
	ikrigs: {
		components: [IKRig],
		listen: {
			added: true,
			removed: true,
			changed: true
		}
	}
}

async function loadMeshA(source) {
	const model = await LoadGLTF(source);

	const skinnedMeshes = [];
	model.scene.traverse(node => {
		if(node.skeleton !== undefined){
			skinnedMeshes.push(node);
		}
	})

	const sortedSkins = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length });

	const entity = createEntity();
	if(!hasComponent(entity, Obj)){
		addComponent(entity, Obj);
	}

	if(!hasComponent(entity, Armature)){
		addComponent(entity, Armature);
	}
	console.log("Loading source");
	console.log(model.scene);
	const o = getMutableComponent(entity, Obj);
	o.setReference(sortedSkins[0]);

	const armature = getMutableComponent(entity, Armature);

	loadBonesInto( entity );

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// TODO: Handle me, since I'm just adding this and might not be able to clean it up
	Engine.scene.add( new SkeletonHelper( armature.skeleton.bones[0] ) );
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Save pose local space transform
	const tpose	= getMutableComponent(entity, Armature).createNewPose();
	let b;

	addComponent(entity, IKRig);
	let rig = getMutableComponent(entity, IKRig);
	rig.init(tpose, false);
	
	for( let i=0; i < armature.skeleton.bones.length; i++ ){
		b = armature.skeleton.bones[ i ];
		tpose.setBone( i, b.quaternion, b.position, b.scale );
	}

	tpose.updateWorld();



	tpose.apply();

	rig.points.head.index = rig.points.neck.index; // Lil hack cause Head Isn't Skinned Well.
	getMutableComponent(entity, Obj).setPosition(1.0, 0, 0);

	gModelA = entity;
}



const loadBonesInto = ( entity, def_len=0.1 ) => {
	const armature 	= getMutableComponent(entity, Armature);

	console.log("Ref is")
	console.log(getMutableComponent(entity, Obj).ref);

	const bones 	= getMutableComponent(entity, Obj).ref.skeleton.bones;
	
	console.log("bones is ", bones);

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Create Bones
	const length	= bones.length,
		map = {}			// Create a Map of the First Child of Every Parent
	let i, b, be;

	for( i=0; i < length; i++ ){
		b	= bones[ i ];
		be	= armature.addBone( b.name, 1, b.p_idx );

		if( b.quaternion ) be.quaternion.fromArray( b.quaternion );
		if( b.position ) be.position.fromArray( b.position );
		if( b.scale ) be.scale.fromArray( b.scale );

		// Save First Child to Parent Mapping
		if( b.p_idx != null && !map[ b.p_idx ] ) map[ b.p_idx ] = i;
	}

	armature.finalize();
	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Set the Entity Transfrom from Armature's Node Transform if available.
	// Loading Meshes that where originally FBX need this to display correctly.
	// if( n_info.scale ) obj.ref.scale.fromArray( n_info.scale );
	// if( n_info.quaternion ) obj.ref.quaternion.fromArray( n_info.quaternion );

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Calc the Length of Each Bone
	let c;
	for( i=0; i < length; i++ ){
		b = armature.bones[ i ];

		if( !map[ i ] ) b.length = def_len;
		else{
			c = armature.bones[ map[ i ] ]; // First Child's World Space Transform
			b.length = b.world.position.distance(c.world.position ); // Distance from Parent to Child
		}
	}

	return entity;
}

// This is a functional React component
const Page = () => {
	useEffect(() => {
		(async function () {
			registerSystem(RenderSystem);
			registerSystem(IKRigSystem);
			registerSystem(ArmatureSystem);

			init_3js();
			Debug = await debug.init();

			await loadSource("ikrig/anim/Walking.glb");
			loadMeshA("ikrig/models/vegeta.glb");

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Misc
			gIKPose = new IKPose();

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// gAnimate(0.2);
			// Create a simple timer
			setInterval(() => {
				// We're only executing fixed update systems, but there are other update types
				Engine.systems.forEach(system => system.execute(1 / 30));
			}, 1 / 30 * 1000);
			console.log("Everything is started");
		})();
		// #endregion ///////////////////////////////////////////
	}, []);

	// Create a simple timer
	setInterval(() => {
		// We're only executing fixed update systems, but there are other update types
		execute(.1, 0, SystemUpdateType.Fixed);
	}, 100);
	// Some JSX to keep the compiler from complaining
	return (<NetworkDebug reinit={() => console.log("nope")} />);
};

export default Page;
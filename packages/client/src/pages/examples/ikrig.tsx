import { System } from "@xrengine/engine/src/ecs/classes/System";
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { execute } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { addComponent, getMutableComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import { registerSystem } from "@xrengine/engine/src/ecs/functions/SystemFunctions";
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType";
import Animation from "@xrengine/engine/src/ikrig/classes/Animation";
import GltfUtil, { Gltf } from "@xrengine/engine/src/ikrig/classes/GltfUtil";
import Obj from "@xrengine/engine/src/ikrig/components/Obj";
import debug from "@xrengine/engine/src/ikrig/classes/Debug";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import IKTarget from "@xrengine/engine/src/ikrig/components/IKTarget";
import { Quat, Transform, Vec3 } from "@xrengine/engine/src/ikrig/math/Maths";
import PoseAnimator from "@xrengine/engine/src/ikrig/classes/PoseAnimator";
import React, { useEffect } from "react";
import { AmbientLight, DirectionalLight, GridHelper, MeshPhongMaterial, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import XhrQueue from "./XhrQueue";
import NetworkDebug from "../../components/NetworkDebug";
import ArmatureSystem from "@xrengine/engine/src/ikrig/systems/ArmatureSystem";

let gSrc, gModelA, gAnimate, gIKPose;

var Debug
class TimerSystem extends System {
	updateType = SystemUpdateType.Fixed;

	/**
	 * Execute the camera system for different events of queries.\
	 * Called each frame by default.
	 *
	 * @param delta time since last frame.
	 */
	execute(delta: number): void {
		gAnimate(delta); // * 0.1
		Engine.renderer.render(Engine.scene, Engine.camera);
	}
}
//////////////////////////////////////////////////////////////////
//
//////////////////////////////////////////////////////////////////
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
		movement: new Vec3(),	// How Much Movement the Hip did in world space
		dir: new Vec3(),
		twist: 0,
	};

	foot_l = { look_dir: new Vec3(), twist_dir: new Vec3() };
	foot_r = { look_dir: new Vec3(), twist_dir: new Vec3() };

	// IK Data for limbs is first the Direction toward the End Effector,
	// The scaled length to the end effector, plus the direction that
	// the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
	// joint dir is UP
	leg_l = { len_scale: 0, dir: new Vec3(), joint_dir: new Vec3() };
	leg_r = { len_scale: 0, dir: new Vec3(), joint_dir: new Vec3() };
	arm_l = { len_scale: 0, dir: new Vec3(), joint_dir: new Vec3() };
	arm_r = { len_scale: 0, dir: new Vec3(), joint_dir: new Vec3() };

	spine = [
		{ look_dir: new Vec3(), twist_dir: new Vec3() },
		{ look_dir: new Vec3(), twist_dir: new Vec3() },
	];

	head = { look_dir: new Vec3(), twist_dir: new Vec3() };

	apply_rig(rig) {
		this.apply_hip(rig);

		this.apply_limb(rig, rig.chains.leg_l, this.leg_l);
		this.apply_limb(rig, rig.chains.leg_r, this.leg_r);

		this.apply_look_twist(rig, rig.points.foot_l, this.foot_l, Vec3.FORWARD, Vec3.UP);
		this.apply_look_twist(rig, rig.points.foot_r, this.foot_r, Vec3.FORWARD, Vec3.UP);

		this.apply_spline(rig, rig.chains.spine, this.spine, Vec3.UP, Vec3.FORWARD);

		if (rig.chains.arm_l) this.apply_limb(rig, rig.chains.arm_l, this.arm_l);
		if (rig.chains.arm_r) this.apply_limb(rig, rig.chains.arm_r, this.arm_r);

		this.apply_look_twist(rig, rig.points.head, this.head, Vec3.FORWARD, Vec3.UP);
	}

	apply_hip(rig) {
		// First step is we need to get access to the Rig's TPose and Pose Hip Bone.
		// The idea is to transform our Bind Pose into a New Pose based on IK Data
		let b_info = rig.points.hip,
			bind = rig.tpose.bones[b_info.idx],	// TPose which is our Bind Pose
			pose = rig.pose.bones[b_info.idx];		// Our Working Pose.

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Apply IK Swing & Twist ( HANDLE ROTATION )
		// When we compute the IK Hip, We used quaternion invert direction and defined that
		// the hip always points in the FORWARD Axis, so We can use that to quicky get Swing Rotation
		// Take note that vegeta and roborex's Hips are completely different but by using that inverse
		// direction trick, we are easily able to apply the same movement to both.
		let p_rot = rig.pose.getParentRotation(b_info.idx);	// Incase the Hip isn't the Root bone, but in our example they are.
		let b_rot = Quat.mul(p_rot, bind.local.rotation);		// Add LS rotation of the hip to the WS Parent to get its WS Rot.
		let q = Quat
			.unit_vecs(Vec3.FORWARD, this.hip.dir)	// Create Swing Rotation
			.mul(b_rot);								// Apply it to our WS Rotation

		// If There is a Twist Value, Apply that as a PreMultiplication.
		if (this.hip.twist != 0) q.pmul_axis_angle(this.hip.dir, this.hip.twist);

		// In the end, we need to convert to local space. Simply premul by the inverse of the parent
		q.pmul_invert(p_rot);

		rig.pose.setBone(b_info.idx, q); // Save LS rotation to pose

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// TRANSLATION
		let h_scl = bind.world.position.y / this.hip.bind_height;	// Create Scale value from Src's Hip Height and Target's Hip Height
		let position = Vec3
			.scale(this.hip.movement, h_scl)		// Scale the Translation Differnce to Match this Models Scale
			.add(bind.world.position);					// Then Add that change to the TPose Position

		// MAYBE we want to keep the stride distance exact, we can reset the XZ positions
		// BUT we need to keep the Y Movement scaled, else our leg IK won't work well since
		// our source is taller then our targets, this will cause our target legs to always
		// straighten out.
		//position.x = this.hip.movement.x;
		//position.z = this.hip.movement.z;

		rig.pose.setBone(b_info.idx, null, position);	// Save Position to Pose
	}

	apply_limb(rig, chain, limb, grounding = 0) {
		// The IK Solvers I put together takes transforms as input, not rotations.
		// The first thing we need is the WS Transform of the start of the chain
		// plus the parent's WS Transform. When are are building a full body IK
		// We need to do things in a certain order to build things correctly.
		// So before we can do legs, we need the hip/root to be moved to where it needs to go
		// The issue is that when people walk, you are actually falling forward, you catch
		// yourself when your front foot touches the floor, in the process you lift yourself 
		// up a bit. During a whole walk, or run cycle, a person's hip is always moving up and down
		// Because of that, the distance from the Hip to the floor is constantly changing
		// which is important if we want to have the legs stretch correctly since each IK leg
		// length scale is based on the hip being at a certain height at the time.
		let p_tran = new Transform(),
			c_tran = new Transform();

		rig.pose.getParentWorld(chain.first(), p_tran, c_tran);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// How much of the Chain length to use to calc End Effector
		let len = (rig.leg_len_lmt || chain.len) * limb.len_scale;

		// Next we pass our into to the Target which does a some pre computations that solvers may need.
		this.target.from_pos_dir(c_tran.position, limb.dir, limb.joint_dir, len);	// Setup IK Target

		if (grounding) this.apply_grounding(grounding);

		// Each Chain is assigned a IK Solver that will bend the bones to the right places
		let solver = chain.ik_solver || "limb";

		// The IK Solver will update the pose with the results of the operation. We pass in the
		// parent for it to use it to return things back into local space.
		this.target[solver](chain, rig.tpose, rig.pose, p_tran);
	}

	apply_look_twist(rig, b_info, ik, look_dir, twist_dir) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First we need to get the WS Rotation of the parent to the Foot
		// Then Add the Foot's LS Bind rotation. The idea is to see where
		// the foot will currently be if it has yet to have any rotation
		// applied to it.
		let bind = rig.tpose.bones[b_info.idx],
			pose = rig.pose.bones[b_info.idx];

		let p_rot = rig.pose.getParentRotation(b_info.idx);
		let c_rot = Quat.mul(p_rot, bind.local.rotation);

		/* DEBUG 
		let p_tran	= rig.pose.getParentWorld( b_info.idx );
		let c_tran	= Transform.add( p_tran, bind.local );
		let tpos	= Vec3.add( c_tran.position, [1,0,0] );		// Model was shifted, Add that Shift to keep things aligned.
		Debug.setPoint( tpos, "yellow", 0.05, 1 );			// See Where the Foot is in 3D Space
		*/

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Next we need to get the Foot's Quaternion Inverse Direction
		// Which matches up with the same Directions used to calculate the IK
		// information.
		let q_inv = Quat.invert(bind.world.rotation),
			alt_look_dir = Vec3.transform_quat(look_dir, q_inv),
			alt_twist_dir = Vec3.transform_quat(twist_dir, q_inv);

		// After the HIP was moved and The Limb IK is complete, This is where 
		// the ALT Look Direction currently points to.
		let now_look_dir = Vec3.transform_quat(alt_look_dir, c_rot);

		/* DEBUG - Here we can see where the bone is currently pointing to and where we need it to point 
		Debug.setLine( tpos, Vec3.scale( now_look_dir, 0.5 ).add( tpos ), "yellow" );	// Current Direction
		Debug.setLine( tpos, Vec3.scale( ik.look_dir, 0.4 ).add( tpos ), "white" );		// Our Target IK Direction
		*/

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Now we start building out final rotation that we
		// want to apply to the bone to get it pointing at the
		// right direction and twisted to match the original animation.
		let rotation = Quat
			.unit_vecs(now_look_dir, ik.look_dir)	// Create our Swing Rotation
			.mul(c_rot);							// Then Apply to our foot

		/* DEBUG SWING ROTATION 
		let new_look_dir	= Vec3.transform_quat( alt_look_dir, rotation );
		let new_twist_dir	= Vec3.transform_quat( alt_twist_dir, rotation );
		Debug.setLine( tpos, Vec3.scale( new_look_dir, 0.8 ).add( tpos ), "yellow" );	// Current Directions
		Debug.setLine( tpos, Vec3.scale( new_twist_dir, 0.8 ).add( tpos ), "yellow" );
		Debug.setLine( tpos, Vec3.scale( ik.look_dir, 0.6 ).add( tpos ), "white" );		// Target Directions
		Debug.setLine( tpos, Vec3.scale( ik.twist_dir, 0.6 ).add( tpos ), "white" );
		*/

		// Now we need to know where the Twist Direction points to after 
		// swing rotation has been applied. Then use it to compute our twist rotation.
		let now_twist_dir = Vec3.transform_quat(alt_twist_dir, rotation);
		let twist = Quat.unit_vecs(now_twist_dir, ik.twist_dir);
		rotation.pmul(twist);	// Apply Twist

		/* DEBUG SWING ROTATION 
		let new_look_dir	= Vec3.transform_quat( alt_look_dir, rotation );
		let new_twist_dir	= Vec3.transform_quat( alt_twist_dir, rotation );
		Debug.setLine( tpos, Vec3.scale( new_look_dir, 0.8 ).add( tpos ), "yellow" );	// Current Directions
		Debug.setLine( tpos, Vec3.scale( new_twist_dir, 0.8 ).add( tpos ), "yellow" );
		Debug.setLine( tpos, Vec3.scale( ik.look_dir, 0.6 ).add( tpos ), "white" );		// Target Directions
		Debug.setLine( tpos, Vec3.scale( ik.twist_dir, 0.6 ).add( tpos ), "white" );
		*/

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		rotation.pmul_invert(p_rot);				// To Local Space
		rig.pose.setBone(b_info.idx, rotation);	// Save to pose.		
	}

	apply_grounding(y_lmt) {
		// Once we have out IK Target setup, We can use its data to test various things
		// First we can test if the end effector is below the height limit. Each foot
		// may need a different off the ground offset since the bones rarely touch the floor
		// perfectly.
		if (this.target.end_pos.y >= y_lmt) return;

		/* DEBUG IK TARGET */
		let tar = this.target,
			posA = Vec3.add(tar.start_pos, [-1, 0, 0]),
			posB = Vec3.add(tar.end_pos, [-1, 0, 0]);
		Debug
			.setPoint(posA, "yellow", 0.05, 6)
			.setPoint(posB, "white", 0.05, 6)
			.setLine(posA, posB, "yellow", "white", true);

		// Where on the line between the Start and end Points would work for our
		// Y Limit. An easy solution is to find the SCALE based on doing a 1D Scale
		//operation on the Y Values only. Whatever scale value we get with Y we can use on X and Z

		let a = this.target.start_pos,
			b = this.target.end_pos,
			s = (y_lmt - a.y) / (b.y - a.y); // Normalize Limit Value in the Max/Min Range of Y.

		// Change the end effector of our target
		this.target.end_pos.set(
			(b.x - a.x) * s + a.x, // We scale the 1D Range then apply it to the start
			y_lmt,
			(b.z - a.z) * s + a.z
		);

		/* DEBUG NEW END EFFECTOR */
		Debug.setPoint(Vec3.add(this.target.end_pos, [-1, 0, 0]), "orange", 0.05, 6);

		// Since we changed the end effector, lets update the Sqr Length and Length of our target
		// This is normally computed by our IK Target when we set it, but since I didn't bother
		// to create a method to update the end effector, we need to do these extra updates.
		// IDEALLY i should make that function to prevent bugs :)
		this.target.len_sqr = Vec3.len_sqr(this.target.start_pos, this.target.end_pos);
		this.target.len = Math.sqrt(this.target.len_sqr);
	}

	apply_spline(rig, chain, ik, look_dir, twist_dir) {
		// For the spline, we have the start and end IK directions. Since spines can have various
		// amount of bones, the simplest solution is to lerp from start to finish. The first
		// spine bone is important to control offsets from the hips, and the final one usually
		// controls the chest which dictates where the arms and head are going to be located.
		// Anything between is how the spine would kind of react.

		// Since we are building up the Skeleton, We look at the pose object to know where the Hips
		// currently exist in World Space.

		let cnt = chain.cnt - 1,								// How Many Spine Bones to deal with
			p_tran = rig.pose.getParentWorld(chain.first()),	// World Space Transform of the spine's parent, usually the hips
			c_tran = new Transform(),
			ik_look = new Vec3(),
			ik_twist = new Vec3(),
			alt_look = new Vec3(),
			alt_twist = new Vec3(),
			now_look = new Vec3(),
			now_twist = new Vec3(),
			q = new Quat(),
			rotation = new Quat();

		let t, idx, bind, pose;

		for (let i = 0; i <= cnt; i++) {
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Prepare for the Iteration
			idx = chain.bones[i].idx;		// Bone Index
			bind = rig.tpose.bones[idx];	// Bind Values of the Bone
			t = (i / cnt);// ** 2;		// The Lerp Time, be 0 on first bone, 1 at final bone, Can use curves to distribute the lerp differently

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Lerp our Target IK Directions for this bone
			ik_look.from_lerp(ik[0].look_dir, ik[1].look_dir, t);
			ik_twist.from_lerp(ik[0].twist_dir, ik[1].twist_dir, t);

			// Compute our Quat Inverse Direction, using the Defined Look&Twist Direction
			q.from_invert(bind.world.rotation);
			alt_look.from_quat(q, look_dir);
			alt_twist.from_quat(q, twist_dir);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			c_tran.from_add(p_tran, bind.local);		// Get bone in WS that has yet to have any rotation applied
			now_look.from_quat(c_tran.rotation, alt_look);	// What direction is the bone point looking now, without any extra rotation

			/* DEBUG 
			let position = Vec3.add( c_tran.position, [1,0,0] );
			Debug.setPoint( position, "yellow", 0.02, 1 );
			*/

			rotation
				.from_unit_vecs(now_look, ik_look)	// Create our Swing Rotation
				.mul(c_tran.rotation);						// Then Apply to our Bone, so its now swong to match the swing direction.

			now_twist.from_quat(rotation, alt_twist);		// Get our Current Twist Direction from Our Swing Rotation
			q.from_unit_vecs(now_twist, ik_twist);	// Create our twist rotation
			rotation.pmul(q);								// Apply Twist so now it matches our IK Twist direction

			/*
			now_twist.from_quat( rotation, alt_twist );	
			Debug.setLine( position, Vec3.scale( now_twist, 0.5 ).add(position), "yellow" );
			Debug.setLine( position, Vec3.scale( ik_twist, 0.3 ).add(position), "white" );
			//break;
			*/
			rotation.pmul_invert(p_tran.rotation);				// To Local Space

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			rig.pose.setBone(idx, rotation);						// Save back to pose
			if (t != 1) p_tran.add(rotation, bind.local.position, bind.local.scale);	// Compute the WS Transform for the next bone in the chain.
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

		this.look_twist(rig, rig.points.foot_l, ik_pose.foot_l, Vec3.FORWARD, Vec3.UP); // Look = Fwd, Twist = Up
		this.look_twist(rig, rig.points.foot_r, ik_pose.foot_r, Vec3.FORWARD, Vec3.UP);

		this.spine(rig, rig.chains.spine, ik_pose, Vec3.UP, Vec3.FORWARD);

		this.limb(rig.pose, rig.chains.arm_l, ik_pose.arm_l);
		this.limb(rig.pose, rig.chains.arm_r, ik_pose.arm_r);

		this.look_twist(rig, rig.points.head, ik_pose.head, Vec3.FORWARD, Vec3.UP);
	}

	static hip(rig, ik_pose) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First thing we need is the Hip bone from the Animated Pose
		// Plus what the hip's Bind Pose as well.
		// We use these two states to determine what change the animation did to the tpose.
		let b_info = rig.points.hip,					// Rig Hip Info
			pose = rig.pose.bones[b_info.idx],		// Animated Pose Bone
			bind = rig.tpose.bones[b_info.idx];	// TPose Bone

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Lets create the Quaternion Inverse Direction based on the
		// TBone's World Space rotation. We don't really know the orientation 
		// of the bone's starting rotation and our targets will have their own
		// orientation, so by doing this we can easily say no matter what the
		// default direction of the hip, we want to say all hips bones point 
		// at the FORWARD axis and the tail of the bone points UP.
		let q_inv = Quat.invert(bind.world.rotation),				// This part can be optimized out and Saved into the Rig Hip's Data.
			alt_fwd = Vec3.transform_quat(Vec3.FORWARD, q_inv),
			alt_up = Vec3.transform_quat(Vec3.UP, q_inv);

		let pose_fwd = Vec3.transform_quat(alt_fwd, pose.world.rotation),
			pose_up = Vec3.transform_quat(alt_up, pose.world.rotation);

		/* VISUAL DEBUG TPOSE AND ANIMATED POSE DIRECTIONS 
		let position = pose.world.position.clone().add( [0,0,0.1] );
		Debug.setLine( position, Vec3.add(position, Vec3.FORWARD), "white" );
		Debug.setLine( position, Vec3.add(position, Vec3.UP), "white" );
		Debug.setLine( position, Vec3.scale( pose_fwd, 0.8 ).add( position ), "orange" );
		Debug.setLine( position, Vec3.scale( pose_up, 0.8 ).add( position ), "orange" );
		*/

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// With our directions known between our TPose and Animated Pose, Next we
		// start to calculate the Swing and Twist Values to swing our TPose into
		// The animation direction

		let swing = Quat.unit_vecs(Vec3.FORWARD, pose_fwd)	// First we create a swing rotation from one dir to the other.
			.mul(bind.world.rotation);		// Then we apply it to the TBone Rotation, this will do a FWD Swing which will create
		// a new Up direction based on only swing.
		let swing_up = Vec3.transform_quat(Vec3.UP, swing),
			twist = Vec3.angle(swing_up, pose_up);		// Swing + Pose have same Fwd, Use Angle between both UPs for twist

		/* VISUAL DEBUG SWING AND ANIMATED POSE DIRECTIONS 
		let position 		= pose.world.position.clone().add( [0,0,0.1] );
		let swing_fwd	= Vec3.transform_quat( Vec3.FORWARD, swing );
		Debug.setLine( position, Vec3.scale( pose_fwd, 1.5 ).add( position ), "white" );	// Out Swing FWD Matches Animated Pose Forward
		Debug.setLine( position, Vec3.scale( swing_fwd, 1.3 ).add( position ), "orange" );
		Debug.setLine( position, Vec3.scale( pose_up, 1.5 ).add( position ), "white" );	// Now we see the TPose Up Direction in its Swing Rotation
		Debug.setLine( position, Vec3.scale( swing_up, 1.5 ).add( position ), "orange" );	// Both UPs share the same forward, resulting in a "Twist" Difference.
		*/

		if (twist <= (0.01 * Math.PI / 180)) {
			twist = 0; // If Less the .01 Degree, dont bother twisting.
		} else {
			// The difference between Pose UP and Swing UP is what makes up our twist since they both
			// share the same forward access. The issue is that we do not know if that twist is in the Negative direction
			// or positive. So by computing the Swing Left Direction, we can use the Dot Product to determine
			// if swing UP is Over 90 Degrees, if so then its a positive twist else its negative.
			let swing_lft = Vec3.cross(swing_up, pose_fwd);
			// Debug.setLine( position, Vec3.scale( swing_lft, 1.5 ).add( position ), "orange" );
			if (Vec3.dot(swing_lft, pose_up) >= 0) twist = -twist;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Save all the info we need to our IK Pose.
		ik_pose.hip.bind_height = bind.world.position.y;	// The Bind Pose Height of the Hip, Helps with scaling.
		ik_pose.hip.movement.from_sub(pose.world.position, bind.world.position);	// How much movement did the hip do between Bind and Animated.
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
			ab_dir = Vec3.sub(boneB.world.position, boneA.world.position),	// Direction from First Bone to Final Bone ( IK Direction )
			ab_len = ab_dir.len();									// Distance from First Bone to Final Bone 

		/* VISUAL DEBUG CHAIN POINTS 
		Debug.setPoint( boneA.world.position, "green", 0.06, 6 );
		Debug.setPoint( boneB.world.position, "red", 0.06, 6 );
		Debug.setLine( boneA.world.position, boneB.world.position, "green", "red", true );
		*/

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Compute the final IK Information needed for the Limb
		ik_limb.len_scale = ab_len / chain.len;	// Normalize the distance base on the length of the Chain.
		ik_limb.dir.copy(ab_dir.norm());		// We also normalize the direction to the end effector.

		// We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
		let j_dir = Vec3.transform_quat(chain.alt_up, boneA.world.rotation);
		let lft_dir = Vec3.cross(j_dir, ab_dir);					// We need left to realign up
		ik_limb.joint_dir.from_cross(ab_dir, lft_dir).norm(); 	// Recalc Up, make it orthogonal to LEFT and FWD

		/* VISUAL DEBUG THE DIRECTIONS BEING COMPUTED 
		Debug.setLine( boneA.world.position, Vec3.scale( j_dir, 0.5 ).add( boneA.world.position ), "white" ); 				// The actual Direction the first bone is pointing too (UP)
		Debug.setLine( boneA.world.position, Vec3.scale( lft_dir, 0.5 ).add( boneA.world.position ), "orange" );			// the Cross of UP and FWD
		Debug.setLine( boneA.world.position, Vec3.scale( ab_dir, 0.5 ).add( boneA.world.position ), "orange" );			// Dir to End Effector
		Debug.setLine( boneA.world.position, Vec3.scale( ik_limb.joint_dir, 0.5 ).add( boneA.world.position ), "orange" );	// Recalc UP to make it orthogonal
		*/
	}

	static look_twist(rig, b_info, ik, look_dir, twist_dir) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let pose = rig.pose.bones[b_info.idx],	// Animated Pose Bone
			bind = rig.tpose.bones[b_info.idx];	// TPose Bone

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First compute the Quaternion Invert Directions based on the Defined
		// Directions that was passed into the function. Most often, your look
		// direction is FORWARD and the Direction used to determine twist is UP.
		// But there are times we need the directions to be different depending
		// on how we view the bone in certain situations.
		let q_inv = Quat.invert(bind.world.rotation),
			alt_look_dir = Vec3.transform_quat(look_dir, q_inv),
			alt_twist_dir = Vec3.transform_quat(twist_dir, q_inv);

		let pose_look_dir = Vec3.transform_quat(alt_look_dir, pose.world.rotation),
			pose_twist_dir = Vec3.transform_quat(alt_twist_dir, pose.world.rotation);

		/* VISUAL DEBUG TPOSE AND ANIMATED POSE DIRECTIONS 
		let position = pose.world.position.clone().add( [0,0,0.0] );
		Debug.setLine( position, Vec3.add(position, look_dir), "white" );
		Debug.setLine( position, Vec3.add(position, twist_dir), "white" );
		Debug.setLine( position, Vec3.scale( pose_look_dir, 0.8 ).add( position ), "orange" );
		Debug.setLine( position, Vec3.scale( pose_twist_dir, 0.8 ).add( position ), "orange" );
		*/

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		ik.look_dir.copy(pose_look_dir);
		ik.twist_dir.copy(pose_twist_dir);
	}

	static spine(rig, chain, ik_pose, look_dir, twist_dir) {
		let idx_ary = [chain.first(), chain.last()], // First and Last Bone of the Chain.
			q_inv = new Quat(),
			v_look_dir = new Vec3(),
			v_twist_dir = new Vec3(),
			j = 0,
			pose, bind;

		for (let i of idx_ary) {
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// First get reference to the Bones
			bind = rig.tpose.bones[i];
			pose = rig.pose.bones[i];

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Create Quat Inverse Direction
			q_inv.from_invert(bind.world.rotation);
			v_look_dir.from_quat(q_inv, look_dir);
			v_twist_dir.from_quat(q_inv, twist_dir);

			// Transform the Inv Dir by the Animated Pose to get their direction
			// Reusing Variables to save on memory / initialization
			v_look_dir.from_quat(pose.world.rotation, v_look_dir);
			v_twist_dir.from_quat(pose.world.rotation, v_twist_dir);

			/* DEBUG 
			let position = pose.world.position;
			Debug.setPoint( position, "orange", 0.03, 6 );
			Debug.setLine( position, Vec3.scale( v_look_dir, 0.12 ).add(position), "yellow" );
			Debug.setLine( position, Vec3.scale( v_twist_dir, 0.12 ).add(position), "yellow" );
			*/

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Save IK
			ik_pose.spine[j].look_dir.copy(v_look_dir);
			ik_pose.spine[j].twist_dir.copy(v_twist_dir);
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

		this.look_twist(rig, rig.points.foot_l, ik.foot_l, Vec3.FORWARD, Vec3.UP);
		this.look_twist(rig, rig.points.foot_r, ik.foot_r, Vec3.FORWARD, Vec3.UP);

		this.spine(rig, rig.chains.spine, ik.spine);

		this.look_twist(rig, rig.points.head, ik.head, Vec3.FORWARD, Vec3.UP);
	}

	static hip(rig, ik) {
		let ws = rig.pose.bones[rig.points.hip.idx].world;
		Debug
			.setPoint(ws.position, CLR.orange, 6, 6)
			.setLine(ws.position, Vec3.scale(ik.hip.dir, 0.20).add(ws.position), CLR.cyan, null, true);
	}
	//static pnt( p, hex=0xff0000, shape=null, size=null ){ this.p.add( p, hex, shape, size ); return this; }

	static limb(pose, chain, ik) {
		let len = chain.len * ik.len_scale,
			posA = pose.bones[chain.first()].world.position,		// Starting Point in Limb
			posB = Vec3.scale(ik.dir, len).add(posA),		// Direction + Length to End Effector
			posC = Vec3.scale(ik.joint_dir, 0.2).add(posA);	// Direction of Joint

		Debug
			.setPoint(posA, CLR.yellow, 6, 4)
			.setPoint(posB, CLR.orange, 6, 4)
			.setLine(posA, posB, CLR.yellow, CLR.orange, true)
			.setLine(posA, posC, CLR.yellow, null, true);
	}

	// Was Originally called Foot.
	static look_twist(rig, b_info, ik, look_dir, twist_dir) {
		let position = rig.pose.bones[b_info.idx].world.position;
		Debug
			.setPoint(position, CLR.cyan, 1, 2.5)												   		// Foot Position
			.setLine(position, Vec3.scale(ik.look_dir, 0.2).add(position), CLR.cyan, null, true)		// IK.DIR
			.setLine(position, Vec3.scale(ik.twist_dir, 0.2).add(position), CLR.cyan, null, true);	// RESULT OF IK.TWIST
	}

	static spine(rig, chain, ik_ary) {
		let ws, ik, idx = [chain.first(), chain.last()];

		for (let i = 0; i < 2; i++) {
			ws = rig.pose.bones[idx[i]].world;
			ik = ik_ary[i];

			Debug
				.setPoint(ws.position, CLR.orange, 1, 2)
				.setLine(ws.position, Vec3.scale(ik.look_dir, 0.2).add(ws.position), CLR.yellow, null)
				.setLine(ws.position, Vec3.scale(ik.twist_dir, 0.2).add(ws.position), CLR.orange, null);
		}
	}
}

let CLR = {
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

function load_src(json, bin) {
	let entity = GltfUtil.createSkeletalArmature("src", json, bin);
	let anim = new Animation(Gltf.get_animation(json, bin), true);
	let pm = new PoseAnimator();
	let rig = addComponent(entity, IKRig) as IKRig;
	rig.init(null, true, IKRig.ARM_MIXAMO)
		.RecomputeFromTPose(); // Mesh requires a few bits to be recomputed because of Mixamo Scaling

	pm.root_idx = 0;	// Get Rid of Motion from The Hip
	pm.root_z = 1;	// Mixamo stuff is 90 degress off, so forward is Y :(

	gSrc = entity;

	return (deltaTime) => {
		pm.tick(deltaTime).update(anim, rig.pose);
		rig.apply_pose();
		//-----------------------------
		IKCompute.run(gSrc, gIKPose);
		IKVisualize.run(gSrc, gIKPose);

		const ikrig = getMutableComponent(gModelA, IKRig);
		gIKPose.apply_rig(ikrig);
		ikrig.apply_pose();
	}
}

function load_mesh_a(json, bin) {
	let entity = GltfUtil.createDebugArmature("target_a", json, bin, new MeshPhongMaterial({ color: 0xff7f7f, shininess: 1 }));
	console.log("entity", entity);
	let tpose = GltfUtil.getPose(entity, json, "tpose", true);
	console.log("tpose");
	console.log(tpose);
	addComponent(entity, IKRig);
	let rig = getMutableComponent(entity, IKRig);
	rig.init(tpose, false);
	console.log("rig");
	console.log(rig);

	tpose.apply();

	rig.points.head.idx = rig.points.neck.idx; // Lil hack cause Head Isn't Skinned Well.
	getMutableComponent(entity, Obj).set_pos(1.0, 0, 0);

	gModelA = entity;
}

// This is a functional React component
const Page = () => {



	useEffect(() => {

		(async function () {
			registerSystem(TimerSystem);
			registerSystem(ArmatureSystem);
			init_3js();
			Debug = await debug.init();


			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Download Resources
			let dl = await XhrQueue.url("ikrig/")
				.grp("src", "anim/Walking.gltf", "json", "anim/Walking.bin", "bin")
				.grp("ma", "models/vegeta.gltf", "json", "models/vegeta.bin", "bin")
				.then() as any;

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Load Resources
			console.log("Loading src");
			console.log(dl.src);

			gAnimate = load_src(dl.src.json, dl.src.bin);
			console.log("gAnimate is ", gAnimate);
			load_mesh_a(dl.ma.json, dl.ma.bin);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Misc
			gIKPose = new IKPose();

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// gAnimate(0.2);
			// Create a simple timer
			setInterval(() => {
				// We're only executing fixed update systems, but there are other update types
				Engine.systems.forEach(system => system.execute(1 / 30))
			}, 1 / 30 * 1000);
			console.log("Everything is started")
		})();
		// #endregion ///////////////////////////////////////////

	}, [])

	// Create a simple timer
	setInterval(() => {
		// We're only executing fixed update systems, but there are other update types
		execute(.1, 0, SystemUpdateType.Fixed);
	}, 100);
	// Some JSX to keep the compiler from complaining
	return (      <NetworkDebug reinit={() => console.log("nope")} />);
};

export default Page;
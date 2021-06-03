import { LoadGLTF } from "@xrengine/engine/src/assets/functions/LoadGLTF";
import { Component } from "@xrengine/engine/src/ecs/classes/Component";
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { System } from "@xrengine/engine/src/ecs/classes/System";
import { execute } from "@xrengine/engine/src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, getMutableComponent, hasComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import { registerSystem } from "@xrengine/engine/src/ecs/functions/SystemFunctions";
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType";
import debug from "@xrengine/engine/src/ikrig/classes/Debug";
import Armature from "@xrengine/engine/src/ikrig/components/Armature";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import Obj from "@xrengine/engine/src/ikrig/components/Obj";
import { BACK, DOWN, FORWARD, LEFT, RIGHT, UP } from "@xrengine/engine/src/ikrig/math/Vector3Constants";
import ArmatureSystem from "@xrengine/engine/src/ikrig/systems/ArmatureSystem";
import React, { useEffect } from "react";
import { AmbientLight, AnimationClip, AnimationMixer, DirectionalLight, GridHelper, PerspectiveCamera, Quaternion, Scene, SkeletonHelper, Vector3, WebGLRenderer } from "three";
import { IKPose } from "./IKPose";

export var Debug;

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
var aToBDirection = new Vector3();
var boneAWorld = new Vector3();
var boneBWorld = new Vector3();
function computeHip(rig, ik_pose) {
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
		let quatInverse = bind.quaternion.invert(),				// This part can be optimized out and Saved into the Rig Hip's Data.
			alt_fwd = FORWARD.applyQuaternion(quatInverse),
			alt_up = UP.applyQuaternion( quatInverse);

		let pose_fwd = alt_fwd.applyQuaternion( pose.quaternion),
			pose_up = alt_up.applyQuaternion( pose.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// With our directions known between our TPose and Animated Pose, Next we
		// start to calculate the Swing and Twist Values to swing our TPose into
		// The animation direction

		let swing = new Quaternion().setFromUnitVectors(FORWARD, pose_fwd)	// First we create a swing rotation from one dir to the other.
			.multiply(bind.quaternion);		// Then we apply it to the TBone Rotation, this will do a FWD Swing which will create
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
		ik_pose.hip.bind_height = bind.position.y;	// The Bind Pose Height of the Hip, Helps with scaling.
		// TODO: Right subtract order?
		ik_pose.hip.movement = pose.position.sub(bind.position);	// How much movement did the hip do between Bind and Animated.
		ik_pose.hip.dir.copy(pose_fwd);	// Pose Forward is the direction we want the Hip to Point to.
		ik_pose.hip.twist = twist;	// How Much Twisting to Apply after pointing in the correct direction.
	}


	function computeLimb(pose, chain, ik_limb) {
		// Limb IK tends to be fairly easy to determine. What you need is the direction the end effector is in
		// relation to the beginning of the limb chain, like the Shoulder for an arm chain. After you have the
		// direction, you can use it to get the distance. Distance is important to create a scale value based on
		// the length of the chain. Since an arm or leg's length can vary between models, if you normalize the 
		// distance, it becomes easy to translate it to other models. The last bit of info is we need the direction
		// that the joint needs to point. In this example, we precompute the Quaternion Inverse Dir for each chain
		// based on the bind pose. We can transform that direction with the Animated rotation to give us where the
		// joint direction has moved to.


		// TODO: Our bones are getting further apart, so we need to figure out why

		let boneA = pose.bones.find((bone) => bone.name === chain.first().name),	// First Bone
			boneB = pose.bones[chain.end_idx];	// END Bone, which is not part of the chain (Hand,Foot)

			boneB.localToWorld(boneBWorld);
			boneA.localToWorld(boneAWorld);

			aToBDirection.subVectors(boneBWorld, boneAWorld);
			const aToBLength = aToBDirection.length();	

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Compute the final IK Information needed for the Limb
		ik_limb.lengthScale = aToBLength / chain.length;	// Normalize the distance base on the length of the Chain.

		ik_limb.dir.copy(aToBDirection.normalize());		// We also normalize the direction to the end effector.

		// We use the first bone of the chain plus the Pre computed ALT UP to easily get the direction of the joint
		let j_dir = chain.alt_up.applyQuaternion(boneA.quaternion);
		let lft_dir = j_dir.cross(aToBDirection);					// We need left to realign up
		ik_limb.jointDirection = aToBDirection.cross(lft_dir).normalize(); 	// Recalc Up, make it orthogonal to LEFT and FWD
	}

	function computeLookTwist(rig, boneInfo, ik, lookDirection, twistDirection) {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		let pose = rig.pose.bones[boneInfo.index],	// Animated Pose Bone
			bind = rig.tpose.bones[boneInfo.index];	// TPose Bone

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// First compute the Quaternion Invert Directions based on the Defined
		// Directions that was passed into the function. Most often, your look
		// direction is FORWARD and the Direction used to determine twist is UP.
		// But there are times we need the directions to be different depending
		// on how we view the bone in certain situations.
		let quatInverse = bind.quaternion.invert(),
			altLookDirection = lookDirection.applyQuaternion( quatInverse),
			altTwistDirection = twistDirection.applyQuaternion( quatInverse);

		let pose_look_dir = altLookDirection.applyQuaternion( pose.quaternion),
			pose_twist_dir = altTwistDirection.applyQuaternion( pose.quaternion);

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		ik.lookDirection.copy(pose_look_dir);
		ik.twistDirection.copy(pose_twist_dir);
	}

	function computeSpine(rig, chain, ik_pose, lookDirection, twistDirection) {
		let idx_ary = [chain.first(), chain.last()], // First and Last Bone of the Chain.
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
			quatInverse = bind.getWorldQuaternion(quatInverse).invert();
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

	function visualizeHip(rig, ik) {

		rig.pose.bones[rig.points.hip.index].getWorldPosition(boneAWorld);
		Debug
			.setPoint(boneAWorld, COLOR.orange, 6, 6)
			.setLine(boneAWorld, new Vector3().copy(ik.hip.dir).multiplyScalar(0.20).add(boneAWorld), COLOR.cyan, null, true);
	}

	function visualizeLimb(pose, chain, ik) {
		const poseBone = pose.bones.find(bone => bone.name === chain.first().name);
		poseBone.getWorldPosition(boneAWorld);
		let len = chain.length * ik.lengthScale,
			posA = boneAWorld,		// Starting Point in Limb
			posB = ik.dir.multiplyScalar(len).add(posA),		// Direction + Length to End Effector
			posC = ik.jointDirection.multiplyScalar(0.2).add(posA);	// Direction of Joint

		Debug
			.setPoint(posA, COLOR.yellow, 6, 4)
			.setPoint(posB, COLOR.orange, 6, 4)
			.setLine(posA, posB, COLOR.yellow, COLOR.orange, true)
			.setLine(posA, posC, COLOR.yellow, null, true);
	}

	function visualizeLookTwist(rig, boneInfo, ik) {
		let position = rig.pose.bones[boneInfo.index].position;
		Debug
			.setPoint(position, COLOR.cyan, 1, 2.5)												   		// Foot Position
			.setLine(position, ik.lookDirection.multiplyScalar(0.2).add(position), COLOR.cyan, null, true)		// IK.DIR
			.setLine(position, ik.twistDirection.multiplyScalar(0.2).add(position), COLOR.cyan, null, true);	// RESULT OF IK.TWIST
	}

	function visualizeSpine(rig, chain, ik_ary) {
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

class AnimationComponent extends Component<AnimationComponent>{
	mixer: AnimationMixer = null;
	animations: AnimationClip[] = [];
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
	const obj = getMutableComponent(entity, Obj);
	const armature = getMutableComponent(entity, Armature);
	const model = (await LoadGLTF(source));
	Engine.scene.add(model.scene)
	Engine.scene.add( new SkeletonHelper( model.scene ) );
	const skinnedMeshes = [];
	model.scene.traverse(node => {
			if(node.children){
				node.children.forEach(n =>{
				if(n.type === "SkinnedMesh"){
					skinnedMeshes.push(n);
				}
			})
		}
	})


	const sortedSkins = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length });
	
	obj.setReference(sortedSkins[0]);

	armature.skeleton =  obj.ref.skeleton.clone();
	armature.skeleton.bones = armature.skeleton.bones;


		const mixer = new AnimationMixer( obj.ref );
		const clips = model.animations;

		mixer.clipAction(clips[0]).play();
	addComponent(entity, AnimationComponent);
	const ac = getMutableComponent(entity, AnimationComponent);
	ac.mixer = mixer;
	ac.animations = clips;

	addComponent(entity, IKPose);

	addComponent(entity, IKRig);
	let rig = getMutableComponent(entity, IKRig);
		rig.armature = armature;
		rig.pose = rig.armature.createNewPose();
		rig.tpose = rig.armature.createNewPose(); // If Passing a TPose, it must have its world space computed.

		//-----------------------------------------
		// Apply Node's Starting Transform as an offset for poses.
		// This is only important when computing World Space Transforms when
		// dealing with specific skeletons, like Mixamo stuff.
		// Need to do this to render things correctly
			const l = getMutableComponent(entity, Obj).getTransform(); // Obj is a ThreeJS Component
			rig.pose.setOffset(l.quaternion, l.position, l.scale);
			rig.tpose.setOffset(l.quaternion, l.position, l.scale);

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

	rig.chains.leg_l.setAlt(DOWN, FORWARD, rig.tpose);
	rig.chains.leg_r.setAlt(DOWN, FORWARD, rig.tpose);
	rig.chains.arm_r.setAlt(RIGHT, BACK, rig.tpose);
	rig.chains.arm_l.setAlt(LEFT, BACK, rig.tpose);

	rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones);
	rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones);
	rig.chains.arm_l.computeLengthFromBones(rig.tpose.bones);
	rig.chains.arm_r.computeLengthFromBones(rig.tpose.bones);
}

class IKRigSystem extends System {
	execute (deltaTime) {
return;
		this.queryResults.animation.all?.forEach((entity) => {
			let ac = getMutableComponent(entity, AnimationComponent);
			ac.mixer.update(deltaTime);
		})


		// RUN
		this.queryResults.ikpose.all?.forEach((entity) => {
			let pose = getMutableComponent(entity, IKPose);
	
			let rig = getMutableComponent(entity, IKRig);
			Debug.reset();			// For this example, Lets reset visual debug for every compute.
			pose.applyRig(rig);
			rig.applyPose();


			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			computeHip(rig, pose);
	
			computeLimb(rig.pose, rig.chains.leg_l, pose.leg_l);
			computeLimb(rig.pose, rig.chains.leg_r, pose.leg_r);
	
			computeLookTwist(rig, rig.points.foot_l, pose.foot_l, FORWARD, UP); // Look = Fwd, Twist = Up
			computeLookTwist(rig, rig.points.foot_r, pose.foot_r, FORWARD, UP);
	
			computeSpine(rig, rig.chains.spine, pose, UP, FORWARD);
	
			computeLimb(rig.pose, rig.chains.arm_l, pose.arm_l);
			computeLimb(rig.pose, rig.chains.arm_r, pose.arm_r);
	
			computeLookTwist(rig, rig.points.head, pose.head, FORWARD, UP);


			visualizeHip(rig, pose);
	
			visualizeLimb(rig.pose, rig.chains.leg_l, pose.leg_l);
			visualizeLimb(rig.pose, rig.chains.leg_r, pose.leg_r);
			visualizeLimb(rig.pose, rig.chains.arm_l, pose.arm_l);
			visualizeLimb(rig.pose, rig.chains.arm_r, pose.arm_r);
	
			visualizeLookTwist(rig, rig.points.foot_l, pose.foot_l);
			visualizeLookTwist(rig, rig.points.foot_r, pose.foot_r);	
			visualizeSpine(rig, rig.chains.spine, pose.spine);
			visualizeLookTwist(rig, rig.points.head, pose.head);

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
	},
	ikpose: {
		components: [IKPose],
		listen: {
			added: true,
			removed: true,
			changed: true
		}
	},
	animation: {
		components: [AnimationComponent],
		listen: {
			added: true,
			removed: true,
			changed: true
		}
	}
}


async function loadMeshA(source) {
	const entity = createEntity();
	if(!hasComponent(entity, Armature)){
		addComponent(entity, Armature);
	}
	if(!hasComponent(entity, Obj)){
		addComponent(entity, Obj);
	}
	const obj = getMutableComponent(entity, Obj);
	const armature = getMutableComponent(entity, Armature);
	const model = (await LoadGLTF(source));
	model.scene.position.set(1,0,0);
	Engine.scene.add(model.scene)
	Engine.scene.add( new SkeletonHelper( model.scene ) );
	const skinnedMeshes = [];
	model.scene.traverse(node => {
			if(node.children){
				node.children.forEach(n =>{
				if(n.type === "SkinnedMesh"){
					skinnedMeshes.push(n);
				}
			})
		}
	})


	const sortedSkins = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length });
	
	obj.setReference(sortedSkins[0]);

	armature.skeleton =  obj.ref.skeleton.clone();
	armature.skeleton.bones = armature.skeleton.bones;

	addComponent(entity, IKPose);

	addComponent(entity, IKRig);
	let rig = getMutableComponent(entity, IKRig);
		rig.armature = armature;
		rig.pose = rig.armature.createNewPose();
		rig.tpose = rig.armature.createNewPose(); // If Passing a TPose, it must have its world space computed.

	//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// // Save pose local space transform
	// const tpose	= getMutableComponent(entity, Armature).createNewPose();
	// let b;

	// addComponent(entity, IKRig);
	// let rig = getMutableComponent(entity, IKRig);
	// rig.init(tpose, false);
	
	// for( let i=0; i < armature.skeleton.bones.length; i++ ){
	// 	b = armature.skeleton.bones[ i ];
	// 	tpose.setBone( i, b.quaternion, b.position, b.scale );
	// }

	// tpose.updateWorld();



	// tpose.apply();

	// rig.points.head.index = rig.points.neck.index; // Lil hack cause Head Isn't Skinned Well.
	// getMutableComponent(entity, Obj).setPosition(1.0, 0, 0);
}

var gIKPose;

// This is a functional React component
const Page = () => {
	useEffect(() => {
		(async function () {
			registerSystem(RenderSystem);
			registerSystem(IKRigSystem);
			registerSystem(ArmatureSystem);

			init_3js();
			Debug = debug.init();

			await loadSource("ikrig/anim/Walking.glb");
			await loadMeshA("ikrig/models/vegeta.glb");

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


			// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// // gAnimate(0.2);
			// // Create a simple timer
			setInterval(() => {
				// We're only executing fixed update systems, but there are other update types
				Engine.systems.forEach(system => system.execute(1 / 30));
			}, 1 / 30 * 1000);
		})();
	}, []);

	// Create a simple timer
	setInterval(() => {
		// We're only executing fixed update systems, but there are other update types
		execute(.1, 0, SystemUpdateType.Fixed);
	}, 100);
	// Some JSX to keep the compiler from complaining
	return (<div>HelloWorld</div>);
};

export default Page;
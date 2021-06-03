import { LoadGLTF } from "@xrengine/engine/src/assets/functions/LoadGLTF";
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { addComponent, createEntity, getMutableComponent, hasComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import { registerSystem } from "@xrengine/engine/src/ecs/functions/SystemFunctions";
import debug from "@xrengine/engine/src/ikrig/classes/Debug";
import Armature from "@xrengine/engine/src/ikrig/components/Armature";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import Obj from "@xrengine/engine/src/ikrig/components/Obj";
import { BACK, DOWN, FORWARD, LEFT, RIGHT } from "@xrengine/engine/src/ikrig/math/Vector3Constants";
import ArmatureSystem from "@xrengine/engine/src/ikrig/systems/ArmatureSystem";
import React, { useEffect } from "react";
import { AnimationMixer, SkeletonHelper, Vector3 } from "three";
import { AnimationComponent } from "./AnimationComponent";
import { IKPose } from "./IKPose";
import { IKRigSystem } from "./IKRigSystem";
import { initThree } from "./initThree";
import { RenderSystem } from "./RenderSystem";

export var Debug;

// This is a functional React component
const Page = () => {
	useEffect(() => {
		(async function () {
			// Register our systems to do stuff
			registerSystem(IKRigSystem);
			registerSystem(ArmatureSystem);
			registerSystem(RenderSystem);

			await initThree(); // Set up the three.js scene with grid, light, etc

			Debug = debug.init(); // Initialize the Debug for IK

			// Test point so we know debug is working (currently not working)
			Debug.setPoint(new Vector3(), "orange", 0.05, 6);

			// LOAD SOURCE
			let model = (await LoadGLTF("ikrig/anim/Walking.glb"));

			// Set up entity
			let entity = createEntity();
			addComponent(entity, Armature);
			addComponent(entity, Obj);
			addComponent(entity, AnimationComponent);
			addComponent(entity, IKPose);
			addComponent(entity, IKRig);
			// Set up skinned meshes
			let skinnedMeshes = [];
			Engine.scene.add(model.scene)
			Engine.scene.add(new SkeletonHelper(model.scene));
			model.scene.traverse(node => {
				if (node.children) 
					node.children.forEach(n => {
						if (n.type === "SkinnedMesh")
							skinnedMeshes.push(n);
					})
			})

			// Set up the Object3D
			let obj = getMutableComponent(entity, Obj);
			let skinnedMesh = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length })[0];
			obj.setReference(skinnedMesh);

			// Set up animations
			const mixer = new AnimationMixer(obj.ref);
			const clips = model.animations;
			mixer.clipAction(clips[0]).play();

			// Add animation component for updating mixer later
			let ac = getMutableComponent(entity, AnimationComponent);
			ac.mixer = mixer;
			ac.animations = clips;

			// Set up armature
			let armature = getMutableComponent(entity, Armature);
			armature.skeleton = obj.ref.skeleton;
			armature.skeleton.bones = armature.skeleton.bones;


			// TODO: Do both models ref same armature?
			// Do both ref same tpose? Or do we make tpose for vegeta?

			// Set up poses
			let rig = getMutableComponent(entity, IKRig);
			rig.pose = armature.createNewPose();
			rig.tpose = armature.createNewPose(); // If Passing a TPose, it must have its world space computed.

			//-----------------------------------------
			// Apply Node's Starting Transform as an offset for poses.
			// This is only important when computing World Space Transforms when
			// dealing with specific skeletons, like Mixamo stuff.
			// Need to do this to render things correctly
			const l = getMutableComponent(entity, Obj).getTransform(); // Obj is a ThreeJS Component
			console.log("l is", l);

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



			// LOAD MESH A
			model = (await LoadGLTF("ikrig/models/vegeta.glb"));
			model.scene.position.set(1, 0, 0);
			Engine.scene.add(model.scene)
			Engine.scene.add(new SkeletonHelper(model.scene));
			skinnedMeshes = [];
			model.scene.traverse(node => {
				if (node.children) {
					node.children.forEach(n => {
						if (n.type === "SkinnedMesh") {
							skinnedMeshes.push(n);
						}
					})
				}
			})


			// Create entity
			entity = createEntity();
			addComponent(entity, Armature);
			addComponent(entity, Obj);
			addComponent(entity, IKPose);
			addComponent(entity, IKRig);

			// Set the skinned mesh reference
			obj = getMutableComponent(entity, Obj);
			skinnedMesh = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length })[0];
			obj.setReference(skinnedMesh);

			armature = getMutableComponent(entity, Armature);
			armature.skeleton = obj.ref.skeleton.clone(); // need to clone?

			addComponent(entity, IKPose);
			addComponent(entity, IKRig);
			rig = getMutableComponent(entity, IKRig);
			rig.pose = armature.createNewPose();

			//

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// // Save pose local space transform
			// let b;

			// for( let i=0; i < armature.skeleton.bones.length; i++ ){
			// 	b = armature.skeleton.bones[ i ];
			// 	tpose.setBone( i, b.quaternion, b.position, b.scale );
			// }

			// tpose.updateWorld();



			// tpose.apply();

			// rig.points.head.index = rig.points.neck.index; // Lil hack cause Head Isn't Skinned Well.


			setInterval(() => {
				// We're only executing fixed update systems, but there are other update types
				Engine.systems.forEach(system => system.execute(1 / 30));
			}, 1 / 30 * 1000);
		})();
	}, []);
	// Some JSX to keep the compiler from complaining
	return <></>;
};

export default Page;


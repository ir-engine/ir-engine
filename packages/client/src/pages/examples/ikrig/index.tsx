import { LoadGLTF } from "@xrengine/engine/src/assets/functions/LoadGLTF";
import { Component } from "@xrengine/engine/src/ecs/classes/Component";
import { Engine } from "@xrengine/engine/src/ecs/classes/Engine";
import { System } from "@xrengine/engine/src/ecs/classes/System";
import { addComponent, createEntity, getMutableComponent } from "@xrengine/engine/src/ecs/functions/EntityFunctions";
import { registerSystem } from "@xrengine/engine/src/ecs/functions/SystemFunctions";
import { SystemUpdateType } from "@xrengine/engine/src/ecs/functions/SystemUpdateType";
import Pose from "@xrengine/engine/src/ikrig/classes/Pose";
import { IKPose } from "@xrengine/engine/src/ikrig/components/IKPose";
import IKRig from "@xrengine/engine/src/ikrig/components/IKRig";
import Obj from "@xrengine/engine/src/ikrig/components/Obj";
import { initDebug, setupIKRig } from "@xrengine/engine/src/ikrig/functions/IKFunctions";
import { IKRigSystem } from "@xrengine/engine/src/ikrig/systems/IKRigSystem";
import React, { useEffect } from "react";
import { AmbientLight, AnimationClip, AnimationMixer, DirectionalLight, GridHelper, PerspectiveCamera, Scene, SkeletonHelper, WebGLRenderer } from "three";
import Debug from "../../../components/Debug";

class AnimationComponent extends Component<AnimationComponent> {
	mixer: AnimationMixer = null;
	animations: AnimationClip[] = [];
}
class AnimationSystem extends System {
	updateType = SystemUpdateType.Fixed;

	/**
	 * Execute the camera system for different events of queries.\
	 * Called each frame by default.
	 *
	 * @param delta time since last frame.
	 */
	execute(delta: number): void {
		this.queryResults.animation.all?.forEach((entity) => {
			let ac = getMutableComponent(entity, AnimationComponent);
			ac.mixer.update(delta);
		})
	}
}

AnimationSystem.queries = {
	animation: {
		components: [AnimationComponent],
		listen: {
			added: true,
			removed: true,
			changed: true
		}
	}
}

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

// This is a functional React component
const Page = () => {
	useEffect(() => {
		(async function () {
			// Register our systems to do stuff
			registerSystem(IKRigSystem);
			registerSystem(RenderSystem);

			await initThree(); // Set up the three.js scene with grid, light, etc

			initDebug();

			////////////////////////////////////////////////////////////////////////////

			// LOAD SOURCE
			let model = (await LoadGLTF("ikrig/anim/TPose.glb"));
			console.log("Model is", model);
			// Set up skinned meshes
			let skinnedMeshes = [];
			Engine.scene.add(model.scene)
			Engine.scene.add(new SkeletonHelper(model.scene));
			model.scene.traverse(node => {
				if (node.children)
					node.children.forEach(n => {
						if (n.type === "SkinnedMesh")
							skinnedMeshes.push(n);
							n.visible = false;
					})
			})
			let skinnedMesh = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length })[0];

			// Set up entity
			let entity = createEntity();
			addComponent(entity, AnimationComponent);
			addComponent(entity, Obj);
			addComponent(entity, IKPose);
			addComponent(entity, IKRig);

			// Set up the Object3D
			let obj = getMutableComponent(entity, Obj);
			obj.setReference(skinnedMesh);

			// Set up animations
			let ac = getMutableComponent(entity, AnimationComponent);
			const mixer = new AnimationMixer(obj.ref);
			const clips = model.animations;
			ac.mixer = mixer;
			ac.animations = clips;
			ac.mixer.clipAction(clips[0]).play();

			// Set up poses
			let rig = getMutableComponent(entity, IKRig);
			rig.pose = new Pose(entity);
			rig.tpose = new Pose(entity); // If Passing a TPose, it must have its world space computed.

			//-----------------------------------------
			// Apply Node's Starting Transform as an offset for poses.
			// This is only important when computing World Space Transforms when
			// dealing with specific skeletons, like Mixamo stuff.
			// Need to do this to render things correctly
			// TODO: Verify the numbers of this vs the original
			let objRoot = getMutableComponent(entity, Obj).ref; // Obj is a ThreeJS Component
			rig.pose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale);
			rig.tpose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale);

			setupIKRig(rig);

			////////////////////////////////////////////////////////////////////////////

			// // LOAD MESH A
			// model = (await LoadGLTF("ikrig/models/vegeta.glb"));
			// model.scene.position.set(1, 0, 0);
			// Engine.scene.add(model.scene)
			// Engine.scene.add(new SkeletonHelper(model.scene));
			// skinnedMeshes = [];
			// model.scene.traverse(node => {
			// 	if (node.children) {
			// 		node.children.forEach(n => {
			// 			if (n.type === "SkinnedMesh") {
			// 				skinnedMeshes.push(n);
			// 			}
			// 		})
			// 	}
			// })
			// skinnedMesh = skinnedMeshes.sort((a, b) => { return a.skeleton.bones.length - b.skeleton.bones.length })[0];

			// // Create entity
			// entity = createEntity();
			// addComponent(entity, Obj);
			// addComponent(entity, IKPose);
			// addComponent(entity, IKRig);

			// // Set the skinned mesh reference
			// obj = getMutableComponent(entity, Obj);
			// obj.setReference(skinnedMesh);

			// rig = getMutableComponent(entity, IKRig);
			// rig.pose = new Pose(entity);
			// rig.tpose = new Pose(entity); // If Passing a TPose, it must have its world space computed.

			// rig.pose.setOffset(obj.ref.quaternion, obj.ref.position, obj.ref.scale);
			// rig.tpose.setOffset(obj.ref.quaternion, obj.ref.position, obj.ref.scale);
			// setupIKRig(rig);

			// // // Save pose local space transform

			// for (let index = 0; index < obj.ref.skeleton.bones.length; index++) {
			// 	let bone = obj.ref.skeleton.bones[index];
			// 	rig.tpose.setBone(index, bone.quaternion, bone.position, bone.scale);
			// }

			// rig.tpose.apply();

			// // // TODO: Fix me
			// rig.points.head.index = rig.points.neck.index; // Lil hack cause Head Isn't Skinned Well.

			////////////////////////////////////////////////////////////////////////////


			Engine.systems.forEach(system => system.execute(1 / 30));

			// setInterval(() => {
			// 	// We're only executing fixed update systems, but there are other update types
			// 	Engine.systems.forEach(system => system.execute(1 / 30));
			// }, 1 / 30 * 1000);
		})();
	}, []);
	// Some JSX to keep the compiler from complaining
	return <Debug></Debug>;
};

export default Page;

async function initThree() {
	// Set up rendering and basic scene for demo
	const canvas = document.createElement("canvas");
	document.body.appendChild(canvas); // adds the canvas to the body element

	let w = window.innerWidth,
		h = window.innerHeight;

		let ctx = canvas.getContext("webgl2"); //, { alpha: false }
	Engine.renderer = new WebGLRenderer({ canvas: canvas, context: ctx, antialias: true });

	Engine.renderer.setClearColor(0x3a3a3a, 1);
	Engine.renderer.setSize(w, h);

	Engine.scene = new Scene();
	Engine.scene.add(new GridHelper(20, 20, 0x0c610c, 0x444444));

	Engine.camera = new PerspectiveCamera(45, w / h, 0.01, 1000);
	Engine.camera.position.set(2, 1, 5);
	Engine.camera.rotation.set(0, .3, 0);

	Engine.scene.add(Engine.camera);

	let light = new DirectionalLight(0xffffff, 1.0);
	light.position.set(4, 10, 1);
	Engine.scene.add(light);

	Engine.scene.add(new AmbientLight(0x404040));
}

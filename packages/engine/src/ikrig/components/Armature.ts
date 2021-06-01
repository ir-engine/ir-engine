import { Bone, Skeleton } from "three";
import { Component } from "../../ecs/classes/Component";
import { addComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import Pose from "../classes/Pose";
import Transform from "../math/Transform";
import Obj from "./Obj";
class Armature extends Component<Armature> {
	updated = true;
	skeleton: any = null;
	bones: any[] = [];
	name_map: {} = {};

	// Bones must be inserted in the order they will be used in a skinned shader.
	// Must keep the bone index and parent index correctly.
	addBone(name, length = 1, parentIndex = null) {
		const b = {
			ref: new Bone(),
			name: name,					// Bone Name
			index: this.bones.length,	// Bone Index
			parentIndex: parentIndex,				// Parent Bone Index
			length: length,					// Length of the Bones
			local: new Transform(),		// Local Space Bind Transform
			world: new Transform(),		// World Space Bind Transform
		};

		this.bones.push(b);					// Save Bone Data to Array
		this.name_map[name] = b.index;			// Save Name to Index Mapping

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Set Bone as a child of another
		if (parentIndex != null && this.bones[parentIndex]) {
			const p = this.bones[parentIndex];

			p.ref.add(b.ref);						// Make Bone a child 
			if (p.length) b.ref.position.y = p.length;	// Move bone to parent's tail location
		} else {
			b.parentIndex = null;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return b.ref;
	}

	// Compute the Fungi Local & World Transform Bind Pose
	// THREE will compute the inverse matrix bind pose on its own when bones 
	// are given to THREE.Skeleton
	computeBindPose() {
		let b, p;
		for (b of this.bones) {
			console.log("b.local is");
			console.log(b.local);
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Copy current local space transform of the bone
			b.local.quaternion.copy(b.ref.quaternion);
			b.local.position.copy(b.ref.position);
			b.local.scale.copy(b.ref.scale);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Compute its world space transform based on parent's ws transform.
			if (b.parentIndex != null) {
				p = this.bones[b.parentIndex];
				b.world.setFromAdd(p.world, b.local);
			} else b.world.copy(b.local);
		}
	}

	// All bones have been created, do final steps to get things working
	finalize() {
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Setup the Inverted Bind Pose
		this.computeBindPose();

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Build THREE.JS Skeleton
		let i;
		const boneArray = new Array(this.bones.length);
		for (i = 0; i < this.bones.length; i++) boneArray[i] = this.bones[i].ref;

		this.skeleton = new Skeleton(boneArray);


		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Bind Skeleton & Root Bone to SkinnedMesh if available.
		const entity = this.entity;


		
		if(!hasComponent(entity, Obj)){
			addComponent(entity, Obj);
			console.warn("entity does NOT have object reference...")

		}
		const obj =  getMutableComponent(entity, Obj);

		if (obj.ref && obj.ref.isSkinnedMesh) {
			obj.ref.add(this.bones[0].ref);	// Add Root Bone
			obj.ref.bind(this.skeleton);		// Bind Skeleton
		} else {
			console.warn("obj.ref is NOT a skinned mesh...")
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		return this;
	}
	// Get the Root Bone
	getRoot() { return this.bones[0].ref; }

	// Get Bone by Name
	getBone(b_name) { return this.bones[this.name_map[b_name]].ref; }

	// Create a pose that copies the Bind Pose
	createNewPose() { return new Pose(this); }

	// Copies modified Local Transforms of the Pose to the Bone Entities.
	loadPose(p) {
		let i,
			pb, // Pose Bone
			o;	// Bone Object

		for (i = 0; i < p.bones.length; i++) {
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Check if bone has been modified in the pose
			pb = p.bones[i];
			if (pb.chg_state == 0) continue;

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Copy changes to Bone Entity
			o = this.bones[i].ref;

			if (pb.chg_state & Pose.ROTATION) o.quaternion.fromArray(pb.local.quaternion);
			if (pb.chg_state & Pose.POSITION) o.position.fromArray(pb.local.position);
			if (pb.chg_state & Pose.SCALE) o.scale.fromArray(pb.local.scale);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Update States
			pb.chg_state = 0;
		}

		this.updated = true;
		return this;
	}
}

export default Armature;
import { Vector3 } from "three";
import { Component } from "../../ecs/classes/Component";
import Pose from "../classes/Pose";
import { FORWARD, UP } from "../math/Vector3Constants";
import Armature from "./Armature";

class IKRig extends Component<IKRig>{
	armature: Armature = null;
	tpose: Pose = null;
	pose: Pose = null;
	chains: any = {};
	points: any = {};
	leg_len_lmt = 0;
	static ARM_MIXAMO: any;

	applyPose() { this.pose.apply(); }

	addPoint(name, boneName) {
		this.points[name] = {
			index: this.armature.skeleton.bones.findIndex(bone => bone.name.includes(boneName))
		};
		return this;
	}

	addChain(name, nameArray, end_name=null) { //  axis="z",		
		let i, b;

		const chain = new Chain(); // axis
		for (i of nameArray) {
			const index = this.armature.skeleton.bones.findIndex(bone => bone.name.includes(i));
			console.log("Index is", index);
			const bone = this.armature.skeleton.bones[index];
			bone.index = index;


			bone.length = bone.children.length > 0 ? bone.localToWorld(bone.position).distanceTo(bone.localToWorld(bone.children[0].position)) : .3; 

			
			const o = { index, ref: bone, length: bone.length };

			chain.bones.push(o);
			chain.cnt++;
			chain.length += length;
		}

		// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if (end_name) {
			chain.end_idx = this.armature.skeleton.bones.indexOf(this.pose.getBone(end_name));
		}

		this.chains[name] = chain;
		return this;
	}	
}


// CONSTANTS
IKRig.ARM_MIXAMO = 1;


class Chain {
	end_idx: any;
	bones: any[];
	length: number;
	cnt: number;
	alt_fwd: any;
	alt_up: any;
	constructor() { // axis="z"
		this.bones = [];	// Index to a bone in an armature / pose
		this.length = 0;			// Chain Length
		this.cnt = 0;			// How many Bones in the chain
		//this.align_axis	= axis;			// Chain is aligned to which axis
		this.end_idx = null;			// Joint that Marks the true end of the chain

		this.alt_fwd = FORWARD.clone();
		this.alt_up = UP.clone();
	}

	// Get Skeleton Index of Bones
	first() { return this.bones[0].index; }
	last() { return this.bones[this.cnt - 1].index; }
	index(i) { return this.bones[i].index; }

	setAlt(fwd, up, tpose = null) {
		// TODO: REVIEW ME, could be broken!
		if (tpose) {
			const b = tpose.bones[0];
			const q = b.quaternion.invert();	// Invert World Space Rotation 
			this.alt_fwd = fwd.applyQuaternion(q).normalize();	// Use invert to get direction that will Recreate the real direction

			this.alt_up = up.applyQuaternion(q).normalize();
		} else {
			this.alt_fwd.copy(fwd);
			this.alt_up.copy(up);
		}
		return this;
	}

	computeLengthFromBones(bones) {
		const end = this.cnt - 1;
		let	sum = 0,
			b, i;
		const boneWorldPosition = new Vector3(),
			childWorldPosition = new Vector3();
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Loop Every Bone Except Last one
		for (i = 0; i < end; i++) {
			b = bones.find(bone => bone.name === this.bones[i].ref.name);

			this.bones[i].ref.getWorldPosition(boneWorldPosition);
			this.bones[i + 1].ref.getWorldPosition(childWorldPosition);

			b.length = boneWorldPosition.distanceTo( childWorldPosition );

			sum += b.length;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// If End Point exists, Can calculate the final bone's length
		if (this.end_idx != null) {
			bones[this.end_idx].getWorldPosition(boneWorldPosition);
			this.bones[i].ref.getWorldPosition(childWorldPosition);

			b.length = boneWorldPosition.distanceTo( childWorldPosition );
			sum += b.length;
		} else console.warn("Recompute Chain Len, End Index is missing");

		this.length = sum;
		return this;
	}
}

export default IKRig;
export { Chain };


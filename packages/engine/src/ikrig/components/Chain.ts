import { Vector3 } from "three";
import { FORWARD, UP } from "../math/Vector3Constants";


export class Chain {
	end_idx: any;
	bones: any[];
	length: number;
	cnt: number;
	alternateForward: any;
	alt_up: any;
	constructor() {
		this.bones = []; // Index to a bone in an armature / pose
		this.length = 0; // Chain Length
		this.cnt = 0; // How many Bones in the chain

		//this.align_axis	= axis;			// Chain is aligned to which axis
		this.end_idx = null; // Joint that Marks the true end of the chain

		this.alternateForward = FORWARD.clone();
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
			const qInverse = b.quaternion.invert(); // Invert World Space Rotation 
			this.alternateForward = FORWARD.clone().applyQuaternion(qInverse).normalize(); // Use invert to get direction that will Recreate the real direction
			this.alt_up = UP.clone().applyQuaternion(qInverse).normalize();
		} else {
			this.alternateForward.copy(fwd);
			this.alt_up.copy(up);
		}
		return this;
	}

	computeLengthFromBones(bones) {
		const end = this.cnt - 1;
		let sum = 0,
			b, i;
		const boneWorldPosition = new Vector3(),
			childWorldPosition = new Vector3();
		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Loop Every Bone Except Last one
		for (i = 0; i < end; i++) {
			b = bones.find(bone => bone.name === this.bones[i].ref.name);

			this.bones[i].ref.getWorldPosition(boneWorldPosition);
			this.bones[i + 1].ref.getWorldPosition(childWorldPosition);

			b.length = boneWorldPosition.distanceTo(childWorldPosition);

			sum += b.length;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// If End Point exists, Can calculate the final bone's length
		if (this.end_idx != null) {
			bones[this.end_idx].getWorldPosition(boneWorldPosition);
			this.bones[i].ref.getWorldPosition(childWorldPosition);

			b.length = boneWorldPosition.distanceTo(childWorldPosition);
			sum += b.length;
		} else
			console.warn("Recompute Chain Len, End Index is missing");

		this.length = sum;
		return this;
	}
}

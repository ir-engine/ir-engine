import { Vector3 } from "three";
import { FORWARD, UP } from "../constants/Vector3Constants";

const boneWorldPosition = new Vector3(),
childWorldPosition = new Vector3();
export class Chain {
	end_idx: any;
	chainBones: any[];
	length: number;
	cnt: number;
	forwardOffset: any;
	upOffset: any;
	constructor() {
		this.chainBones = []; // Index to a bone in an armature / pose
		this.length = 0; // Chain Length
		this.cnt = 0; // How many Bones in the chain

		//this.align_axis	= axis;			// Chain is aligned to which axis
		this.end_idx = null; // Joint that Marks the true end of the chain

		this.forwardOffset = FORWARD.clone();
		this.upOffset = UP.clone();
	}

	// Get Skeleton Index of Bones
	first() { return this.chainBones[0].index; }
	last() { return this.chainBones[this.cnt - 1].index; }
	index(i) { return this.chainBones[i].index; }

	setOffsets(fwd, up, tpose = null) {
		// TODO: REVIEW ME, could be broken!
		if (tpose) {
			const b = tpose.bones[0];
			const qInverse = b.quaternion.invert(); // Invert World Space Rotation 
			this.forwardOffset = FORWARD.clone().applyQuaternion(qInverse).normalize(); // Use invert to get direction that will Recreate the real direction
			this.upOffset = UP.clone().applyQuaternion(qInverse).normalize();
		} else {
			this.forwardOffset.copy(fwd);
			this.upOffset.copy(up);
		}
		return this;
	}

	computeLengthFromBones(bones) {
		console.log("computeLengthFromBones on", bones);
		const end = this.cnt - 1;
		let sum = 0,
			b, i;


		// Loop Every Bone Except Last one
		for (i = 0; i < end; i++) {
			b = bones[i];
			
			this.chainBones[i].ref.getWorldPosition(boneWorldPosition);
			this.chainBones[i + 1].ref.getWorldPosition(childWorldPosition);

			b.length = boneWorldPosition.distanceTo(childWorldPosition);

			sum += b.length;
		}

		// If End Point exists, Can calculate the final bone's length
		if (this.end_idx != null) {
			console.log("bones", bones);
			console.log("bones[this.end_idx]", bones[this.end_idx]);
			bones[this.end_idx].getWorldPosition(boneWorldPosition);
			this.chainBones[i].ref.getWorldPosition(childWorldPosition);
			b.length = boneWorldPosition.distanceTo(childWorldPosition);
			sum += b.length;
		} else
			console.warn("Recompute Chain Len, End Index is missing");

		this.length = sum;
		return this;
	}
}

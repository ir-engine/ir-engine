import { Component } from "../../ecs/classes/Component";
import { addComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import Pose from "../classes/Pose";
import { BACK, DOWN, FORWARD, LEFT, RIGHT, UP } from "../math/Vector3Constants";
import Armature from "./Armature";
import Obj from "./Obj";

class IKRig extends Component<IKRig>{
	armature: Armature = null;
	tpose: Pose = null;
	pose: Pose = null;
	chains: any = {};
	points: any = {};
	leg_len_lmt = 0;
	static ARM_MIXAMO: any;

	// #region METHODS
	apply_pose() { this.pose.apply(); }
	updateWorld() { this.pose.updateWorld(); }
	// #endregion ////////////////////////////////////////////////


	addPoint(name, b_name) {
		this.points[name] = {
			index: this.armature.name_map[b_name]
		};
		return this;
	}

	addChain(name, name_ary, end_name = null, ik_solver = null) { //  axis="z",
		let i, b;
		const ch = new Chain(); // axis
		for (i of name_ary) {
			b = this.pose.getBone(i);
			console.log("bone is", b)
			ch.addBone(b.index, b.length);
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if (end_name) {
			ch.end_idx = this.pose.getBone(end_name).index;
		}

		ch.ik_solver = ik_solver;

		this.chains[name] = ch;
		return this;
	}

	set_leg_lmt(length = null, offset = 0) {
		if (!length) {
			const hip = this.tpose.bones[this.points.hip.index];
			console.log("hip world is");
			console.log(hip.world);
			this.leg_len_lmt = hip.world.position.y + offset;
		} else {
			this.leg_len_lmt = length + offset;
		}
		return this;
	}
	// #endregion ////////////////////////////////////////////////

	// #region METHODS
	first_bone(ch_name) {
		const index = this.chains[ch_name].bones[0].index;
		return this.pose.bones[index];
	}

	get_chain_indices(ch_name) {
		const ch = this.chains[ch_name];
		if (!ch) return null;

		let b;
		const array = [];
		for (b of ch.bones) array.push(b.index);

		return array;
	}
	// #endregion ////////////////////////////////////////////////

	// #region SPECIAL METHODS
	RecomputeFromTPose() {
		// Recompute the Length of the bones for each chain. Most often this
		// is a result of scale being applied to the armature object that can
		// only be computed after the rig is setup
		this.chains.leg_l.computeLengthFromBones(this.tpose.bones);
		this.chains.leg_r.computeLengthFromBones(this.tpose.bones);
		this.chains.arm_l.computeLengthFromBones(this.tpose.bones);
		this.chains.arm_r.computeLengthFromBones(this.tpose.bones);

		return this;
	}
	// #endregion ////////////////////////////////////////////////

}


// CONSTANTS
IKRig.ARM_MIXAMO = 1;


class Chain {
	end_idx: any;
	ik_solver: any;
	bones: any[];
	length: number;
	magnitudeSquared: number;
	cnt: number;
	alt_fwd: any;
	alt_up: any;
	constructor() { // axis="z"
		this.bones = [];	// Index to a bone in an armature / pose
		this.length = 0;			// Chain Length
		this.magnitudeSquared = 0;			// Chain Length Squared, Cached for Checks without SQRT
		this.cnt = 0;			// How many Bones in the chain
		//this.align_axis	= axis;			// Chain is aligned to which axis
		this.end_idx = null;			// Joint that Marks the true end of the chain

		this.alt_fwd = FORWARD.clone();
		this.alt_up = UP.clone();

		this.ik_solver = null;
	}

	// #region Getters / Setters
	addBone(index, length) {
		const o = { index, length };

		this.bones.push(o);
		this.cnt++;
		this.length += length;
		this.magnitudeSquared = this.length * this.length;
		return this;
	}

	// Get Skeleton Index of Bones
	first() { return this.bones[0].index; }
	last() { return this.bones[this.cnt - 1].index; }
	index(i) { return this.bones[i].index; }

	setAlt(fwd, up, tpose = null) {
		// TODO: REVIEW ME, could be broken!
		if (tpose) {
			console.log("tpose is", tpose.bones);
			console.log("this bones is", this.bones);
			const b = tpose.bones[0],
				q = b.world.quaternion.invert();	// Invert World Space Rotation 

			this.alt_fwd = fwd.applyQuaternion(q);	// Use invert to get direction that will Recreate the real direction
			this.alt_up = up.applyQuaternion(q);
		} else {
			this.alt_fwd.copy(fwd);
			this.alt_up.copy(up);
		}
		return this;
	}
	// #endregion ////////////////////////////////////////////////

	// #region Special Methods
	computeLengthFromBones(bones) {
		const end = this.cnt - 1;
		let	sum = 0,
			b, i;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Loop Every Bone Except Last one
		for (i = 0; i < end; i++) {
			b = bones[this.bones[i].index];
			console.log("bones[this.bones[i + 1]", this.bones[i + 1]);

			b.length =
				bones[this.bones[i + 1].index].world.position.distanceTo(
				bones[this.bones[i].index].world.position
			);

			sum += b.length;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// If End Point exists, Can calculate the final bone's length
		if (this.end_idx != null) {
			b = bones[this.bones[i].index];
			b.length = 
				bones[this.end_idx].world.position.distanceTo(
				bones[this.bones[i].index].world.position
			);
			sum += b.length;
		} else console.warn("Recompute Chain Len, End Index is missing");

		this.length = sum;
		this.magnitudeSquared = sum * sum;
		return this;
	}
	// #endregion ////////////////////////////////////////////////
}

export default IKRig;
export { Chain };

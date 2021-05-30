import { Component } from "../../ecs/classes/Component";
import { addComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import Pose from "../classes/Pose";
import Quat from "../math/Quat";
import Vec3 from "../math/Vec3";
import Armature from "./Armature";
import Obj from "./Obj";

class Node extends Component<Node> {
	local: any;
}

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

	// #region MANAGE RIG DATA
	init(tpose = null, use_node_offset = false, arm_type = 1) {
		const entity = this.entity;
		if(!hasComponent(entity, Armature)){
			addComponent(entity, Armature);
		}
		if(!hasComponent(entity, Obj)){
			addComponent(entity, Obj);
		}
		if(!hasComponent(entity, Node)){
			addComponent(entity, Node);
		}
		this.armature = getMutableComponent(entity, Armature);
		this.pose = this.armature.new_pose();
		this.tpose = tpose || this.armature.new_pose(); // If Passing a TPose, it must have its world space computed.

		//-----------------------------------------
		// Apply Node's Starting Transform as an offset for poses.
		// This is only important when computing World Space Transforms when
		// dealing with specific skeletons, like Mixamo stuff.
		// Need to do this to render things correctly
		if (use_node_offset) {
			const l = getMutableComponent(entity, Obj).get_transform(); // Obj is a ThreeJS Component
			this.pose.setOffset(l.rotation, l.position, l.scale);
			if (!tpose) this.tpose.setOffset(l.rotation, l.position, l.scale);
		}

		//-----------------------------------------
		// If TPose Was Created by Rig, it does not have its world
		// Space Computed. Must do this after setting offset to work right.
		if (!tpose) this.tpose.updateWorld();

		//-----------------------------------------
		// Auto Setup the Points and Chains based on
		// Known Skeleton Structures.
		switch (arm_type) {
			case IKRig.ARM_MIXAMO: init_mixamo_rig(this.armature, this); break;
		}

		return this;
	}
	entity_id(entity_id: any) {
		throw new Error("Method not implemented.");
	}

	add_point(name, b_name) {
		this.points[name] = {
			idx: this.armature.name_map[b_name]
		};
		return this;
	}

	add_chain(name, name_ary, end_name = null, ik_solver = null) { //  axis="z",
		let i, b, ch = new Chain(); // axis
		for (i of name_ary) {
			b = this.pose.getBone(i);
			ch.add_bone(b.idx, b.len);
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if (end_name) {
			ch.end_idx = this.pose.getBone(end_name).idx;
		}

		ch.ik_solver = ik_solver;

		this.chains[name] = ch;
		return this;
	}

	set_leg_lmt(len = null, offset = 0) {
		if (!len) {
			const hip = this.tpose.bones[this.points.hip.idx];
			this.leg_len_lmt = hip.world.position.y + offset;
		} else {
			this.leg_len_lmt = len + offset;
		}
		return this;
	}
	// #endregion ////////////////////////////////////////////////

	// #region METHODS
	first_bone(ch_name) {
		const idx = this.chains[ch_name].bones[0].idx;
		return this.pose.bones[idx];
	}

	get_chain_indices(ch_name) {
		const ch = this.chains[ch_name];
		if (!ch) return null;

		let b, ary = [];
		for (b of ch.bones) ary.push(b.idx);

		return ary;
	}
	// #endregion ////////////////////////////////////////////////

	// #region SPECIAL METHODS
	RecomputeFromTPose() {
		// Recompute the Length of the bones for each chain. Most often this
		// is a result of scale being applied to the armature object that can
		// only be computed after the rig is setup
		this.chains.leg_l.compute_len_from_bones(this.tpose.bones);
		this.chains.leg_r.compute_len_from_bones(this.tpose.bones);
		this.chains.arm_l.compute_len_from_bones(this.tpose.bones);
		this.chains.arm_r.compute_len_from_bones(this.tpose.bones);

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
	len: number;
	len_sqr: number;
	cnt: number;
	alt_fwd: any;
	alt_up: any;
	constructor() { // axis="z"
		this.bones = [];	// Index to a bone in an armature / pose
		this.len = 0;			// Chain Length
		this.len_sqr = 0;			// Chain Length Squared, Cached for Checks without SQRT
		this.cnt = 0;			// How many Bones in the chain
		//this.align_axis	= axis;			// Chain is aligned to which axis
		this.end_idx = null;			// Joint that Marks the true end of the chain

		//this.alt_dir 	= Vec3.FORWARD.clone();

		this.alt_fwd = Vec3.FORWARD.clone();
		this.alt_up = Vec3.UP.clone();

		this.ik_solver = null;
	}

	// #region Getters / Setters
	add_bone(idx, len) {
		const o = { idx, len };

		this.bones.push(o);
		this.cnt++;
		this.len += len;
		this.len_sqr = this.len * this.len;
		return this;
	}

	// Get Skeleton Index of Bones
	first() { return this.bones[0].idx; }
	last() { return this.bones[this.cnt - 1].idx; }
	idx(i) { return this.bones[i].idx; }

	//set_alt_dir( dir, tpose=null, idx=0 ){
	//if( tpose ){
	//	let b = tpose.bones[ this.bones[ idx ].idx ],
	//		q = Quat.invert( b.world.rotation );	// Invert World Space Rotation 
	//	this.alt_dir.from_quat( q, dir );	// Use invert to get direction that will Recreate the real direction
	//}else this.alt_dir.copy( v );

	//	return this;
	//}

	set_alt(fwd, up, tpose = null) {
		if (tpose) {
			const b = tpose.bones[this.bones[0].idx],
				q = Quat.invert(b.world.rotation);	// Invert World Space Rotation 

			this.alt_fwd.from_quat(q, fwd);	// Use invert to get direction that will Recreate the real direction
			this.alt_up.from_quat(q, up);
		} else {
			this.alt_fwd.copy(fwd);
			this.alt_up.copy(up);
		}
		return this;
	}
	// #endregion ////////////////////////////////////////////////

	// #region Special Methods
	compute_len_from_bones(bones) {
		let end = this.cnt - 1,
			sum = 0,
			b, i;

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Loop Every Bone Except Last one
		for (i = 0; i < end; i++) {
			b = bones[this.bones[i].idx];
			b.len = Vec3.len(
				bones[this.bones[i + 1].idx].world.position,
				bones[this.bones[i].idx].world.position
			);

			sum += b.len;
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// If End Point exists, Can calculate the final bone's length
		if (this.end_idx != null) {
			b = bones[this.bones[i].idx];
			b.len = Vec3.len(
				bones[this.end_idx].world.position,
				bones[this.bones[i].idx].world.position
			);
			sum += b.len;
		} else console.warn("Recompute Chain Len, End Index is missing");

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		//sum = b.len = Vec3.len( 
		//	bones[ this.end_idx ].world.position,
		//	bones[ this.bones[0].idx ].world.position
		//);

		this.len = sum;
		this.len_sqr = sum * sum;
		return this;
	}
	// #endregion ////////////////////////////////////////////////
}


function init_mixamo_rig(arm, rig) {
	rig
		.add_point("hip", "Hips")
		.add_point("head", "Head")
		.add_point("neck", "Neck")
		.add_point("chest", "Spine2")
		.add_point("foot_l", "LeftFoot")
		.add_point("foot_r", "RightFoot")

		.add_chain("arm_r", ["RightArm", "RightForeArm"], "RightHand") //"x",
		.add_chain("arm_l", ["LeftArm", "LeftForeArm"], "LeftHand") //"x", 

		.add_chain("leg_r", ["RightUpLeg", "RightLeg"], "RightFoot") //"z", 
		.add_chain("leg_l", ["LeftUpLeg", "LeftLeg"], "LeftFoot")  //"z", 

		.add_chain("spine", ["Spine", "Spine1", "Spine2"]) //, "y"
		;

	// Set Direction of Joints on th Limbs
	//rig.chains.leg_l.set_alt_dir( Vec3.FORWARD, rig.tpose );
	//rig.chains.leg_r.set_alt_dir( Vec3.FORWARD, rig.tpose );
	//rig.chains.arm_r.set_alt_dir( Vec3.BACK, rig.tpose );
	//rig.chains.arm_l.set_alt_dir( Vec3.BACK, rig.tpose );

	rig.chains.leg_l.set_alt(Vec3.DOWN, Vec3.FORWARD, rig.tpose);
	rig.chains.leg_r.set_alt(Vec3.DOWN, Vec3.FORWARD, rig.tpose);
	rig.chains.arm_r.set_alt(Vec3.RIGHT, Vec3.BACK, rig.tpose);
	rig.chains.arm_l.set_alt(Vec3.LEFT, Vec3.BACK, rig.tpose);
}


export default IKRig;
export { Chain };

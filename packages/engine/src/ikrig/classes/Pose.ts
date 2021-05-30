import Quat from "../math/Quat";
import Transform from "../math/Transform";

class Pose {
	static ROTATION: any;
	static POSITION: any;
	static SCALE: any;
	armature: any;
	bones: any[];
	root_offset: any;
	constructor(armature) {
		this.armature = armature;								// Reference Back to Armature, Make Apply work Easily
		this.bones = new Array(armature.bones.length);	// Recreation of Bone Hierarchy
		this.root_offset = new Transform();					// Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Create Bone Transform Hierarchy to do transformations
		// without changing the actual armature.
		let b, pi;
		for (let i = 0; i < armature.bones.length; i++) {
			b = armature.bones[i];
			this.bones[i] = {
				chg_state: 0,						// If Local Has Been Updated
				idx: b.idx,					// Bone Index in Armature
				p_idx: b.p_idx,					// Parent Bone Index in Armature
				length: b.length,					// Length of Bone
				name: b.name,
				local: new Transform(b.local), // Local Transform, use Bind pose as default
				world: new Transform(b.world),	// Model Space Transform
			};
		}
	}

	setOffset(rotation = null, position = null, scale = null) { this.root_offset.set(rotation, position, scale); return this; }

	setBone(idx, rotation = null, position = null, scale = null) {
		const b = this.bones[idx];
		b.local.set(rotation, position, scale);

		// Set its Change State
		if (rotation) b.chg_state |= Pose.ROTATION;
		if (position) b.chg_state |= Pose.POSITION;
		if (scale) b.chg_state |= Pose.SCALE;
		return this;
	}

	setState(idx, rotation = false, position = false, scale = false) {
		const b = this.bones[idx];
		if (rotation) b.chg_state |= Pose.ROTATION;
		if (position) b.chg_state |= Pose.POSITION;
		if (scale) b.chg_state |= Pose.SCALE;
		return this;
	}

	getBone(bname) { return this.bones[this.armature.name_map[bname]]; }

	getLocalRotation(idx) { return this.bones[idx].local.rotation; }

	apply() { this.armature.loadPose(this); return this; }

	updateWorld() {
		for (const b of this.bones) {
			if (b.p_idx != null) b.world.from_add(this.bones[b.p_idx].world, b.local); // Parent.World + Child.Local
			else b.world.from_add(this.root_offset, b.local);
		}
		return this;
	}

	getParentWorld(b_idx, pt = null, ct = null, t_offset = null) {
		const cbone = this.bones[b_idx];
		pt = pt || new Transform();

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		// Child is a Root Bone, just reset since there is no parent.
		if (cbone.p_idx == null) {
			pt.clear();
		} else {
			// Parents Exist, loop till reaching the root
			let b = this.bones[cbone.p_idx];
			pt.copy(b.local);

			while (b.p_idx != null) {
				b = this.bones[b.p_idx];
				pt.add_rev(b.local);
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		pt.add_rev(this.root_offset);				// Add Starting Offset
		if (t_offset) pt.add_rev(t_offset);		// Add Additional Starting Offset

		if (ct) ct.from_add(pt, cbone.local);	// Requesting Child WS Info Too

		return pt;
	}

	getParentRotation(b_idx, q = null) {
		const cbone = this.bones[b_idx];
		q = q || new Quat();

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Child is a Root Bone, just reset since there is no parent.
		if (cbone.p_idx == null) q.reset();
		else {
			// Parents Exist, loop till reaching the root
			let b = this.bones[cbone.p_idx];
			q.copy(b.local.rotation);

			while (b.p_idx != null) {
				b = this.bones[b.p_idx];
				q.premultiply(b.local.rotation);
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		q.premultiply(this.root_offset.rotation); // Add Starting Offset
		return q;
	}
}

Pose.ROTATION = 1;
Pose.POSITION = 2;
Pose.SCALE = 4;

export default Pose;
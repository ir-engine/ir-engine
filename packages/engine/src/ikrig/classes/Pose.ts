import { Quaternion } from "three";
import { SkeletonUtils } from "../../character/SkeletonUtils";
import Transform from "../math/Transform";

class Pose {
	static ROTATION: any;
	static POSITION: any;
	static SCALE: any;
	armature: any;
	skeleton: Skeleton;
	bones: any[];
	root_offset: any;
	constructor(armature) {
		this.armature = armature;
		armature.bones.forEach(b => {

		})	
									// Reference Back to Armature, Make Apply work Easily
		this.skeleton = armature.skeleton.clone();	// Recreation of Bone Hierarchy
		this.bones = this.skeleton.bones;
		this.root_offset = new Transform();					// Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )

		console.log("Armature is")
		console.log(armature)

		console.log("Bones are")
		console.log(this.bones);
	}

	setOffset(quaternion = null, position = null, scale = null) { this.root_offset.set(quaternion, position, scale); return this; }

	setBone(index, quaternion = null, position = null, scale = null) {
		const b = this.bones[index];
		b.local.set(quaternion, position, scale);

		// Set its Change State
		if (quaternion) b.chg_state |= Pose.ROTATION;
		if (position) b.chg_state |= Pose.POSITION;
		if (scale) b.chg_state |= Pose.SCALE;
		return this;
	}

	setState(index, quaternion = false, position = false, scale = false) {
		const b = this.bones[index];
		if (quaternion) b.chg_state |= Pose.ROTATION;
		if (position) b.chg_state |= Pose.POSITION;
		if (scale) b.chg_state |= Pose.SCALE;
		return this;
	}

	getBone(bname) { 
		console.log("this.bones is", this.bones);
		console.log("bname is", bname);
		console.log("Bone index is", this.bones.findIndex((b) => { return b.name.includes(bname) }));
		const index = this.bones.findIndex((b) => { return b.name.includes(bname) });
		let bone = this.bones[index];
		console.log('getBone is is', bone);
		if (bone !== undefined) return bone;
		bone = this.bones.find(b => {
			if(b.name.includes(bname))
				return b;
		});
		return bone;
	}

	getLocalRotation(index) { return this.bones[index].local.quaternion; }

	apply() { this.armature.loadPose(this); return this; }

	updateWorld() {
		for (const b of this.bones) {
			if (b.parentIndex != null) b.world.setFromAdd(this.bones[b.parentIndex].world, b.local); // Parent.World + Child.Local
			else b.world.setFromAdd(this.root_offset, b.local);
		}
		return this;
	}

	getParentWorld(b_idx, t_offset = null) {

		// The IK Solver takes transforms as input, not rotations.
		// The first thing we need is the WS Transform of the start of the chain
		// plus the parent's WS Transform. When are are building a full body IK
		// We need to do things in a certain order to build things correctly.
		// So before we can do legs, we need the hip/root to be moved to where it needs to go
		// The issue is that when people walk, you are actually falling forward, you catch
		// yourself when your front foot touches the floor, in the process you lift yourself 
		// up a bit. During a whole walk, or run cycle, a person's hip is always moving up and down
		// Because of that, the distance from the Hip to the floor is constantly changing
		// which is important if we want to have the legs stretch correctly since each IK leg
		// length scale is based on the hip being at a certain height at the time.
		let parentTransform = new Transform(),
			childTransform = new Transform();


		const cbone = this.bones[b_idx];

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		// Child is a Root Bone, just reset since there is no parent.
		if (cbone.parentIndex == null) {
			parentTransform.clear();
		} else {
			// Parents Exist, loop till reaching the root
			let b = this.bones[cbone.parentIndex];
			parentTransform.copy(b.ref);

			while (b.parentIndex != null) {
				b = this.bones[b.parentIndex];
				parentTransform.add_rev(b.ref);
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

		parentTransform.add_rev(this.root_offset);				// Add Starting Offset
		if (t_offset) parentTransform.add_rev(t_offset);		// Add Additional Starting Offset

		childTransform.setFromAdd(parentTransform, cbone.local);	// Requesting Child WS Info Too

		return {childTransform, parentTransform};
	}

	getParentRotation(boneIndex, q = null) {
		const childBone = this.bones[boneIndex];
		q = q || new Quaternion();

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		// Child is a Root Bone, just reset since there is no parent.
		if ((childBone.parent == null)) q.reset();
		else {
			// Parents Exist, loop till reaching the root
			let b = childBone.parent;
			q.copy(b.local.quaternion);

			while (b.parentIndex != null) {
				b = this.bones[b.parentIndex];
				q.premultiply(b.local.quaternion);
			}
		}

		//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		q.premultiply(this.root_offset.quaternion); // Add Starting Offset
		return q;
	}
}

Pose.ROTATION = 1;
Pose.POSITION = 2;
Pose.SCALE = 4;

export default Pose;
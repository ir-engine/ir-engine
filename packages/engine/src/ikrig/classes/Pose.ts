import { Object3D, Quaternion, Skeleton, Vector3 } from "three";
import { SkeletonUtils } from "../../character/SkeletonUtils";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import Obj from "../components/Obj";

class Pose {
	static ROTATION: any = 1;;
	static POSITION: any = 2;;
	static SCALE: any = 4;;

	entity: any;
	skeleton: Skeleton;
	bones: any[];
	rootOffset = {
		quaternion: new Quaternion(),
		position: new Vector3(0, 0, 0),
		scale: new Vector3(1, 1, 1)
	};
	helper: any;


	constructor(entity) {
		this.entity = entity;
		const armature = getMutableComponent(entity, Obj).ref;
		this.skeleton = SkeletonUtils.clone(armature.parent).children.find(skin => skin.skeleton != null).skeleton;	// Recreation of Bone Hierarchy
		console.log("this.skeleton", this.skeleton)
		
		this.bones = this.skeleton.bones;
		this.rootOffset = new Object3D();					// Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )
		for (let i = 0; i < this.skeleton.bones.length; i++) {
			this.skeleton.bones['index'] = i;
		}
	}

	setOffset(quaternion: Quaternion, position: Vector3, scale: Vector3) {
		this.rootOffset.quaternion.copy(quaternion);
		this.rootOffset.position.copy(position);
		this.rootOffset.scale.copy(scale);
		return this;
	}

	setBone(index: number, quaternion?: Quaternion, position?: Vector3, scale?: Vector3) {
		if(quaternion) this.bones[index].quaternion.copy(quaternion);
		if(position) this.bones[index].position.copy(position);
		if(scale) this.bones[index].scale.copy(scale);
		return this;
	}

	getBone(bname) {
		const index = this.bones.findIndex((b) => { return b.name.includes(bname) });
		let bone = this.bones[index];
		if (bone !== undefined) return bone;
		bone = this.bones.find(b => {
			if (b.name.includes(bname))
				return b;
		});
		return bone;
	}

	apply() {
		// Copies modified LquatInverseocal Transforms of the Pose to the Bone Entities.
		const skeleton = getMutableComponent(this.entity, Obj).ref.skeleton;

		let pb, // Pose Bone
			o;	// Bone Object

		for (let i = 0; i < skeleton.bones.length; i++) {
			// Check if bone has been modified in the pose
			pb = skeleton.bones[i];

			// Copy changes to Bone Entity
			o = this.bones[i];

			o.quaternion.copy(pb.quaternion);
			o.position.copy(pb.position);
			o.scale.copy(pb.scale);
		}

		return this;
	}

	getParentWorld(boneIndex, t_offset = null) {
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
		console.log("incomingBone is", boneIndex)
		console.log("this.bones is", this.bones);
		let bone = this.bones[boneIndex];

		// Child is a Root Bone, just reset since there is no parent.
		if (!bone) {
			// TODO: Clear pos/rot/scale of parent
			parentTransform.clear();
		} else {
			while (bone.parent != null) {
				bone = bone.parent;
				console.log("Bone is", bone);
				this.addInReverseOrder(bone);
			}
		}

		this.addInReverseOrder(this.rootOffset);				// Add Starting Offset
		if (t_offset) this.addInReverseOrder(t_offset);		// Add Additional Starting Offset
		console.log('bone is ', bone)
		this.setChildFromParent(parentTransform, bone);	// Requesting Child WS Info Too

		return this;
	}

	// If these are temp vars okay, but these might need to move to the bones?? Do we need these if we have world poses on bones?
	parentQuaternion = new Quaternion()
	parentScale = new Vector3(1,1,1)
	parentPosition = new Vector3(0,0,0)

	childQuaternion = new Quaternion()
	childScale = new Vector3(1,1,1)
	childPosition = new Vector3(0,0,0)

	// Make sure this is properly named
	setChildFromParent(parent, child) {
		console.log("parent, child", parent, child)

		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// TODO: Make sure this matrix isn't flipped
		const v: Vector3 = parent.scale.multiply(child.position); // parent.scale * child.position;
		v.applyQuaternion(parent.quaternion); //Vec3.transformQuat( v, tp.quaternion, v );
		this.childPosition = parent.position.add(v); // Vec3.add( tp.position, v, this.position );

		// SCALE - parent.scale * child.scale
		// TODO: not flipped, right?
		this.childScale = parent.scale.multiply(child.scale);

		// ROTATION - parent.quaternion * child.quaternion
		this.childQuaternion = parent.quaternion.multiply(child.quaternion);

		return this;
	}

	// Computing Transforms in reverse, Child - > Parent
	addInReverseOrder(parent) {
		console.log("parent", parent);

		// POSITION - parent.position + ( parent.quaternion * ( parent.scale * child.position ) )
		// The only difference for this func, We use the IN.scale & IN.quaternion instead of THIS.scale * THIS.quaternion
		// Consider that this Object is the child and the input is the Parent.
		this.parentPosition.multiply(parent.scale).applyQuaternion(parent.quaternion).add(parent.position);
		this.parentScale.multiply(parent.scale);
		// ROTATION - parent.quaternion * child.quaternion
		this.parentQuaternion.premultiply(parent.quaternion); // Must Rotate from Parent->Child, need PMUL

		return this
	}

	getParentRoot(boneIndex, q = null) {
		const childBone = this.bones[boneIndex];
		q = q || new Quaternion();

		// Child is a Root Bone, just reset since there is no parent.
		if ((childBone.parent == null)) q.reset();
		else {
			// Parents Exist, loop till reaching the root
			let b = childBone.parent;
			q.copy(b.quaternion);

			while (b.parentIndex != null) {
				b = this.bones[b.parentIndex];
				q.premultiply(b.quaternion);
			}
		}

		q.premultiply(this.rootOffset.quaternion); // Add Starting Offset
		return q;
	}
}



export default Pose;
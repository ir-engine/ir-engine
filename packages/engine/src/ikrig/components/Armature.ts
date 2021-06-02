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

	// Compute the Fungi Local & World Transform Bind Pose
	// THREE will compute the inverse matrix bind pose on its own when bones 
	// are given to THREE.Skeleton
	computeBindPose() {
		let b: Bone, p: Bone;
		for (b of this.bones) {

			if(!b.local || !b.world){
				b.local = new Transform();
				b.world = new Transform();

			}


			console.log("b.local is");
			console.log((b as any).local);
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Copy current local space transform of the bone
			(b as any).local.quaternion.copy(b.quaternion);
			(b as any).local.position.copy(b.position);
			(b as any).local.scale.copy(b.scale);

			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			// Compute its world space transform based on parent's ws transform.
			if (b.parent != null && b.parent.type == "Bone") {
				p = b.parent as Bone;
				if(!p.local || !p.world){
					p.local = new Transform();
					p.world = new Transform();
	
				}
				console.log("parent is")
				console.log(p)
				console.log("b is")
				console.log(b);
				console.log(p.world);
				console.log(p.world);
				(b as any).world.setFromAdd(p.world, (b as any).local);
			} else (b as any).world.copy((b as any).local);
		}
	}


	// Get the Root Bone
	getRoot() { return this.bones[0]; }

	// Get Bone by Name
	getBone(b_name) { return this.bones[this.name_map[b_name]]; }

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
			o = this.bones[i];

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
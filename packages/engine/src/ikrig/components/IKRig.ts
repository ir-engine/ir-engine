import { Component } from "../../ecs/classes/Component";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import Pose from "../classes/Pose";
import Armature from "./Armature";
import { Chain } from "./Chain";

class IKRig extends Component<IKRig>{
	armature: Armature = null;
	tpose: Pose = null; // Base pose to calculate math from
	pose: Pose = null; // Working pose to apply math to and copy back to bones
	chains: any = {}; // IK Chains
	points: any = {}; // Individual IK points (hands, head, feet)

	addPoint(name, boneName) {
		const armature = getMutableComponent(this.entity, Armature);
		this.points[name] = {
			index: armature.skeleton.bones.findIndex(bone => bone.name.includes(boneName))
		};
		return this;
	}

	addChain(name, nameArray, end_name = null) { //  axis="z",		
		let i, b;
		const armature = getMutableComponent(this.entity, Armature);

		const chain = new Chain(); // axis
		for (i of nameArray) {
			const index = armature.skeleton.bones.findIndex(bone => bone.name.includes(i));
			const bone = armature.skeleton.bones[index];
			bone.index = index;


			bone.length = bone.children.length > 0 ? bone.localToWorld(bone.position).distanceTo(bone.localToWorld(bone.children[0].position)) : .3;


			const o = { index, ref: bone, length: bone.length };

			chain.bones.push(o);
			chain.cnt++;
			chain.length += length;
		}

		// //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if (end_name) {
			chain.end_idx = armature.skeleton.bones.indexOf(this.pose.getBone(end_name));
		}

		this.chains[name] = chain;
		return this;
	}
}

export default IKRig;
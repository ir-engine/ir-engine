import { Component } from "@xrengine/engine/src/ecs/classes/Component";
import IKTarget from "@xrengine/engine/src/ikrig/components/IKTarget";
import { Vector3 } from "three";
export class IKPose extends Component<IKPose> {
	target = new IKTarget(); // IK Solvers

	hip = {
		bind_height: 0,
		movement: new Vector3(),
		dir: new Vector3(),
		twist: 0,
	};

	foot_l = { lookDirection: new Vector3(), twistDirection: new Vector3() };
	foot_r = { lookDirection: new Vector3(), twistDirection: new Vector3() };

	// IK Data for limbs is first the Direction toward the End Effector,
	// The scaled length to the end effector, plus the direction that
	// the KNEE or ELBOW is pointing. For IK Targeting, Dir is FORWARD and
	// joint dir is UP
	leg_l = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };
	leg_r = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };
	arm_l = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };
	arm_r = { lengthScale: 0, dir: new Vector3(), jointDirection: new Vector3() };

	spine = [
		{ lookDirection: new Vector3(), twistDirection: new Vector3() },
		{ lookDirection: new Vector3(), twistDirection: new Vector3() },
	];

	head = { lookDirection: new Vector3(), twistDirection: new Vector3() };

	tempV = new Vector3();
}

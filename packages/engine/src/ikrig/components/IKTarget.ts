import { Quaternion, Vector3 } from "three";
import Axis from "../math/Axis";


class IKTarget{
	startPosition: Vector3 = new Vector3();
	endPosition: Vector3 = new Vector3();
	axis: Axis = new Axis();
	length = 0;

	fromPositionAndDirection(position: Vector3, dir: Vector3, up_dir: Vector3, lengthScale: number) {
		this.startPosition.copy(position);
		console.log("position, dir, up_dir, len_scl");
		console.log(position, dir, up_dir, lengthScale)
		this.endPosition = dir.multiplyScalar( lengthScale)	// Compute End Effector
			.add(position);
		const length = position.distanceTo(this.endPosition)

		this.axis.fromDirection(dir, up_dir); // Target Axis
		return this;
	}

	tempQ = new Quaternion();

	
}

export default IKTarget;
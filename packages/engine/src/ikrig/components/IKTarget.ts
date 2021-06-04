import { Quaternion, Vector3 } from "three";
import Axis from "../math/Axis";


class IKTarget{
	startPosition: Vector3 = new Vector3(); // Start of chain (world space position of shoulder for an arm chain)
	endPosition: Vector3 = new Vector3(); // Target position for chain to reach (end effector)
	axis: Axis = new Axis(); // Axis of rotation toward the end position
	length = 0;

	fromPositionAndDirection(position: Vector3, dir: Vector3, up_dir: Vector3, lengthScale: number) {
		this.startPosition.copy(position);
		console.log("position, dir, up_dir, len_scl");
		console.log(position, dir, up_dir, lengthScale)
		this.endPosition = dir.multiplyScalar( lengthScale)	// Compute End Effector
			.add(position);
		this.length = position.distanceTo(this.endPosition)

		this.axis.fromDirection(dir, up_dir); // Target Axis
		return this;
	}
}

export default IKTarget;
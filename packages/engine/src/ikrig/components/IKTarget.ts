import { Vector3 } from "three";
import Axis from "../classes/Axis";


class IKTarget{
	startPosition: Vector3 = new Vector3(); // Start of chain (world space position of shoulder for an arm chain)
	endPosition: Vector3 = new Vector3(); // Target position for chain to reach (end effector)
	axis: Axis = new Axis(); // Axis of rotation toward the end position
	length = 0;
}

export default IKTarget;
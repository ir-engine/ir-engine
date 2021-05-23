import { Object3D } from "three";
import { Component } from "../../ecs/classes/Component";

/**
 * 
 * @author Avaer Kazmer
 */
abstract class IKArm extends Component<IKArm> {
	target: any;
	upperArmLength: number;
	lowerArmLength: number;
	armLength: number;

	transform: any;
	upperArm: Object3D;
	lowerArm: Object3D;
	hand: Object3D;
	thumb0: Object3D;
	thumb1: Object3D;
	thumb2: Object3D;
	indexFinger1: Object3D;
	indexFinger2: Object3D;
	indexFinger3: Object3D;
	middleFinger1: Object3D;
	middleFinger2: Object3D;
	middleFinger3: Object3D;
	ringFinger1: Object3D;
	ringFinger2: Object3D;
	ringFinger3: Object3D;
	littleFinger1: Object3D;
	littleFinger2: Object3D;
	littleFinger3: Object3D;
}

export default IKArm;

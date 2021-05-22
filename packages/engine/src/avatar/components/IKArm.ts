import { Component } from "../../ecs/classes/Component";

/**
 * 
 * @author Avaer Kazmer
 */
abstract class Arm extends Component<Arm> {
	shoulder: any;
	target: any;
	upperArmLength: number;
	lowerArmLength: number;
	armLength: number;

	transform: any;
	upperArm: any;
	lowerArm: any;
	hand: any;
	thumb0: any;
	thumb1: any;
	thumb2: any;
	indexFinger1: any;
	indexFinger2: any;
	indexFinger3: any;
	middleFinger1: any;
	middleFinger2: any;
	middleFinger3: any;
	ringFinger1: any;
	ringFinger2: any;
	ringFinger3: any;
	littleFinger1: any;
	littleFinger2: any;
	littleFinger3: any;
}

export default Arm;

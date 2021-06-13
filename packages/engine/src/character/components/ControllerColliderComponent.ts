import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { Vector3 } from "three";
import type { Controller } from "three-physx";

/**
 * @author Shaw
 */
export class ControllerColliderComponent extends Component<ControllerColliderComponent>
{
	public options: any;
	public controller: Controller;
	public mass: number;
	public position: Vector3;
	public height: number;
	public contactOffset: number;
	public radius: number;
	public segments: number;
	public friction: number;
	public playerStuck: number;
}

ControllerColliderComponent._schema = {
	options: { type: Types.Ref, default: {} },
	mass: { type: Types.Number, default: 0 },
	controller: { type: Types.Ref, default: null },
	position: { type: Types.Vector3Type, default: new Vector3() },
	height: { type: Types.Number, default: 0.5 },
	contactOffset: { type: Types.Number, default: 0.01 },
	radius: { type: Types.Number, default: 0.3 },
	segments: { type: Types.Number, default: 8 },
	friction: { type: Types.Number, default: 0.3 },
	playerStuck: { type: Types.Number, default: 0 }
};

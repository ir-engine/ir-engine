// import { Vec3, Material, Body, Sphere, Cylinder } from "cannon-es";
import { Component } from "../../ecs/classes/Component";
import { setDefaults } from "../../common/functions/setDefaults";
import { Types } from "../../ecs/types/Types";
import { CollisionGroups } from "../enums/CollisionGroups";
import { Vector3 } from "three";
import { PhysXInstance, PhysXModelShapes, RigidBodyProxy } from "three-physx";

/**
 * @author Shaw 
 */

export class ControllerColliderComponent extends Component<ControllerColliderComponent>
{
	public options: any;
	public body: RigidBodyProxy;
	public mass: number;
	public position: Vector3;
	public height: number;
	public radius: number;
	public segments: number;
	public friction: number;
	public playerStuck: number;
	public moreRaysIchTurn = 0;

	constructor(options: any)
	{
		super(options);
		this.reapplyOptions(options);
	}

	copy(options) {
		const newThis = super.copy(options);

		newThis.reapplyOptions(options);

		return newThis;
	}

	reapplyOptions(options: any) {
    if(this.body) {
      PhysXInstance.instance.removeBody(this.body);
      this.body = null;
    }
		const defaults = {
			mass: 0,
			position: {x: 0, y: 1, z: 0},
			height: 0.5,
			radius: 0.3,
			segments: 8,
			friction: 0
		};
		options = setDefaults(options, defaults);
		this.options = options;

		this.body = PhysXInstance.instance.createController({
			isCapsule: true,
      collisionLayer: CollisionGroups.Characters,
      collisionMask: CollisionGroups.Default | CollisionGroups.Characters | CollisionGroups.Car | CollisionGroups.TrimeshColliders,
      position: {
        x: options.position.x,
        y: options.position.y,
        z: options.position.z
      },
      material: {
        dynamicFriction: options.friction,
      }
    });
	}
}

ControllerColliderComponent._schema = {
	mass: { type: Types.Number, default: 0 },
	position: { type: Types.Ref, default: new Vector3() },
	height: { type: Types.Number, default: 0.5 },
	radius: { type: Types.Number, default: 0.3 },
	segments: { type: Types.Number, default: 8 },
	friction: { type: Types.Number, default: 0.3 },
	playerStuck: { type: Types.Number, default: 1000 }
};

import { Vector3 } from 'three';
import { AnimationMapping } from '../functions/AvatarMathFunctions';
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { DefaultCollisionMask } from "../../physics/enums/CollisionGroups";

export type AvatarOptions = { top: boolean, bottom: boolean, visemes: boolean, hair: boolean, fingers: boolean }

/**
 * 
 * @author Avaer Kazmer
 */
export class IKAvatarRig extends Component<IKAvatarRig> {

	head: any;
	leftHand: any;
	rightHand: any;
	floorHeight: number;

	referencePlayerHeightHmd: number;
	referencePlayerWidthWrist: number;
	playerHeightHmd: number;
	playerWidthWrist: number;

  pose: any;
  modelBones: any;
  sdkInputs: any;
  inputs: any;
  options: AvatarOptions;
  springBoneManager: any;
  lastModelScaleFactor: any;
  model: any;
  modelBoneOutputs: any;
  outputs: any;
  skinnedMeshesVisemeMappings: any;
  volume: number;
  fingerBoneMap: any;
  object: any;
  skinnedMeshes: any[];
  flipZ: boolean;
  flipY: boolean;
  flipLeg: boolean;
  allHairBones: any[];
  hairBones: any[];
  height: any;
  shoulderWidth: any;
  leftArmLength: any;
  rightArmLength: any;
  handOffsetLeft: Vector3;
  handOffsetRight: Vector3;
  animationMappings: AnimationMapping[];
  direction: Vector3 = new Vector3();
  velocity: Vector3 = new Vector3();
  skeleton: any;
  fingerBones: { left: { thumb: any; index: any; middle: any; ring: any; little: any; }; right: { thumb: any; index: any; middle: any; ring: any; little: any; }; };
  eyeToHipsOffset: any;

  static _schema = {
		tiltContainer: { type: Types.Ref, default: null },
		collisionMask: { type: Types.Number, default: DefaultCollisionMask },
		object: { type: Types.Ref, default: null },
		top: { type: Types.Boolean, default: true },
		bottom: { type: Types.Boolean, default: true },
		visemes: { type: Types.Boolean, default: true },
		hair: { type: Types.Boolean, default: true },
		fingers: { type: Types.Boolean, default: true }
	};
}

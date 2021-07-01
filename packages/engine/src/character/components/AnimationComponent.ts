import { Vector3 } from "three";
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { AnimationGraph } from "../animations/AnimationGraph";
import { AnimationState } from "../animations/AnimationState";

export class AnimationComponent extends Component<AnimationComponent> {
  animationsSchema: any;
  updateAnimationsValues: any;

  /** Animaiton graph of this entity */
	animationGraph: AnimationGraph;

  /** Current animation state */
  currentState: AnimationState;

  /** Previous animation state */
  prevState: AnimationState;

  /** Previous velocity of the character */
  prevVelocity: Vector3;
}

AnimationComponent._schema = {
	animationsSchema: { type: Types.Ref, default: null },
	updateAnimationsValues: { type: Types.Ref, default: null },
  currentState: { type: Types.Ref, default: null },
  prevState: { type: Types.Ref, default: null },
  animationGraph: { type: Types.Ref, default: null },
  prevVelocity: { type: Types.Ref, default: null },
};

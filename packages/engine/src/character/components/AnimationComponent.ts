import { AnimationAction, AnimationMixer, Vector3 } from "three";
import { Component } from "../../ecs/classes/Component";
import { Types } from "../../ecs/types/Types";
import { VectorSpringSimulator } from "../../physics/classes/VectorSpringSimulator";
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

  /** Whether to only update mixer time or run full render cycle */
  onlyUpdateMixerTime: boolean;

  // === ANIMATION === // // TODO: Move these to AnimationComponent

	mixer: AnimationMixer;
	animations: any[] = [];
	currentAnimationAction: AnimationAction[] = [];
	currentAnimationLength = 0; // we may not need this
	speedMultiplier = 3;// TODO -- rename this to animation speed
	animationVectorSimulator: VectorSpringSimulator
	animationVelocity: Vector3 = new Vector3();
}

AnimationComponent._schema = {
	animationsSchema: { type: Types.Ref, default: null },
	updateAnimationsValues: { type: Types.Ref, default: null },
  onlyUpdateMixerTime: { type: Types.Ref, default: false },
};

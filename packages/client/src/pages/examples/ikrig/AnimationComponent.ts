import { Component } from "@xrengine/engine/src/ecs/classes/Component";
import { AnimationClip, AnimationMixer } from "three";

export class AnimationComponent extends Component<AnimationComponent> {
	mixer: AnimationMixer = null;
	animations: AnimationClip[] = [];
}

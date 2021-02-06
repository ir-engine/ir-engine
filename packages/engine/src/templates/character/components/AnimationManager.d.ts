import { Component } from '../../../ecs/classes/Component';
import { AnimationClip } from 'three';
export declare class AnimationManager extends Component<AnimationManager> {
    static instance: AnimationManager;
    initialized: boolean;
    _animations: AnimationClip[];
    getAnimations(): Promise<AnimationClip[]>;
    constructor();
}

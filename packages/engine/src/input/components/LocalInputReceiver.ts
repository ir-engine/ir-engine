import { Component } from "../../ecs/classes/Component";

// Input inherits from BehaviorComponent, which adds .map and .data
export class LocalInputReceiver extends Component<LocalInputReceiver> {}

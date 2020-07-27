import { System } from "ecsy";
import Behavior from "../../common/interfaces/Behavior";
export default class SubscriptionSystem extends System {
    private subscription;
    execute(delta: number, time: number): void;
    callBehaviorsForHook: Behavior;
}

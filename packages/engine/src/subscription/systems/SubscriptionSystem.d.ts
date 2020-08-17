import { Behavior } from "../../common/interfaces/Behavior";
import { System } from "../../ecs/classes/System";
export declare class SubscriptionSystem extends System {
    init(): void;
    private subscription;
    execute(delta: number): void;
    callBehaviorsForHook: Behavior;
}

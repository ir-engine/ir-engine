import { Behavior } from "../../common/interfaces/Behavior";
import { System, Attributes } from "../../ecs/classes/System";
import { Entity } from "../../ecs/classes/Entity";
export declare class WebGLRendererSystem extends System {
    init(attributes?: Attributes): void;
    onResize(): void;
    dispose(): void;
    isInitialized: boolean;
    configurePostProcessing(entity: Entity): void;
    execute(delta: number): void;
}
export declare const resize: Behavior;

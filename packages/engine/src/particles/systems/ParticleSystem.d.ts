import { System, SystemAttributes } from "../../ecs/classes/System";
/** System class for particle system. */
export declare class ParticleSystem extends System {
    /** Constructs the system. */
    constructor(attributes?: SystemAttributes);
    /** Executes the system. */
    execute(deltaTime: any, time: any): void;
}

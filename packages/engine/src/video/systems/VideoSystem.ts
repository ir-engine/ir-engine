import { System } from "../../ecs/classes/System";

/**
 * System for XR session and input handling
 * 
 * @author Kevin Roan <github.com/Realitian>
 */
export class VideoSystem extends System {

    constructor() {
        super();
    }

    /** Constructs Video System. */
    execute(delta, time): void {
    }

    dispose(): void {

    }
}

VideoSystem.queries = {

};
    
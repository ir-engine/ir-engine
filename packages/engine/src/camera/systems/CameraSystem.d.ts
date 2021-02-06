import { System } from '../../ecs/classes/System';
/** System class which provides methods for Camera system. */
export declare class CameraSystem extends System {
    /** Constructs camera system. */
    constructor();
    /**
     * Execute the camera system for different events of queries.\
     * Called each frame by default.
     *
     * @param delta time since last frame.
     */
    execute(delta: number): void;
}

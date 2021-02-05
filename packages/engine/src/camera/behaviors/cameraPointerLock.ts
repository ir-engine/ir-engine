import { Engine } from "../../ecs/classes/Engine";

/** Lock camera pointer. */
export function cameraPointerLock(shouldLock: boolean): void {
    if(!Engine.renderer?.domElement || typeof document === 'undefined') return
    if(shouldLock) {
        Engine.renderer.domElement.requestPointerLock();
    } else {
        document.exitPointerLock();
    }
}

export * from "./components/index";
export * from "./systems/index";
import { World } from "ecsy";
export default function initializeInputSystems(world: World, options?: {
    mouse: boolean;
    keyboard: boolean;
    touchscreen: boolean;
    gamepad: boolean;
    debug: boolean;
}): void;

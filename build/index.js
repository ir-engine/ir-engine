export * from "./components/index";
export * from "./systems/index";
import { MouseInputSystem, KeyboardInputSystem, GamepadInputSystem } from "./systems/index";
const DEFAULT_OPTIONS = {
    mouse: true,
    keyboard: true,
    touchscreen: true,
    gamepad: true,
    debug: false
};
export default function initializeInputSystems(world, options = DEFAULT_OPTIONS) {
    const isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    if (!isBrowser)
        return console.error("Couldn't initialize input, are you in a browser?");
    if (options.mouse)
        world.registerSystem(MouseInputSystem, null);
    if (options.keyboard)
        world.registerSystem(KeyboardInputSystem, null);
    if (options.gamepad)
        world.registerSystem(GamepadInputSystem, null);
    // TODO: Add touchscreen
    if (options.debug)
        console.log("INPUT: Registered input systems.");
}

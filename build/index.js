export * from "./components/index";
export * from "./systems/index";
import { MouseInputSystem, KeyboardInputSystem, GamepadInputSystem } from "./systems/index";
import { isBrowser } from "./util";
import { InputState } from "./components/InputState";
import { KeyboardInputState } from "./components/KeyboardInputState";
import { GamepadInputState } from "./components/GamepadInputState";
import { MouseInputState } from "./components/MouseInputState";
const DEFAULT_OPTIONS = {
    mouse: true,
    keyboard: true,
    touchscreen: true,
    gamepad: true,
    debug: false
};
export function initializeInputSystems(world, options = DEFAULT_OPTIONS) {
    if (options.debug)
        console.log("Initializing input systems...");
    if (!isBrowser)
        return console.error("Couldn't initialize input, are you in a browser?");
    if (window && options.debug)
        window.DEBUG_INPUT = true;
    if (options.debug) {
        console.log("Registering input systems with the following options:");
        console.log(options);
    }
    const inputSystemEntity = world.createEntity().addComponent(InputState);
    if (options.keyboard) {
        world.registerSystem(KeyboardInputSystem, null);
        inputSystemEntity.addComponent(KeyboardInputState);
        if (options.debug)
            console.log("Registered KeyboardInputSystem and added KeyboardInputState component to input entity");
    }
    if (options.mouse) {
        world.registerSystem(MouseInputSystem, null);
        inputSystemEntity.addComponent(MouseInputState);
        if (options.debug)
            console.log("Registered MouseInputSystem and added MouseInputState component to input entity");
    }
    if (options.gamepad) {
        world.registerSystem(GamepadInputSystem, null);
        inputSystemEntity.addComponent(GamepadInputState);
        if (options.debug)
            console.log("Registered MouseInputSystem and added MouseInputState component to input entity");
    }
    // TODO: Add touchscreen
    if (options.touchscreen) {
        // world.registerSystem(TouchscreenInputSystem, null)
        // inputSystemEntity.addComponent(TouchscreenInputState)
        if (options.debug) {
            console.log("Touchscreen is not yet implemented");
        }
    }
    if (options.debug)
        console.log("INPUT: Registered input systems.");
}

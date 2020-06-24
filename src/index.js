import { isBrowser } from "browser-or-node";
export { initialize } from "./initialize.js";
export * from "./components/index.js";
export * from "./systems/index.js";

const DEFAULT_OPTIONS = {
  vr: true,
  ar: false,
  mouse: true,
  keyboard: true,
  touchscreen: true,
  gamepad: true,
  debug: false
};

export default function initializeInputSystems(
  world,
  options = DEFAULT_OPTIONS
) {
  if (options.debug) {
    console.log("Registering input systems with the following options:");
    console.log(options);
  }

  if (!isBrowser)
    return console.error("Couldn't initialize input, are you in a browser?");

  if (options.mouse) world.registerSystem(MouseInputSystem);
  if (options.keyboard) world.registerSystem(KeyboardInputSystem);
  if (options.gamepad) world.registerSystem(MouseInputSystem);
  // TODO: Add touchscreen

  if (navigator && navigator.xr && options.vr)
    world.registerSystem(VRInputSystem);

  if (options.debug) console.log("INPUT: Registered input systems.");
}

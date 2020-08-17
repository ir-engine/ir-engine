import "./webxr-input.mock"
//jest.mock("./webxr-input.mock")

import { InputSystem } from "../../src/input/systems/InputSystem"
import { initializeWorld, registerSystem, getSystem } from "../../src/ecs"

initializeWorld()
registerSystem(InputSystem)
// new InputSystem()

test("check navigator", () => {
  expect("xr" in navigator).toBeTruthy()
  expect("requestSession" in (navigator as any).xr).toBeTruthy()
})

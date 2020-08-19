import "./webxr-input.mock"
//jest.mock("./webxr-input.mock")

import { InputSystem } from "../../src/input/systems/InputSystem"
import { registerSystem } from "../../src/ecs"

initializeEngine()
// new InputSystem()

test("check navigator", () => {
  expect("xr" in navigator).toBeTruthy()
  expect("requestSession" in (navigator as any).xr).toBeTruthy()
})

import "./webxr-input.mock"
//jest.mock("./webxr-input.mock")

import { initializeEngine } from "../../src/initialize"

initializeEngine()
// new InputSystem()

test("check navigator", () => {
  expect("xr" in navigator).toBeTruthy()
  expect("requestSession" in (navigator as any).xr).toBeTruthy()
})

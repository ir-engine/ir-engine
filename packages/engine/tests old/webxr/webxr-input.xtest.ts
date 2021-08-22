import './webxr-input.mock'

import { InputSystem } from '../../src/input/systems/ClientInputSystem'
import { initializeEngine } from '../../src/initialize'
import { registerSystem, getSystem } from '../../src/ecs/functions/SystemFunctions'

test('check navigator', () => {
  expect('xr' in navigator).toBeTruthy()
  expect('requestSession' in (navigator as any).xr).toBeTruthy()
})

test('adding InputSystem', () => {
  expect(() => {
    //initializeEngine()
    registerSystem(InputSystem)
  }).not.toThrowError()
})

test('start XR sesion', () => {
  expect(() => {
    const system = getSystem(InputSystem)
    system.init({ useWebXR: true, onVRSupportRequested })
  }).not.toThrowError()
  //FIXME: doesn't work as expected
  function onVRSupportRequested(isSupported = false) {
    expect(isSupported).toBeTruthy()
  }
})

//TODO: add more tests

import ButtonState from "../enums/ButtonState"

export interface GamepadInputTypes {
  axis_threshold: number
  connected: boolean
  dpadOneAxisY: number
  dpadOneAxisX: number
  dpadTwoAxisY: number
  dpadTwoAxisX: number
  buttonA: boolean
  buttonB: boolean
  buttonX: boolean
  buttonY: boolean
}

export interface VRInputTypes extends GamepadInputTypes {
  grabber: number
  trigger: number
  bumper: number
  index: number
  middle: number
  ring: number
  pinky: number
  thumb: number
}

export interface MouseInputTypes {
  mouseButtonLeft: ButtonState
  mouseButtonMiddle: ButtonState
  mouseButtonScrollUp: ButtonState
  mouseButtonScrollDown: ButtonState
  mouseButtonRight: ButtonState
  mousePosition: { x: number; y: number }
}

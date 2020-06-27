import GamepadInputState from "./GamepadInputState"

export default interface VRInputState extends GamepadInputState {
  grabber: number
  trigger: number
  bumper: number
  index: number
  middle: number
  ring: number
  pinky: number
  thumb: number
}

export default interface InputStates {
  up: boolean
  down: boolean
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  crouch: boolean
  jump: boolean
  sprint: boolean
  walk: boolean
  interact: boolean
  aim: boolean
  zoom: boolean
  dpadOneAxisY: number
  dpadOneAxisX: number
  dpadTwoAxisY: number
  dpadTwoAxisX: number
  mouseButtonLeft: boolean
  mouseButtonMiddle: boolean
  mouseButtonScrollUp: boolean
  mouseButtonScrollDown: boolean
  mouseButtonRight: boolean
  customActions: boolean[]
}

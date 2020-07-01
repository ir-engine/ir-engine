import LifecycleValue from "../enums/LifecycleValue"

export interface MouseInputState {
  mouseButtonLeft: LifecycleValue
  mouseButtonMiddle: LifecycleValue
  mouseButtonScrollUp: LifecycleValue
  mouseButtonScrollDown: LifecycleValue
  mouseButtonRight: LifecycleValue
  mousePosition: { x: number; y: number }
}

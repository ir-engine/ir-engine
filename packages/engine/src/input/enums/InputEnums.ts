export enum MouseInput {
  LeftButton = 0,
  MiddleButton = 1,
  RightButton = 2,
  MousePosition = 3,
  MouseClickDownPosition = 4,
  MouseClickDownTransformRotation = 5,
  MouseMovement = 6,
  MouseScroll = 7,
  MouseClickDownMovement = 8
}

export enum TouchInputs {
  Touch = 10,
  DoubleTouch = 11,
  LongTouch = 12,
  Touch1Position = 13,
  Touch1Movement = 14,
  Touch2Move = 15,
  SwipeLeft = 16,
  SwipeRight = 17,
  SwipeUp = 18,
  SwipeDown = 19,
  Scale = 20,
}

export enum XRInput {
  HEAD = 21,
  CONTROLLER_LEFT = 22,
  CONTROLLER_RIGHT = 23
}

export enum Thumbsticks {
  Left = 28,
  Right = 29
}

export enum GamepadButtons {
  A = 30,
  B = 31,
  X = 32,
  Y = 33,
  LBumper = 34,
  RBumper = 35,
  LTrigger = 36,
  RTrigger = 37,
  Back = 38,
  Start = 39,
  LStick = 40,
  RString = 41,
  DPad1 = 42,
  DPad2 = 43,
  DPad3 = 44,
  DPad4 = 45
}

export const CameraInput = {
  Neutral: 100,
  Angry: 101,
  Disgusted: 102,
  Fearful: 103,
  Happy: 104,
  Surprised: 105,
  Sad: 106,
  Pucker: 107,
  Widen: 108,
  Open: 109
};

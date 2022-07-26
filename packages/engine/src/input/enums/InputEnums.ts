export enum MouseInput {
  LeftButton = 'LeftButton',
  MiddleButton = 'MiddleButton',
  RightButton = 'RightButton',
  MousePosition = 'MousePosition',
  MouseClickDownPosition = 'MouseClickDownPosition',
  MouseClickDownTransformRotation = 'MouseClickDownTransformRotation',
  MouseMovement = 'MouseMovement',
  MouseScroll = 'MouseScroll',
  MouseClickDownMovement = 'MouseClickDownMovement'
}

export enum TouchInputs {
  Touch = 'Touch',
  DoubleTouch = 'DoubleTouch',
  LongTouch = 'LongTouch',
  Touch1Position = 'Touch1Position',
  Touch2Position = 'Touch2Position',
  Touch1Movement = 'Touch1Movement',
  Touch2Movement = 'Touch2Movement',
  SwipeLeft = 'SwipeLeft',
  SwipeRight = 'SwipeRight',
  SwipeUp = 'SwipeUp',
  SwipeDown = 'SwipeDown',
  Scale = 'Scale'
}

export enum XRAxes {
  Left = 'Left',
  Right = 'Right'
}

export enum XR6DOF {
  HMD = 'HMD',
  LeftHand = 'LeftHand',
  RightHand = 'RightHand'
}

export enum GamepadAxis {
  Left = 'Left',
  Right = 'Right'
}

export enum GamepadButtons {
  A = 'A',
  B = 'B',
  X = 'X',
  Y = 'Y',
  LBumper = 'LBumper',
  RBumper = 'RBumper',
  LTrigger = 'LTrigger',
  RTrigger = 'RTrigger',
  Back = 'Back',
  Start = 'Start',
  LPad = 'LPad',
  RPad = 'RPad',
  LStick = 'LStick',
  RStick = 'RStick',
  DPad1 = 'DPad1',
  DPad2 = 'DPad2',
  DPad3 = 'DPad3',
  DPad4 = 'DPad4'
}

export enum CameraInput {
  Neutral = 'Neutral',
  Angry = 'Angry',
  Disgusted = 'Disgusted',
  Fearful = 'Fearful',
  Happy = 'Happy',
  Surprised = 'Surprised',
  Sad = 'Sad',
  Pucker = 'Pucker',
  Widen = 'Widen',
  Open = 'Open'
}

export enum AvatarMovementScheme {
  Linear = 'Linear',
  Teleport = 'Teleport'
}

export enum AvatarControllerType {
  None = 'None',
  XRHands = 'XRHands',
  OculusQuest = 'OculusQuest'
}

export enum MouseInput {
  LeftButton = 'MouseInput_LeftButton',
  MiddleButton = 'MouseInput_MiddleButton',
  RightButton = 'MouseInput_RightButton',
  MousePosition = 'MouseInput_MousePosition',
  MouseClickDownPosition = 'MouseInput_MouseClickDownPosition',
  MouseClickDownTransformRotation = 'MouseInput_MouseClickDownTransformRotation',
  MouseMovement = 'MouseInput_MouseMovement',
  MouseScroll = 'MouseInput_MouseScroll',
  MouseClickDownMovement = 'MouseInput_MouseClickDownMovement'
}

export enum TouchInputs {
  Touch = 'TouchInputs_Touch',
  DoubleTouch = 'TouchInputs_DoubleTouch',
  LongTouch = 'TouchInputs_LongTouch',
  Touch1Position = 'TouchInputs_Touch1Position',
  Touch2Position = 'TouchInputs_Touch2Position',
  Touch1Movement = 'TouchInputs_Touch1Movement',
  Touch2Movement = 'TouchInputs_Touch2Movement',
  SwipeLeft = 'TouchInputs_SwipeLeft',
  SwipeRight = 'TouchInputs_SwipeRight',
  SwipeUp = 'TouchInputs_SwipeUp',
  SwipeDown = 'TouchInputs_SwipeDown',
  Scale = 'TouchInputs_Scale'
}

export enum XRAxes {
  Left = 'XRAxes_Left',
  Right = 'XRAxes_Right'
}

export enum XR6DOF {
  HMD = 'XR6DOF_HMD',
  LeftHand = 'XR6DOF_LeftHand',
  RightHand = 'XR6DOF_RightHand'
}

export enum GamepadAxis {
  Left = 'GamepadAxis_Left',
  Right = 'GamepadAxis_Right'
}

export enum GamepadButtons {
  A = 'GamepadButtons_A',
  B = 'GamepadButtons_B',
  X = 'GamepadButtons_X',
  Y = 'GamepadButtons_Y',
  LBumper = 'GamepadButtons_LBumper',
  RBumper = 'GamepadButtons_RBumper',
  LTrigger = 'GamepadButtons_LTrigger',
  RTrigger = 'GamepadButtons_RTrigger',
  Back = 'GamepadButtons_Back',
  Start = 'GamepadButtons_Start',
  LPad = 'GamepadButtons_LPad',
  RPad = 'GamepadButtons_RPad',
  LStick = 'GamepadButtons_LStick',
  RStick = 'GamepadButtons_RStick',
  DPad1 = 'GamepadButtons_DPad1',
  DPad2 = 'GamepadButtons_DPad2',
  DPad3 = 'GamepadButtons_DPad3',
  DPad4 = 'GamepadButtons_DPad4'
}

export enum CameraInput {
  Neutral = 'CameraInput_Neutral',
  Angry = 'CameraInput_Angry',
  Disgusted = 'CameraInput_Disgusted',
  Fearful = 'CameraInput_Fearful',
  Happy = 'CameraInput_Happy',
  Surprised = 'CameraInput_Surprised',
  Sad = 'CameraInput_Sad',
  Pucker = 'CameraInput_Pucker',
  Widen = 'CameraInput_Widen',
  Open = 'CameraInput_Open'
}

export enum AvatarMovementScheme {
  Linear = 'AvatarMovementScheme_Linear',
  Teleport = 'AvatarMovementScheme_Teleport'
}

export enum AvatarControllerType {
  None = 'AvatarControllerType_None',
  XRHands = 'AvatarControllerType_XRHands',
  OculusQuest = 'AvatarControllerType_OculusQuest'
}

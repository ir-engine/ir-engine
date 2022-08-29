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

export enum XR6DOF {
  HMD = 'XR6DOF_HMD',
  LeftHand = 'XR6DOF_LeftHand',
  RightHand = 'XR6DOF_RightHand'
}

export enum GamepadAxis {
  LTouchpad = 'GamepadAxis_LeftTouchpad',
  RTouchpad = 'GamepadAxis_RightTouchpad',
  LThumbstick = 'GamepadAxis_LeftThumbstick',
  RThumbstick = 'GamepadAxis_RightThumbstick'
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

export const AvatarMovementScheme = {
  Linear: 'AvatarMovementScheme_Linear' as const,
  Teleport: 'AvatarMovementScheme_Teleport' as const
}

export const AvatarControllerType = {
  None: 'AvatarControllerType_None' as const,
  XRHands: 'AvatarControllerType_XRHands' as const,
  OculusQuest: 'AvatarControllerType_OculusQuest' as const
}

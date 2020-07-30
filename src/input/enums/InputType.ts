// Button -- discrete states of ON and OFF, like a button
// OneD -- one dimensional value between 0 and 1, or -1 and 1, like a trigger
// TwoD -- Two dimensional value with x: -1, 1 and y: -1, 1 like a mouse input
// ThreeD -- Three dimensional value, just in case
// FourD -- Four dimensional value, for quaternions like rotation
// 6DOF -- Six dimensional input, three for pose and three for rotation (in euler?), i.e. for VR controllers
export enum InputType {
  BUTTON,
  ONED,
  TWOD,
  THREED,
  FOURD,
  SIXDOF
}

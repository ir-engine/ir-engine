// BUTTON -- discrete states of ON and OFF, like a button
// ONEDIM -- one dimensional value between 0 and 1, or -1 and 1, like a trigger
// TWODIM -- Two dimensional value with x: -1, 1 and y: -1, 1 like a mouse input
// THREEDIM -- Three dimensional value, just in case
// SIXDOF -- Six dimensional input, three for pose and three for rotation (in euler?), i.e. for VR controllers
export enum InputType {
  BUTTON = 0,
  ONEDIM = 1,
  TWODIM = 2,
  THREEDIM = 3,
  SIXDOF = 4
}

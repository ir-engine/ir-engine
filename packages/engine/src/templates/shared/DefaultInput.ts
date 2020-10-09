// Abstract inputs that all input devices get mapped to

export enum DefaultInput {
  PRIMARY,
  SECONDARY,
  FORWARD,
  BACKWARD,
  UP,
  DOWN,
  LEFT,
  RIGHT,
  INTERACT,
  CROUCH,
  JUMP,
  WALK,
  RUN,
  SPRINT,
  SNEAK,
  SCREENXY, // Is this too specific, or useful?
  SCREENXY_START,
  ROTATION_START,
  MOVEMENT_PLAYERONE,
  LOOKTURN_PLAYERONE,
  MOVEMENT_PLAYERTWO,
  LOOKTURN_PLAYERTWO,
  ALTERNATE,
  MOUSE_MOVEMENT, // mouse event movement
  SWITCH_CAR,
  POINTER_LOCK,
  CAMERA_SCROLL,
  SWITCH_CAMERA
}

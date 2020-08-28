import { disableScroll, enableScroll } from '../../common/functions/enableDisableScrolling';
import { preventDefault } from '../../common/functions/preventDefault';
import { DefaultInput } from '../shared/DefaultInput';
import { InputSchema } from '../../input/interfaces/InputSchema';
import { BinaryValue } from '../../common/enums/BinaryValue';
import { handleKey, handleMouseMovement, handleMouseButton } from '../../input/behaviors/DesktopInputBehaviors';
import { handleGamepadConnected, handleGamepadDisconnected } from '../../input/behaviors/GamepadInputBehaviors';
import { GamepadButtons } from '../../input/enums/GamepadButtons';
import { Thumbsticks } from '../../common/enums/Thumbsticks';
import { InputRelationship } from '../../input/interfaces/InputRelationship';
import { drive } from '../../physics/behaviors/driveBehavior';
import { InputType } from '../../input/enums/InputType';
import { rotateAround } from '../../common/defaults/behaviors/rotate';
import { handleTouch, handleTouchMove } from '../../input/behaviors/TouchBehaviors'
import { MouseButtons } from '../../input/enums/MouseButtons';
import { updateMovementState } from '../../input/behaviors/updateMovementState'

export const VehicleInputSchema: InputSchema = {
  // When an Input component is added, the system will call this array of behaviors
  onAdded: [
    {
      behavior: disableScroll
    }
  ],
  // When an Input component is removed, the system will call this array of behaviors
  onRemoved: [
    {
      behavior: enableScroll
    }
  ],
  // When the input component is added or removed, the system will bind/unbind these events to the DOM
  eventBindings: {
    // Mouse
    contextmenu: [
      {
        behavior: preventDefault
      }
    ],
    mousemove: [
      {
        behavior: handleMouseMovement,
        args: {
          value: DefaultInput.SCREENXY
        }
      }
    ],
    mouseup: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    mousedown: [
      {
        behavior: handleMouseButton,
        args: {
          value: BinaryValue.ON
        }
      }
    ],

    // Touch
    touchstart: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.ON
        }
      },
      // {
      //   behavior: rotateStart
      // }
    ],
    touchend: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    touchcancel: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    touchmove: [
      {
        behavior: handleTouchMove
      }
    ],

    // Keys
    keyup: [
      {
        behavior: handleKey,
        args: {
          value: BinaryValue.OFF
        }
      }
    ],
    keydown: [
      {
        behavior: handleKey,
        args: {
          value: BinaryValue.ON
        }
      }
    ],
    // Gamepad
    gamepadconnected: [
      {
        behavior: handleGamepadConnected
      }
    ],
    gamepaddisconnected: [
      {
        behavior: handleGamepadDisconnected
      }
    ]
  },
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseButtons.LeftButton]: DefaultInput.PRIMARY,
      [MouseButtons.RightButton]: DefaultInput.SECONDARY
      // [MouseButtons.MiddleButton]: DefaultInput.INTERACT
    },
    axes: {
      mousePosition: DefaultInput.SCREENXY,
      mouseClickDownPosition: DefaultInput.SCREENXY_START,
      mouseClickDownTransformRotation: DefaultInput.ROTATION_START
    }
  },
  // Map gamepad buttons to abstract input
  gamepadInputMap: {
    buttons: {
      [GamepadButtons.A]: DefaultInput.JUMP,
      [GamepadButtons.B]: DefaultInput.CROUCH, // B - back
      // [GamepadButtons.X]: DefaultInput.SPRINT, // X - secondary input
      // [GamepadButtons.Y]: DefaultInput.INTERACT, // Y - tertiary input
      // 4: DefaultInput.DEFAULT, // LB
      // 5: DefaultInput.DEFAULT, // RB
      // 6: DefaultInput.DEFAULT, // LT
      // 7: DefaultInput.DEFAULT, // RT
      // 8: DefaultInput.DEFAULT, // Back
      // 9: DefaultInput.DEFAULT, // Start
      // 10: DefaultInput.DEFAULT, // LStick
      // 11: DefaultInput.DEFAULT, // RStick
      [GamepadButtons.DPad1]: DefaultInput.FORWARD, // DPAD 1
      [GamepadButtons.DPad2]: DefaultInput.BACKWARD, // DPAD 2
      [GamepadButtons.DPad3]: DefaultInput.LEFT, // DPAD 3
      [GamepadButtons.DPad4]: DefaultInput.RIGHT // DPAD 4
    },
    axes: {
      [Thumbsticks.Left]: DefaultInput.MOVEMENT_PLAYERONE,
      [Thumbsticks.Right]: DefaultInput.LOOKTURN_PLAYERONE
    }
  },
  // Map keyboard buttons to abstract input
  keyboardInputMap: {
    w: DefaultInput.FORWARD,
    a: DefaultInput.LEFT,
    s: DefaultInput.BACKWARD,
    d: DefaultInput.RIGHT,
    ' ': DefaultInput.JUMP,
    shift: DefaultInput.CROUCH
  },
  // Map how inputs relate to each other
  inputRelationships: {
    [DefaultInput.FORWARD]: { opposes: [DefaultInput.BACKWARD] } as InputRelationship,
    [DefaultInput.BACKWARD]: { opposes: [DefaultInput.FORWARD] } as InputRelationship,
    [DefaultInput.LEFT]: { opposes: [DefaultInput.RIGHT] } as InputRelationship,
    [DefaultInput.RIGHT]: { opposes: [DefaultInput.LEFT] } as InputRelationship,
    [DefaultInput.CROUCH]: { blockedBy: [DefaultInput.JUMP, DefaultInput.SPRINT] } as InputRelationship,
    [DefaultInput.JUMP]: { overrides: [DefaultInput.CROUCH] } as InputRelationship
  },
  // onInputButtonBehavior: {
  //     [BinaryValue.ON]: {
  //       started: [
  //         {
  //           behavior: sendMessage,
  //           args: {}
  //         }
  //       ]
  //     },
  //     [BinaryValue.OFF]: {

  //     }
  //   }
  // "Button behaviors" are called when button input is called (i.e. not axis input)
  inputButtonBehaviors: {
    [DefaultInput.FORWARD]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, -1]
            }
          },
          {
            behavior: updateMovementState
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, -1]
            }
          }
        ]
      },
      [BinaryValue.OFF]: {
        started: [
          {
            behavior: updateMovementState
          }
        ],
        continued: [
          {
            behavior: updateMovementState
          }
        ]
      }
    },
    [DefaultInput.BACKWARD]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: updateMovementState
          },
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, 1]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [0, 1]
            }
          }
        ]
      },
      [BinaryValue.OFF]: {
        started: [
          {
            behavior: updateMovementState
          }
        ],
        continued: [
        ]
      }
    },
    [DefaultInput.LEFT]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: updateMovementState
          },
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [-1, 0]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              input: {
                value: [-1, 0]
              },
              value: [-1, 0]
            }
          }
        ]
      },
      [BinaryValue.OFF]: {
        started: [
          {
            behavior: updateMovementState
          }
        ],
        continued: [
        ]
      }
    },
    [DefaultInput.RIGHT]: {
      [BinaryValue.ON]: {
        started: [
          {
            behavior: updateMovementState
          },
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [1, 0]
            }
          }
        ],
        continued: [
          {
            behavior: drive,
            args: {
              inputType: InputType.TWOD,
              value: [1, 0]
            }
          }
        ]
      },
      [BinaryValue.OFF]: {
        started: [
          {
            behavior: updateMovementState
          }
        ],
        continued: [
        ]
      }
    }
  },
  // Axis behaviors are called by continuous input and map to a scalar, vec2 or vec3
  inputAxisBehaviors: {
    [DefaultInput.MOVEMENT_PLAYERONE]: {
      started: [
        {
          behavior: updateMovementState
        }
      ],
      continued: [
        {
          behavior: drive,
          args: {
            input: DefaultInput.MOVEMENT_PLAYERONE,
            inputType: InputType.TWOD
          }
        }
      ]
    },
    [DefaultInput.SCREENXY]: {
      started: [
        // {
        //   behavior: rotateAround,
        //   args: {
        //     input: DefaultInput.SCREENXY,
        //     inputType: InputType.TWOD
        //   }
        // }
      ]
    }
  }
};

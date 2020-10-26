import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/InputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeEntity } from "../../src/ecs/functions/EntityFunctions";
import { Input } from "../../src/input/components/Input";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { DefaultInput } from "../../src/templates/shared/DefaultInput";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { MouseInput } from "../../src/input/enums/MouseInput";
import { preventDefault } from "../../src/common/functions/preventDefault";
import { handleMouseMovement } from "../../src/input/behaviors/handleMouseMovement";
import { handleMouseButton } from "../../src/input/behaviors/handleMouseButton";
import { handleMouseWheel } from "../../src/input/behaviors/handleMouseWheel";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";
import { handleTouch } from "../../src/input/behaviors/handleTouch";
import { handleTouchMove } from "../../src/input/behaviors/handleTouchMove";
import { TouchInputs } from "../../src/input/enums/TouchInputs";
import { deltaMouseMovement } from "../../src/common/functions/deltaMouseMovement";

let addListenerMock:jest.SpyInstance;

const mockedBehaviorOnStarted = jest.fn(() => { console.log('behavior call on started'); });
const mockedBehaviorOnEnded = jest.fn(() => { console.log('behavior call on ended'); });
const mockedBehaviorOnChanged = jest.fn(() => { console.log('behavior call on changed'); });
const mockedBehaviorOnUnchanged = jest.fn(() => { console.log('behavior call on unchanged'); });

const testInputSchema: InputSchema = {
  inputRelationships: {},
  onAdded: [],
  onRemoved: [],

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
    wheel: [
      {
        behavior: handleMouseWheel,
        args: {
          value: DefaultInput.CAMERA_SCROLL
        }
      }
    ]
  
  // // Touch
  // touchstart: [
  //   {
  //     behavior: handleTouch,
  //     args: {
  //       value: BinaryValue.ON
  //     }
  //   }
  // ],
  // touchend: [
  //   {
  //     behavior: handleTouch,
  //     args: {
  //       value: BinaryValue.OFF
  //     }
  //   }
  // ],
  // touchcancel: [
  //   {
  //     behavior: handleTouch,
  //     args: {
  //       value: BinaryValue.OFF
  //     }
  //   }
  // ],
  // touchmove: [
  //   {
  //     behavior: handleTouchMove
  //   }
  // ],
},
// touchInputMap: {
//   buttons: {
//     [TouchInputs.Touch]: DefaultInput.INTERACT,
//   },
//   axes: {
//     [TouchInputs.Touch1Position]: DefaultInput.SCREENXY,
//     [TouchInputs.Touch1Movement]: DefaultInput.LOOKTURN_PLAYERONE
//   }
// },
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: DefaultInput.PRIMARY,
      [MouseInput.RightButton]: DefaultInput.SECONDARY,
      [MouseInput.MiddleButton]: DefaultInput.INTERACT
    },
    axes: {
      [MouseInput.MouseMovement]: DefaultInput.MOUSE_MOVEMENT,
      [MouseInput.MousePosition]: DefaultInput.SCREENXY,
      [MouseInput.MouseClickDownPosition]: DefaultInput.SCREENXY_START,
      // [MouseInput.MouseClickDownTransformRotation]: DefaultInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseClickDownMovement]: DefaultInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseScroll]: DefaultInput.CAMERA_SCROLL
    }
  },
  inputButtonBehaviors: {
    [DefaultInput.PRIMARY]: {
      started: [
        {
          behavior: mockedBehaviorOnStarted
        }
      ],
      // mouse buttons can't be triggered continuously?
      // continued: []
      ended: [
        {
          behavior: mockedBehaviorOnEnded
        }
      ]
    },
  },
  inputAxisBehaviors: {
    [DefaultInput.SCREENXY]: {
      started: [
        {
          behavior: mockedBehaviorOnStarted
        }
      ],
      changed: [
        {
          behavior: mockedBehaviorOnChanged
        }
      ],
      unchanged: [
        {
          behavior: mockedBehaviorOnUnchanged
        }
      ]
    }
  },
};

let entity, input;

beforeAll(() => {
  addListenerMock = jest.spyOn(document, 'addEventListener');
  registerSystem(InputSystem, { useWebXR: false });
});

beforeEach(() => {
  // in each test we should have new clean entity with new clean input component (unpolluted by previous tests)
  entity = createEntity();
  input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input;
  addComponent(entity, LocalInputReceiver);
  execute();

  resetMouse();

  mockedBehaviorOnStarted.mockClear();
  mockedBehaviorOnEnded.mockClear();
  mockedBehaviorOnChanged.mockClear();
  mockedBehaviorOnUnchanged.mockClear();
});
afterEach(() => {
  // cleanup
  removeEntity(entity, true);
});

// buttons

// check MouseMovement
// xdescribe("movement", () => {
//   const windowPoint1 = { x: 0, y:0 };
//   const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
//   const windowPoint2 = { x: 1024, y:25 };
//   const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

//     it ("lifecycle STARTED", () => {
//       triggerMouse({ ...windowPoint1, type: 'mousemove'});
//       execute();
//       triggerMouse({ ...windowPoint2, type: 'mousemove'});
//       execute();

//       expect(input.data.has(DefaultInput.LOOKTURN_PLAYERONE)).toBeTruthy();
//       const data1 = input.data.get(DefaultInput.LOOKTURN_PLAYERONE);
//       expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
//     //   expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);
//       expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
//     });


// //   it ("triggered started behavior", () => {
// //     triggerMouse({ ...windowPoint1, type: 'mousemove' });
// //     execute();
// //     expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
// //   });

// });

// buttons + move
// TODO: check who's sets MouseInput.MouseClickDownTransformRotation - DefaultInput.ROTATION_START
// TODO: check that mousemove without button does not set MouseInput.MouseClickDownTransformRotation - DefaultInput.ROTATION_START
// test("move does not set DefaultInput.ROTATION_START", () => {
//
// })
describe("button + movement", () => {
  const windowPoint1 = { x: 0, y:0 };
  const normalPoint1 = deltaMouseMovement(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 1024, y:800 };
  const normalPoint2 = deltaMouseMovement(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  it ("triggers associated input STARTED", () => {
    triggerMouse({ ...windowPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...windowPoint2, type: 'mousemove' });
    execute();

    expect(input.data.has(DefaultInput.LOOKTURN_PLAYERONE)).toBeTruthy();
    const data2 = input.data.get(DefaultInput.LOOKTURN_PLAYERONE);
    expect(data2.value[0]).toBeGreaterThanOrEqual(0.5);
    expect(data2.value[0]).toBeLessThanOrEqual(2);
    expect(data2.value[1]).toBeGreaterThanOrEqual(0.5);
    expect(data2.value[1]).toBeLessThanOrEqual(2);
    // expect(data2.lifecycleState).toBe(LifecycleValue.STARTED);
  });

//   it ("triggers associated input CHANGED", () => {
//     triggerMouse({ ...windowPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
//     execute();
//     triggerMouse({ ...windowPoint2, type: 'mousemove' });
//     execute(); // started
//     triggerMouse({ ...windowPoint1, type: 'mousemove' });
//     execute(); // changed

//     expect(input.data.has(DefaultInput.LOOKTURN_PLAYERONE)).toBeTruthy();
//     const data2 = input.data.get(DefaultInput.LOOKTURN_PLAYERONE);
//     expect(data2.value).toMatchObject([ -20, -5 ]);
//     expect(data2.lifecycleState).toBe(LifecycleValue.CHANGED);
//   });

});

// scroll
// TODO: check MouseScroll

const mouseLastPosition = [0,0];

function resetMouse() {
  mouseLastPosition[0] = 0;
  mouseLastPosition[1] = 0;
}

function triggerMouse({ x, y, button, type}: { x:number, y:number, button?:number, type?:string }):void {
  const typeListenerCall = addListenerMock.mock.calls.find(call => call[0] === type);
  typeListenerCall[1]({
    type,
    target: document,
    button,
    clientX: x,
    clientY: y,
    movementX: x - mouseLastPosition[0],
    movementY: y - mouseLastPosition[1],
    view: window,
    cancelable: true,
    bubbles: true,
  });

  mouseLastPosition[0] = x;
  mouseLastPosition[1] = y;
}
import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/ClientInputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeEntity } from "../../src/ecs/functions/ComponentFunctions";
import { Input } from "../../src/input/components/Input";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput';
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { MouseInput } from "../../src/input/enums/InputEnums";
import { handleMouseMovement } from "../../src/input/functions/handleMouseMovement";
import { handleMouseButton } from "../../src/input/functions/handleMouseButton";
import { handleMouseWheel } from "../../src/input/functions/handleMouseWheel";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";

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
        behavior: (e: any) =>  e.preventDefault()
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
          value: BaseInput.CAMERA_SCROLL
        }
      }
    ],
  },
  // Map mouse buttons to abstract input
  mouseInputMap: {
    buttons: {
      [MouseInput.LeftButton]: BaseInput.PRIMARY,
      [MouseInput.RightButton]: BaseInput.SECONDARY,
      [MouseInput.MiddleButton]: BaseInput.INTERACT
    },
    axes: {
      [MouseInput.MouseMovement]: BaseInput.MOUSE_MOVEMENT,
      [MouseInput.MousePosition]: BaseInput.SCREENXY,
      [MouseInput.MouseClickDownPosition]: BaseInput.SCREENXY_START,
      // [MouseInput.MouseClickDownTransformRotation]: BaseInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseClickDownMovement]: BaseInput.LOOKTURN_PLAYERONE,
      [MouseInput.MouseScroll]: BaseInput.CAMERA_SCROLL
    }
  },
  inputButtonBehaviors: {
    [BaseInput.PRIMARY]: {
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
    [BaseInput.SCREENXY]: {
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
xdescribe("buttons", () => {
  const clickPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(clickPoint1.x, clickPoint1.y, window.innerWidth, window.innerHeight);

  it ("sets input ON, STARTED", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();

    expect(input.data.has(BaseInput.PRIMARY)).toBeTruthy();
    const data1 = input.data.get(BaseInput.PRIMARY);
    expect(data1.value).toBe(BinaryValue.ON);
    expect(data1.lifecycleState).toBe(LifecycleValue.Started);
  });

  it ("triggered started behavior", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
  });

  it ("sets input OFF, ENDED", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mouseup' });
    execute();

    expect(input.data.has(BaseInput.PRIMARY)).toBeFalsy();
    // const data = input.data.get(BaseInput.PRIMARY);
    // expect(data.value).toBe(BinaryValue.OFF);
    // expect(data.lifecycleState).toBe(LifecycleValue.Ended);
  });

  it ("triggered ended behavior", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mouseup' });
    execute();
    expect(mockedBehaviorOnEnded.mock.calls.length).toBe(1);
  });

  it ("MouseClickDownPosition: sets SCREENXY_START STARTED", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    expect(input.data.has(BaseInput.SCREENXY_START)).toBeTruthy();
    const data1 = input.data.get(BaseInput.SCREENXY_START);
    expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
    expect(data1.lifecycleState).toBe(LifecycleValue.Started);
  });

  it ("MouseClickDownPosition: SCREENXY_START UNCHANGED", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute(); // started
    execute(); // should UNCHANGED
    execute(); // should not switch to CHANGED/ENDED/CONTINUED
    expect(input.data.has(BaseInput.SCREENXY_START)).toBeTruthy();
    const data1 = input.data.get(BaseInput.SCREENXY_START);
    expect(data1.lifecycleState).toBe(LifecycleValue.Unchanged);
  });

  it ("MouseClickDownPosition: sets SCREENXY_START to ENDED on release", () => {
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...clickPoint1, button: MouseInput.LeftButton,  type: 'mouseup' });
    execute();

    expect(input.data.has(BaseInput.SCREENXY_START)).toBeTruthy();
    const data1 = input.data.get(BaseInput.SCREENXY_START);
    expect(data1.lifecycleState).toBe(LifecycleValue.Ended);
  });
});

// check MouseMovement
xdescribe("movement", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  it ("triggers associated input STARTED", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute();

    expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
    const data1 = input.data.get(BaseInput.SCREENXY);
    expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
    expect(data1.lifecycleState).toBe(LifecycleValue.Started);
  });

  it ("triggered started behavior", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute();
    expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
  });

  it ("triggers associated input CHANGED", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute();
    triggerMouse({...windowPoint2, type: 'mousemove'});
    execute();

    expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
    const data2 = input.data.get(BaseInput.SCREENXY);
    expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Changed);
  });

  it ("triggered changed behavior", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute();
    triggerMouse({...windowPoint2, type: 'mousemove'});
    execute();
    expect(mockedBehaviorOnChanged.mock.calls.length).toBe(1);
  });

  it ("triggers input UNCHANGED from STARTED", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute(); // started
    execute(); // unchanged

    expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
    const data2 = input.data.get(BaseInput.SCREENXY);
    expect(data2.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Unchanged);
  });

  it ("triggers input UNCHANGED from CHANGED", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute();
    triggerMouse({...windowPoint2, type: 'mousemove'});
    execute(); // changed
    execute(); // unchanged

    expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
    const data2 = input.data.get(BaseInput.SCREENXY);
    expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Unchanged);
  });

  it ("triggered UNCHANGED behavior", () => {
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute();
    triggerMouse({...windowPoint2, type: 'mousemove'});
    execute(); // changed
    execute(); // unchanged
    expect(mockedBehaviorOnUnchanged.mock.calls.length).toBe(1);
  });
});

// buttons + move
// TODO: check who's sets MouseInput.MouseClickDownTransformRotation - BaseInput.ROTATION_START
// TODO: check that mousemove without button does not set MouseInput.MouseClickDownTransformRotation - BaseInput.ROTATION_START
// test("move does not set BaseInput.ROTATION_START", () => {
//
// })
xdescribe("button + movement", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  it ("triggers associated input STARTED", () => {
    triggerMouse({ ...windowPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...windowPoint2, type: 'mousemove' });
    execute();

    expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
    const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data2.value).toMatchObject([ 20, 5 ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Started);
  });

  it ("triggers associated input CHANGED", () => {
    triggerMouse({ ...windowPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...windowPoint2, type: 'mousemove' });
    execute(); // started
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute(); // changed

    expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
    const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data2.value).toMatchObject([ -20, -5 ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Changed);
  });

  it ("triggers associated input UNCHANGED", () => {
    triggerMouse({ ...windowPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...windowPoint2, type: 'mousemove' });
    execute(); // started
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute(); // changed
    execute(); // unchanged

    expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
    const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data2.value).toMatchObject([ -20, -5 ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Unchanged);
  });

  it ("not trigger CHANGED if button is released", () => {
    triggerMouse({ ...windowPoint1, button: MouseInput.LeftButton,  type: 'mousedown' });
    execute();
    triggerMouse({ ...windowPoint2, type: 'mousemove' });
    execute(); // started
    triggerMouse({ ...windowPoint2, button: MouseInput.LeftButton,  type: 'mouseup' });
    execute(); // mouse released
    triggerMouse({ ...windowPoint1, type: 'mousemove' });
    execute(); // should not be changed

    expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
    const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data2.value).toMatchObject([ 20, 5 ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.Unchanged);
  });

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
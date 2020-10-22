import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeEntity } from "../../src/ecs/functions/EntityFunctions";
import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { handleTouch } from "../../src/input/behaviors/handleTouch";
import { handleTouchMove } from "../../src/input/behaviors/handleTouchMove";
import { Input } from "../../src/input/components/Input";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { TouchInputs } from "../../src/input/enums/TouchInputs";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { InputSystem } from "../../src/input/systems/InputSystem";
import { DefaultInput } from "../../src/templates/shared/DefaultInput";

let addListenerMock:jest.SpyInstance;

const mockedButtonBehaviorOnStarted = jest.fn(() => { console.log('behavior call on started'); });
const mockedButtonBehaviorOnContinued = jest.fn(() => { console.log('behavior call on continued'); });
const mockedButtonBehaviorOnEnded = jest.fn(() => { console.log('behavior call on ended'); });

const mockedBehaviorOnStarted = jest.fn(() => { console.log('behavior call on started'); });
const mockedBehaviorOnEnded = jest.fn(() => { console.log('behavior call on ended'); });
const mockedBehaviorOnChanged = jest.fn(() => { console.log('behavior call on changed'); });
const mockedBehaviorOnUnChanged = jest.fn(() => { console.log('behavior call on unchanged'); });

const testInputSchema: InputSchema = {
  inputRelationships: {},
  onAdded: [],
  onRemoved: [],

  eventBindings: {
    // Touch
    touchstart: [
      {
        behavior: handleTouch,
        args: {
          value: BinaryValue.ON
        }
      }
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
  },
  touchInputMap: {
    axes: {
      [TouchInputs.Touch]: DefaultInput.PRIMARY,
      [TouchInputs.Touch1Move]: DefaultInput.SCREENXY,
      [TouchInputs.Touch2Move]: DefaultInput.LOOKTURN_PLAYERONE
    }
  },
  inputButtonBehaviors: {
    [DefaultInput.PRIMARY]: {
      started: [
        {
          behavior: mockedButtonBehaviorOnStarted
        }
      ],
      continued: [
        {
          behavior: mockedButtonBehaviorOnContinued
        }
      ],
      ended: [
        {
          behavior: mockedButtonBehaviorOnEnded
        }
      ]
    },
    [DefaultInput.SECONDARY]: {
      started: [
        {
          behavior: mockedButtonBehaviorOnStarted
        }
      ],
      continued: [
        {
          behavior: mockedButtonBehaviorOnContinued
        }
      ],
      ended: [
        {
          behavior: mockedButtonBehaviorOnEnded
        }
      ]
    }
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
          behavior: mockedBehaviorOnUnChanged
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

  mockedBehaviorOnStarted.mockClear();
  mockedBehaviorOnEnded.mockClear();
  mockedBehaviorOnChanged.mockClear();
  mockedBehaviorOnUnChanged.mockClear();
  mockedButtonBehaviorOnStarted.mockClear();
  mockedButtonBehaviorOnContinued.mockClear();
  mockedButtonBehaviorOnEnded.mockClear();
});
afterEach(() => {
  // cleanup
  removeEntity(entity, true);
});

// TODO: check that move of touches with different id does not interfere,
//  another Input type should be triggered by two touches, but SCREENXY doesn't

// move
xdescribe("movement", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  it ("lifecycle STARTED", () => {
    triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    execute();

    expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
    const data1 = input.data.get(DefaultInput.SCREENXY);
    expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
    expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);
    expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
  });

  it ("lifecycle CHANGED", () => {
    triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    execute();
    triggerTouch({...windowPoint2, type: 'touchmove', id: 1 });
    execute();

    expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
    const data2 = input.data.get(DefaultInput.SCREENXY);
    expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.CHANGED);
    expect(mockedBehaviorOnChanged.mock.calls.length).toBe(1);
  });

  it ("lifecycle UNCHANGED", () => {
    triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    execute();
    triggerTouch({ ...windowPoint2, type: 'touchmove', id: 1 });
    execute(); // changed
    execute(); // unchanged from previous execution

    expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
    const data2 = input.data.get(DefaultInput.SCREENXY);
    expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.UNCHANGED);
    expect(mockedBehaviorOnUnChanged.mock.calls.length).toBe(1);
  });

  xdescribe("simultaneous", () => {
    it ("lifecycle STARTED", () => {
      triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
      triggerTouch({ ...windowPoint2, type: 'touchstart', id: 2 });
      execute();

      const data1 = input.data.get(DefaultInput.SCREENXY);
      expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
      expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);

      const data2 = input.data.get(DefaultInput.LOOKTURN_PLAYERONE);
      expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
      expect(data2.lifecycleState).toBe(LifecycleValue.STARTED);

      expect(mockedBehaviorOnStarted.mock.calls.length).toBe(2);
    });
  });
});

// buttons + move
xdescribe("gestures", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  xdescribe("touch", () => {
    it ("lifecycle STARTED", () => {
      triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
      execute();

      expect(input.data.has(DefaultInput.PRIMARY)).toBeTruthy();
      const data1 = input.data.get(DefaultInput.PRIMARY);
      expect(data1.value).toBe(BinaryValue.ON);
      expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);
      expect(mockedButtonBehaviorOnStarted.mock.calls.length).toBe(1);
    });

    it ("lifecycle CONTINUED", () => {
      triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
      execute();
      execute();

      expect(input.data.has(DefaultInput.PRIMARY)).toBeTruthy();
      const data1 = input.data.get(DefaultInput.PRIMARY);
      expect(data1.value).toBe(BinaryValue.ON);
      expect(data1.lifecycleState).toBe(LifecycleValue.CONTINUED);
      expect(mockedButtonBehaviorOnContinued.mock.calls.length).toBe(1);
    });

    it ("lifecycle ENDED", () => {
      triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
      execute();
      triggerTouch({ ...windowPoint1, type: 'touchend', id: 1 });
      execute();

      expect(input.data.has(DefaultInput.PRIMARY)).toBeFalsy();
      expect(mockedButtonBehaviorOnEnded.mock.calls.length).toBe(1);
    });

    xdescribe("simultaneous", () => {
      it ("lifecycle CONTINUED when second touch starts and ends", () => {
        triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
        triggerTouch({ ...windowPoint2, type: 'touchstart', id: 2 });
        execute();
        triggerTouch({ ...windowPoint1, type: 'touchend', id: 2 });
        execute();

        expect(input.data.has(DefaultInput.PRIMARY)).toBeTruthy();
        const data1 = input.data.get(DefaultInput.SECONDARY);
        expect(data1.value).toBe(BinaryValue.ON);
        expect(data1.lifecycleState).toBe(LifecycleValue.CONTINUED);

        expect(mockedButtonBehaviorOnEnded.mock.calls.length).toBe(1);
      });
    });
  });
  // zoom
  // TODO: check Scale(Pinch)
});

function triggerTouch({ x, y, type, id = 0}: { x:number, y:number, type?:string, id?:number }):void {
  const touch = {
    identifier: id,
    target: document,
    clientX: x,
    clientY: y,
  };
  const touches = [
    touch
  ];

  const typeListenerCall = addListenerMock.mock.calls.find(call => call[0] === type);
  typeListenerCall[1]({
    type,
    changedTouches: touches,
    targetTouches: touches,
    touches: touches,
    view: window,
    cancelable: true,
    bubbles: true,
  });
}
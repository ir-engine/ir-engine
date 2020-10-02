import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/InputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeComponent, removeEntity } from "../../src/ecs/functions/EntityFunctions";
import { Input } from "../../src/input/components/Input";
import { CharacterInputSchema } from "../../src/templates/character/CharacterInputSchema";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { TouchInputs } from "../../src/input/enums/TouchInputs";
import { handleTouch, handleTouchMove } from "../../src/input/behaviors/TouchBehaviors";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { DefaultInput } from "../../src/templates/shared/DefaultInput";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";

let addListenerMock:jest.SpyInstance;

const mockedBehaviorOnStarted = jest.fn(() => { console.log('behavior call on started') });
const mockedBehaviorOnEnded = jest.fn(() => { console.log('behavior call on ended') });
const mockedBehaviorOnChanged = jest.fn(() => { console.log('behavior call on changed') });

const testInputSchema: InputSchema = {
  inputButtonBehaviors: {},
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
      [TouchInputs.Touch1]: DefaultInput.SCREENXY
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
      // unchanged: [
      //   {
      //     behavior: mockedBehaviorOnStarted
      //   }
      // ]
    }
  },
}

let entity, input

beforeAll(() => {
  addListenerMock = jest.spyOn(document, 'addEventListener')
  registerSystem(InputSystem, { useWebXR: false });
})

beforeEach(() => {
  // in each test we should have new clean entity with new clean input component (unpolluted by previous tests)
  entity = createEntity()
  input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input
  addComponent(entity, LocalInputReceiver)
  execute();

  mockedBehaviorOnStarted.mockClear()
  mockedBehaviorOnEnded.mockClear()
  mockedBehaviorOnChanged.mockClear()
})
afterEach(() => {
  // cleanup
  removeEntity(entity, true);
})

// move
// TODO: check Movement
describe("movement", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  it.skip ("triggers associated input STARTED", () => {
    triggerTouch({ ...windowPoint1, type: 'touchstart' })
    execute();

    expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
    const data1 = input.data.get(DefaultInput.SCREENXY);
    expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
    expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);
  })

  it.skip ("triggered started behavior", () => {
    triggerTouch({ ...windowPoint1, type: 'touchmove' })
    execute();
    expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1)
  })

  // TODO: check that move of touches with different id does not interfere,
  //  another Input type should be triggered by two touches, but SCREENXY doesn't
  it.skip ("triggers associated input CHANGED", () => {
    triggerTouch({ ...windowPoint1, type: 'touchstart' })
    execute();
    triggerTouch({...windowPoint2, type: 'touchmove'})
    execute();

    expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
    const data2 = input.data.get(DefaultInput.SCREENXY);
    expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
    expect(data2.lifecycleState).toBe(LifecycleValue.CHANGED);
  })

  it.skip ("triggered changed behavior", () => {
    triggerTouch({ ...windowPoint1, type: 'touchstart' })
    execute();
    triggerTouch({...windowPoint2, type: 'touchmove'})
    execute();
    expect(mockedBehaviorOnChanged.mock.calls.length).toBe(1)
  })
})

// buttons + move
// TODO: check who's sets MouseInput.MouseClickDownTransformRotation - DefaultInput.ROTATION_START
// TODO: check that mousemove without button does not set MouseInput.MouseClickDownTransformRotation - DefaultInput.ROTATION_START
// test("move does not set DefaultInput.ROTATION_START", () => {
//
// })

// zoom
// TODO: check Scale(Pinch)

function triggerTouch({ x, y, type, id = 0}: { x:number, y:number, type?:string, id?:number }):void {
  // const touch = new Touch({
  //   identifier: id,
  //   target: document,
  //   clientX: x,
  //   clientY: y,
  // });
  //
  // const touchEvent = new TouchEvent(type, {
  //   touches: [touch],
  //   view: window,
  //   cancelable: true,
  //   bubbles: true,
  // });
  //
  // document.dispatchEvent(touchEvent);


  const touch = {
    identifier: id,
    target: document,
    clientX: x,
    clientY: y,
  };
  const touches = [
    touch
  ];

  const typeListenerCall = addListenerMock.mock.calls.find(call => call[0] === type)
  typeListenerCall[1]({
    type,
    changedTouches: touches,
    targetTouches: touches,
    touches: touches,
    view: window,
    cancelable: true,
    bubbles: true,
  })
}
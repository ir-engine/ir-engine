import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/InputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeComponent, removeEntity } from "../../src/ecs/functions/EntityFunctions";
import { Input } from "../../src/input/components/Input";
import { CharacterInputSchema } from "../../src/templates/character/CharacterInputSchema";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { TouchInputs } from "../../src/input/enums/TouchInputs";
import { handleTouch } from "../../src/input/behaviors/handleTouch";
import { handleTouchMove } from "../../src/input/behaviors/handleTouchMove";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { DefaultInput } from "../../src/templates/shared/DefaultInput";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";
import { handleTouchScale } from "../../src/input/behaviors/handleTouchScale";
import { Vector2 } from "three";
import { Entity } from "../../src/ecs/classes/Entity";

let addListenerMock:jest.SpyInstance;

const mockedButtonBehaviorOnStarted = jest.fn(() => { console.log('behavior call on button started') });
const mockedButtonBehaviorOnContinued = jest.fn(() => { console.log('behavior call on button continued') });
const mockedButtonBehaviorOnEnded = jest.fn(() => { console.log('behavior call on button ended') });

const mockedBehaviorOnStarted = jest.fn(() => { console.log('behavior call on started') });
const mockedBehaviorOnEnded = jest.fn(() => { console.log('behavior call on ended') });
const mockedBehaviorOnChanged = jest.fn(() => { console.log('behavior call on changed') });
const mockedBehaviorOnUnChanged = jest.fn(() => { console.log('behavior call on unchanged') });

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
      },
      {
        behavior: handleTouchMove
      },
      {
        behavior: handleTouchScale,
        args: {
          value: DefaultInput.CAMERA_SCROLL
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
      },
      {
        behavior: handleTouchScale,
        args: {
          value: DefaultInput.CAMERA_SCROLL
        }
      }
    ]
  },
  touchInputMap: {
    buttons: {
      [TouchInputs.Touch]: DefaultInput.INTERACT,
    },
    axes: {
      [TouchInputs.Touch1Position]: DefaultInput.SCREENXY,
      [TouchInputs.Touch1Movement]: DefaultInput.LOOKTURN_PLAYERONE,
      [TouchInputs.Scale]: DefaultInput.CAMERA_SCROLL
    }
  },
  inputButtonBehaviors: {
    [DefaultInput.INTERACT]: {
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
}

let entity:Entity, input:Input;

beforeAll(() => {
  addListenerMock = jest.spyOn(document, 'addEventListener')
  registerSystem(InputSystem, { useWebXR: false });
})

beforeEach(() => {
  addListenerMock.mockClear();

  // in each test we should have new clean entity with new clean input component (unpolluted by previous tests)
  entity = createEntity()
  input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input
  addComponent(entity, LocalInputReceiver)
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

function normalizeMouseCoordinatesV2(vector:Vector2, elementWidth: number, elementHeight: number): Vector2 {
  const n = normalizeMouseCoordinates(vector.x, vector.y, elementWidth, elementHeight);
  return new Vector2(n.x, n.y);
}

// buttons + move
describe("gestures", () => {
  const windowPoint1_1 = new Vector2( 100, 20 );
  const normalPoint1_1 = normalizeMouseCoordinatesV2(windowPoint1_1, window.innerWidth, window.innerHeight);
  const windowPoint1_2 = new Vector2( 110, 30 );
  const normalPoint1_2 = normalizeMouseCoordinatesV2(windowPoint1_2, window.innerWidth, window.innerHeight);

  const windowPoint2_1 = new Vector2( 90, 10 );
  const normalPoint2_1 = normalizeMouseCoordinatesV2(windowPoint2_1, window.innerWidth, window.innerHeight);
  const windowPoint2_2 = new Vector2( 120, 40 );
  const normalPoint2_2 = normalizeMouseCoordinatesV2(windowPoint2_2, window.innerWidth, window.innerHeight);

  const distance1 = normalPoint1_1.distanceTo(normalPoint1_2);
  const distance2 = normalPoint2_1.distanceTo(normalPoint2_2);


// check Scale(Pinch)
  describe("touch scale", () => {
    it ("lifecycle STARTED", () => {
      let data
      triggerTouch({ touches: [ windowPoint1_1, windowPoint1_2 ], type: 'touchstart' });
      execute();
      triggerTouch({ touches: [ windowPoint2_1, windowPoint2_2 ], type: 'touchmove' });
      execute();

      expect(input.data.has(DefaultInput.CAMERA_SCROLL)).toBeTruthy();
      const data2 = input.data.get(DefaultInput.CAMERA_SCROLL);
      expect(data2.value).toBe((distance2 - distance1)*100);  // TODO: remove 100 multiplication after mouse scroll will be normalized (or divided by 100)

      // expect(data2.lifecycleState).toBe(LifecycleValue.CHANGED);
      //expect(mockedButtonBehaviorOnStarted.mock.calls.length).toBe(1);
    });
  });

  // zoom
  // TODO: check Scale(Pinch)
});


function triggerTouch({ touches, type}: { touches:{x:number,y:number,id?:number}[], type?:string }):void {
  // const touch1 = {
  //   identifier: touches[0].id,
  //   target: document,
  //   clientX: touches[0].x,
  //   clientY: touches[0].y,
  // };
  
  const _touches = touches.map(touch => {
    return {
      identifier: touch.id,
      target: document,
      clientX: touch.x,
      clientY: touch.y,
    };
  });

  const typeListenerCalls = addListenerMock.mock.calls.filter(call => call[0] === type);
  typeListenerCalls.forEach(typeListenerCall => {
    typeListenerCall[1]({
      type,
      changedTouches: _touches,
      targetTouches: _touches,
      touches: _touches,
      view: window,
      cancelable: true,
      bubbles: true,
    });
  });
}
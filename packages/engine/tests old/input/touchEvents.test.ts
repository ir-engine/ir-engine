import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/ClientInputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeComponent, removeEntity } from "../../src/ecs/functions/ComponentFunctions";
import { Input } from "../../src/input/components/Input";
import { AvatarInputSchema } from "../../src/avatar/AvatarInputSchema";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { TouchInputs } from "../../src/input/enums/InputEnums";
import { handleTouch } from "../../src/input/functions/handleTouch";
import { handleTouchMove } from "../../src/input/functions/handleTouchMove";
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput';
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";
import { Vector2 } from "three";
// import { handleTouchScale } from "../../src/input/functions/handleTouchScale";

function normalizeMouseCoordinatesV2(vector:Vector2, elementWidth: number, elementHeight: number): Vector2 {
  const n = normalizeMouseCoordinates(vector.x, vector.y, elementWidth, elementHeight);
  return new Vector2(n.x, n.y);
}

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
      // {
      //   behavior: handleTouchScale,
      //   args: {
      //     value: BaseInput.CAMERA_SCROLL
      //   }
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
      },
      // {
      //   behavior: handleTouchScale,
      //   args: {
      //     value: BaseInput.CAMERA_SCROLL
      //   }
      // }
    ],
  },
  touchInputMap: {
    buttons: {
      [TouchInputs.Touch]: BaseInput.INTERACT,
    },
    axes: {
      [TouchInputs.Touch1Position]: BaseInput.SCREENXY,
      [TouchInputs.Touch1Movement]: BaseInput.LOOKTURN_PLAYERONE,
      [TouchInputs.Scale]: BaseInput.CAMERA_SCROLL
    }
  },
  inputButtonBehaviors: {
    [BaseInput.INTERACT]: {
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
    [BaseInput.SECONDARY]: {
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
          behavior: mockedBehaviorOnUnChanged
        }
      ]
    }
  },
}

let entity, input

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

// TODO: check that move of touches with different id does not interfere,
//  another Input type should be triggered by two touches, but SCREENXY doesn't

// move
describe("move", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);
  const normalDiff = { x: normalPoint2.x - normalPoint1.x, y: normalPoint2.y - normalPoint1.y };
  // const windowPoint3 = { x: 140, y:30 };
  // const normalPoint3 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);

  describe.skip("position", () => {
    it ("lifecycle STARTED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
      execute();

      expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
      const data1 = input.data.get(BaseInput.SCREENXY);
      expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
      expect(data1.lifecycleState).toBe(LifecycleValue.Started);
      expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
    });

    it ("lifecycle CHANGED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
      execute();
      triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
      execute();
      // triggerTouch({...windowPoint3, type: 'touchmove', id: 1 })
      // execute();

      expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
      const data2 = input.data.get(BaseInput.SCREENXY);
      expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
      expect(data2.lifecycleState).toBe(LifecycleValue.Changed);
      expect(mockedBehaviorOnChanged.mock.calls.length).toBe(1);
    });

    it ("lifecycle UNCHANGED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
      execute();
      triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
      execute(); // changed
      execute(); // unchanged from previous execution

      expect(input.data.has(BaseInput.SCREENXY)).toBeTruthy();
      const data2 = input.data.get(BaseInput.SCREENXY);
      expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
      expect(data2.lifecycleState).toBe(LifecycleValue.Unchanged);
      expect(mockedBehaviorOnUnChanged.mock.calls.length).toBe(1);
    });

    // describe.skip("simultaneous", () => {
    //   it ("lifecycle STARTED", () => {
    //     triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    //     triggerTouch({ ...windowPoint2, type: 'touchstart', id: 2 });
    //     execute();
    //
    //     const data1 = input.data.get(BaseInput.SCREENXY);
    //     expect(data1.value).toMatchObject([ normalPoint1.x, normalPoint1.y ]);
    //     expect(data1.lifecycleState).toBe(LifecycleValue.Started);
    //
    //     const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    //     expect(data2.value).toMatchObject([ normalPoint2.x, normalPoint2.y ]);
    //     expect(data2.lifecycleState).toBe(LifecycleValue.Started);
    //
    //     expect(mockedBehaviorOnStarted.mock.calls.length).toBe(2);
    //   });
    // });
  })

  describe.skip("movement", () => {
    it ("lifecycle STARTED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
      execute();

      expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
      const data1 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
      expect(data1.value).toMatchObject([ 0, 0 ]);
      expect(data1.lifecycleState).toBe(LifecycleValue.Started);
      //expect(mockedBehaviorOnStarted.mock.calls.length).toBe(1);
    });

    it ("lifecycle CHANGED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
      execute();
      triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
      execute();

      expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
      const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
      expect(data2.value).toMatchObject([ normalDiff.x, normalDiff.y ]);
      expect(data2.lifecycleState).toBe(LifecycleValue.Changed);
      // expect(mockedBehaviorOnChanged.mock.calls.length).toBe(1);
    });

    it ("lifecycle UNCHANGED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
      execute();
      triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
      execute(); // changed
      execute(); // unchanged from previous execution

      expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
      const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
      expect(data2.value).toMatchObject([ normalDiff.x, normalDiff.y ]);
      expect(data2.lifecycleState).toBe(LifecycleValue.Unchanged);
      //expect(mockedBehaviorOnUnChanged.mock.calls.length).toBe(1);
    });

  })
});

// buttons + move
describe("gestures", () => {
  const windowPoint1 = { x: 100, y:20 };
  const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
  const windowPoint2 = { x: 120, y:25 };
  const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);
  const normalDiff = { x: normalPoint2.x - normalPoint1.x, y: normalPoint2.y - normalPoint1.y };

  describe.skip("touch", () => {
    it ("lifecycle STARTED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchstart' });
      execute();

      expect(input.data.has(BaseInput.INTERACT)).toBeTruthy();
      const data1 = input.data.get(BaseInput.INTERACT);
      expect(data1.value).toBe(BinaryValue.ON);
      expect(data1.lifecycleState).toBe(LifecycleValue.Started);
      expect(mockedButtonBehaviorOnStarted.mock.calls.length).toBe(1);
    });

    it ("lifecycle CONTINUED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchstart' });
      execute();
      execute();

      expect(input.data.has(BaseInput.INTERACT)).toBeTruthy();
      const data1 = input.data.get(BaseInput.INTERACT);
      expect(data1.value).toBe(BinaryValue.ON);
      expect(data1.lifecycleState).toBe(LifecycleValue.Continued);
      expect(mockedButtonBehaviorOnContinued.mock.calls.length).toBe(1);
    });

    it ("lifecycle ENDED", () => {
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchstart' });
      execute();
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchend' });
      execute();

      expect(input.data.has(BaseInput.INTERACT)).toBeFalsy();
      expect(mockedButtonBehaviorOnEnded.mock.calls.length).toBe(1);
    });

    // describe.skip("simultaneous", () => {
    //   it ("lifecycle CONTINUED when second touch starts and ends", () => {
    //     triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    //     triggerTouch({ ...windowPoint2, type: 'touchstart', id: 2 });
    //     execute();
    //     triggerTouch({ ...windowPoint1, type: 'touchend', id: 2 });
    //     execute();
    //
    //     expect(input.data.has(BaseInput.INTERACT)).toBeTruthy();
    //     const data1 = input.data.get(BaseInput.SECONDARY);
    //     expect(data1.value).toBe(BinaryValue.ON);
    //     expect(data1.lifecycleState).toBe(LifecycleValue.Continued);
    //
    //     expect(mockedButtonBehaviorOnEnded.mock.calls.length).toBe(1);
    //   });
    // });
  });

  describe.skip("touch drag", () => {
    it ("lifecycle STARTED", () => {
      let data
      triggerTouch({ touches: [ windowPoint1 ], type: 'touchstart' });
      execute();
      triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
      execute();

      expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
      const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
      expect(data2.value).toMatchObject([ normalDiff.x, normalDiff.y ]);
      expect(data2.lifecycleState).toBe(LifecycleValue.Changed);
      //expect(mockedButtonBehaviorOnStarted.mock.calls.length).toBe(1);
    });

    // it ("lifecycle CONTINUED", () => {
    //   triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    //   execute();
    //   execute();
    //
    //   expect(input.data.has(BaseInput.INTERACT)).toBeTruthy();
    //   const data1 = input.data.get(BaseInput.INTERACT);
    //   expect(data1.value).toBe(BinaryValue.ON);
    //   expect(data1.lifecycleState).toBe(LifecycleValue.Continued);
    //   expect(mockedButtonBehaviorOnContinued.mock.calls.length).toBe(1);
    // });
    //
    // it ("lifecycle ENDED", () => {
    //   triggerTouch({ ...windowPoint1, type: 'touchstart', id: 1 });
    //   execute();
    //   triggerTouch({ ...windowPoint1, type: 'touchend', id: 1 });
    //   execute();
    //
    //   expect(input.data.has(BaseInput.INTERACT)).toBeFalsy();
    //   expect(mockedButtonBehaviorOnEnded.mock.calls.length).toBe(1);
    // });
  });

  // zoom
  // TODO: check Scale(Pinch)
  describe.skip("touch scale", () => {
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

    it ("lifecycle STARTED", () => {
      let data
      triggerTouch({ touches: [ windowPoint1_1, windowPoint1_2 ], type: 'touchstart' });
      execute();
      triggerTouch({ touches: [ windowPoint2_1, windowPoint2_2 ], type: 'touchmove' });
      execute();

      expect(input.data.has(BaseInput.CAMERA_SCROLL)).toBeTruthy();
      const data2 = input.data.get(BaseInput.CAMERA_SCROLL);
      expect(data2.value).toBe((distance2 - distance1)*100);  // TODO: remove 100 multiplication after mouse scroll will be normalized (or divided by 100)

      // expect(data2.lifecycleState).toBe(LifecycleValue.Changed);
      //expect(mockedButtonBehaviorOnStarted.mock.calls.length).toBe(1);
    });
  });
});

describe.skip("special cases", () => {
  test("start+move happening between execute", () => {
    const windowPoint1 = { x: 10, y:20 };
    const normalPoint1 = normalizeMouseCoordinates(windowPoint1.x, windowPoint1.y, window.innerWidth, window.innerHeight);
    const windowPoint2 = { x: -12, y:-25 };
    const normalPoint2 = normalizeMouseCoordinates(windowPoint2.x, windowPoint2.y, window.innerWidth, window.innerHeight);
    const windowPoint3 = { x: 16, y:10 };
    const normalPoint3 = normalizeMouseCoordinates(windowPoint3.x, windowPoint3.y, window.innerWidth, window.innerHeight);
    const normalDiff1 = { x: normalPoint2.x - normalPoint1.x, y: normalPoint2.y - normalPoint1.y };
    const normalDiff2 = { x: normalPoint3.x - normalPoint2.x, y: normalPoint3.y - normalPoint2.y };
    const normalDiff1to3 = { x: normalPoint3.x - normalPoint1.x, y: normalPoint3.y - normalPoint1.y };


    triggerTouch({ touches: [ windowPoint1 ], type: 'touchstart' });
    triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
    execute();
    const data = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data.value).toMatchObject([ normalDiff1.x, normalDiff1.y ]);

    triggerTouch({ touches: [ windowPoint1 ], type: 'touchmove' });
    triggerTouch({ touches: [ windowPoint2 ], type: 'touchmove' });
    triggerTouch({ touches: [ windowPoint3 ], type: 'touchmove' });
    execute();

    expect(input.data.has(BaseInput.LOOKTURN_PLAYERONE)).toBeTruthy();
    const data2 = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data2.value).toMatchObject([ normalDiff2.x, normalDiff2.y ]);
  })

  test("subsequent moves between execute", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const points:Array<{ point: Vector2, move: Vector2, nPoint: Vector2, nMove: Vector2 }> = [];

    const normalizeCoordinatesV = (point:{x:number,y:number}, width:number, height:number):Vector2 => {
      const tmp = normalizeMouseCoordinates(point.x, point.y, width, height);
      return new Vector2(tmp.x, tmp.y);
    }

    const pointStart = new Vector2(100, 30);
    const pointEnd = pointStart.clone();
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      const move = new Vector2(5,2);
      const point = pointEnd.clone().add(move);
      const nPoint = normalizeCoordinatesV(point, width, height);
      const nPointPrev = normalizeCoordinatesV(pointEnd, width, height);
      const nMove = nPoint.clone().sub(nPointPrev);

      points.push({
        point,
        move,
        nPoint,
        nMove
      })
      pointEnd.copy(point);
    }

    const nMoveTotal = normalizeCoordinatesV(pointEnd, width, height).sub(normalizeCoordinatesV(pointStart, width, height));

    triggerTouch({ touches: [ pointStart ], type: 'touchmove' });
    execute();
    points.forEach(data => {
      triggerTouch({ touches: [ data.point ], type: 'touchmove' });
    })
    execute();
    const data = input.data.get(BaseInput.LOOKTURN_PLAYERONE);
    expect(data.value).toMatchObject(nMoveTotal.toArray());
  })
})

function triggerTouch({ touches, type}: { touches:{x:number,y:number,id?:number}[], type?:string }):void {
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

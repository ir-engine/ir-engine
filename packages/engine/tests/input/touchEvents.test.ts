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

let addListenerMock:jest.SpyInstance;

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
  inputAxisBehaviors: {},
}

test("transfers data from events", () => {
  addListenerMock = jest.spyOn(document, 'addEventListener')
  registerSystem(InputSystem, { useWebXR: false });
  const entity = createEntity()
  const input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input
  addComponent(entity, LocalInputReceiver)
  execute();

  triggerTouch({ x: 100, y:20, type: 'touchstart' })
  execute();

  expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
  const data1 = input.data.get(DefaultInput.SCREENXY);
  expect(data1.value).toMatchObject({x:100,y:20});
  expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);

  triggerTouch({ x: 100, y:20, type: 'touchend' })
  execute();

  expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
  const data2 = input.data.get(DefaultInput.SCREENXY);
  expect(data2.value).toMatchObject({x:100,y:20});
  expect(data2.lifecycleState).toBe(LifecycleValue.ENDED);

  execute();
  expect(input.data.has(DefaultInput.SCREENXY)).toBeFalsy();

  // cleanup
  removeEntity(entity, true);
  execute();
})

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
import { BinaryValue } from "../../src/common/enums/BinaryValue";
import { LifecycleValue } from "../../src/common/enums/LifecycleValue";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeEntity } from "../../src/ecs/functions/ComponentFunctions";
import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { handleKey } from "../../src/input/functions/handleKey";
import { Input } from "../../src/input/components/Input";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { InputSchema } from "../../src/input/interfaces/InputSchema";
import { InputSystem } from "../../src/input/systems/ClientInputSystem";
import { BaseInput } from '@xrengine/engine/src/input/enums/BaseInput';

let addListenerMock:jest.SpyInstance;

const testInputSchema: InputSchema = {
  inputButtonBehaviors: {},
  inputRelationships: {},
  onAdded: [],
  onRemoved: [],

  eventBindings: {
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
  },
  keyboardInputMap: {
    w: BaseInput.FORWARD,
    a: BaseInput.LEFT,
  },
  inputAxisBehaviors: {},
};

describe.skip('full lifecycle', () => {
  let entity, input;
  beforeAll(() => {
    addListenerMock = jest.spyOn(document, 'addEventListener');
    registerSystem(InputSystem, { useWebXR: false });
  });
  beforeEach(() => {
    addListenerMock.mockClear();
    entity = createEntity();
    input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input;
    addComponent(entity, LocalInputReceiver);
    execute();
  });
  afterEach(() => {
    // cleanup
    removeEntity(entity, true);
  });

  it("triggers associated input, ON, STARTED", () => {
    triggerKey({ key:'w', type: 'keydown' });
    execute(); // started
    triggerKey({ key:'w', type: 'keyup' });
    execute(); // ended
    triggerKey({ key:'w', type: 'keydown' });
    execute(); // stared

    expect(input.data.has(BaseInput.FORWARD)).toBeTruthy();
    const data1 = input.data.get(BaseInput.FORWARD);
    expect(data1.value).toBe(BinaryValue.ON);
    expect(data1.lifecycleState).toBe(LifecycleValue.Started);
  });

  it("on next execution switches CONTINUED", () => {
    triggerKey({ key:'w', type: 'keydown' });
    execute(); // started
    execute(); // continued

    const data1 = input.data.get(BaseInput.FORWARD);
    expect(data1.lifecycleState).toBe(LifecycleValue.Continued);
  });

  it("subsequent keydown triggers CONTINUED", () => {
    triggerKey({ key:'w', type: 'keydown' });
    execute();
    triggerKey({ key:'w', type: 'keydown' });
    execute();

    const data1 = input.data.get(BaseInput.FORWARD);
    expect(data1.lifecycleState).toBe(LifecycleValue.Continued);
  });

  it ("sets associated input to OFF, ENDED", () => {
    triggerKey({ key:'w', type: 'keydown' });
    execute();
    triggerKey({ key:'w', type: 'keyup' });
    execute();

    expect(input.data.has(BaseInput.FORWARD)).toBeFalsy();
    // const data2 = input.data.get(BaseInput.FORWARD);
    // expect(data2.value).toBe(BinaryValue.OFF);
    // expect(data2.lifecycleState).toBe(LifecycleValue.Ended);
  });

  // it("on next execution it's deleted", () => {
  //   execute();
  //   expect(input.data.has(BaseInput.FORWARD)).toBeFalsy();
  // })
});

function triggerKey({ key, type}: { key:string, type?:string }):void {

  const typeListenerCall = addListenerMock.mock.calls.find(call => call[0] === type);
  typeListenerCall[1]({
    type,
    key
  });
}
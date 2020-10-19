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
import { handleKey } from "../../src/input/behaviors/handleKey";

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
    w: DefaultInput.FORWARD,
    a: DefaultInput.LEFT,
  },
  inputAxisBehaviors: {},
}

describe('full lifecycle', () => {
  let entity, input
  beforeAll(() => {
    addListenerMock = jest.spyOn(document, 'addEventListener')
    registerSystem(InputSystem, { useWebXR: false });
  })
  beforeEach(() => {
    addListenerMock.mockClear()
    entity = createEntity()
    input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input
    addComponent(entity, LocalInputReceiver)
    execute();
  })
  afterEach(() => {
    // cleanup
    removeEntity(entity, true);
  })

  it("triggers associated input, ON, STARTED", () => {
    triggerKey({ key:'w', type: 'keydown' })
    execute(); // started
    triggerKey({ key:'w', type: 'keyup' })
    execute(); // ended
    triggerKey({ key:'w', type: 'keydown' })
    execute(); // stared

    expect(input.data.has(DefaultInput.FORWARD)).toBeTruthy();
    const data1 = input.data.get(DefaultInput.FORWARD);
    expect(data1.value).toBe(BinaryValue.ON);
    expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);
  })

  it("on next execution switches CONTINUED", () => {
    triggerKey({ key:'w', type: 'keydown' })
    execute(); // started
    execute(); // continued

    const data1 = input.data.get(DefaultInput.FORWARD);
    expect(data1.lifecycleState).toBe(LifecycleValue.CONTINUED);
  })

  it("subsequent keydown triggers CONTINUED", () => {
    triggerKey({ key:'w', type: 'keydown' })
    execute();
    triggerKey({ key:'w', type: 'keydown' })
    execute();

    const data1 = input.data.get(DefaultInput.FORWARD);
    expect(data1.lifecycleState).toBe(LifecycleValue.CONTINUED);
  })

  it ("sets associated input to OFF, ENDED", () => {
    triggerKey({ key:'w', type: 'keydown' })
    execute();
    triggerKey({ key:'w', type: 'keyup' })
    execute();

    expect(input.data.has(DefaultInput.FORWARD)).toBeFalsy()
    // const data2 = input.data.get(DefaultInput.FORWARD);
    // expect(data2.value).toBe(BinaryValue.OFF);
    // expect(data2.lifecycleState).toBe(LifecycleValue.ENDED);
  })

  // it("on next execution it's deleted", () => {
  //   execute();
  //   expect(input.data.has(DefaultInput.FORWARD)).toBeFalsy();
  // })
})

function triggerKey({ key, type}: { key:string, type?:string }):void {

  const typeListenerCall = addListenerMock.mock.calls.find(call => call[0] === type)
  typeListenerCall[1]({
    type,
    key
  })
}
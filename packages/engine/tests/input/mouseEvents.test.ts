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
import { MouseInput } from "../../src/input/enums/MouseInput";
import { preventDefault } from "../../src/common/functions/preventDefault";
import { handleMouseMovement } from "../../src/input/behaviors/handleMouseMovement";
import { handleMouseButton } from "../../src/input/behaviors/handleMouseButton";
import { handleMouseWheel } from "../../src/input/behaviors/handleMouseWheel";

let addListenerMock:jest.SpyInstance;

const testInputSchema: InputSchema = {
  inputButtonBehaviors: {},
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
    wheel: [
      {
        behavior: handleMouseWheel,
        args: {
          value: DefaultInput.CAMERA_SCROLL
        }
      }
    ],
  },
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
      [MouseInput.MouseClickDownTransformRotation]: DefaultInput.ROTATION_START,
      [MouseInput.MouseScroll]: DefaultInput.CAMERA_SCROLL
    }
  },
  inputAxisBehaviors: {},
}

// TODO: check mouse button sets MouseInput.MouseClickDownPosition - DefaultInput.SCREENXY_START
// TODO: check who's sets MouseInput.MouseClickDownTransformRotation - DefaultInput.ROTATION_START
// TODO: check MouseScroll
// TODO: check MouseMovement

test("transfers data from events", () => {
  console.log('window.innerWidth', window.innerWidth)
  console.log('window.innerHeight', window.innerHeight)

  addListenerMock = jest.spyOn(document, 'addEventListener')
  registerSystem(InputSystem, { useWebXR: false });
  const entity = createEntity()
  const input = addComponent<Input>(entity, Input, { schema: testInputSchema }) as Input
  addComponent(entity, LocalInputReceiver)
  execute();

  triggerMouse({ x: 100, y:20, type: 'mousemove' })
  execute();

  expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
  const data1 = input.data.get(DefaultInput.SCREENXY);
  expect(data1.value).toMatchObject({x:100,y:20});
  expect(data1.lifecycleState).toBe(LifecycleValue.STARTED);

  triggerMouse({ x: 120, y:25, type: 'mousemove' })
  execute();

  expect(input.data.has(DefaultInput.SCREENXY)).toBeTruthy();
  const data2 = input.data.get(DefaultInput.SCREENXY);
  expect(data2.value).toMatchObject({x:120,y:25});
  expect(data2.lifecycleState).toBe(LifecycleValue.ENDED);

  execute();
  expect(input.data.has(DefaultInput.SCREENXY)).toBeFalsy();

  // cleanup
  removeEntity(entity, true);
  execute();
})

function triggerMouse({ x, y, type}: { x:number, y:number, type?:string }):void {
  const typeListenerCall = addListenerMock.mock.calls.find(call => call[0] === type)
  typeListenerCall[1]({
    type,
    target: document,
    clientX: x,
    clientY: y,
    view: window,
    cancelable: true,
    bubbles: true,
  })
}
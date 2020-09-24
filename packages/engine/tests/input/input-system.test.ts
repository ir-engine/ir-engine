import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/InputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeComponent } from "../../src/ecs/functions/EntityFunctions";
import { Input } from "../../src/input/components/Input";
import { CharacterInputSchema } from "../../src/templates/character/CharacterInputSchema";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";

test("cleanup event listeners", () => {
  const addListener = jest.spyOn(document, 'addEventListener')
  const removeListener = jest.spyOn(document, 'removeEventListener')

  registerSystem(InputSystem, { useWebXR: false });
  const entity = createEntity()
  addComponent(entity, Input, { schema: CharacterInputSchema })
  addComponent(entity, LocalInputReceiver)
  execute();

  expect(removeListener.mock.calls.length).toBe(0)
  expect(addListener.mock.calls.length).toBeGreaterThan(0)

  removeComponent(entity, Input)
  execute();

  // run through mocked addListener.mock.calls there should be parameters listed,
  // add callbacks to Set, then loop removeListener.mock.calls and remove their callbacks from Set,
  // in the end Set should be empty
  const listenersSet:Set<Function> = new Set()
  addListener.mock.calls.forEach((call:any) => listenersSet.add(call[1]))
  removeListener.mock.calls.forEach((call:any) => listenersSet.delete(call[1]))

  expect(listenersSet.size).toBe(0)
})
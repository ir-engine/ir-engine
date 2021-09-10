import { registerSystem } from "../../src/ecs/functions/SystemFunctions";
import { InputSystem } from "../../src/input/systems/ClientInputSystem";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, removeComponent } from "../../src/ecs/functions/ComponentFunctions";
import { Input } from "../../src/input/components/Input";
import { AvatarInputSchema } from "../../src/avatar/AvatarInputSchema";
import { LocalInputReceiver } from "../../src/input/components/LocalInputReceiver";
import { normalizeMouseCoordinates } from "../../src/common/functions/normalizeMouseCoordinates";
import { normalizeMouseMovement } from "../../src/common/functions/normalizeMouseMovement";

test.skip("cleanup event listeners", () => {
  const addListener = jest.spyOn(document, 'addEventListener');
  const removeListener = jest.spyOn(document, 'removeEventListener');

  registerSystem(InputSystem, { useWebXR: false });
  const entity = createEntity();
  addComponent(entity, Input, { schema: AvatarInputSchema });
  addComponent(entity, LocalInputReceiver);
  execute();

  expect(removeListener.mock.calls.length).toBe(0);
  expect(addListener.mock.calls.length).toBeGreaterThan(0);

  removeComponent(entity, Input);
  execute();

  // run through mocked addListener.mock.calls there should be parameters listed,
  // add callbacks to Set, then loop removeListener.mock.calls and remove their callbacks from Set,
  // in the end Set should be empty
  const listenersSet:Set<Function> = new Set();
  addListener.mock.calls.forEach((call:any) => listenersSet.add(call[1]));
  removeListener.mock.calls.forEach((call:any) => listenersSet.delete(call[1]));

  expect(listenersSet.size).toBe(0);
});

describe("coordinates", () => {
  const PointWH0 = { x: 0, y:0 };
  const PointWEnd = { x: window.innerWidth, y:0 };
  const PointHEnd = { x: 0, y:window.innerHeight };

  test("normalized coordinates", () => {
    expect(normalizeMouseCoordinates(PointWH0.x, PointWH0.y, window.innerWidth, window.innerHeight)).toMatchObject({ x:-1, y: 1})
    expect(normalizeMouseCoordinates(PointWEnd.x, PointWEnd.y, window.innerWidth, window.innerHeight)).toMatchObject({ x:1, y: 1})
    expect(normalizeMouseCoordinates(PointHEnd.x, PointHEnd.y, window.innerWidth, window.innerHeight)).toMatchObject({ x:-1, y: -1})
  })

  test("normalized delta", () => {
    expect(normalizeMouseMovement(PointWH0.x, PointWH0.y, window.innerWidth, window.innerHeight)).toMatchObject({ x:0, y: 0})
    expect(normalizeMouseMovement(PointWEnd.x, PointWEnd.y, window.innerWidth, window.innerHeight)).toMatchObject({ x:2, y: 0})
    expect(normalizeMouseMovement(PointHEnd.x, PointHEnd.y, window.innerWidth, window.innerHeight)).toMatchObject({ x:0, y: 2})
  })
})

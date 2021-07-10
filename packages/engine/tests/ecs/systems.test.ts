import { System } from "../../src/ecs/classes/System";
import { Component } from "../../src/ecs/classes/Component";
import { registerSystem, unregisterSystem } from "../../src/ecs/functions/SystemFunctions";
import { Engine } from "../../src/ecs/classes/Engine";

class TestComponent extends Component<TestComponent> {}

class TestSystem extends System {
  execute(delta: number, time: number): void {}
}

TestSystem.queries = {
  test: {
    components: [TestComponent],
    listen: {
      added: true,
      removed: true
    }
  }
};

test("unregisterSystem", () => {
  registerSystem(TestSystem)
  unregisterSystem(TestSystem)
  expect(Engine.systems.length).toBe(0)
  expect(Engine.activeSystems[TestSystem.instance.updateType].length).toBe(0)
})
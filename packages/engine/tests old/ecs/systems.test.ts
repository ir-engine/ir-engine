import { System } from "../../src/ecs/System";
import { Component } from "../../src/ecs/Component";
import { registerSystem, unregisterSystem } from "../../src/ecs/SystemFunctions";
import { Engine } from "../../src/ecs/Engine";

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
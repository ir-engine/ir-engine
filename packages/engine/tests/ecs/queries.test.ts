import { System } from "../../src/ecs/classes/System";
import { Component } from "../../src/ecs/classes/Component";
import { registerSystem, unregisterSystem } from "../../src/ecs/functions/SystemFunctions";
import {
  addComponent,
  createEntity,
  removeEntity,
  removeComponent,
  getMutableComponent
} from "../../src/ecs/functions/EntityFunctions";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { Types } from "../../src/ecs/types/Types";

class TestComponent extends Component<TestComponent> {}
TestComponent.schema = {
  value: { type: Types.Number, default: 0 },
};


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

describe("add component", () => {
  let entity, system
  beforeEach(() => {
    system = registerSystem(TestSystem)
    entity = createEntity()
  })
  afterEach(() => {
    removeEntity(entity, true)
    unregisterSystem(TestSystem)
  })

  it("adds entity into query .added and .all", () => {
    addComponent(entity, TestComponent)
    expect(system.queryResults.test.all.length).toBe(1)
    expect(system.queryResults.test.added.length).toBe(1)
    expect(system.queryResults.test.changed.length).toBe(0)
    expect(system.queryResults.test.removed.length).toBe(0)
  })

  it("removes from .added on next execution", () => {
    addComponent(entity, TestComponent)
    execute()
    expect(system.queryResults.test.all.length).toBe(1)
    expect(system.queryResults.test.added.length).toBe(0)
    expect(system.queryResults.test.changed.length).toBe(0)
    expect(system.queryResults.test.removed.length).toBe(0)
  })
})

describe("remove component", () => {
  let entity, system
  beforeEach(() => {
    system = registerSystem(TestSystem)
    entity = createEntity()
    addComponent(entity, TestComponent)
    execute() // handle added
  })
  afterEach(() => {
    removeEntity(entity, true)
    unregisterSystem(TestSystem)
  })

  it("adds entity into query .removed", () => {
    removeComponent(entity, TestComponent)
    expect(system.queryResults.test.all.length).toBe(0)
    expect(system.queryResults.test.added.length).toBe(0)
    expect(system.queryResults.test.changed.length).toBe(0)
    expect(system.queryResults.test.removed.length).toBe(1)
  })

  it("removes from .removed and .all on next execution", () => {
    removeComponent(entity, TestComponent)
    execute()
    expect(system.queryResults.test.all.length).toBe(0)
    expect(system.queryResults.test.added.length).toBe(0)
    expect(system.queryResults.test.changed.length).toBe(0)
    expect(system.queryResults.test.removed.length).toBe(0)
  })
})

describe("change component", () => {
  let entity, system
  beforeEach(() => {
    system = registerSystem(TestSystem)
    entity = createEntity()
    addComponent(entity, TestComponent)
    execute() // handle added
  })
  afterEach(() => {
    removeEntity(entity, true)
    unregisterSystem(TestSystem)
  })

  it("adds entity into query .changed", () => {
    const component = getMutableComponent(entity, TestComponent) as any
    component.value += 1

    expect(system.queryResults.test.all.length).toBe(1)
    expect(system.queryResults.test.added.length).toBe(0)
    expect(system.queryResults.test.changed.length).toBe(1)
    expect(system.queryResults.test.removed.length).toBe(0)
  })

  it("removes from .changed on next execution", () => {
    const component = getMutableComponent(entity, TestComponent) as any
    component.value += 1

    expect(system.queryResults.test.changed.length).toBe(1)

    execute()

    expect(system.queryResults.test.all.length).toBe(1)
    expect(system.queryResults.test.added.length).toBe(0)
    expect(system.queryResults.test.changed.length).toBe(0)
    expect(system.queryResults.test.removed.length).toBe(0)
  })
})
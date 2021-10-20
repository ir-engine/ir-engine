import { System } from "../../src/ecs/classes/System";
import { Component } from "../../src/ecs/classes/Component";
import { registerSystem, unregisterSystem } from "../../src/ecs/functions/SystemFunctions";
import {
  addComponent,
  createEntity,
  removeEntity,
  removeComponent,
  getMutableComponent, hasComponent, hasAllComponents, hasAnyComponents
} from "../../src/ecs/functions/ComponentFunctions";
import { execute } from "../../src/ecs/functions/EngineFunctions";
import { Types } from "../../src/ecs/types/Types";
import { Not } from "../../src/ecs/functions/ComponentFunctions";

class TestComponent extends Component<TestComponent> {}
TestComponent._schema = {
  value: { type: Types.Number, default: 0 },
};

class UnwantedComponent extends Component<TestComponent> {}


class TestSystem extends System {
  execute(delta: number, time: number): void {

  }
}

TestSystem.queries = {
  test: {
    components: [TestComponent],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  },
  testNot: {
    components: [ TestComponent, Not(UnwantedComponent) ],
    listen: {
      added: true,
      removed: true
    }
  },
};

let entity, system
beforeEach(() => {
  system = registerSystem(TestSystem)
  entity = createEntity()
})
afterEach(() => {
  if (entity) {
    removeEntity(entity, true)
  }
  unregisterSystem(TestSystem)
})

describe("add component", () => {
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
  beforeEach(() => {
    addComponent(entity, TestComponent)
    execute() // handle added
  })

  it("removes component from entity", () => {
    expect(hasComponent(entity, TestComponent)).toBe(true)
    removeComponent(entity, TestComponent)
    expect(hasComponent(entity, TestComponent)).toBe(false)
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

test("entity deletion should trigger .removed", () => {
  addComponent(entity, TestComponent)
  execute() // handle added

  // initial state
  expect(system.queryResults.test.all.length).toBe(1)
  expect(system.queryResults.test.added.length).toBe(0)
  expect(system.queryResults.test.changed.length).toBe(0)
  expect(system.queryResults.test.removed.length).toBe(0)

  removeEntity(entity, true)

  // in .removed
  expect(system.queryResults.test.all.length).toBe(0)
  expect(system.queryResults.test.added.length).toBe(0)
  expect(system.queryResults.test.changed.length).toBe(0)
  expect(system.queryResults.test.removed.length).toBe(1)

  execute()

  // removed from system completely
  expect(system.queryResults.test.all.length).toBe(0)
  expect(system.queryResults.test.added.length).toBe(0)
  expect(system.queryResults.test.changed.length).toBe(0)
  expect(system.queryResults.test.removed.length).toBe(0)

  entity = null
})

describe("change component", () => {
  beforeEach(() => {
    addComponent(entity, TestComponent)
    execute() // handle added
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

describe("modifier Not. [TestComponent, Not(UnwantedComponent)]", () => {

  it("TestComponent = +", () => {
    expect(system.queryResults.testNot.all.length).toBe(0)
    addComponent(entity, TestComponent)
    expect(system.queryResults.testNot.all.length).toBe(1)
  })

  it("[UnwantedComponent,TestComponent]-UnwantedComponent = +", () => {
    expect(system.queryResults.testNot.all.length).toBe(0)
    addComponent(entity, UnwantedComponent)
    addComponent(entity, TestComponent)

    removeComponent(entity, UnwantedComponent)

    expect(system.queryResults.testNot.all.length).toBe(1)
  })

  it("[UnwantedComponent,TestComponent] -", () => {
    expect(system.queryResults.testNot.all.length).toBe(0)
    addComponent(entity, UnwantedComponent)
    addComponent(entity, TestComponent)
    expect(system.queryResults.testNot.all.length).toBe(0)
  })

  it("[TestComponent,UnwantedComponent] -", () => {
    expect(system.queryResults.testNot.all.length).toBe(0)
    addComponent(entity, TestComponent)
    addComponent(entity, UnwantedComponent)

    expect(system.queryResults.testNot.all.length).toBe(0)
  })
})

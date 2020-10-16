import { Component } from "../../src/ecs/classes/Component";
import { Types } from "../../src/ecs/types/Types";
import { System } from "../../src/ecs/classes/System";
import {
  getComponent,
  hasComponent, removeEntity,
} from "../../src/ecs/functions/EntityFunctions";
import { registerSystem, unregisterSystem } from "../../src/ecs/functions/SystemFunctions";
import { createPrefab } from "../../src/common/functions/createPrefab";
import { Entity } from "../../src/ecs/classes/Entity";

const onCreate = jest.fn((entity:Entity) => { return entity.componentTypes.length });
const onAfterCreate = jest.fn((entity:Entity) => { return entity.componentTypes.length });

class TestComponent extends Component<TestComponent> {
  value:number
}
TestComponent.schema = {
  value: { type: Types.Number, default: 0 },
};
class TestComponent2 extends Component<TestComponent> {}

class TestSystem extends System {
  execute(delta: number, time: number): void {
  }
}

TestSystem.queries = {
  test: {
    components: [TestComponent],
    listen: {
      added: true,
      changed: true
    }
  }
};

let system, entity
beforeEach(() => {
  console.log('BeforeEach')
  system = registerSystem(TestSystem)
  entity = createTestPrefab();
})
afterEach(() => {
  console.log('AfterEach')
  removeEntity(entity, true)
  unregisterSystem(TestSystem)
  onCreate.mockClear()
  onAfterCreate.mockClear()
})

const onCreateArgs = { testing: true }
const onAfterCreateArgs = { testing: true, another: true }
function createTestPrefab() {
  return createPrefab({
    onCreate: [
      {
        behavior: onCreate,
        args: onCreateArgs
      },
      {
        behavior: onCreate,
        args: onCreateArgs
      }
    ],
    onAfterCreate: [
      {
        behavior: onAfterCreate,
        args: onAfterCreateArgs
      },
      {
        behavior: onAfterCreate,
        args: onAfterCreateArgs
      }
    ],
    components: [
      {
        type: TestComponent,
        data: {
          value: 42
        }
      },
      {
        type: TestComponent2
      }
    ]
  })
}

it ("runs onCreate", () => {
  expect(onCreate).toBeCalledTimes(2)
  expect(onCreate).toBeCalledWith(entity, onCreateArgs)
  expect(onCreate).toReturnWith(0)
})

it ("runs onAfterCreate", () => {
  expect(onAfterCreate).toBeCalledTimes(2)
  expect(onAfterCreate).toBeCalledWith(entity, onAfterCreateArgs)
  expect(onAfterCreate).toReturnWith(2)
})

it ("fills components with data", () => {
  expect(hasComponent(entity, TestComponent)).toBe(true)
  expect(hasComponent(entity, TestComponent2)).toBe(true)

  const component = getComponent(entity, TestComponent) as TestComponent
  expect(component.value).toBe(42)
})

it ("queries receive components as added", () => {
  expect(system.queryResults.test.all.length).toBe(1)
  expect(system.queryResults.test.added.length).toBe(1)
  expect(system.queryResults.test.changed.length).toBe(0)
})
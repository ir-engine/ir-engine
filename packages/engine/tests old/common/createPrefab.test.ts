import { Component } from "../../src/ecs/classes/Component";
import { Types } from "../../src/ecs/types/Types";
import { System } from "../../src/ecs/classes/System";
import {
  getComponent,
  hasComponent, removeEntity,
} from "../../src/ecs/functions/ComponentFunctions";
import { registerSystem, unregisterSystem } from "../../src/ecs/functions/SystemFunctions";
import { createPrefab } from "../../src/common/functions/createPrefab";
import { Entity } from "../../src/ecs/classes/Entity";
import { Quaternion, Vector3, Scene } from "three";
import { interactiveBox } from "../../src/templates/interactive/prefabs/interactiveBox";
import { TransformComponent } from "../../src/transform/components/TransformComponent";
import { Engine } from "../../src/ecs/classes/Engine";

const onCreate = jest.fn((entity:Entity) => { return entity.componentTypes.length });
const onAfterCreate = jest.fn((entity:Entity) => { return entity.componentTypes.length });

class TestComponent extends Component<TestComponent> {
  value:number;
  position: Vector3;
  rotation: Quaternion;
}
TestComponent._schema = {
  value: { type: Types.Number, default: 0 },
  position: { type: Types.Ref, default: new Vector3(1,2,3)},
  rotation: { type: Types.Ref, default: new Quaternion(1,2,3, 4)}
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
    onBeforeCreate: [
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
    localClientComponents: [
      {
        type: TestComponent,
        data: {
          position: [4,5,6],
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
  expect(component.position).toMatchObject(new Vector3(4,5,6))
  expect(component.rotation).toMatchObject(new Quaternion(1,2,3, 4))
})

it ("queries receive components as added", () => {
  expect(system.queryResults.test.all.length).toBe(1)
  expect(system.queryResults.test.added.length).toBe(1)
  expect(system.queryResults.test.changed.length).toBe(0)
})

describe("special case", () => {
  test("interactiveBox rotation?", () => {
    Engine.scene = new Scene();
    const iBox = createPrefab(interactiveBox);
    const transformComponent = getComponent(iBox, TransformComponent);
    expect(transformComponent.position).toBeInstanceOf(Vector3);
    expect(transformComponent.rotation).toBeInstanceOf(Quaternion);
    expect(transformComponent.velocity).toBeInstanceOf(Vector3);
  })
})
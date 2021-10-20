import { addComponent, createEntity, hasComponent, removeComponent, removeEntity } from "../../src/ecs/functions/ComponentFunctions";
import * as ComponentFunctions from "../../src/ecs/functions/ComponentFunctions";
import * as ComponentFunctions from "../../src/ecs/functions/ComponentFunctions";
import { Component } from "../../src/ecs/classes/Component";
import { SystemStateComponent } from "../../src/ecs/classes/SystemStateComponent";
import { Entity } from "../../src/ecs/classes/Entity";
import { Quaternion, Vector3 } from "three";
import { Types } from "../../src/ecs/types/Types";
import { TransformComponent } from "../../src/transform/components/TransformComponent";

class TestComponent1 extends Component<TestComponent1> { }
class TestComponent2 extends Component<TestComponent2> { }
class TestSystemStateComponent1 extends Component<TestSystemStateComponent1> { }
class TestSystemStateComponent2 extends SystemStateComponent<TestSystemStateComponent2> { }
class TestComponentWithData extends Component<TestComponentWithData> {
  count: number;
  title: string;
  position: Vector3;
  rotation: Quaternion;
}

TestComponentWithData._schema = {
  count: { default: 123, type: Types.Number },
  title: { default: "test string", type: Types.String },
  position: { default: new Vector3(1,2,3), type: Types.Ref },
  rotation: { default: new Quaternion(1,2,3,4), type: Types.Ref },
}

describe("add component", () => {
  let entity:Entity = null
  beforeEach(() => {
    entity = createEntity()
  })
  afterEach(() => {
    jest.restoreAllMocks()
    removeEntity(entity, true)
  })

  it("registers component on add", () => {
    class UniqueTestComponent extends Component<UniqueTestComponent> { }

    const registerComponentMock = jest.spyOn(ComponentFunctions, 'registerComponent')

    addComponent(entity, UniqueTestComponent)
    removeComponent(entity, UniqueTestComponent, true)
    addComponent(entity, UniqueTestComponent)

    expect(registerComponentMock).toBeCalledTimes(1)
    expect(ComponentFunctions.componentRegistered(UniqueTestComponent)).toBe(true)
  })

  it("adds component", () => {
    addComponent(entity, TestComponent1)
    expect(hasComponent(entity, TestComponent1)).toBe(true)
  })

  it("added component have default values populated", () => {
    const component = addComponent(entity, TestComponentWithData) as TestComponentWithData;

    expect(component.count).toBe(123)
    expect(component.title).toBe('test string')
    expect(component.position).toMatchObject(new Vector3(1,2,3))
    expect(component.rotation).toMatchObject(new Quaternion(1,2,3,4))
  })

  it("added component with partial initial data have default values populated", () => {
    const partialData = {
      count: 999,
      position: new Vector3(4,5,6)
    }
    const component = addComponent(entity, TestComponentWithData, partialData) as TestComponentWithData;

    expect(component.count).toBe(999)
    expect(component.title).toBe('test string')
    expect(component.position).toMatchObject(new Vector3(4,5,6))
    expect(component.rotation).toMatchObject(new Quaternion(1,2,3,4))
  })

  it("TransformComponent?", () => {
    const partialData = {
      position: new Vector3(4,5,6)
    }
    const component = addComponent(entity, TransformComponent, partialData) as TransformComponent;

    expect(component.position).toMatchObject(new Vector3(4,5,6))
    expect(component.rotation).toBeInstanceOf(Quaternion)
  })

  it("created component matches it's constructor typeId", () => {
    const entity2 = createEntity()
    const component1 = addComponent(entity, TestComponent1)
    const component1copy = addComponent(entity2, TestComponent1)
    const component2 = addComponent(entity, TestComponent2)
    expect(component1._typeId).toBe(TestComponent1._typeId)
    expect(component1copy._typeId).toBe(TestComponent1._typeId)
    expect(component2._typeId).toBe(TestComponent2._typeId)

    removeEntity(entity2, true)
  })
})

describe("remove component", () => {
  let entity:Entity = null
  beforeEach(() => {
    entity = createEntity()
  })
  afterEach(() => {
    jest.restoreAllMocks()
    removeEntity(entity, true)
  })

  it("removes", () => {
    addComponent(entity, TestComponent1)
    addComponent(entity, TestComponent2)
    removeComponent(entity, TestComponent1)
    expect(hasComponent(entity, TestComponent1)).toBeFalsy()
    expect(hasComponent(entity, TestComponent2)).toBeTruthy()
  })

  it("does not delete entity with last SystemStateComponent deleted, if there are other Components left", () => {
    const removeEntityMock = jest.spyOn(ComponentFunctions, 'removeEntity')

    addComponent(entity, TestComponent1)
    addComponent(entity, TestSystemStateComponent1)

    removeComponent(entity, TestSystemStateComponent1)

    expect(removeEntityMock).not.toBeCalled()
  })

  it.skip("delete entity with last SystemStateComponent deleted, if there is no other components", () => {
    const removeEntityMock = jest.spyOn(ComponentFunctions, 'removeEntity')

    addComponent(entity, TestSystemStateComponent1)
    addComponent(entity, TestSystemStateComponent2)

    removeComponent(entity, TestSystemStateComponent1)
    removeComponent(entity, TestSystemStateComponent2)

    expect(removeEntityMock).toBeCalledTimes(1)
  })
})


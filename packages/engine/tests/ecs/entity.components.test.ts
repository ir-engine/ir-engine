import { addComponent, createEntity, hasComponent, removeComponent, removeEntity } from "../../src/ecs/functions/EntityFunctions";
import * as EntityFunctions from "../../src/ecs/functions/EntityFunctions";
import * as ComponentFunctions from "../../src/ecs/functions/ComponentFunctions";
import { Component } from "../../src/ecs/classes/Component";
import { SystemStateComponent } from "../../src/ecs/classes/SystemStateComponent";
import { Entity } from "../../src/ecs/classes/Entity";

class TestComponent1 extends Component<TestComponent1> { }
class TestComponent2 extends Component<TestComponent2> { }
class TestSystemStateComponent1 extends Component<TestSystemStateComponent1> { }
class TestSystemStateComponent2 extends SystemStateComponent<TestSystemStateComponent2> { }

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
    let removeEntityMock = jest.spyOn(EntityFunctions, 'removeEntity')

    addComponent(entity, TestComponent1)
    addComponent(entity, TestSystemStateComponent1)

    removeComponent(entity, TestSystemStateComponent1)

    expect(removeEntityMock).not.toBeCalled()
  })

  it("delete entity with last SystemStateComponent deleted, if there is no other components", () => {
    let removeEntityMock = jest.spyOn(EntityFunctions, 'removeEntity')

    addComponent(entity, TestSystemStateComponent1)
    addComponent(entity, TestSystemStateComponent2)

    removeComponent(entity, TestSystemStateComponent1)
    removeComponent(entity, TestSystemStateComponent2)

    expect(removeEntityMock).toBeCalledTimes(1)
  })
})


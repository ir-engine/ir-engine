import { AmbientLight } from "three";
import { Prefab } from "../src/common/interfaces/Prefab";
import { Component } from "../src/ecs/classes/Component";
import { Engine } from "../src/ecs/classes/Engine";
import { Entity } from "../src/ecs/classes/Entity";
import { execute, shutdownEngine } from "../src/ecs/functions/EngineFunctions";
import { addComponent, createEntity } from "../src/ecs/functions/ComponentFunctions";
// import { initializeEngine } from "../src/initialize"; // TODO: this file has been moved to client-core
import { Input } from "../src/input/components/Input";
import { addObject3DComponent } from "../src/scene/functions/addObject3DComponent";
import { AvatarInputSchema } from "../src/avatar/AvatarInputSchema";
import { CharacterComponent } from "../src/avatar/components/CharacterComponent";
import { DefaultNetworkSchema } from "../src/networking/templates/DefaultNetworkSchema";
import { TransformComponent } from "../src/transform/components/TransformComponent";
/*
const options = {
  input: {
    useWebXR: false,
    schema: CharacterInputSchema
  },
  networking: {
    schema: DefaultNetworkSchema
  }
}

export const PlayerCharacter: Prefab = {
  // These will be created for all players on the network
  // These are only created for the local player who owns this prefab
  localClientComponents: [
    // ActorComponent has values like movement speed, decelleration, jump height, etc
    { type: CharacterComponent },
    // Transform system applies values from transform component to three.js object (position, rotation, etc)
    { type: TransformComponent },
    // Local player input mapped to behaviors in the input map
    { type: Input, data: { schema: CharacterInputSchema } }
  ],
  onBeforeCreate: [
  ],
  onBeforeDestroy: [
  ]
};


describe("entityPoolIsClean check", () => {
  it("pass if pool is clean", () => {
    const entity = createEntity()
    // check that pool is empty
    expect(Engine.entityPool.freeList.length).toBe(0)

    // add clean entity into clean pool
    Engine.entityPool.freeList.push(entity)
    // check that function works
    expect(entityPoolIsClean()).toBe(true)

    // return pool back to normal
    Engine.entityPool.freeList.length = 0
  })

  it("fails if pool is dirty", () => {
    const entity = createEntity()
    class UniqueTestComponent extends Component<UniqueTestComponent> { }
    addComponent(entity, UniqueTestComponent)

    // make mess in the pool
    Engine.entityPool.freeList.push(entity)
    // check that function works
    expect(entityPoolIsClean()).toBe(false)

    // remove our entity
    Engine.entityPool.freeList.pop()
  })
})

test.skip("Engine reset should work", () => {
  // TODO: update to reset audio when it finished and whatever is still left untouched
  const EngineInitialState = {
    enabled: Engine.enabled,
    deferredRemovalEnabled: Engine.deferredRemovalEnabled
  }

  jest.useFakeTimers()

  initializeEngine(options)

  jest.advanceTimersByTime(1000)

  addObject3DComponent(createEntity(), { obj3d: AmbientLight, ob3dArgs: {
      intensity: 2.0
  }})

  // run once to make sure all "added" queries is processed
  execute()
  jest.advanceTimersByTime(1000)

  execute()
  jest.advanceTimersByTime(1000)

  jest.spyOn(Engine.eventDispatcher, 'reset')

  shutdownEngine()

  expect(Engine.renderer).toBeNull()
  expect(Engine.scene).toBeNull()
  expect(Engine.camera).toBeNull()
  expect(Engine.eventDispatcher.reset).toBeCalled()
  expect(Engine.enabled).toBe(EngineInitialState.enabled)
  expect(Engine.deferredRemovalEnabled).toBe(EngineInitialState.deferredRemovalEnabled)
  expect(Engine.systems.length).toBe(0)
  expect(Engine.entities.length).toBe(0)
  expect(Engine.queries.length).toBe(0)
  expect(Engine.components.length).toBe(0)
  expect(Engine.nextEntityId).toBe(0)
  expect(Engine.nextComponentId).toBe(0)
  expect(Engine.componentsMap).toMatchObject({})
  expect(Engine.componentPool).toMatchObject({})
  expect(Engine.numComponents).toMatchObject({})
  expect(Engine.entitiesWithComponentsToRemove.length).toBe(0)
  expect(Engine.entitiesToRemove.length).toBe(0)

  // Engine.entityPool
  // Engine.entityPool.freeList should be propagated with reset Entities
  expect(entityPoolIsClean()).toBe(true)
})

function entityPoolIsClean():boolean {
  // Engine.entityPool.freeList should be propagated with empty Entities
  return !Engine.entityPool.freeList.find( (entity:Entity):boolean => {
    // search for first not clean entity
    return !!(entity.componentTypes.length
      || entity.componentTypesToRemove.length
      || entity.queries.length
      || Object.keys(entity.components).length
      || Object.keys(entity.componentsToRemove).length)
  })
}
*/
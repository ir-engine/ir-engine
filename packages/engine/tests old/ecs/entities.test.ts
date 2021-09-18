import { createEntity, removeAllEntities, removeEntity } from "../../src/ecs/functions/ComponentFunctions";
import { Engine } from "../../src/ecs/classes/Engine";
import { execute } from "../../src/ecs/functions/EngineFunctions";

test("create entity works", () => {
  const currentEntitiesCount = Engine.entities.length
  const entity = createEntity()
  expect(Engine.entities.length).toBe(currentEntitiesCount + 1)
  removeEntity(entity, true)
})

describe("immediate delete", () => {

})

describe("deferred delete", () => {
  it("removeAllEntities", () => {
    createEntity()
    createEntity()
    createEntity()
    removeAllEntities()
    execute(0, 0)
    execute(0, 0)
    expect(Engine.entities.length).toBe(0)
  })
})
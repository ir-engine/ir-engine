import { ComponentJson } from "@xrengine/common/src/interfaces/SceneInterface"
import { MathUtils } from "three"
import { createEntity } from "../../../ecs/functions/EntityFunctions"
import { deserializeMetaData } from "./MetaDataFunctions"
import assert from 'assert'
import { createWorld } from "../../../ecs/classes/World"
import { Engine } from "../../../ecs/classes/Engine"

describe('MetadataFunctions', () => {
  describe('deserializeMetaData', () => {
    const world = createWorld()
    Engine.currentWorld = world

    const entity = createEntity()
    const testData = MathUtils.generateUUID()

    const sceneComponentData = {
      meta_data: testData
    }
    const sceneComponent: ComponentJson = {
      name: 'mtdata',
      props: sceneComponentData
    }

    deserializeMetaData(entity, sceneComponent)
    assert.equal(world.sceneMetadata, testData)
  })
})
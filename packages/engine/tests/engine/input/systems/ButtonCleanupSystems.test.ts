import assert from 'assert'

import { ButtonCleanupSystem } from '../../../../src/input/systems/ButtonCleanupSystem'
import { destroyEngine } from "../../../../src/ecs/classes/Engine"
import { defineQuery } from "../../../../src/ecs/functions/ComponentFunctions"
import { createEngine } from "../../../../src/initializeEngine"
import { loadEmptyScene } from "../../../util/loadEmptyScene"

describe('ButtonCleanupSystem', () => {

  beforeEach(() => {
    createEngine()
    loadEmptyScene()
  })
  
  it('should be queryable', () => {
    const buttonCleanupQuery = defineQuery([ButtonCleanupSystem])
    assert(buttonCleanupQuery)
    assert(buttonCleanupQuery._enterQuery)
    assert(buttonCleanupQuery._exitQuery)
    assert(buttonCleanupQuery._query)
  })

  afterEach(() => {
    destroyEngine()
  })
})
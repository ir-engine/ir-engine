import assert from 'assert'

import { Engine, destroyEngine } from "../../../../src/ecs/classes/Engine"
import { defineQuery, setComponent } from "../../../../src/ecs/functions/ComponentFunctions"
import { createEngine } from "../../../../src/initializeEngine"
import { InputSourceComponent } from "../../../../src/input/components/InputSourceComponent"
import { loadEmptyScene } from "../../../util/loadEmptyScene"
import { MockXRInputSource, MockXRSpace } from '../../../util/MockXRInputSource'

describe('InputSourceComponent', () => {

  beforeEach(() => {
    createEngine()
    loadEmptyScene()
  })
  
  it('should be queryable', () => {
    const inputSourceQuery = defineQuery([InputSourceComponent])
    assert(inputSourceQuery)
    assert(inputSourceQuery._enterQuery)
    assert(inputSourceQuery._exitQuery)
    assert(inputSourceQuery._query)
  })

  it('should able to be set as a component', () => {
    // const mockXrInputSource = new MockXRInputSource({
    //     handedness: "right",
    //     targetRayMode: "screen",
    //     targetRaySpace: new MockXRSpace(),
    //     gripSpace: undefined,
    //     gamepad: undefined,
    //     profiles: ['test'],
    //     hand: undefined,
    // })
    // setComponent(Engine.instance.originEntity, InputSourceComponent, { source: mockXrInputSource })
    // console.log(Engine.instance)
  })

  afterEach(() => {
    destroyEngine()
  })
})
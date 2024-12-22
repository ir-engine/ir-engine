/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { getMutableState } from '@ir-engine/hyperflux'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { Vector3 } from 'three'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TransitionComponent, defineComponent, getComponent, setComponent } from './ComponentFunctions'
import { ECSState } from './ECSState'
import { Easing } from './EasingFunctions'
import { createEngine, destroyEngine } from './Engine'
import { executeSystems } from './EngineFunctions'
import { Entity } from './Entity'
import { createEntity } from './EntityFunctions'
import './TransitionSystem'
import { S } from './schemas/JSONSchemas'

describe('TransitionSystem', () => {
  const TestComponent = defineComponent({
    name: 'TestComponent',
    jsonID: 'EE_test',
    schema: S.Object({
      position: T.Vec3(),
      number: S.Number()
    })
  })

  let entity: Entity

  beforeEach(() => {
    createEngine()
    getMutableState(ECSState).maxDeltaSeconds.set(1)
    entity = createEntity()
    setComponent(entity, TestComponent, {
      position: new Vector3(0, 0, 0),
      number: 0
    })
  })

  afterEach(() => {
    destroyEngine()
  })

  it('should transition number property correctly', () => {
    TestComponent.setTransition(entity, 'number', 10, {
      duration: 1000,
      easing: Easing.linear.inOut
    })

    // Simulate half duration
    executeSystems(500)
    const halfwayComponent = getComponent(entity, TestComponent)
    expect(halfwayComponent.number).toBeCloseTo(5, 2)

    // Simulate full duration
    executeSystems(1000)
    const finalComponent = getComponent(entity, TestComponent)
    expect(finalComponent.number).toBeCloseTo(10, 2)
  })

  it('should transition Vector3 property correctly', () => {
    TestComponent.setTransition(entity, 'position', new Vector3(10, 20, 30), {
      duration: 1000,
      easing: Easing.linear.inOut
    })

    // Simulate half duration
    executeSystems(500)
    const halfwayComponent = getComponent(entity, TestComponent)
    expect(halfwayComponent.position.x).toBeCloseTo(5, 2)
    expect(halfwayComponent.position.y).toBeCloseTo(10, 2)
    expect(halfwayComponent.position.z).toBeCloseTo(15, 2)

    // Simulate full duration
    executeSystems(1000)
    const finalComponent = getComponent(entity, TestComponent)
    expect(finalComponent.position.x).toBeCloseTo(10, 2)
    expect(finalComponent.position.y).toBeCloseTo(20, 2)
    expect(finalComponent.position.z).toBeCloseTo(30, 2)
  })

  it('should handle multiple transitions correctly', () => {
    // Start first transition
    TestComponent.setTransition(entity, 'number', 10, {
      duration: 1000,
      easing: Easing.linear.inOut
    })

    // Simulate 250ms
    executeSystems(250)
    const firstComponent = getComponent(entity, TestComponent)
    expect(firstComponent.number).toBeCloseTo(2.5, 2)

    // Start second transition
    TestComponent.setTransition(entity, 'number', 0, {
      duration: 1000,
      easing: Easing.linear.inOut
    })

    // Simulate another 500ms
    executeSystems(750)
    const secondComponent = getComponent(entity, TestComponent)
    expect(secondComponent.number).toBeCloseTo(5, 2)
  })

  it('should handle easing functions correctly', () => {
    TestComponent.setTransition(entity, 'number', 1, {
      duration: 1000,
      easing: Easing.quadratic.inOut
    })

    // For quadratic.inOut:
    // t < 0.5: fn(t * 2) / 2 where fn(t) = t^2
    // t >= 0.5: 1 - fn((1-t) * 2) / 2 where fn(t) = t^2

    // At 250ms (t=0.25): (0.5)^2 / 2 = 0.125
    executeSystems(250)
    const firstComponent = getComponent(entity, TestComponent)
    expect(firstComponent.number).toBeCloseTo(0.125, 2)

    // At 500ms (t=0.5): (1)^2 / 2 = 0.5
    executeSystems(500)
    const secondComponent = getComponent(entity, TestComponent)
    expect(secondComponent.number).toBeCloseTo(0.5, 2)

    // At 1000ms (t=1.0): 1
    executeSystems(1000)
    const finalComponent = getComponent(entity, TestComponent)
    expect(finalComponent.number).toBeCloseTo(1, 2)
  })

  it('should cleanup completed transitions', () => {
    TestComponent.setTransition(entity, 'number', 10, {
      duration: 1000,
      easing: Easing.linear.inOut
    })

    // Complete the transition
    executeSystems(1000)
    const component = getComponent(entity, TestComponent)
    expect(component.number).toBeCloseTo(10, 2)

    // Check that the transition was cleaned up
    const transitionComponent = getComponent(entity, TransitionComponent)
    const transition = transitionComponent.find(
      (t) => t.componentJsonID === TestComponent.jsonID && t.propertyPath === 'number'
    )!
    expect(transition.events.length).toBe(0)
  })
})

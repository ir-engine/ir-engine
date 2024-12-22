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

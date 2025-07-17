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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import assert from 'assert'
import sinon from 'sinon'
import { afterEach, beforeEach, describe, it } from 'vitest'

import {
  ComponentMap,
  createEntity,
  defineComponent,
  getComponent,
  getMutableComponent,
  Layers,
  Observer,
  removeComponent,
  removeEntity,
  setComponent
} from './ComponentFunctions'
import { createEngine, destroyEngine } from './Engine'
import { Entity } from './Entity'
import { S } from './schemas/JSONSchemas'

describe('Observables API', () => {
  beforeEach(() => {
    createEngine()
    ComponentMap.clear()
  })

  afterEach(() => {
    return destroyEngine()
  })

  // Helper function to check if a handle exists in any path
  const hasObserverHandle = (component: any, handle: number): boolean => {
    for (const pathObservers of component.observers.values()) {
      if (pathObservers.has(handle)) return true
    }
    return false
  }

  // Helper function to get observer by handle from any path
  const getObserverByHandle = (component: any, handle: number): any => {
    for (const pathObservers of component.observers.values()) {
      if (pathObservers.has(handle)) return pathObservers.get(handle)
    }
    return undefined
  }

  describe('defineObserver', () => {
    it('should create an observer and return a handle', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer)

      assert(typeof handle === 'number')
      assert(hasObserverHandle(TestComponent, handle))
    })

    it('should call observer when component is set on entity in same layer', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer, undefined, Layers.Simulation)

      const entity = createEntity(Layers.Simulation)
      const componentData = { value: 42 }
      setComponent(entity, TestComponent, componentData)

      assert(observer.calledOnce)
      assert(observer.calledWith(entity, componentData))
    })

    it('should call observer when component is set on entity in a propagated layer', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer, undefined, Layers.Simulation)

      const entity = createEntity(Layers.Authoring)
      setComponent(entity, TestComponent, { value: 42 })

      // 2 calls, one for onSet propagation and one for explicit propagate call inside setComponent
      assert.equal(observer.callCount, 2)
    })

    it('should not call observer when component is set on entity in different layer', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer, undefined, Layers.Authoring)

      const entity = createEntity(Layers.Simulation)
      setComponent(entity, TestComponent, { value: 42 })

      assert(observer.notCalled)
    })

    it('should call previous unobserver when setting component again on same entity', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const firstUnobserver = sinon.spy()
      const secondUnobserver = sinon.spy()
      const observer = sinon.stub()
      observer.onFirstCall().returns(firstUnobserver)
      observer.onSecondCall().returns(secondUnobserver)

      TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(firstUnobserver.callCount, 1)
      assert(secondUnobserver.notCalled)
    })

    it('should support multiple observers on the same component', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer1 = sinon.spy()
      const observer2 = sinon.spy()
      TestComponent.defineObserver(observer1)
      TestComponent.defineObserver(observer2)

      const entity = createEntity()
      const componentData = { value: 42 }
      setComponent(entity, TestComponent, componentData)

      assert(observer1.calledOnce)
      assert(observer2.calledOnce)
      assert(observer1.calledWith(entity, componentData))
      assert(observer2.calledWith(entity, componentData))
    })

    it('should work with different layers', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const simulationObserver = sinon.spy()
      const authoringObserver = sinon.spy()
      TestComponent.defineObserver(simulationObserver, undefined, Layers.Simulation)
      TestComponent.defineObserver(authoringObserver, undefined, Layers.Authoring)

      const simEntity = createEntity(Layers.Simulation)
      const authEntity = createEntity(Layers.Authoring)

      setComponent(simEntity, TestComponent, { value: 42 })
      setComponent(authEntity, TestComponent, { value: 84 })

      assert(simulationObserver.calledThrice)
      assert(authoringObserver.calledOnce)
      assert(simulationObserver.calledWith(simEntity, { value: 42 }))
      assert(authoringObserver.calledWith(authEntity, { value: 84 }))
    })
  })

  describe('removeObserver', () => {
    it('should remove observer from internal maps', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer)

      assert(hasObserverHandle(TestComponent, handle))
      TestComponent.removeObserver(handle)
      assert(!hasObserverHandle(TestComponent, handle))
    })

    it('should call all pending unobserver functions', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const unobserver1 = sinon.spy()
      const unobserver2 = sinon.spy()
      const observer = sinon.stub()
      observer.onFirstCall().returns(unobserver1)
      observer.onSecondCall().returns(unobserver2)

      const handle = TestComponent.defineObserver(observer)

      const entity1 = createEntity()
      const entity2 = createEntity()
      setComponent(entity1, TestComponent, { value: 42 })
      setComponent(entity2, TestComponent, { value: 84 })

      TestComponent.removeObserver(handle)

      assert(unobserver1.calledOnce)
      assert(unobserver2.calledOnce)
    })

    it('should not call observer after removal', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      assert(observer.calledOnce)

      TestComponent.removeObserver(handle)
      observer.resetHistory()

      setComponent(entity, TestComponent, { value: 84 })
      assert(observer.notCalled)
    })
  })

  describe('Observer edge cases', () => {
    it('should handle observer that returns undefined', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.stub().returns(undefined)
      const handle = TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      const unobserver = getObserverByHandle(TestComponent, handle)!
      assert(!unobserver(entity, getComponent(entity, TestComponent)))
    })

    it('should handle component updates correctly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      assert.equal(observer.callCount, 1)
      assert(observer.calledWith(entity, { value: 42 }))

      /** @todo proper path support - should not add count here if the observer looks for 'value' path */
      setComponent(entity, TestComponent, { value: 42 })
      assert.equal(observer.callCount, 2)

      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(observer.callCount, 3)
    })

    it('should handle entity removal properly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const _unobserver = sinon.spy()
      const observer = sinon.stub().returns(_unobserver)
      const handle = TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      const unobserver = getObserverByHandle(TestComponent, handle)!
      assert(unobserver)

      removeEntity(entity)

      assert(_unobserver.calledOnce)
      const unobserver2 = getObserverByHandle(TestComponent, handle)!
      assert(!unobserver2(entity, getComponent(entity, TestComponent)))
    })

    it('should handle component removal properly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      TestComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      observer.resetHistory()

      removeComponent(entity, TestComponent)
      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(observer.callCount, 1)
      assert(observer.calledWith(entity, { value: 84 }))
    })

    it('should handle multiple unobservers for same entity correctly', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const unobserver1 = sinon.spy()
      const unobserver2 = sinon.spy()
      const observer = sinon.stub()
      observer.onFirstCall().returns(unobserver1)
      observer.onSecondCall().returns(unobserver2)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })
      setComponent(entity, TestComponent, { value: 84 })

      assert.equal(unobserver1.callCount, 0)
      assert.equal(unobserver2.callCount, 0)
    })

    it('should handle complex component schemas', () => {
      const ComplexComponent = defineComponent({
        name: 'ComplexComponent',
        schema: S.Object({
          position: S.Object({
            x: S.Number({ default: 0 }),
            y: S.Number({ default: 0 }),
            z: S.Number({ default: 0 })
          }),
          metadata: S.Object({
            name: S.String({ default: '' }),
            tags: S.Array(S.String())
          })
        })
      })

      const observer = sinon.spy()
      ComplexComponent.defineObserver(observer)

      const entity = createEntity()
      const complexData = {
        position: { x: 1, y: 2, z: 3 },
        metadata: { name: 'test', tags: ['tag1', 'tag2'] }
      }
      setComponent(entity, ComplexComponent, complexData)

      assert(observer.calledOnce)
      assert(observer.calledWith(entity, complexData))
    })

    it('should maintain observer isolation between different components', () => {
      const Component1 = defineComponent({
        name: 'Component1',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })
      const Component2 = defineComponent({
        name: 'Component2',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer1 = sinon.spy()
      const observer2 = sinon.spy()
      Component1.defineObserver(observer1)
      Component2.defineObserver(observer2)

      const entity = createEntity()
      setComponent(entity, Component1, { value: 42 })
      setComponent(entity, Component2, { value: 84 })

      assert(observer1.calledOnce)
      assert(observer2.calledOnce)
      assert(observer1.calledWith(entity, { value: 42 }))
      assert(observer2.calledWith(entity, { value: 84 }))
    })
  })

  describe('Observer type safety', () => {
    it('should properly type observer callback parameters', () => {
      const TypedComponent = defineComponent({
        name: 'TypedComponent',
        schema: S.Object({
          count: S.Number({ default: 0 }),
          name: S.String({ default: '' })
        })
      })

      const observer: Observer<typeof TypedComponent> = (entity: Entity, data) => {
        // TypeScript should infer the correct type for data
        assert(typeof data.count === 'number')
        assert(typeof data.name === 'string')
        assert(typeof entity === 'number')
      }

      TypedComponent.defineObserver(observer)

      const entity = createEntity()
      setComponent(entity, TypedComponent, { count: 42, name: 'test' })
    })

    it('should properly type unobserver return value', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer: Observer<typeof TestComponent> = (_entity: Entity, _data) => {
        return () => {
          // Cleanup logic
        }
      }

      const handle = TestComponent.defineObserver(observer)
      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      const unobserver = getObserverByHandle(TestComponent, handle)!
      assert(typeof unobserver === 'function')
    })
  })

  describe('Path-specific observers', () => {
    it('should support observing specific property paths', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({
          value: S.Number({ default: 0 }),
          name: S.String({ default: '' })
        })
      })

      const rootObserver = sinon.spy()
      const valueObserver = sinon.spy()
      const nameObserver = sinon.spy()
      TestComponent.defineObserver(rootObserver) // observes entire component
      TestComponent.defineObserver(valueObserver, 'value')
      TestComponent.defineObserver(nameObserver, 'name')

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42, name: 'test' })

      /** @todo should it trigger all of them? */
      // Only root observer should be called for initial component set
      assert(rootObserver.calledOnce)
      assert(valueObserver.notCalled)
      assert(nameObserver.notCalled)
      assert(rootObserver.calledWith(entity, { value: 42, name: 'test' }))
    })

    it('should organize observers by path in nested map structure', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({
          value: S.Number({ default: 0 }),
          name: S.String({ default: '' })
        })
      })

      const rootObserver = sinon.spy()
      const valueObserver = sinon.spy()
      const rootHandle = TestComponent.defineObserver(rootObserver)
      const valueHandle = TestComponent.defineObserver(valueObserver, 'value')

      assert(TestComponent.observers.has(''))
      assert(TestComponent.observers.has('value'))
      assert(TestComponent.observers.get('')!.has(rootHandle))
      assert(TestComponent.observers.get('value')!.has(valueHandle))
    })

    it('should clean up empty path maps when all observers are removed', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer = sinon.spy()
      const handle = TestComponent.defineObserver(observer, 'value')

      assert(TestComponent.observers.has('value'))
      TestComponent.removeObserver(handle)
      assert(!TestComponent.observers.has('value'))
    })

    it('should support multiple observers on the same path', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({ value: S.Number({ default: 0 }) })
      })

      const observer1 = sinon.spy()
      const observer2 = sinon.spy()
      const handle1 = TestComponent.defineObserver(observer1)
      const handle2 = TestComponent.defineObserver(observer2)

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42 })

      assert(observer1.calledOnce)
      assert(observer2.calledOnce)
      assert(observer1.calledWith(entity, { value: 42 }))
      assert(observer2.calledWith(entity, { value: 42 }))

      assert(TestComponent.observers.get('')!.has(handle1))
      assert(TestComponent.observers.get('')!.has(handle2))
    })

    it('should handle removeObserver correctly with path-based structure', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({
          value: S.Number({ default: 0 }),
          name: S.String({ default: '' })
        })
      })

      const valueObserver1 = sinon.spy()
      const valueObserver2 = sinon.spy()
      const nameObserver = sinon.spy()

      const handle1 = TestComponent.defineObserver(valueObserver1, 'value')
      const handle2 = TestComponent.defineObserver(valueObserver2, 'value')
      const handle3 = TestComponent.defineObserver(nameObserver, 'name')

      TestComponent.removeObserver(handle1)

      assert(TestComponent.observers.has('value'))
      assert(!TestComponent.observers.get('value')!.has(handle1))
      assert(TestComponent.observers.get('value')!.has(handle2))

      assert(TestComponent.observers.has('name'))
      assert(TestComponent.observers.get('name')!.has(handle3))

      TestComponent.removeObserver(handle2)

      assert(!TestComponent.observers.has('value'))

      assert(TestComponent.observers.has('name'))
    })

    it('should call path-specific observers when individual properties are updated', () => {
      const TestComponent = defineComponent({
        name: 'TestComponent',
        schema: S.Object({
          value: S.Number({ default: 0 }),
          name: S.String({ default: '' })
        })
      })

      const rootObserver = sinon.spy()
      const valueObserver = sinon.spy()
      const nameObserver = sinon.spy()
      TestComponent.defineObserver(rootObserver)
      TestComponent.defineObserver(valueObserver, 'value')
      TestComponent.defineObserver(nameObserver, 'name')

      const entity = createEntity()
      setComponent(entity, TestComponent, { value: 42, name: 'test' })

      rootObserver.resetHistory()
      valueObserver.resetHistory()
      nameObserver.resetHistory()

      const componentState = getMutableComponent(entity, TestComponent)
      componentState.nested('value').set(84)

      assert(valueObserver.calledOnce)
      assert(rootObserver.notCalled)
      assert(nameObserver.notCalled)
      assert(valueObserver.calledWith(entity, 84))

      valueObserver.resetHistory()
      componentState.name.set('updated')

      assert(nameObserver.calledOnce)
      assert(rootObserver.notCalled)
      assert(valueObserver.notCalled)
      assert(nameObserver.calledWith(entity, 'updated'))
    })
  })
})

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { act, render } from '@testing-library/react'
import assert from 'assert'
import React from 'react'
import { default as Sinon, default as sinon } from 'sinon'

import { parseStorageProviderURLs } from '@etherealengine/common/src/utils/parseSceneJSON'
import {
  ComponentMap,
  createEntity,
  destroyEngine,
  destroySystem,
  ECSState,
  Entity,
  entityExists,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  setComponent,
  SystemDefinitions,
  UUIDComponent
} from '@etherealengine/ecs'
import {
  getOnAsyncExecuteSystemUUID,
  getOnExecuteSystemUUID,
  getUseStateSystemUUID,
  getUseVariableSystemUUID,
  registerEngineProfile,
  VisualScriptComponent,
  VisualScriptDomain
} from '@etherealengine/engine'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { createEngine, initializeSpatialEngine } from '@etherealengine/spatial/src/initializeEngine'
import { InputComponent } from '@etherealengine/spatial/src/input/components/InputComponent'

import { GraphJSON, VisualScriptState } from '../src/VisualScriptModule'
import booleanTestVisualScript from './assets/boolean-test-visual-script.json'
import decisionTestVisualScript from './assets/decision-test-visual-script.json'
import defaultVisualScript from './assets/default-visual-script.json'
import entityComponentTestVisualScript from './assets/entity-component-test-visual-script.json'
import floatTestVisualScript from './assets/float-test-visual-script.json'
import integerTestVisualScript from './assets/integer-test-visual-script.json'
import rateRepeatTestVisualScript from './assets/rate-repeat-test-visual-script.json'
import stateTestVisualScript from './assets/state-test-visual-script.json'
import stringTestVisualScript from './assets/string-test-visual-script.json'
import variableTestVisualScript from './assets/variable-test-visual-script.json'
import vec2TestVisualScript from './assets/vec2-test-visual-script.json'
import vec3TestVisualScript from './assets/vec3-test-visual-script.json'
import vec4TestVisualScript from './assets/vec4-test-visual-script.json'

/** @todo rewrite these tests without relying on logging */
describe.skip('visual Script', () => {
  let consoleSpy: Sinon.SinonSpy
  let consoleErrorSpy: Sinon.SinonSpy // Spy on console.error
  let systemAsyncUUID
  const successMessage = 'pass'
  const waitForConsoleLog = (successMessage = 'pass') =>
    new Promise<string>((resolve, reject) => {
      const intervalId = setInterval(() => {
        const consoleCalls = consoleSpy.getCalls()
        const errorCalls = consoleErrorSpy.getCalls()

        consoleCalls.forEach((call) => {
          const message = call.args.join(' ')
          if (message.includes(successMessage)) {
            clearInterval(intervalId)
            resolve(message)
          }
        })

        errorCalls.forEach((call) => {
          clearInterval(intervalId)
          reject(new Error('visual script failed: ' + call.args.join(' ')))
        })
      }, 100)
    })

  beforeEach(() => {
    createEngine()
    initializeSpatialEngine()
    consoleSpy = sinon.spy(console, 'info')
    consoleErrorSpy = sinon.spy(console, 'error') // Spy on console.error
    VisualScriptState.registerProfile(registerEngineProfile, VisualScriptDomain.ECS)
  })

  it('test default script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(defaultVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
    SystemDefinitions.get(getOnExecuteSystemUUID())!.execute()

    await waitForConsoleLog('tick').then((result) => {
      assert(result.includes('tick'))
    })
  })

  it('test float nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(floatTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test integer nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(integerTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test string nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(stringTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test boolean nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(booleanTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test decision nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(decisionTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })
    const messageSequence = [
      'branch true',
      'sequence 1',
      'sequence 2',
      'flip off',
      'sequence 3',
      'switch string one',
      'switch int 2'
    ]
    for (const message of messageSequence) {
      await waitForConsoleLog(message).then((result) => {
        assert(result.includes(message))
      })
    }
  })

  it('test rate and repeat nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(rateRepeatTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })
    const onStartMessageSequence = ['repeatNone', 'repeatN0', 'repeatN1', 'repeatN2']
    const onTickMessageSequence = ['throttle0', 'throttle1', 'throttle2', 'debounce']

    for (const message of onStartMessageSequence) {
      await waitForConsoleLog(message).then((result) => {
        assert(result.includes(message))
      })
    }
    const startTime = Date.now()
    const duration = 5
    let done = false
    const loop = () => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime

      if (elapsedTime < duration * 1000 && !done) {
        SystemDefinitions.get(getOnExecuteSystemUUID())!.execute()
        // Continue the loop
        setTimeout(loop, 0) // using setTimeout with 0ms delay to allow other tasks to run
      } else {
        return
      }
    }
    loop()
    for (const message of onTickMessageSequence) {
      await waitForConsoleLog(message).then((result) => {
        assert(result.includes(message))
      })
    }
    done = true
  })

  it('test entity and component nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(entityComponentTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })
    const messageSequence = [
      'entity added',
      'uuid',
      'component added',
      'component modified',
      'component deleted',
      'tag added',
      'tag deleted',
      'entity deleted',
      'passed'
    ]

    let newEntity: Entity
    console.log()
    for (const message of messageSequence) {
      await waitForConsoleLog(message).then((result) => {
        assert(result.includes(message))
        switch (message) {
          case messageSequence[1]: {
            // uuid
            const message = result.split(' ')
            const uuid = message[message.length - 1] as EntityUUID
            newEntity = UUIDComponent.getEntityByUUID(uuid)
            assert(entityExists(newEntity))
            assert(getComponent(newEntity, NameComponent) === 'test')
            break
          }
          case messageSequence[2]: {
            // component added
            assert(getComponent(newEntity, InputComponent) !== undefined)
            break
          }
          case messageSequence[3]: {
            // component modified
            const inputComponent = getComponent(newEntity, InputComponent)
            assert(inputComponent !== undefined)
            assert(inputComponent.grow)
            systemAsyncUUID = getOnAsyncExecuteSystemUUID()
            SystemDefinitions.get(systemAsyncUUID)!.execute()
            break
          }
          case messageSequence[4]: {
            // component deleted
            const inputComponent = getOptionalComponent(newEntity, InputComponent)
            assert(inputComponent === undefined)
            break
          }
          case messageSequence[5]: {
            // tag added
            assert(getComponent(newEntity, ComponentMap.get('bg-tag.test')!) !== undefined)
            SystemDefinitions.get(systemAsyncUUID)!.execute()
            break
          }
          case messageSequence[6]: {
            // tag deleted
            assert(getOptionalComponent(newEntity, ComponentMap.get('bg-tag.test')!) === undefined)
            break
          }
          case messageSequence[7]: {
            // entity deleted
            assert(entityExists(newEntity) === false)
            break
          }
        }
      })
    }
    destroySystem(systemAsyncUUID)
  })

  it('test variable nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(variableTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog('variableGet').then((result) => {
      assert(result.includes('variableGet'))
    })

    const variableName = getComponent(entity, VisualScriptComponent)!.visualScript!.variables![0].name
    const systemUUID = getUseVariableSystemUUID(variableName)
    const UseVariableReactor = SystemDefinitions.get(systemUUID)!.reactor!
    const useVariableTag = <UseVariableReactor />
    const { rerender, unmount } = render(useVariableTag)
    await act(() => rerender(useVariableTag))

    SystemDefinitions.get(systemUUID)!.execute()
    await waitForConsoleLog('variableUsevariableGet').then((result) => {
      assert(result.includes('variableUsevariableGet'))
    })

    systemAsyncUUID = getOnAsyncExecuteSystemUUID()
    SystemDefinitions.get(systemAsyncUUID)!.execute()

    await act(() => rerender(useVariableTag))

    await waitForConsoleLog('variableSet').then((result) => {
      assert(result.includes('variableSet'))
    })

    SystemDefinitions.get(systemUUID)!.execute()

    await waitForConsoleLog('variableUsevariableSet').then((result) => {
      assert(result.includes('variableUsevariableSet'))
    })

    unmount()
  })

  it('test vec2 nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(vec2TestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test vec3 nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(vec3TestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test vec4 nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(vec4TestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test state nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(stateTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })
    const messageQueue = ['Get', 'Use', 'Set', 'Use', 'Use', 'passed']

    await waitForConsoleLog(messageQueue[0]).then((result) => {
      // get state
      assert(result.includes(messageQueue[0]))
    })

    const systemUUID = getUseStateSystemUUID(ECSState.name)
    const UseStateReactor = SystemDefinitions.get(systemUUID)!.reactor!
    const useStateTag = <UseStateReactor />
    const { rerender, unmount } = render(useStateTag)

    await act(() => rerender(useStateTag)) // first use on startup

    systemAsyncUUID = getOnAsyncExecuteSystemUUID()
    SystemDefinitions.get(systemAsyncUUID)!.execute()

    await waitForConsoleLog(messageQueue[1]).then((result) => {
      // use state
      assert(result.includes(messageQueue[1]))
    })

    //Engine.instance.store.stateMap

    await waitForConsoleLog(messageQueue[2]).then((result) => {
      // set state
      assert(result.includes(messageQueue[2]))
    })

    await act(() => rerender(useStateTag)) // first change use

    SystemDefinitions.get(systemAsyncUUID)!.execute()

    await waitForConsoleLog(messageQueue[3]).then((result) => {
      // use state
      assert(result.includes(messageQueue[3]))
    })

    await act(() => rerender(useStateTag)) // second use startup

    await waitForConsoleLog(messageQueue[5]).then((result) => {
      assert(result.includes(messageQueue[5])) // test passed
    })

    await waitForConsoleLog(messageQueue[4]).then((result) => {
      assert(result.includes(messageQueue[4])) // use state
    })
  })

  // these are too basic
  /*it('test euler nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(integerTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })

  it('test quat nodes script', async () => {
    const entity = createEntity()
    const visualScript = parseStorageProviderURLs(integerTestVisualScript) as unknown as GraphJSON
    setComponent(entity, VisualScriptComponent, { visualScript: visualScript, run: true })

    await waitForConsoleLog(successMessage).then((result) => {
      assert(result.includes(successMessage))
    })
  })*/

  afterEach(() => {
    consoleSpy.restore()
    consoleErrorSpy.restore()
    return destroyEngine()
  })
})

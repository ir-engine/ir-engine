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

import { setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { destroyEngine } from '@etherealengine/ecs/src/Engine'
import { createEntity } from '@etherealengine/ecs/src/EntityFunctions'
import {
  VisualScriptComponent,
  VisualScriptDomain,
  getOnExecuteSystemUUID,
  registerEngineProfile
} from '@etherealengine/spatial'
import { createEngine } from '@etherealengine/spatial/src/initializeEngine'
import booleanTestVisualScript from './assets/boolean-test-visual-script.json'
import decisionTestVisualScript from './assets/decision-test-visual-script.json'
import defaultVisualScript from './assets/default-visual-script.json'
import floatTestVisualScript from './assets/float-test-visual-script.json'
import integerTestVisualScript from './assets/integer-test-visual-script.json'
import rateRepeatTestVisualScript from './assets/rate-repeat-test-visual-script.json'
import stringTestVisualScript from './assets/string-test-visual-script.json'

import { SystemDefinitions } from '@etherealengine/ecs'
import { parseStorageProviderURLs } from '@etherealengine/spatial/src/common/functions/parseSceneJSON'
import assert from 'assert'
import { default as Sinon, default as sinon } from 'sinon'
import { GraphJSON, VisualScriptState } from '../src/VisualScriptModule'

describe('visual Script', () => {
  let consoleSpy: Sinon.SinonSpy
  let consoleErrorSpy: Sinon.SinonSpy // Spy on console.error
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
    VisualScriptState.registerProfile(registerEngineProfile, VisualScriptDomain.ECS)
    consoleSpy = sinon.spy(console, 'info')
    consoleErrorSpy = sinon.spy(console, 'error') // Spy on console.error
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
        assert(result.includes(successMessage))
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
    const loop = () => {
      const currentTime = Date.now()
      const elapsedTime = currentTime - startTime

      if (elapsedTime < duration * 1000) {
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
  })

  afterEach(() => {
    consoleSpy.restore()
    consoleErrorSpy.restore()
    return destroyEngine()
  })
})

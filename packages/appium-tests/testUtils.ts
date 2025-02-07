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

import { writeFile } from 'fs/promises'
import { Browser, remote } from 'webdriverio'

const capabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest'
}

const wdOpts = {
  hostname: process.env.APPIUM_HOST || '0.0.0.0',
  port: process.env.APPIUM_PORT ? parseInt(process.env.APPIUM_PORT, 10) : 4723,
  path: '/wd/hub',
  capabilities
}

const perfTraceDir = process.env.DEVICEFARM_LOG_DIR ?? '.'

type benchmarkAsync = (testId: string, driver: Browser, skipIfJavaScriptCore: boolean) => Promise<void>

async function runScreenshotTest(testId: string, driver: Browser, skipIfJavaScriptCore: boolean) {
  const outputPath = `${perfTraceDir}/${testId}Screenshot.png`

  const screenshot = await driver.takeScreenshot()
  const buffer = Buffer.from(screenshot, 'base64')

  await writeFile(outputPath, buffer)
  console.log('Screenshot written to', outputPath)
}

function withDriver(benchmarkAsync: benchmarkAsync) {
  return async (testId: string, skipIfJavaScriptCore = false) => {
    const driver = await remote(wdOpts)
    try {
      await benchmarkAsync(testId, driver, skipIfJavaScriptCore)
    } catch (err) {
      throw new Error(`${testId} failed with the following error: ${err}`)
    } finally {
      await driver.deleteSession()
    }
  }
}

export const screenshotTest = withDriver(runScreenshotTest)

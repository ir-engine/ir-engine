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

import { lstatSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import path from 'path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

function expectBitmapsToBeEqual(imagePath, expectedImagePath) {
  console.log('comparing:', imagePath, 'to:', expectedImagePath)
  const image = PNG.sync.read(readFileSync(imagePath))
  const expectedImage = PNG.sync.read(readFileSync(expectedImagePath))
  const { width, height } = image
  const diff = new PNG({ width, height })

  const result = pixelmatch(image.data, expectedImage.data, diff.data, width, height, { threshold: 0.1 })

  if (result !== 0) {
    writeFileSync('diff.png', PNG.sync.write(diff))
    throw new Error(
      `Expected image at ${imagePath} to be equal to image at ${expectedImagePath}, but it was different!`
    )
  }
}

function screenshotTest() {
  const screenshotsPath = path.resolve(process.cwd(), 'screenshots')
  const expectedScreenshotsPath = path.resolve(process.cwd(), 'expectedScreenshots')
  const files = readdirSync(screenshotsPath, {
    recursive: true
  })

  for (const file of files) {
    const screenshot = screenshotsPath + '/' + file
    const expectedScreenshot = expectedScreenshotsPath + '/' + file
    if (lstatSync(screenshot).isDirectory() || lstatSync(expectedScreenshot).isDirectory()) continue
    if (!file.endsWith('png')) continue
    expectBitmapsToBeEqual(expectedScreenshot, screenshot)
  }
}

screenshotTest()

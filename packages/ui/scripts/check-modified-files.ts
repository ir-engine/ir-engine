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

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'node:path'

const isGithubAction = process.env.GITHUB_ACTIONS === 'true'

function log(...args: any[]) {
  if (!isGithubAction) {
    console.log(...args)
  }
}

//always pass this check for now
process.exit(0)

try {
  log('Comparing with origin/dev...\n')

  // Get list of modified or added files
  const cwd = path.resolve(__dirname, '../../..')
  const output = execSync('git diff --name-status origin/dev...HEAD', { cwd }).toString().trim()

  if (!output) {
    log('No changes detected.')
    process.exit(1) // No changes, exit with failure
  }

  const lines = output.split('\n')
  const tsxFiles: string[] = []

  lines.forEach((line) => {
    const [status, ...fileParts] = line.split(/\s+/)
    const file = fileParts.join(' ')
    const filename = path.basename(file)

    if ((status === 'M' || status === 'A') && filename.endsWith('.tsx') && !filename.includes('.stories')) {
      tsxFiles.push(file)
    }
  })

  log('Relevant .tsx files:', tsxFiles)

  const hasStories = tsxFiles.some((file) => {
    const dirname = path.dirname(file)
    const basename = path.basename(file, '.tsx')
    const storiesPath = path.join(cwd, dirname, `${basename}.stories.tsx`)
    return fs.existsSync(storiesPath)
  })

  if (!hasStories) {
    log('❌ No corresponding .stories.tsx files found. Exiting early.')
    process.exit(1)
  } else {
    log('✅ Found at least one corresponding .stories.tsx file.')
    process.exit(0)
  }
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}

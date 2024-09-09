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
import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'

import { execPromise } from '@ir-engine/server-core/src/util/execPromise'
dotenv.config({
  path: appRootPath.path,
  silent: true
})
cli.enable('status')

/**
 * Repo must be in the format https://github.com/<ORG>/<REPO>
 */

const options = cli.parse({
  url: [false, 'Repo URL', 'string'],
  branch: ['b', 'Branch', 'string', 'dev']
}) as {
  url?: string
  branch: string
}

const cloneRepo = async () => {
  const branch = options.branch
  const url = options.url
  if (!url) throw new Error('URL is required')

  const [org, repo] = new URL(url).pathname.split('/').slice(1, 3)

  const orgFolderPath = path.resolve(appRootPath.path, 'packages/projects/projects', org)
  const orgExists = await fs.promises
    .access(orgFolderPath)
    .then(() => true)
    .catch(() => false)

  if (!orgExists) {
    await fs.promises.mkdir(orgFolderPath)
  }

  const repoExists = await fs.promises
    .access(path.resolve(orgFolderPath, repo))
    .then(() => true)
    .catch(() => false)
  if (!repoExists) {
    await execPromise(`git clone ${url}`, {
      cwd: path.resolve(orgFolderPath)
    })
  }

  /** Checkout branch and rebase */
  /** @todo - this breaks with git-lfs */
  // await execPromise(`git checkout ${branch} && git fetch -p && git rebase`, {
  //   cwd: path.resolve(appRootPath.path, `packages/projects/projects/${org}/${repo}`)
  // })
}
cli.main(async () => {
  try {
    await cloneRepo()
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})

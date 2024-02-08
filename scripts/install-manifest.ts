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

/**
 * Install-manifest.ts
 * - uses CLI to fetch a manifest and clone projects
 */

import { exec } from 'child_process'

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

const options = cli.parse({
  manifestURL: [false, 'Manifest URL', 'string'],
  branch: [false, 'Branch', 'string']
}) as {
  manifestURL?: string
  branch?: string
}

const fetchManifest = async () => {
  if (!options.manifestURL) throw new Error('No manifest URL specified')
  const response = await fetch(options.manifestURL)
  return response.json()
}

interface PackageManifest_V_1_0_0 {
  version: string // semver
  name: string
  packages: Array<string>
}

function execPromise(cmd, opts) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      console.log(stdout ? stdout : stderr)
      resolve(stdout ? stdout : stderr)
    })
  })
}

const installManifest = async () => {
  const branch = options.branch ?? 'main'
  const manifest = (await fetchManifest()) as PackageManifest_V_1_0_0
  if (!manifest) throw new Error('No manifest found')
  if (!manifest.version) throw new Error('No version found in manifest')
  if (manifest.version !== '1.0.0') throw new Error('Unsupported manifest version')
  if (!manifest.packages) throw new Error('No packages found in manifest')

  console.log(`Cloning packages for ${manifest.name}`)

  await Promise.all(
    manifest.packages.map(async (url) => {
      /** Check if folder already exists */
      const folder = url.split('/').pop()
      if (!folder) throw new Error('Invalid URL')

      const folderExists = fs.existsSync(path.resolve(appRootPath.path, 'packages/projects/projects', folder))
      if (folderExists) {
        console.log(`Package ${folder} already exists, skipping`)
      } else {
        console.log(`Cloning ${url}`)
        await execPromise(`git clone ${url}`, {
          cwd: path.resolve(appRootPath.path, 'packages/projects/projects')
        })
      }
      await execPromise(`git checkout ${branch} && git fetch -p && git rebase`, {
        cwd: path.resolve(appRootPath.path, `packages/projects/projects/${folder}`)
      })
    })
  )
  await execPromise(`ls`, {
    cwd: path.resolve(appRootPath.path, 'packages/projects/projects')
  })
}

cli.main(async () => {
  try {
    await installManifest()
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})

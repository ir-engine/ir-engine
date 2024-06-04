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

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs, { promises as fsp } from 'fs'
import path from 'path'

import { execPromise } from '@etherealengine/server-core/src/util/execPromise'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

const options = cli.parse({
  manifestURL: [false, 'Manifest URL', 'string'],
  branch: ['b', 'Branch', 'string', 'main'],
  replace: ['r', 'Replace existing project?', 'string', 'no'],
  singleBranch: ['s', 'Clone repos in a single branch?', 'string', 'no']
}) as {
  manifestURL?: string
  branch?: string
  replace?: string
  singleBranch?: string
}

/**
 * Use git clone to fetch the manifest, to avoid having to handle github oauth
 * URL format must be in the form `https://github.com/<ORG>/<REPO>/blob/<BRANCH>/<MANIFEST_NAME>.manifest.json
 */

const fetchManifest = async () => {
  try {
    if (!options.manifestURL) throw new Error('No manifest URL specified')
    const [org, repo, blob, branch, manifest] = options.manifestURL
      // maintaining support for http repo urls, although discouraged due deprecated usr/pwd github feature
      // as well as avoiding blockers and extra steps by having to figure out that a github token has to be created
      .replace('https://github.com/', '')
      // recommended repo url form, uses ssh keys and speed up staging process for new developers
      .replace('git@github.com:', '')
      .split('/')
    const clonePath = path.resolve(appRootPath.path, '.temp', repo)
    // enforce ssh connection rather than deprecated http usr/pwd
    await execPromise(`git clone git@github.com:${org}/${repo} ${clonePath}`, {
      cwd: appRootPath.path
    })
    console.log('manifest installed')
    const manifestPath = path.resolve(clonePath, manifest)
    const manifestData = fs.readFileSync(manifestPath, 'utf8')
    const manifestJSON = JSON.parse(manifestData)
    // remove temp folder
    fs.rmSync(path.resolve(appRootPath.path, '.temp'), { recursive: true })
    return manifestJSON
  } catch (err) {
    console.log(err)
    cli.fatal('Failed to fetch manifest')
  }
}

interface PackageManifest_V_1_0_0 {
  version: string // semver
  name: string
  packages: Array<string>
}

const installManifest = async () => {
  const { branch, singleBranch } = options // ?? 'main' -> unnecessary coalescing operator, leveraging default value from cli settings instead
  const manifest = (await fetchManifest()) as PackageManifest_V_1_0_0
  const replacing = options.replace?.toLowerCase() === 'yes' || options.replace?.toLowerCase() === 'y'
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
      const packageDir = path.resolve(appRootPath.path, 'packages/projects/projects', folder)
      /* 
       Performing Sync IO Operations withing Async Processes is an anti-pattern that will block
       the Thread and the Event Loop therefore defeats the purpose of having a Promise.all which is expected to execute
       async processes in parallel, using sync io operations in async processes drastically hurts performance...

       Deprecated: const folderExists = fs.existsSync(packageDir)

       reference: https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking
      */

      try {
        // Using async IO operations to avoid blocking the thread and event loop
        const stat = await fsp.stat(packageDir)

        if (!replacing) return console.log(`Package ${folder} already exists, skipping`)

        console.log(`Package ${folder} already exists, cleaning up project directory`)

        try {
          // Using async IO operations to avoid blocking the thread and event loop
          await fsp.rm(packageDir, { recursive: true })
        } catch (e) {
          console.error(`Unexpected error while deleting directory ${packageDir} Error: ${e}`)
        }
      } catch (e) {
        // if this catch is triggered means that the folder doesn't exist, therefore
        // it's safe to execute the logic below, no error handling required.
      }

      // Enforcing ssh connection instead of deprecated http usr/pwd + token connection
      // while maintaining support for manifests having http as configuration
      const curatedURL = url.replace('https://github.com/', 'git@github.com:')
      console.log(`Cloning ${curatedURL}`)
      // Improving performance by cloning the code from the expected branch in a single step
      await execPromise(`git clone -b ${branch} ${singleBranch === 'yes' ? '--single-branch' : ''} ${curatedURL}`, {
        cwd: path.resolve(appRootPath.path, 'packages/projects/projects')
      })

      /*
      Deprecating unnecessary extra steps, by cloning only from the expected 
      branch in a single step, each project installation will be cleaner and faster,
      therefore no extra checkout, fetch, prune or rebase processes are required freeing
      the event loop to resolve other operations already running in parallel faster.

      await execPromise(`git checkout ${branch} && git fetch -p && git rebase`, {
        cwd: path.resolve(appRootPath.path, `packages/projects/projects/${folder}`)
      })
      */
    })
  )

  await execPromise(`ls`, {
    cwd: path.resolve(appRootPath.path, 'packages/projects/projects')
  })

  if (singleBranch === 'yes') {
    console.log(`You enabled cloning a single branch, the only branch currently available in your local environment
    is "${branch}", in case you need to checkout a different remote branch, run the following commands in your terminal:
    
    $ git fetch origin [branch]
    $ git checkout FETCH_HEAD -b [branch]`)
  }
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

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

/**
 * Install-manifest.ts
 * - uses CLI to fetch a manifest and clone projects
 */

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
import fs, { promises as fsp } from 'fs'
import path from 'path'

import { execPromise } from '@ir-engine/server-core/src/util/execPromise'

import { normalizeDependency } from '@ir-engine/server-core/src/projects/project/project-helper'

dotenv.config({
  path: appRootPath.path,
  silent: true
})

cli.enable('status')

const options = cli.parse({
  manifestRepo: [false, 'Manifest URL', 'string'],
  branch: ['b', 'Branch', 'string'],
  commit: ['c', 'Commit', 'string'],
  tag: ['t', 'Tag', 'string'],
  replace: ['r', 'Replace existing project?', 'boolean', true],
  singleBranch: ['s', 'Clone repos in a single branch?', 'boolean', true],
  token: [false, 'Token to sign requests with', 'string'],
  ignoreAssetsOnly: [false, 'Ignore assets only projects', 'boolean', true]
}) as {
  manifestRepo?: string
  branch?: string
  commit?: string
  tag?: string
  replace?: boolean
  singleBranch?: boolean
  token?: string
  ignoreAssetsOnly?: boolean
}

/**
 * Use git clone to fetch the manifest, to avoid having to handle github oauth
 * URL format must be in the form `https://github.com/<ORG>/<REPO>/blob/<BRANCH>/<MANIFEST_NAME>.manifest.json
 */

const fetchManifest = async ({ org, repo, branch, commit, tag }) => {
  try {
    const clonePath = path.resolve(appRootPath.path, '.temp', repo)
    try {
      // Using async IO operations to avoid blocking the thread and event loop
      await fsp.stat(clonePath)

      try {
        // Using async IO operations to avoid blocking the thread and event loop
        await fsp.rm(clonePath, { recursive: true })
      } catch (e) {
        console.error(`Unexpected error while deleting directory ${clonePath} Error: ${e}`)
      }
    } catch (e) {
      // if this catch is triggered means that the folder doesn't exist, therefore
      // it's safe to execute the logic below, no error handling required.
    }
    await fsp.mkdir(clonePath, { recursive: true })
    // enforce ssh connection rather than deprecated http usr/pwd

    // Clone from the specific branch provided in the URL
    let cloneCommand = 'git clone'

    if (options.token) cloneCommand += ` https://x-access-token:${options.token}@github.com/${org}/${repo} ${clonePath}`
    else cloneCommand += ` git@github.com:${org}/${repo} ${clonePath}`
    if (options.singleBranch) cloneCommand += ' --single-branch'
    console.log(`Cloning ${org}/${repo} on ${tag || commit || branch || 'main'} for manifest`)
    await execPromise(cloneCommand, {
      cwd: appRootPath.path
    })
    if (branch || commit || tag) {
      if (tag)
        await execPromise(`git checkout ${tag}`, {
          cwd: clonePath
        })
      else if (commit)
        await execPromise(`git checkout ${commit}`, {
          cwd: clonePath
        })
      else if (branch)
        await execPromise(`git checkout -b ${branch}`, {
          cwd: clonePath
        })
    }
    const manifestPath = path.resolve(clonePath, 'manifest.json')
    const manifestData = fs.readFileSync(manifestPath, 'utf8')
    return JSON.parse(manifestData)
  } catch (err) {
    console.log(err)
    cli.fatal('Failed to fetch manifest')
  }
}

interface PackageManifestV100 {
  version: string // semver
  name: string
  dependencies?: (
    | string
    | {
        name: string
        commit?: string
        tag?: string
        branch?: string
      }
  )[]
}

const resolveDependencies = async (
  initialManifest: ManifestJson
): Promise<{ dependencies: ResolvedDependency[]; conflicts: string[] }> => {
  const resolvedDeps = new Map<string, ResolvedDependency>()
  const conflicts: string[] = []
  const visited = new Set<string>()

  const processDependencies = async (manifest: ManifestJson, projectName: string) => {
    if (visited.has(projectName)) return
    visited.add(projectName)

    if (!manifest.dependencies) return

    await Promise.all(
      manifest.dependencies.map(async (dep) => {
        const normalized = normalizeDependency(dep)
        if (options.ignoreAssetsOnly && dep.assetsOnly) return
        const existing = resolvedDeps.get(normalized.name)

        if (existing) {
          // Resolve both dependencies to commit SHAs for accurate conflict detection
          let existingCommitSha = existing.ref
          let normalizedCommitSha = normalized.ref

          // Check for conflicts using resolved commit SHAs
          if (existingCommitSha !== normalizedCommitSha) {
            const existingDesc =
              existing.refType === 'branch'
                ? `${existing.refType} ${existing.ref} (${existingCommitSha})`
                : `${existing.refType} ${existing.ref}`
            const normalizedDesc =
              normalized.refType === 'branch'
                ? `${normalized.refType} ${normalized.ref} (${normalizedCommitSha})`
                : `${normalized.refType} ${normalized.ref}`

            conflicts.push(`Conflict for ${normalized.name}: ${existingDesc} vs ${normalizedDesc}`)
          }
          return
        }

        try {
          const [org, repo] = normalized.name.split('/')
          // Fetch the dependency's manifest
          const depManifest = await fetchManifest({
            org,
            repo,
            branch: normalized.refType === 'branch' ? normalized.ref : undefined,
            commit: normalized.refType === 'commit' ? normalized.ref : undefined,
            tag: normalized.refType === 'tag' ? normalized.ref : undefined
          })

          const resolvedDep: ResolvedDependency = {
            ...normalized,
            manifest: depManifest
          }

          resolvedDeps.set(normalized.name, resolvedDep)

          // Recursively process this dependency's dependencies
          await processDependencies(depManifest, normalized.name)
        } catch (err) {
          logger.error(`Failed to resolve dependency ${normalized.name}:`, err)
          throw err
        }
      })
    )
  }

  await processDependencies(initialManifest, initialManifest.name)

  return {
    dependencies: Array.from(resolvedDeps.values()),
    conflicts
  }
}

const installManifest = async () => {
  const { branch, commit, tag, singleBranch } = options // ?? 'main' -> unnecessary coalescing operator, leveraging default value from cli settings instead
  const [org, repo] = options.manifestRepo.split('/')
  const manifest = (await fetchManifest({
    org,
    repo,
    branch,
    commit,
    tag
  })) as PackageManifestV100
  const replacing = options.replace
  if (!manifest) throw new Error('No manifest found')
  if (!manifest.version) throw new Error('No version found in manifest')
  if (manifest.version !== '1.0.0') throw new Error('Unsupported manifest version')
  if (!manifest.dependencies) {
    console.log('No dependencies found in manifest')
    cli.exit(0)
  }

  console.log(`Cloning packages for ${manifest.name}`)

  const { dependencies, conflicts } = await resolveDependencies(manifest)

  if (conflicts.length > 0) {
    console.log('Conflicts detected:', conflicts)
    cli.exit(1)
  }

  await Promise.all(
    dependencies.map(async (item) => {
      if (typeof item === 'string') item = { name: item }
      const name = item.name

      /** Check if folder already exists */
      const repoSegments = name.split('/')
      const repo = repoSegments[repoSegments.length - 1]
      const org = repoSegments[repoSegments.length - 2]
      if (!repo) throw new Error('Invalid dependency, repo not found')
      if (!org) throw new Error('Invalid repo, org root not found')
      const packageDir = path.resolve(appRootPath.path, 'packages/projects/projects', org, repo)
      /*
       Performing Sync IO Operations withing Async Processes is an anti-pattern that will block
       the Thread and the Event Loop therefore defeats the purpose of having a Promise.all which is expected to execute
       async processes in parallel, using sync io operations in async processes drastically hurts performance...

       Deprecated: const folderExists = fs.existsSync(packageDir)

       reference: https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking
      */
      await fsp.mkdir(packageDir, { recursive: true })
      await fsp.cp(path.resolve(appRootPath.path, '.temp', repo), packageDir, {
        recursive: true,
        force: replacing
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

  // remove temp folder
  fs.rmSync(path.resolve(appRootPath.path, '.temp'), { recursive: true })
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

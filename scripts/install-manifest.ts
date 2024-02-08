/**
 * Install-manifest.ts
 * - uses CLI to fetch a manifest and clone projects
 */

import { exec } from 'child_process'

import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'
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
      console.log(`Cloning ${url}`)
      await execPromise(`git clone ${url}`, {
        cwd: path.resolve(appRootPath.path, 'packages/projects/projects')
      })
      await execPromise(`git checkout ${branch}`, {
        cwd: path.resolve(appRootPath.path, 'packages/projects/projects')
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

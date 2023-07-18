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

import { ECRClient } from '@aws-sdk/client-ecr'
import { DescribeImagesCommand, ECRPUBLICClient } from '@aws-sdk/client-ecr-public'
import * as k8s from '@kubernetes/client-node'
import appRootPath from 'app-root-path'
import { exec } from 'child_process'
import { compareVersions } from 'compare-versions'
import _ from 'lodash'
import fetch from 'node-fetch'
import path from 'path'
import semver from 'semver'
import Sequelize, { Op } from 'sequelize'
import { promisify } from 'util'

import { BuilderTag } from '@etherealengine/common/src/interfaces/BuilderTags'
import { ProjectCommitInterface } from '@etherealengine/common/src/interfaces/ProjectCommitInterface'
import { ProjectInterface, ProjectPackageJsonType } from '@etherealengine/common/src/interfaces/ProjectInterface'
import { helmSettingPath } from '@etherealengine/engine/src/schemas/setting/helm-setting.schema'
import { getState } from '@etherealengine/hyperflux'
import { ProjectConfigInterface, ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getPodsData } from '../../cluster/server-info/server-info-helper'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import logger from '../../ServerLogger'
import { ServerState } from '../../ServerState'
import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '../../setting/helm-setting/helm-setting'
import { getOctokitForChecking, getUserRepos } from './github-helper'
import { ProjectParams } from './project.class'

export const dockerHubRegex = /^[\w\d\s\-_]+\/[\w\d\s\-_]+:([\w\d\s\-_.]+)$/
export const publicECRRepoRegex = /^public.ecr.aws\/[a-zA-Z0-9]+\/([a-z0-9\-_\\]+)$/
export const publicECRTagRegex = /^public.ecr.aws\/[a-zA-Z0-9]+\/[a-z0-9\-_\\]+:([\w\d\s\-_.]+?)$/
export const privateECRRepoRegex = /^[a-zA-Z0-9]+.dkr.ecr.([\w\d\s\-_]+).amazonaws.com\/([a-z0-9\-_\\]+)$/
export const privateECRTagRegex = /^[a-zA-Z0-9]+.dkr.ecr.([\w\d\s\-_]+).amazonaws.com\/[a-z0-9\-_\\]+:([\w\d\s\-_.]+)$/

const BRANCH_PER_PAGE = 100
const COMMIT_PER_PAGE = 10

const execAsync = promisify(exec)

interface GitHubFile {
  status: number
  url: string
  data: {
    name: string
    path: string
    sha: string
    size: number
    url: string
    html_url: string
    ssh_url: string
    git_url: string
    download_url: string
    type: string
    content: string
    encoding: string
    _links: {
      self: string
      git: string
      html: string
    }
  }
}

export const updateBuilder = async (
  app: Application,
  tag: string,
  data,
  params: ProjectParams,
  storageProviderName?: string
) => {
  try {
    // invalidate cache for all installed projects
    await getStorageProvider(storageProviderName).createInvalidation(['projects*'])
  } catch (e) {
    logger.error(e, `[Project Rebuild]: Failed to invalidate cache with error: ${e.message}`)
  }

  if (data.updateProjects) {
    await Promise.all(data.projectsToUpdate.map((project) => app.service('project').update(project, null, params)))
  }

  const helmSettingsResult = await app.service(helmSettingPath).find()
  const helmSettings = helmSettingsResult.total > 0 ? helmSettingsResult.data[0] : null
  const builderDeploymentName = `${config.server.releaseName}-builder`

  if (helmSettings && helmSettings.builder && helmSettings.builder.length > 0)
    await execAsync(
      `helm upgrade --reuse-values --version ${helmSettings.builder} --set builder.image.tag=${tag} ${builderDeploymentName} etherealengine/etherealengine-builder`
    )
  else {
    const { stdout } = await execAsync(`helm history ${builderDeploymentName} | grep deployed`)
    const builderChartVersion = BUILDER_CHART_REGEX.exec(stdout)
    if (builderChartVersion)
      await execAsync(
        `helm upgrade --reuse-values --version ${builderChartVersion} --set builder.image.tag=${tag} ${builderDeploymentName} etherealengine/etherealengine-builder`
      )
  }
}

export const checkBuilderService = async (app: Application): Promise<boolean> => {
  let isRebuilding = true
  const k8DefaultClient = getState(ServerState).k8DefaultClient

  // check k8s to find the status of builder service
  if (k8DefaultClient && config.server.releaseName !== 'local') {
    try {
      logger.info('Attempting to check k8s rebuild status')

      const builderLabelSelector = `app.kubernetes.io/instance=${config.server.releaseName}-builder`
      const containerName = 'etherealengine-builder'

      const builderPods = await k8DefaultClient.listNamespacedPod(
        'default',
        undefined,
        false,
        undefined,
        undefined,
        builderLabelSelector
      )
      const runningBuilderPods = builderPods.body.items.filter((item) => item.status && item.status.phase === 'Running')

      if (runningBuilderPods.length > 0) {
        const podName = runningBuilderPods[0].metadata?.name

        const builderLogs = await k8DefaultClient.readNamespacedPodLog(
          podName!,
          'default',
          containerName,
          undefined,
          false,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        )

        const isCompleted = builderLogs.body.includes('sleep infinity')
        if (isCompleted) {
          logger.info(podName, 'podName')
          isRebuilding = false
        }
      }
    } catch (e) {
      logger.error(e)
      return e
    }
  } else {
    isRebuilding = false
  }

  return isRebuilding
}

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

export const onProjectEvent = async (
  app: Application,
  projectName: string,
  hookPath: string,
  eventType: keyof ProjectEventHooks,
  ...args
) => {
  const hooks = require(path.resolve(projectsRootFolder, projectName, hookPath)).default
  if (typeof hooks[eventType] === 'function') {
    if (args && args.length > 0) {
      return await hooks[eventType](app, ...args)
    }
    return await hooks[eventType](app)
  }
}

export const getProjectConfig = (projectName: string): ProjectConfigInterface => {
  try {
    return require(path.resolve(projectsRootFolder, projectName, 'xrengine.config.ts')).default
  } catch (e) {
    logger.error(
      e,
      '[Projects]: WARNING project with ' +
        `name ${projectName} has no xrengine.config.ts file - this is not recommended.`
    )
    return null!
  }
}

export const getProjectPackageJson = (projectName: string): ProjectPackageJsonType => {
  return require(path.resolve(projectsRootFolder, projectName, 'package.json'))
}

export const getEnginePackageJson = (): ProjectPackageJsonType => {
  return require(path.resolve(appRootPath.path, 'packages/server-core/package.json'))
}

//DO NOT REMOVE!
//Even though an IDE may say that it's not used in the codebase, projects may use this.
export const getProjectEnv = async (app: Application, projectName: string) => {
  const projectSetting = await app.service('project-setting').find({
    query: {
      $limit: 1,
      name: projectName,
      $select: ['settings']
    }
  })
  const settings = {} as { [key: string]: string }
  Object.values(projectSetting).map(({ key, value }) => (settings[key] = value))
  return settings
}

export const checkUnfetchedSourceCommit = async (app: Application, sourceURL: string, params: ProjectParams) => {
  const { selectedSHA } = params.query!

  const { owner, repo, octoKit: sourceOctoKit } = await getOctokitForChecking(app, sourceURL!, params)

  if (!sourceOctoKit)
    return {
      error: 'invalidSourceOctokit',
      text: 'You do not have access to the source GitHub repo'
    }
  if (!owner || !repo)
    return {
      error: 'invalidSourceURL',
      text: 'The source URL is not valid, or you do not have access to it'
    }
  let commit
  try {
    commit = await sourceOctoKit.rest.repos.getCommit({
      owner,
      repo,
      ref: selectedSHA || '',
      per_page: 1
    })
  } catch (err) {
    logger.error(err)
    if (err.status === 422) {
      return {
        error: 'commitInvalid',
        text: 'That commit does not appear to exist'
      }
    } else return Promise.reject(err)
  }

  try {
    const blobResponse = await sourceOctoKit.rest.repos.getContent({
      owner,
      repo,
      path: 'package.json',
      ref: commit.data.sha
    })
    const content = JSON.parse(Buffer.from((blobResponse.data as { content: string }).content, 'base64').toString())
    const enginePackageJson = getEnginePackageJson()
    return {
      projectName: content.name,
      projectVersion: content.version,
      engineVersion: content.etherealEngine?.version,
      commitSHA: commit.data.sha,
      datetime: commit.data.commit.committer.date,
      matchesEngineVersion: content.etherealEngine?.version
        ? compareVersions(content.etherealEngine?.version, enginePackageJson.version || '0.0.0') === 0
        : false
    }
  } catch (err) {
    logger.error("Error getting commit's package.json %s/%s %s", owner, repo, err.toString())
    return Promise.reject(err)
  }
}

export const checkProjectDestinationMatch = async (app: Application, params: ProjectParams) => {
  const { sourceURL, selectedSHA, destinationURL, existingProject } = params.query!
  const {
    owner: destinationOwner,
    repo: destinationRepo,
    octoKit: destinationOctoKit
  } = await getOctokitForChecking(app, destinationURL!, params)
  const {
    owner: sourceOwner,
    repo: sourceRepo,
    octoKit: sourceOctoKit
  } = await getOctokitForChecking(app, sourceURL!, params)

  if (!sourceOctoKit)
    return {
      error: 'invalidSourceOctokit',
      text: 'You do not have access to the source GitHub repo'
    }
  if (!destinationOctoKit)
    return {
      error: 'invalidDestinationOctokit',
      text: 'You do not have access to the destination GitHub repo'
    }
  if (!sourceOwner || !sourceRepo)
    return {
      error: 'invalidSourceURL',
      text: 'The source URL is not valid, or you do not have access to it'
    }
  if (!destinationOwner || !destinationRepo)
    return {
      error: 'invalidDestinationURL',
      text: 'The destination URL is not valid, or you do not have access to it'
    }
  const [sourceBlobResponse, sourceConfigResponse, destinationBlobResponse]: [
    sourceBlobResponse: any,
    sourceConfigResponse: any,
    destinationBlobResponse: any
  ] = await Promise.all([
    new Promise(async (resolve, reject) => {
      try {
        const sourcePackage = await sourceOctoKit.rest.repos.getContent({
          owner: sourceOwner,
          repo: sourceRepo,
          path: 'package.json',
          ref: selectedSHA
        })
        resolve(sourcePackage)
      } catch (err) {
        logger.error(err)
        if (err.status === 404) {
          resolve({
            error: 'sourcePackageMissing',
            text: 'There is no package.json in the source repo'
          })
        } else reject(err)
      }
    }),
    new Promise(async (resolve, reject) => {
      try {
        const sourceConfig = await sourceOctoKit.rest.repos.getContent({
          owner: sourceOwner,
          repo: sourceRepo,
          path: 'xrengine.config.ts',
          ref: selectedSHA
        })
        resolve(sourceConfig)
      } catch (err) {
        logger.error(err)
        if (err.status === 404) {
          resolve({
            error: 'sourceConfigMissing',
            text: 'There is no xrengine.config.ts in the source repo'
          })
        } else reject(err)
      }
    }),
    new Promise(async (resolve, reject) => {
      try {
        const destinationPackage = await destinationOctoKit.rest.repos.getContent({
          owner: destinationOwner,
          repo: destinationRepo,
          path: 'package.json'
        })
        resolve(destinationPackage)
      } catch (err) {
        logger.error('destination package fetch error', err)
        if (err.status === 404) {
          resolve({
            error: 'destinationPackageMissing',
            text: 'There is no package.json in the source repo'
          })
        } else reject(err)
      }
    })
  ])
  if (sourceBlobResponse.error) return sourceBlobResponse
  if (sourceConfigResponse.error) return sourceConfigResponse
  const sourceContent = JSON.parse(
    Buffer.from(sourceBlobResponse.data.content, sourceBlobResponse.data.encoding).toString()
  )
  if (!existingProject) {
    const projectExists = await app.service('project').find({
      query: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
            [Op.like]: '%' + sourceContent.name.toLowerCase() + '%'
          })
        ]
      }
    })
    if (projectExists.data.length > 0)
      return {
        sourceProjectMatchesDestination: false,
        error: 'projectExists',
        text: `The source project, ${sourceContent.name}, is already installed`
      }
  }
  if (destinationBlobResponse.error && destinationBlobResponse.error !== 'destinationPackageMissing')
    return destinationBlobResponse
  if (destinationBlobResponse.error === 'destinationPackageMissing')
    return { sourceProjectMatchesDestination: true, projectName: sourceContent.name }
  const destinationContent = JSON.parse(Buffer.from(destinationBlobResponse.data.content, 'base64').toString())
  if (sourceContent.name.toLowerCase() !== destinationContent.name.toLowerCase())
    return {
      error: 'invalidRepoProjectName',
      text: 'The repository you are attempting to update from contains a different project than the one you are updating'
    }
  else return { sourceProjectMatchesDestination: true, projectName: sourceContent.name }
}

export const checkDestination = async (app: Application, url: string, params?: ProjectParams) => {
  const inputProjectURL = params!.query!.inputProjectURL!
  const octokitResponse = await getOctokitForChecking(app, url, params!)
  const { owner, repo, octoKit, token } = octokitResponse

  const returned = {} as any
  if (!owner || !repo)
    return {
      error: 'invalidUrl',
      text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
    }

  if (!octoKit)
    return {
      error: 'invalidDestinationOctokit',
      text: 'You do not have access to the destination GitHub repo'
    }

  try {
    const [authUser, repos] = await Promise.all([octoKit.rest.users.getAuthenticated(), getUserRepos(token)])
    const matchingRepo = repos.find(
      (repo) =>
        repo.html_url.toLowerCase() === url.toLowerCase() ||
        `${repo.html_url.toLowerCase()}.git` === url.toLowerCase() ||
        repo.ssh_url.toLowerCase() === url.toLowerCase() ||
        `${repo.ssh_url.toLowerCase()}.git` === url.toLowerCase()
    )
    if (!matchingRepo)
      return {
        error: 'invalidDestinationURL',
        text: 'The destination URL is not valid, or you do not have access to it'
      }
    const repoAccessible = owner === authUser.data.login || matchingRepo

    if (!repoAccessible) {
      returned.error = 'invalidDestinationURL'
      returned.text = `You do not appear to have access to this repository. If this seems wrong, click the button 
      "Refresh GitHub Repo Access" and try again. If you are only in the organization that owns this repo, make sure that the
      organization has installed the OAuth app associated with this installation, and that your personal GitHub account
      has granted access to the organization: https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/requesting-organization-approval-for-oauth-apps`
    }
    returned.destinationValid =
      matchingRepo.permissions?.push || matchingRepo.permissions?.admin || matchingRepo.permissions?.maintain || false
    if (!returned.destinationValid)
      return {
        error: 'invalidPermission',
        text: 'You do not have personal push, maintain, or admin access to this repo.'
      }
    let destinationPackage
    try {
      destinationPackage = await octoKit.rest.repos.getContent({ owner, repo, path: 'package.json' })
    } catch (err) {
      logger.error('destination package fetch error', err)
      if (err.status !== 404) throw err
    }
    if (destinationPackage)
      returned.projectName = JSON.parse(Buffer.from(destinationPackage.data.content, 'base64').toString()).name
    else returned.repoEmpty = true

    if (inputProjectURL?.length > 0) {
      const projectOctokitResponse = await getOctokitForChecking(app, inputProjectURL, params!)
      const { owner: existingOwner, repo: existingRepo, octoKit: projectOctoKit } = projectOctokitResponse
      if (!projectOctoKit)
        return {
          error: 'invalidDestinationOctokit',
          text: 'You do not have access to the new GitHub repo'
        }
      if (!existingOwner || !existingRepo)
        return {
          error: 'invalidDestinationURL',
          text: 'The destination URL is not valid, or you do not have access to it'
        }
      let existingProjectPackage
      try {
        existingProjectPackage = await projectOctoKit.rest.repos.getContent({
          owner: existingOwner,
          repo: existingRepo,
          path: 'package.json'
        })
        const existingProjectName = JSON.parse(
          Buffer.from(existingProjectPackage.data.content, 'base64').toString()
        ).name
        if (!returned.repoEmpty && existingProjectName.toLowerCase() !== returned.projectName.toLowerCase()) {
          returned.error = 'mismatchedProjects'
          returned.text = `The new destination repo contains project '${returned.projectName}', which is different than the current project '${existingProjectName}'`
        }
      } catch (err) {
        logger.error('destination package fetch error', err)
        if (err.status !== 404) throw err
      }
    }
    return returned
  } catch (err) {
    logger.error('error checking destination URL %o', err)
    if (err.status === 404)
      return {
        error: 'invalidUrl',
        text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
      }
    throw err
  }
}

export const getBranches = async (app: Application, url: string, params?: ProjectParams) => {
  const octokitResponse = await getOctokitForChecking(app, url, params!)
  const { owner, repo, octoKit } = octokitResponse

  if (!owner || !repo)
    return {
      error: 'invalidUrl',
      text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
    }

  if (!octoKit)
    return {
      error: 'invalidSourceOctokit',
      text: 'You do not have access to the source GitHub repo'
    }

  try {
    const repoResponse = await octoKit.rest.repos.get({ owner, repo })
    let returnedBranches = [] as { name: string; branchType: string }[]
    let endPagination = false
    let page = 1
    while (!endPagination) {
      const branches = (
        await octoKit.rest.repos.listBranches({
          owner,
          repo,
          per_page: BRANCH_PER_PAGE,
          page
        })
      ).data
      page++
      if (branches.length < BRANCH_PER_PAGE || branches.length === 0) endPagination = true
      returnedBranches = returnedBranches.concat(
        branches.map((branch) => {
          return {
            name: branch.name,
            branchType:
              branch.name === repoResponse.data.default_branch
                ? 'main'
                : branch.name === `${config.server.releaseName}-deployment`
                ? 'deployment'
                : 'generic'
          }
        })
      )
    }
    return returnedBranches
  } catch (err) {
    logger.error('error getting branches for project %o', err)
    if (err.status === 404)
      return {
        error: 'invalidUrl',
        text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
      }
    throw err
  }
}

export const getProjectCommits = async (
  app: Application,
  url: string,
  params?: ProjectParams
): Promise<ProjectCommitInterface[] | { error: string; text: string }> => {
  try {
    const octokitResponse = await getOctokitForChecking(app, url, params!)
    const { owner, repo, octoKit } = octokitResponse

    if (!owner || !repo)
      return {
        error: 'invalidUrl',
        text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
      }

    if (!octoKit)
      return {
        error: 'invalidDestinationOctokit',
        text: 'You does not have access to the destination GitHub repo'
      }

    const enginePackageJson = getEnginePackageJson()
    const repoResponse = await octoKit.rest.repos.get({ owner, repo })
    const branchName = params!.query!.branchName || (repoResponse as any).default_branch
    const headResponse = await octoKit.rest.repos.listCommits({
      owner,
      repo,
      sha: branchName,
      per_page: COMMIT_PER_PAGE
    })
    const commits = headResponse.data
    const mappedCommits = (await Promise.all(
      commits.map(
        (commit) =>
          new Promise(async (resolve, reject) => {
            try {
              const blobResponse = await octoKit.rest.repos.getContent({
                owner,
                repo,
                path: 'package.json',
                ref: commit.sha
              })
              const content = JSON.parse(
                Buffer.from((blobResponse.data as { content: string }).content, 'base64').toString()
              )
              resolve({
                projectName: content.name,
                projectVersion: content.version,
                engineVersion: content.etherealEngine?.version,
                commitSHA: commit.sha,
                datetime: commit?.commit?.committer?.date || new Date().toString(),
                matchesEngineVersion: content.etherealEngine?.version
                  ? compareVersions(content.etherealEngine?.version, enginePackageJson.version || '0.0.0') === 0
                  : false
              })
            } catch (err) {
              logger.error("Error getting commit's package.json %s/%s:%s %s", owner, repo, branchName, err.toString())
              resolve({
                discard: true
              })
            }
          })
      )
    )) as ProjectCommitInterface[]
    return mappedCommits.filter((commit) => !commit.discard)
  } catch (err) {
    logger.error('error getting repo commits %o', err)
    if (err.status === 404)
      return {
        error: 'invalidUrl',
        text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
      }
    else if (err.status === 409)
      return {
        error: 'repoEmpty',
        text: 'This repo is empty'
      }
    throw err
  }
}

export const findBuilderTags = async (): Promise<Array<BuilderTag>> => {
  const builderRepo = (process.env.BUILDER_REPOSITORY as string) || ''
  const publicECRExec = publicECRRepoRegex.exec(builderRepo)
  const privateECRExec = privateECRRepoRegex.exec(builderRepo)
  if (publicECRExec) {
    const ecr = new ECRPUBLICClient({
      credentials: {
        accessKeyId: config.aws.eks.accessKeyId,
        secretAccessKey: config.aws.eks.secretAccessKey
      },
      region: 'us-east-1'
    })
    const command = {
      repositoryName: publicECRExec[1]
    }
    const result = new DescribeImagesCommand(command)
    const response = await ecr.send(result)
    if (!response || !response.imageDetails) return []
    return response.imageDetails
      .filter(
        (imageDetails) => imageDetails.imageTags && imageDetails.imageTags.length > 0 && imageDetails.imagePushedAt
      )
      .sort((a, b) => b.imagePushedAt!.getTime() - a!.imagePushedAt!.getTime())
      .map((imageDetails) => {
        const tag = imageDetails.imageTags!.find((tag) => !/latest/.test(tag))!
        const tagSplit = tag ? tag.split('_') : ''
        return {
          tag,
          commitSHA: tagSplit.length === 1 ? tagSplit[0] : tagSplit[1],
          engineVersion: tagSplit.length === 1 ? 'unknown' : tagSplit[0],
          pushedAt: imageDetails.imagePushedAt!.toJSON()
        }
      })
  } else if (privateECRExec) {
    const ecr = new ECRClient({
      credentials: {
        accessKeyId: config.aws.eks.accessKeyId,
        secretAccessKey: config.aws.eks.secretAccessKey
      },
      region: privateECRExec[1]
    })
    const command = {
      repositoryName: privateECRExec[2]
    }
    const result = new DescribeImagesCommand(command)
    const response = await ecr.send(result)
    if (!response || !response.imageDetails) return []
    return response.imageDetails
      .filter(
        (imageDetails) => imageDetails.imageTags && imageDetails.imageTags.length > 0 && imageDetails.imagePushedAt
      )
      .sort((a, b) => b.imagePushedAt!.getTime() - a.imagePushedAt!.getTime())
      .map((imageDetails) => {
        const tag = imageDetails.imageTags!.find((tag) => !/latest/.test(tag))!
        const tagSplit = tag ? tag.split('_') : ''
        return {
          tag,
          commitSHA: tagSplit.length === 1 ? tagSplit[0] : tagSplit[1],
          engineVersion: tagSplit.length === 1 ? 'unknown' : tagSplit[0],
          pushedAt: imageDetails.imagePushedAt!.toJSON()
        }
      })
  } else {
    const repoSplit = builderRepo.split('/')
    const registry = repoSplit.length === 1 ? 'etherealengine' : repoSplit[0]
    const repo =
      repoSplit.length === 1 ? (repoSplit[0].length === 0 ? 'etherealengine-builder' : repoSplit[0]) : repoSplit[1]
    try {
      const result = await fetch(
        `https://registry.hub.docker.com/v2/repositories/${registry}/${repo}/tags?page_size=100`
      )
      const body = JSON.parse(Buffer.from(await result.arrayBuffer()).toString())
      return body.results.map((imageDetails) => {
        const tag = imageDetails.name
        const tagSplit = tag.split('_')
        return {
          tag,
          commitSHA: tagSplit.length === 1 ? tagSplit[0] : tagSplit[1],
          engineVersion: tagSplit.length === 1 ? 'unknown' : tagSplit[0],
          pushedAt: new Date(imageDetails.tag_last_pushed).toJSON()
        }
      })
    } catch (e) {
      console.error(e)
      return []
    }
  }
}

export const getLatestProjectTaggedCommitInBranch = async (
  app: Application,
  url: string,
  branchName: string,
  params: ProjectParams
): Promise<string[] | { error: string; text: string }> => {
  const octokitResponse = await getOctokitForChecking(app, url, params!)
  const { owner, repo, octoKit } = octokitResponse

  if (!owner || !repo)
    return {
      error: 'invalidUrl',
      text: 'Project URL is not a valid GitHub URL, or the GitHub repo is private'
    }

  if (!octoKit)
    return {
      error: 'invalidDestinationOctokit',
      text: 'You does not have access to the destination GitHub repo'
    }

  const tagResponse = await octoKit.rest.repos.listTags({
    owner,
    repo,
    per_page: BRANCH_PER_PAGE
  })

  const commitResponse = await octoKit.rest.repos.listCommits({
    owner,
    repo,
    sha: branchName,
    per_page: COMMIT_PER_PAGE
  })

  let latestTaggedCommitInBranch
  let sortedTags = semver.rsort(tagResponse.data.map((item) => item.name))
  const taggedCommits = [] as string[]
  sortedTags.forEach((tag) => taggedCommits.push(tagResponse.data.find((item) => item.name === tag)!.commit.sha))
  const branchCommits = commitResponse.data.map((response) => response.sha)
  for (const commit of taggedCommits) {
    if (branchCommits.indexOf(commit) > -1) {
      latestTaggedCommitInBranch = commit
      break
    }
  }

  return latestTaggedCommitInBranch
}

export const getCronJobBody = (project: ProjectInterface, image: string): object => {
  return {
    metadata: {
      name: `${process.env.RELEASE_NAME}-${project.name}-auto-update`,
      labels: {
        'etherealengine/projectUpdater': 'true',
        'etherealengine/projectField': project.name,
        'etherealengine/projectId': project.id,
        'etherealengine/release': process.env.RELEASE_NAME
      }
    },
    spec: {
      schedule: project.updateSchedule,
      concurrencyPolicy: 'Replace',
      successfulJobsHistoryLimit: 1,
      failedJobsHistoryLimit: 2,
      jobTemplate: {
        spec: {
          template: {
            metadata: {
              labels: {
                'etherealengine/projectUpdater': 'true',
                'etherealengine/projectField': project.name,
                'etherealengine/projectId': project.id,
                'etherealengine/release': process.env.RELEASE_NAME
              }
            },
            spec: {
              serviceAccountName: `${process.env.RELEASE_NAME}-etherealengine-api`,
              containers: [
                {
                  name: `${process.env.RELEASE_NAME}-${project.name}-auto-update`,
                  image,
                  imagePullPolicy: 'IfNotPresent',
                  command: [
                    'npx',
                    'cross-env',
                    'ts-node',
                    '--swc',
                    'scripts/update-project.ts',
                    '--projectName',
                    `${project.name}`
                  ],
                  env: Object.entries(process.env).map(([key, value]) => {
                    return { name: key, value: value }
                  })
                }
              ],
              restartPolicy: 'OnFailure'
            }
          }
        }
      }
    }
  }
}

export const createOrUpdateProjectUpdateJob = async (app: Application, projectName: string): Promise<void> => {
  const project = await app.service('project').Model.findOne({
    where: {
      name: projectName
    }
  })

  const apiPods = await getPodsData(
    `app.kubernetes.io/instance=${config.server.releaseName},app.kubernetes.io/component=api`,
    'api',
    'Api',
    app
  )

  const image = apiPods.pods[0].containers.find((container) => container.name === 'etherealengine')!.image

  const k8BatchClient = getState(ServerState).k8BatchClient

  if (k8BatchClient) {
    try {
      await k8BatchClient.patchNamespacedCronJob(
        `${process.env.RELEASE_NAME}-${projectName}-auto-update`,
        'default',
        getCronJobBody(project, image),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            'content-type': k8s.PatchUtils.PATCH_FORMAT_JSON_MERGE_PATCH
          }
        }
      )
    } catch (err) {
      logger.error('Could not find cronjob %o', err)
      await k8BatchClient.createNamespacedCronJob('default', getCronJobBody(project, image))
    }
  }
}

export const removeProjectUpdateJob = async (app: Application, projectName: string): Promise<void> => {
  try {
    const k8BatchClient = getState(ServerState).k8BatchClient
    if (k8BatchClient)
      await k8BatchClient.deleteNamespacedCronJob(`${process.env.RELEASE_NAME}-${projectName}-auto-update`, 'default')
  } catch (err) {
    logger.error('Failed to remove project update cronjob %o', err)
  }
}

export const checkProjectAutoUpdate = async (app: Application, projectName: string): Promise<void> => {
  let commitSHA
  const project = await app.service('project').Model.findOne({
    where: {
      name: projectName
    }
  })
  const user = await app.service('user').get(project.updateUserId)
  if (project.updateType === 'tag') {
    const latestTaggedCommit = await getLatestProjectTaggedCommitInBranch(
      app,
      project.sourceRepo,
      project.sourceBranch,
      { user }
    )
    if (latestTaggedCommit !== project.commitSHA) commitSHA = latestTaggedCommit
  } else if (project.updateType === 'commit') {
    const commits = await getProjectCommits(app, project.sourceRepo, {
      user,
      query: { branchName: project.branchName }
    })
    if (commits && commits[0].commitSHA !== project.commitSHA) commitSHA = commits[0].commitSHA
  }
  if (commitSHA)
    await app.service('project').update(
      {
        sourceURL: project.sourceRepo,
        destinationURL: project.repositoryPath,
        name: projectName,
        reset: true,
        commitSHA,
        sourceBranch: project.sourceBranch,
        updateType: project.updateType,
        updateSchedule: project.updateSchedule
      },
      null,
      { user: user }
    )
}

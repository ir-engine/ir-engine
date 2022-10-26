import appRootPath from 'app-root-path'
import AWS from 'aws-sdk'
import axios from 'axios'
import { compareVersions } from 'compare-versions'
import _ from 'lodash'
import path from 'path'
import Sequelize, { Op } from 'sequelize'

import { ProjectBranchInterface } from '@xrengine/common/src/interfaces/ProjectBranchInterface'
import { ProjectPackageJsonType } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectTagInterface } from '@xrengine/common/src/interfaces/ProjectTagInterface'
import { ProjectConfigInterface, ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import logger from '../../ServerLogger'
import { getOctokitForChecking, getUserOrgs } from './github-helper'
import { ProjectParams } from './project.class'

const publicECRRegex = /^public.ecr.aws\/[a-zA-Z0-9]+\/([\w\d\s\-_]+)$/
const privateECRRegex = /^[a-zA-Z0-9]+.dkr.ecr.([\w\d\s\-_]+).amazonaws.com\/([\w\d\s\-_]+)$/

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

  // trigger k8s to re-run the builder service
  if (app.k8AppsClient) {
    try {
      logger.info('Attempting to update builder tag')
      const builderRepo = process.env.BUILDER_REPOSITORY
      const updateBuilderTagResponse = await app.k8AppsClient.patchNamespacedDeployment(
        `${config.server.releaseName}-builder-xrengine-builder`,
        'default',
        {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
              },
              spec: {
                containers: [
                  {
                    name: 'xrengine-builder',
                    image: `${builderRepo}:${tag}`
                  }
                ]
              }
            }
          }
        },
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            'Content-Type': 'application/strategic-merge-patch+json'
          }
        }
      )
      logger.info(updateBuilderTagResponse, 'updateBuilderTagResponse')
      return updateBuilderTagResponse
    } catch (e) {
      logger.error(e)
      return e
    }
  }
}

export const checkBuilderService = async (app: Application): Promise<boolean> => {
  let isRebuilding = true

  // check k8s to find the status of builder service
  if (app.k8DefaultClient && !config.server.local) {
    try {
      logger.info('Attempting to check k8s rebuild status')

      const builderLabelSelector = `app.kubernetes.io/instance=${config.server.releaseName}-builder`
      const containerName = 'xrengine-builder'

      const builderPods = await app.k8DefaultClient.listNamespacedPod(
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

        const builderLogs = await app.k8DefaultClient.readNamespacedPodLog(
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
  eventType: keyof ProjectEventHooks
) => {
  const hooks = require(path.resolve(projectsRootFolder, projectName, hookPath)).default
  if (typeof hooks[eventType] === 'function') await hooks[eventType](app)
}

export const getProjectConfig = async (projectName: string): Promise<ProjectConfigInterface> => {
  try {
    return (await import(`@xrengine/projects/projects/${projectName}/xrengine.config.ts`)).default
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

//DO NOT REMOVE, even though an IDE may say that it's not used in the codebase, projects
//may use this.
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
  const { owner, repo, octoKit } = octokitResponse

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
    const [authUser, orgs] = await Promise.all([
      octoKit.rest.users.getAuthenticated(),
      octoKit.rest.orgs.listForAuthenticatedUser()
    ])
    const orgAccessible =
      owner === authUser.data.login || orgs.data.find((org) => org.login.toLowerCase() === owner.toLowerCase())
    if (!orgAccessible) {
      returned.error = 'appNotAuthorizedInOrg'
      returned.text = `The organization '${owner}' needs to install the GitHub OAuth app '${config.authentication.oauth.github.key}' in order to push code to its repositories. See https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/requesting-organization-approval-for-oauth-apps for further details.`
    }
    const repoResponse = await octoKit.rest.repos.get({ owner, repo })
    if (!repoResponse)
      return {
        error: 'invalidDestinationURL',
        text: 'The destination URL is not valid, or you do not have access to it'
      }
    let destinationPackage
    try {
      destinationPackage = await octoKit.rest.repos.getContent({ owner, repo, path: 'package.json' })
    } catch (err) {
      logger.error('destination package fetch error', err)
      if (err.status !== 404) throw err
    }
    returned.destinationValid = repoResponse.data?.permissions?.push || repoResponse.data?.permissions?.admin || false
    if (destinationPackage)
      returned.projectName = JSON.parse(Buffer.from(destinationPackage.data.content, 'base64').toString()).name
    else returned.repoEmpty = true
    if (!returned.destinationValid) {
      returned.error = 'invalidPermission'
      returned.text = 'You do not have personal push or admin access to this repo.'
    }

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
    const returnedBranches = [{ name: repoResponse.data.default_branch, isMain: true }] as ProjectBranchInterface[]
    const deploymentBranch = `${config.server.releaseName}-deployment`
    try {
      await octoKit.rest.repos.getBranch({ owner, repo, branch: deploymentBranch })
      returnedBranches.push({
        name: deploymentBranch,
        isMain: false
      })
    } catch (err) {
      logger.error(err)
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

export const getTags = async (
  app: Application,
  url: string,
  params?: ProjectParams
): Promise<ProjectTagInterface[] | { error: string; text: string }> => {
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

    let headIsTagged = false
    const enginePackageJson = getEnginePackageJson()
    const repoResponse = await octoKit.rest.repos.get({ owner, repo })
    const branchName = params!.query!.branchName || (repoResponse as any).default_branch
    const [headResponse, tagResponse] = await Promise.all([
      octoKit.rest.repos.listCommits({ owner, repo, sha: branchName }),
      octoKit.rest.repos.listTags({ owner, repo })
    ])
    const commits = headResponse.data.map((commit) => commit.sha)
    const matchingTags = tagResponse.data.filter((tag) => commits.indexOf(tag.commit.sha) > -1)
    let tagDetails = (await Promise.all(
      matchingTags.map(
        (tag) =>
          new Promise(async (resolve, reject) => {
            try {
              if (tag.commit.sha === headResponse.data[0].sha) headIsTagged = true
              const blobResponse = await octoKit.rest.repos.getContent({
                owner,
                repo,
                path: 'package.json',
                ref: tag.name
              })
              const content = JSON.parse(
                Buffer.from((blobResponse.data as { content: string }).content, 'base64').toString()
              )
              resolve({
                projectName: content.name,
                projectVersion: tag.name,
                engineVersion: content.etherealEngine?.version,
                commitSHA: tag.commit.sha,
                matchesEngineVersion: content.etherealEngine?.version
                  ? compareVersions(content.etherealEngine?.version, enginePackageJson.version || '0.0.0') === 0
                  : false
              })
            } catch (err) {
              logger.error('Error getting tagged package.json %s/%s:%s %s', owner, repo, tag.name, err.toString())
              reject(err)
            }
          })
      )
    )) as ProjectTagInterface[]
    tagDetails = tagDetails.sort((a, b) => compareVersions(b.projectVersion, a.projectVersion))
    if (!headIsTagged) {
      const headContent = await octoKit.rest.repos.getContent({ owner, repo, path: 'package.json' })
      const content = JSON.parse(Buffer.from((headContent.data as { content: string }).content, 'base64').toString())
      tagDetails.unshift({
        projectName: content.name,
        projectVersion: '{Latest commit}',
        engineVersion: content.etherealEngine?.version,
        commitSHA: headResponse.data[0].sha,
        matchesEngineVersion: content.etherealEngine?.version
          ? compareVersions(content.etherealEngine?.version, enginePackageJson.version || '0.0.0') === 0
          : false
      })
    }
    return tagDetails
  } catch (err) {
    logger.error('error getting repo tags %o', err)
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

export const findBuilderTags = async () => {
  const builderRepo = process.env.BUILDER_REPOSITORY || ''
  const publicECRExec = publicECRRegex.exec(builderRepo)
  const privateECRExec = privateECRRegex.exec(builderRepo)
  if (publicECRExec) {
    const ecr = new AWS.ECRPUBLIC({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: 'us-east-1'
    })
    const result = await ecr
      .describeImages({
        repositoryName: publicECRExec[1]
      })
      .promise()
    if (!result || !result.imageDetails) return []
    return result.imageDetails
      .filter(
        (imageDetails) => imageDetails.imageTags && imageDetails.imageTags.length > 0 && imageDetails.imagePushedAt
      )
      .sort((a, b) => b.imagePushedAt!.getTime() - a!.imagePushedAt!.getTime())
      .map((imageDetails) => {
        const tag = imageDetails.imageTags!.find((tag) => !/latest/.test(tag))
        const tagSplit = tag ? tag.split('_') : ''
        return {
          tag,
          commitSHA: tagSplit.length === 1 ? tagSplit[0] : tagSplit[1],
          engineVersion: tagSplit.length === 1 ? 'unknown' : tagSplit[0],
          pushedAt: imageDetails.imagePushedAt!.toJSON()
        }
      })
  } else if (privateECRExec) {
    const ecr = new AWS.ECR({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET,
      region: privateECRExec[1]
    })
    const result = await ecr
      .describeImages({
        repositoryName: privateECRExec[2]
      })
      .promise()
    if (!result || !result.imageDetails) return []
    return result.imageDetails
      .filter(
        (imageDetails) => imageDetails.imageTags && imageDetails.imageTags.length > 0 && imageDetails.imagePushedAt
      )
      .sort((a, b) => b.imagePushedAt!.getTime() - a.imagePushedAt!.getTime())
      .map((imageDetails) => {
        const tag = imageDetails.imageTags!.find((tag) => !/latest/.test(tag))
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
    const registry = repoSplit.length === 1 ? 'lagunalabs' : repoSplit[0]
    const repo = repoSplit.length === 1 ? repoSplit[0] : repoSplit[1]
    const result = await axios.get(
      `https://registry.hub.docker.com/v2/repositories/${registry}/${repo}/tags?page_size=100`
    )
    return result.data.results.map((imageDetails) => {
      const tag = imageDetails.name
      const tagSplit = tag.split('_')
      return {
        tag,
        commitSHA: tagSplit.length === 1 ? tagSplit[0] : tagSplit[1],
        engineVersion: tagSplit.length === 1 ? 'unknown' : tagSplit[0],
        pushedAt: new Date(imageDetails.tag_last_pushed).toJSON()
      }
    })
  }
}

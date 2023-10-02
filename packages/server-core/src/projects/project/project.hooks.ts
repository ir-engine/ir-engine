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
import { hooks as schemaHooks } from '@feathersjs/schema'
import { iff, isProvider } from 'feathers-hooks-common'

import { projectPermissionPath } from '@etherealengine/engine/src/schemas/projects/project-permission.schema'
import {
  ProjectType,
  projectDataValidator,
  projectPatchValidator,
  projectPath,
  projectQueryValidator
} from '@etherealengine/engine/src/schemas/projects/project.schema'
import templateProjectJson from '@etherealengine/projects/template-project/package.json'
import fs from 'fs'
import authenticate from '../../hooks/authenticate'
import projectPermissionAuthenticate from '../../hooks/project-permission-authenticate'
import verifyScope from '../../hooks/verify-scope'
import { projectPermissionDataResolver } from '../project-permission/project-permission.resolvers'

import { GITHUB_URL_REGEX } from '@etherealengine/common/src/constants/GitHubConstants'
import { StaticResourceType, staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import { routePath } from '@etherealengine/engine/src/schemas/route/route.schema'
import { locationPath } from '@etherealengine/engine/src/schemas/social/location.schema'
import { AvatarType, avatarPath } from '@etherealengine/engine/src/schemas/user/avatar.schema'
import {
  GithubRepoAccessType,
  githubRepoAccessPath
} from '@etherealengine/engine/src/schemas/user/github-repo-access.schema'
import {
  IdentityProviderType,
  identityProviderPath
} from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { Knex } from 'knex'
import path from 'path'
import logger from '../../ServerLogger'
import config from '../../appconfig'
import { projectsRootFolder } from '../../media/file-browser/file-browser.class'
import { cleanString } from '../../util/cleanString'
import { copyFolderRecursiveSync } from '../../util/fsHelperFunctions'
import { useGit } from '../../util/gitHelperFunctions'
import { checkAppOrgStatus, checkUserOrgWriteStatus, checkUserRepoWriteStatus } from './github-helper'
import {
  createExecutorJob,
  deleteProjectFilesInStorageProvider,
  getEnginePackageJson,
  getProjectConfig,
  getProjectPackageJson,
  getProjectUpdateJobBody,
  onProjectEvent,
  removeProjectUpdateJob,
  updateProject,
  uploadLocalProjectToProvider
} from './project-helper'
import {
  projectDataResolver,
  projectExternalResolver,
  projectPatchResolver,
  projectQueryResolver,
  projectResolver
} from './project.resolvers'

const createProjectPermission = async (context: HookContext) => {
  if (context.params?.user?.id) {
    const projectPermissionData = await projectPermissionDataResolver.resolve(
      {
        userId: context.params.user.id,
        projectId: context.result.id,
        type: 'owner'
      },
      context as any
    )
    return context.app.service(projectPermissionPath).create(projectPermissionData)
  }
  return context
}

const findBeforeActionHook = async (context: HookContext) => {
  let projectPushIds: string[] = []
  if (context.params?.query?.allowed) {
    // See if the user has a GitHub identity-provider, and if they do, also determine which GitHub repos they personally
    // can push to.

    const githubIdentityProvider = (await context.app.service(identityProviderPath).find({
      query: {
        userId: context.params.user!.id,
        type: 'github',
        $limit: 1
      }
    })) as Paginated<IdentityProviderType>

    // Get all of the projects that this user has permissions for, then calculate push status by whether the user
    // can push to it. This will make sure no one tries to push to a repo that they do not have write access to.
    const knexClient: Knex = context.app.get('knexClient')
    const projectPermissions = await knexClient
      .from(projectPermissionPath)
      .join(projectPath, `${projectPath}.id`, `${projectPermissionPath}.projectId`)
      .where(`${projectPermissionPath}.userId`, context.params.user!.id)
      .select()
      .options({ nestTables: true })

    const allowedProjects = await projectPermissions.map((permission) => permission.project)
    const repoAccess =
      githubIdentityProvider.data.length > 0
        ? ((await context.app.service(githubRepoAccessPath).find({
            query: {
              identityProviderId: githubIdentityProvider.data[0].id
            },
            paginate: false
          })) as any as GithubRepoAccessType[])
        : []
    const pushRepoPaths = repoAccess.filter((repo) => repo.hasWriteAccess).map((item) => item.repo.toLowerCase())
    let allowedProjectGithubRepos = allowedProjects.filter((project) => project.repositoryPath != null)
    allowedProjectGithubRepos = await Promise.all(
      allowedProjectGithubRepos.map(async (project) => {
        const regexExec = GITHUB_URL_REGEX.exec(project.repositoryPath)
        if (!regexExec) return { repositoryPath: '', name: '' }
        const split = regexExec[2].split('/')
        project.repositoryPath = `https://github.com/${split[0]}/${split[1]}`
        return project
      })
    )
    const pushableAllowedProjects = allowedProjectGithubRepos.filter(
      (project) => pushRepoPaths.indexOf(project.repositoryPath.toLowerCase().replace(/.git$/, '')) > -1
    )
    projectPushIds = projectPushIds.concat(pushableAllowedProjects.map((project) => project.id))

    if (githubIdentityProvider) {
      const repositoryPaths: string[] = []
      repoAccess.forEach((item) => {
        if (item.hasWriteAccess) {
          const url = item.repo.toLowerCase()
          repositoryPaths.push(url)
          repositoryPaths.push(`${url}.git`)
          const regexExec = GITHUB_URL_REGEX.exec(url)
          if (regexExec) {
            const split = regexExec[2].split('/')
            repositoryPaths.push(`git@github.com:${split[0]}/${split[1]}`)
            repositoryPaths.push(`git@github.com:${split[0]}/${split[1]}.git`)
          }
        }
      })

      const matchingAllowedRepos = (await context.service._find({
        query: { repositoryPath: { $in: repositoryPaths } },
        paginate: false
      })) as ProjectType[]

      projectPushIds = projectPushIds.concat(matchingAllowedRepos.map((repo) => repo.id))
    }

    if (!context.params.user!.scopes?.find((scope) => scope.type === 'admin:admin'))
      context.params.query.id = { $in: [...new Set(allowedProjects.map((project) => project.id))] }
  }

  let paramsWithoutExtras = {
    ...context.params,
    // Explicitly cloned sort object because otherwise it was affecting default params object as well.
    query: context.params?.query ? JSON.parse(JSON.stringify(context.params?.query)) : {}
  }

  paramsWithoutExtras = {
    ...paramsWithoutExtras,
    query: {
      ...paramsWithoutExtras.query,
      $limit: context.params?.query?.$limit || 1000,
      $sort: context.params?.query?.$sort || { name: 1 }
    }
  }

  if (paramsWithoutExtras?.query?.allowed) delete paramsWithoutExtras.query.allowed

  context.params = paramsWithoutExtras
}

const findAfterActionHook = async (context: HookContext) => {
  const data: ProjectType[] = context.result['data'] ? context.result['data'] : context.result
  for (const item of data) {
    try {
      const packageJson = getProjectPackageJson(item.name)
      const config = getProjectConfig(item.name)
      item.thumbnail = config.thumbnail!
      item.version = packageJson.version
      item.engineVersion = packageJson.etherealEngine?.version
      item.description = packageJson.description
      item.hasWriteAccess = projectPushIds.indexOf(item.id) > -1
    } catch (err) {
      //
    }
  }

  return context.params.paginate === false
    ? data
    : {
        data: data,
        total: data.length,
        limit: context.params.query.$limit || 1000,
        skip: context.params.query.$skip || 0
      }
}

const createActionHook = async (context: HookContext) => {
  const templateFolderDirectory = path.join(appRootPath.path, `packages/projects/template-project/`)
  const projectName = cleanString(context.data.name!)
  const projectLocalDirectory = path.resolve(projectsRootFolder, projectName)

  const projectExists = (await context.service._find({
    query: { name: projectName, $limit: 1 }
  })) as Paginated<ProjectType>

  if (projectExists.total > 0) throw new Error(`[Projects]: Project with name ${projectName} already exists`)

  if ((!config.db.forceRefresh && projectName === 'default-project') || projectName === 'template-project')
    throw new Error(`[Projects]: Project name ${projectName} not allowed`)

  copyFolderRecursiveSync(templateFolderDirectory, projectsRootFolder)
  fs.renameSync(path.resolve(projectsRootFolder, 'template-project'), projectLocalDirectory)

  fs.mkdirSync(path.resolve(projectLocalDirectory, '.git'), { recursive: true })

  const git = useGit(path.resolve(projectLocalDirectory, '.git'))
  try {
    await git.init(true)
  } catch (e) {
    logger.warn(e)
  }

  const packageData = Object.assign({}, templateProjectJson) as any
  packageData.name = projectName
  packageData.etherealEngine.version = getEnginePackageJson().version
  fs.writeFileSync(path.resolve(projectLocalDirectory, 'package.json'), JSON.stringify(packageData, null, 2))

  await uploadLocalProjectToProvider(context.self, projectName, false)

  context.data = { ...context.data, name: projectName, needsRebuild: true }
}

const updateActionHook = async (context: HookContext) => {
  if (!config.kubernetes.enabled || context.params?.isJob)
    return updateProject(context.self, context.data, context.params)
  else {
    const urlParts = context.data.sourceURL.split('/')
    let projectName = context.data.name || urlParts.pop()
    if (!projectName) throw new Error('Git repo must be plain URL')
    projectName = projectName.toLowerCase()
    if (projectName.substring(projectName.length - 4) === '.git') projectName = projectName.slice(0, -4)
    if (projectName.substring(projectName.length - 1) === '/') projectName = projectName.slice(0, -1)
    const jobBody = await getProjectUpdateJobBody(context.data, context.self, context.params!.user!.id)
    const jobLabelSelector = `etherealengine/projectField=${context.data.name},etherealengine/release=${process.env.RELEASE_NAME},etherealengine/autoUpdate=false`
    const jobFinishedPromise = createExecutorJob(context.self, jobBody, jobLabelSelector, 1000)
    try {
      await jobFinishedPromise
      const result = (await context.service._find({
        query: {
          name: {
            $like: projectName
          }
        }
      })) as Paginated<ProjectType>
      let returned = {} as ProjectType
      if (result.total > 0) returned = result.data[0]
      else throw new BadRequest('Project did not exist after update')
      returned.needsRebuild = typeof context.data.needsRebuild === 'boolean' ? context.data.needsRebuild : true
      context.result = returned
    } catch (err) {
      console.log('Error: project did not exist after completing update', projectName, err)
      throw err
    }
  }
}

const patchActionHook = async (context: HookContext) => {
  if (context.data.repositoryPath) {
    const repoPath = context.data.repositoryPath
    const user = context.params!.user!

    const githubIdentityProvider = (await context.service(identityProviderPath).find({
      query: {
        userId: user.id,
        type: 'github',
        $limit: 1
      }
    })) as Paginated<IdentityProviderType>

    const githubPathRegexExec = GITHUB_URL_REGEX.exec(repoPath)
    if (!githubPathRegexExec) throw new BadRequest('Invalid Github URL')
    if (githubIdentityProvider.data.length === 0)
      throw new Error('Must be logged in with GitHub to link a project to a GitHub repo')
    const split = githubPathRegexExec[2].split('/')
    const org = split[0]
    const repo = split[1].replace('.git', '')
    const appOrgAccess = await checkAppOrgStatus(org, githubIdentityProvider.data[0].oauthToken)
    if (!appOrgAccess)
      throw new Forbidden(
        `The organization ${org} needs to install the GitHub OAuth app ${config.authentication.oauth.github.key} in order to push code to its repositories`
      )
    const repoWriteStatus = await checkUserRepoWriteStatus(org, repo, githubIdentityProvider.data[0].oauthToken)
    if (repoWriteStatus !== 200) {
      if (repoWriteStatus === 404) {
        const orgWriteStatus = await checkUserOrgWriteStatus(org, githubIdentityProvider.data[0].oauthToken)
        if (orgWriteStatus !== 200) throw new Forbidden('You do not have write access to that organization')
      } else {
        throw new Forbidden('You do not have write access to that repo')
      }
    }
  }
}

const removeActionHook = async (context: HookContext) => {
  if (!context.id) return
  const { name } = await context.service._get(context.id, context.params)

  const projectConfig = getProjectConfig(name)

  // run project uninstall script
  if (projectConfig?.onEvent) {
    await onProjectEvent(context.self, name, projectConfig.onEvent, 'onUninstall')
  }

  if (fs.existsSync(path.resolve(projectsRootFolder, name))) {
    fs.rmSync(path.resolve(projectsRootFolder, name), { recursive: true })
  }

  logger.info(`[Projects]: removing project id "${context.id}", name: "${name}".`)
  await deleteProjectFilesInStorageProvider(name)

  await context.app.service(locationPath).remove(null, {
    query: {
      sceneId: {
        $like: `${name}/%`
      }
    }
  })

  await context.app.service(routePath).remove(null, {
    query: {
      project: name
    }
  })

  const avatarItems = (await context.app.service(avatarPath).find({
    query: {
      project: name
    },
    paginate: false
  })) as AvatarType[]

  await Promise.all(
    avatarItems.map(async (avatar) => {
      await context.app.service(avatarPath).remove(avatar.id)
    })
  )

  const staticResourceItems = (await context.app.service(staticResourcePath).find({
    query: {
      project: name
    },
    paginate: false
  })) as StaticResourceType[]
  staticResourceItems.length &&
    staticResourceItems.forEach(async (staticResource) => {
      await context.app.service(staticResourcePath).remove(staticResource.id)
    })

  await removeProjectUpdateJob(context.self, name)
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(projectExternalResolver), schemaHooks.resolveResult(projectResolver)]
  },

  before: {
    all: [
      authenticate(),
      () => schemaHooks.validateQuery(projectQueryValidator),
      schemaHooks.resolveQuery(projectQueryResolver)
    ],
    find: [findBeforeActionHook],
    get: [],
    create: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      () => schemaHooks.validateData(projectDataValidator),
      schemaHooks.resolveData(projectDataResolver),
      createActionHook
    ],
    update: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      projectPermissionAuthenticate(false),
      updateActionHook
    ],
    patch: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      projectPermissionAuthenticate(false),
      () => schemaHooks.validateData(projectPatchValidator),
      schemaHooks.resolveData(projectPatchResolver),
      patchActionHook
    ],
    remove: [
      iff(isProvider('external'), verifyScope('editor', 'write')),
      projectPermissionAuthenticate(false),
      removeActionHook
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createProjectPermission],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any

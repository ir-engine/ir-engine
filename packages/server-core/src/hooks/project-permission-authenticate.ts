import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'

import { GITHUB_URL_REGEX } from '@xrengine/common/src/constants/GitHubConstants'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { checkUserRepoWriteStatus } from '../projects/githubapp/githubapp-helper'

export default (writeAccess) => {
  return async (context: HookContext): Promise<HookContext> => {
    const { params, app } = context
    const loggedInUser = params.user as UserInterface
    if (
      (!writeAccess && loggedInUser.scopes && loggedInUser.scopes.find((scope) => scope.type === 'admin:admin')) ||
      context.provider == null
    )
      return context
    let projectId, projectRepoPath
    const projectName = context.arguments[0]?.projectName || params.query?.projectName
    if (projectName) {
      const project = await (app.service('project') as any).Model.findOne({
        where: {
          name: projectName
        }
      })
      projectRepoPath = project.repositoryPath
      if (project) projectId = project.id
      else throw new BadRequest('Invalid Project name')
    }
    if (!projectId) projectId = params.id || context.id
    const projectPermissionResult = await (app.service('project-permission') as any).Model.findOne({
      where: {
        projectId: projectId,
        userId: loggedInUser.id
      }
    })
    if (projectPermissionResult == null) {
      const githubIdentityProvider = await (app.service('identity-provider') as any).Model.findOne({
        where: {
          userId: params.user.id,
          type: 'github'
        }
      })
      if (!githubIdentityProvider) throw new Forbidden('You are not authorized to access this project')
      const githubPathRegexExec = GITHUB_URL_REGEX.exec(projectRepoPath)
      if (!githubPathRegexExec) throw new BadRequest('Invalid project URL')
      const split = githubPathRegexExec[1].split('/')
      const owner = split[0]
      const repo = split[1].replace('.git', '')
      const userRepoWriteStatus = await checkUserRepoWriteStatus(owner, repo, githubIdentityProvider.oauthToken)
      if (userRepoWriteStatus !== 200) throw new Forbidden('You are not authorized to access this project')
    }

    return context
  }
}

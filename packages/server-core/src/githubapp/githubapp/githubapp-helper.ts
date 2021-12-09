import { App } from '@octokit/app'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'
import fs from 'fs'
import config from '../../appconfig'
import { replace } from 'lodash'

//@octokit/app
const app = new App({
  appId: config.authentication.oauth.github.appid,
  privateKey: fs.readFileSync(config.server.gitPemPath, 'utf8'),
  oauth: {
    clientId: config.authentication.oauth.github.key,
    clientSecret: config.authentication.oauth.github.secret
  }
})

//@octokit/rest
const appOctokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: config.authentication.oauth.github.appid,
    privateKey: fs.readFileSync(config.server.gitPemPath, 'utf8')
  }
})

export const getGitHubAppRepos = async () => {
  try {
    const repos = [] as Array<GithubAppInterface>
    for await (const { repository } of app.eachRepository.iterator()) {
      // console.log(repository)
      repos.push({
        id: repository.id,
        user: repository.owner.login,
        name: repository.name,
        repositoryPath: repository.clone_url
      })
    }
    return repos
  } catch (error) {
    console.error(error)
    return []
  }
}

export const getAuthenticatedRepo = async (repositoryPath) => {
  const repos = await getGitHubAppRepos()
  const filtered = repos.filter((repo) => repo.repositoryPath == repositoryPath)
  if (filtered && filtered[0]) {
    const token = await getAccessTokenByUser(filtered[0].user)
    if (token == '') return null
    return filtered[0].repositoryPath.replace('https://', `https://${filtered[0].user}:${token}@`)
  }
  return null
}

export const getAccessTokenByUser = async (user) => {
  let installationId = -1
  await app.eachInstallation(({ installation }) => {
    if (user == installation.account?.login) installationId = installation.id
  })
  if (installationId == -1) return ''
  const res = await appOctokit.auth({
    type: 'installation',
    installationId
  })
  return (res as any).token
}

export const getGitRepoById = async (id: number) => {
  const repos = await getGitHubAppRepos()
  const filtered = repos.filter((repo) => repo.id == id)
  if (filtered && filtered[0]) return filtered[0]
  return null
}

import { App } from '@octokit/app'
import { Octokit } from '@octokit/rest'
import { createAppAuth } from '@octokit/auth-app'
import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'
import fs from 'fs'
import appRootPath from 'app-root-path'
import config from '../../appconfig'
import { replace } from 'lodash'

let app, appOctokit

export const createGitHubApp = () => {
  let privateKey = config.server.gitPem
  if (process.env.APP_ENV === 'development') {
    privateKey = appRootPath.path.toString() + '/' + privateKey
    privateKey = fs.readFileSync(privateKey, 'utf8')
  } else {
    privateKey = privateKey.replace('-----BEGIN RSA PRIVATE KEY-----', '')
    privateKey = privateKey.replace('-----END RSA PRIVATE KEY-----', '')
    privateKey = privateKey.replace(' ', '\n')
    privateKey = `-----BEGIN RSA PRIVATE KEY-----${privateKey}\n-----END RSA PRIVATE KEY-----`
  }
  try {
    //@octokit/app
    app = new App({
      appId: config.authentication.oauth.github.appid,
      privateKey,
      oauth: {
        clientId: config.authentication.oauth.github.key,
        clientSecret: config.authentication.oauth.github.secret
      }
    })

    //@octokit/rest
    appOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: config.authentication.oauth.github.appid,
        privateKey
      }
    })
  } catch (error) {
    console.log(error)
  }
}

export const getGitHubAppRepos = async () => {
  try {
    //TODO: want to call this function after env is loaded from DB. this is not the best solution.
    if (!app) createGitHubApp()
    const repos = [] as Array<GithubAppInterface>
    for await (const { repository } of app.eachRepository.iterator()) {
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
  try {
    const repos = await getGitHubAppRepos()
    const filtered = repos.filter((repo) => repo.repositoryPath == repositoryPath)
    if (filtered && filtered[0]) {
      const token = await getAccessTokenByUser(filtered[0].user)
      if (token == '') return null
      return filtered[0].repositoryPath.replace('https://', `https://${filtered[0].user}:${token}@`)
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
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

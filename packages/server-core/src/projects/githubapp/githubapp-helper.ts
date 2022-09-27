import { BadRequest } from '@feathersjs/errors'
import { App } from '@octokit/app'
import { createAppAuth } from '@octokit/auth-app'
import { Octokit } from '@octokit/rest'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { GITHUB_PER_PAGE, GITHUB_URL_REGEX } from '@xrengine/common/src/constants/GitHubConstants'
import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { isDev } from '@xrengine/common/src/utils/isDev'
import {
  AudioFileTypes,
  ImageFileTypes,
  VideoFileTypes,
  VolumetricFileTypes
} from '@xrengine/engine/src/assets/constants/fileTypes'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import logger from '../../ServerLogger'
import { refreshAppConfig } from '../../updateAppConfig'
import { deleteFolderRecursive, writeFileSyncRecursive } from '../../util/fsHelperFunctions'
import { useGit } from '../../util/gitHelperFunctions'

let app, appOctokit

export const createGitHubApp = async () => {
  try {
    if (!config.server.gitPem || config.server.gitPem == '') await refreshAppConfig()
    let privateKey = config.server.gitPem
    privateKey = privateKey.replace('-----BEGIN RSA PRIVATE KEY-----', '')
    privateKey = privateKey.replace('-----END RSA PRIVATE KEY-----', '')
    privateKey = privateKey.replace(' ', '\n')
    privateKey = `-----BEGIN RSA PRIVATE KEY-----${privateKey}\n-----END RSA PRIVATE KEY-----`

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
    logger.error(error)
  }
}

export const getGitHubAppRepos = async () => {
  try {
    if (!config.server.gitPem || config.server.gitPem == '') await refreshAppConfig()
    if (!config.server.gitPem || config.server.gitPem == '') return []
    //TODO: want to call this function after env is loaded from DB. this is not the best solution.
    if (!app) await createGitHubApp()
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
    logger.error(error)
    return []
  }
}

export const getAuthenticatedRepo = async (repositoryPath: string) => {
  try {
    if (!/.git$/.test(repositoryPath)) repositoryPath = repositoryPath + '.git'
    const repos = await getGitHubAppRepos()
    const filtered = repos.filter((repo) => repo.repositoryPath == repositoryPath)
    if (filtered && filtered[0]) {
      const token = await getAccessTokenByUser(filtered[0].user)
      if (token === '') return null
      return filtered[0].repositoryPath.replace('https://', `https://${filtered[0].user}:${token}@`)
    }
    return null
  } catch (error) {
    logger.error(error)
    return null
  }
}

export const getInstallationOctokit = async (repo) => {
  if (!repo) return null
  let installationId
  await app.eachInstallation(({ installation }) => {
    if (repo.user == installation.account?.login) installationId = installation.id
  })
  const installationAuth = await app.octokit.auth({
    type: 'installation',
    installationId: installationId
  })

  return new Octokit({
    auth: installationAuth.token // directly pass the token
  })
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

export const checkUserRepoWriteStatus = async (owner, repo, token): Promise<number> => {
  const userApp = new Octokit({ auth: token })
  try {
    const { data } = await userApp.rest.repos.get({
      owner,
      repo
    })
    if (!data.permissions) return 403
    return data.permissions.push || data.permissions.admin ? 200 : 403
  } catch (err) {
    logger.error(err, 'Error getting repo')
    return err.status
  }
}

export const checkUserOrgWriteStatus = async (org, token) => {
  const octo = new Octokit({ auth: token })
  try {
    const authUser = await octo.rest.users.getAuthenticated()
    if (org === authUser.data.login) return 200
    const { data } = await octo.rest.orgs.getMembershipForAuthenticatedUser({
      org
    })
    return data.role === 'admin' || data.role === 'member' ? 200 : 403
  } catch (err) {
    logger.error(err, 'Org does not exist')
    return err.status
  }
}

export const getUserRepos = async (app, token): Promise<string[]> => {
  let page = 1
  let end = false
  let repos = []
  const octoKit = new Octokit({ auth: token })
  while (!end) {
    const repoResponse = (await octoKit.rest.repos.listForAuthenticatedUser({
      per_page: GITHUB_PER_PAGE,
      page
    })) as any
    repos = repos.concat(repoResponse.data.map((item) => item.clone_url))
    page++
    if (repoResponse.data.length < GITHUB_PER_PAGE) end = true
  }
  return repos
}

export const pushProjectToGithub = async (
  app: Application,
  project: ProjectInterface,
  user: UserInterface,
  reset = false,
  storageProviderName?: string
) => {
  const storageProvider = getStorageProvider(storageProviderName)
  try {
    logger.info(`[ProjectPush]: Getting files for project "${project.name}"...`)
    let files = await getFileKeysRecursive(`projects/${project.name}/`)
    files = files.filter((file) => /\.\w+$/.test(file))
    logger.info('[ProjectPush]: Found files:' + files)

    const localProjectDirectory = path.join(appRootPath.path, 'packages/projects/projects', project.name)
    if (fs.existsSync(localProjectDirectory)) {
      logger.info('[Project temp debug]: fs exists, deleting')
      deleteFolderRecursive(localProjectDirectory)
    }

    await Promise.all(
      files.map(async (filePath) => {
        if (path.parse(filePath).ext.length > 0) {
          logger.info(`[ProjectLoader]: - downloading "${filePath}"`)
          const fileResult = await storageProvider.getObject(filePath)
          if (fileResult.Body.length === 0) logger.info(`[ProjectLoader]: WARNING file "${filePath}" is empty`)
          writeFileSyncRecursive(path.join(appRootPath.path, 'packages/projects', filePath), fileResult.Body)
        }
      })
    )
    const repoPath = project.repositoryPath
    const githubIdentityProvider = await app.service('identity-provider').Model.findOne({
      where: {
        userId: user.id,
        type: 'github'
      }
    })
    const githubPathRegexExec = GITHUB_URL_REGEX.exec(repoPath)
    if (!githubPathRegexExec) throw new BadRequest('Invalid Github URL')
    const split = githubPathRegexExec[1].split('/')
    const owner = split[0]
    const repo = split[1].replace('.git', '')
    const repos = await getGitHubAppRepos()

    const octoKit = githubIdentityProvider
      ? new Octokit({ auth: githubIdentityProvider.oauthToken })
      : await (async () => {
          await createGitHubApp()
          return getInstallationOctokit(
            repos.find((repo) => repo.repositoryPath === repoPath || repo.repositoryPath === repoPath + '.git')
          )
        })()
    if (!octoKit) return
    try {
      const result = await octoKit.rest.repos.get({
        owner,
        repo
      })
    } catch (err) {
      if (err.status === 404) {
        const authUser = await octoKit.rest.users.getAuthenticated()
        if (authUser.data.login === owner)
          await octoKit.repos.createForAuthenticatedUser({
            name: repo,
            auto_init: true
          })
        else await octoKit.repos.createInOrg({ org: owner, name: repo, auto_init: true })
      } else throw err
    }
    const defaultBranch = `${config.server.releaseName}-deployment`
    if (reset) {
      const projectDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${project.name}/`)

      // if project exists already, remove it and re-clone it
      if (fs.existsSync(projectDirectory)) {
        // if (isDev) throw new Error('Cannot create project - already exists')
        deleteFolderRecursive(projectDirectory)
      }

      let repoPath = await getAuthenticatedRepo(project.repositoryPath)
      if (!repoPath) repoPath = project.repositoryPath

      const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/`)
      const gitCloner = useGit(projectLocalDirectory)
      await gitCloner.clone(repoPath)
      const git = useGit(projectDirectory)
      const branches = await git.branchLocal()
      await git.push('origin', `${branches.current}:${defaultBranch}`, ['-f'])
    } else await uploadToRepo(octoKit, files, owner, repo, defaultBranch, project.name, githubIdentityProvider != null)
  } catch (err) {
    logger.error(err)
    throw err
  }
}

// Credit to https://dev.to/lucis/how-to-push-files-programatically-to-a-repository-using-octokit-with-typescript-1nj0
// for much of the following code.
const uploadToRepo = async (
  octo: Octokit,
  filePaths: string[],
  org: string,
  repo: string,
  branch: string = `master`,
  projectName: string,
  isUser: boolean
) => {
  let currentCommit
  try {
    currentCommit = await getCurrentCommit(octo, org, repo, branch)
  } catch (err) {
    if (err.status === 409 && err.message === 'Git Repository is empty.') {
      await octo.repos.delete({ owner: org, repo })
      await octo.repos.createInOrg({ org, name: repo, auto_init: true })
      currentCommit = await getCurrentCommit(octo, org, repo, branch)
    } else throw err
  }
  //Get the GH user for use in commit message
  const user = isUser ? (await octo.users.getAuthenticated()).data : { login: 'GitHub-installation' }
  //Create blobs from all the files
  const fileBlobs = await Promise.all(filePaths.map(createBlobForFile(octo, org, repo)))
  // Create a new tree from all of the files, so that a new commit can be made from it
  const newTree = await createNewTree(
    octo,
    org,
    repo,
    fileBlobs,
    filePaths.map((path) => path.replace(`projects/${projectName}/`, '')),
    currentCommit.treeSha
  )
  const date = Date.now()
  const commitMessage = `Update by ${user.login} at ${new Date(date).toJSON()}`
  //Create the new commit with all of the file changes
  const newCommit = await createNewCommit(octo, org, repo, commitMessage, newTree.sha, currentCommit.commitSha)
  try {
    //This pushes the commit to the main branch in GitHub
    await setBranchToCommit(octo, org, repo, branch, newCommit.sha)
  } catch (err) {
    // Couldn't push directly to branch for some reason, so making a new branch and opening a PR instead
    await octo.git.createRef({
      owner: org,
      repo,
      ref: `refs/heads/${user.login}-${date}`,
      sha: newCommit.sha
    })
    await octo.pulls.create({
      owner: org,
      repo,
      head: `refs/heads/${user.login}-${date}`,
      base: `refs/heads/${branch}`,
      title: commitMessage
    })
  }
}
export const getCurrentCommit = async (octo: Octokit, org: string, repo: string, branch: string = 'master') => {
  try {
    await octo.repos.getBranch({ owner: org, repo, branch })
  } catch (err) {
    // If the branch for this deployment somehow doesn't exist, push the default branch to it so it exists
    if (err.status === 404 && err.message === 'Branch not found') {
      const repoResult = await octo.repos.get({ owner: org, repo })
      const baseBranchRef = await octo.git.getRef({
        owner: org,
        repo,
        ref: `heads/${repoResult.data.default_branch}`
      })
      await octo.git.createRef({
        owner: org,
        repo,
        ref: `refs/heads/${branch}`,
        sha: baseBranchRef.data.object.sha
      })
    } else throw err
  }
  const { data: refData } = await octo.git.getRef({
    owner: org,
    repo,
    ref: `heads/${branch}`
  })
  const commitSha = refData.object.sha
  const { data: commitData } = await octo.git.getCommit({
    owner: org,
    repo,
    commit_sha: commitSha
  })
  return {
    commitSha,
    treeSha: commitData.tree.sha
  }
}

const createBlobForFile = (octo: Octokit, org: string, repo: string) => async (filePath: string) => {
  const encoding = isBase64Encoded(filePath) ? 'base64' : 'utf-8'
  const bytes = await fs.readFileSync(path.join(appRootPath.path, 'packages/projects', filePath), 'binary')
  const buffer = Buffer.from(bytes, 'binary')
  const content = buffer.toString(encoding)
  const blobData = await octo.git.createBlob({
    owner: org,
    repo,
    content,
    encoding
  })
  return blobData.data
}

const createNewTree = async (
  octo: Octokit,
  owner: string,
  repo: string,
  blobs: any[],
  paths: string[],
  parentTreeSha: string
) => {
  const oldTree = await octo.git.getTree({
    owner,
    repo,
    tree_sha: parentTreeSha,
    recursive: 'true'
  })
  const committableFiles = oldTree.data.tree.filter((file) => file.type === 'blob')
  const committableFilesMap = committableFiles.map((file) => file.path)
  // My custom config. Could be taken as parameters
  const tree = blobs.map(({ sha }, index) => ({
    path: paths[index],
    mode: `100644`,
    type: `blob`,
    sha
  })) as any[]
  committableFilesMap.forEach((fileName) => {
    if (fileName && paths.indexOf(fileName) < 0) {
      tree.push({
        path: fileName,
        mode: `100644`,
        type: 'blob',
        sha: null
      })
    }
  })
  const { data } = await octo.git.createTree({
    owner,
    repo,
    tree,
    base_tree: parentTreeSha
  })
  return data
}

const createNewCommit = async (
  octo: Octokit,
  org: string,
  repo: string,
  message: string,
  currentTreeSha: string,
  currentCommitSha: string
) =>
  (
    await octo.git.createCommit({
      owner: org,
      repo,
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha]
    })
  ).data

const setBranchToCommit = (octo: Octokit, org: string, repo: string, branch: string = `master`, commitSha: string) =>
  octo.git.updateRef({
    owner: org,
    repo,
    ref: `heads/${branch}`,
    sha: commitSha
  })

const isBase64Encoded = (filePath: string) => {
  const extension = `.${filePath.split('.').pop()!}`
  return (
    ImageFileTypes.indexOf(extension) > -1 ||
    AudioFileTypes.indexOf(extension) > -1 ||
    VolumetricFileTypes.indexOf(extension) > -1 ||
    VideoFileTypes.indexOf(extension) > -1
  )
}

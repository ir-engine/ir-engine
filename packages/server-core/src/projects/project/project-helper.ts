import * as k8s from '@kubernetes/client-node'
import appRootPath from 'app-root-path'
import path from 'path'

import { ProjectConfigInterface, ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import logger from '../../ServerLogger'

export const retriggerBuilderService = async (app: Application, storageProviderName?: string) => {
  try {
    // invalidate cache for all installed projects
    await getStorageProvider(storageProviderName).createInvalidation(['projects*'])
  } catch (e) {
    logger.error(e, `[Project Rebuild]: Failed to invalidate cache with error: ${e.message}`)
  }

  // trigger k8s to re-run the builder service
  if (app.k8AppsClient) {
    try {
      logger.info('Attempting to reload k8s clients!')
      const restartClientsResponse = await app.k8AppsClient.patchNamespacedDeployment(
        `${config.server.releaseName}-builder-xrengine-builder`,
        'default',
        {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
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
      logger.info(restartClientsResponse, 'restartClientsResponse')
      return restartClientsResponse
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

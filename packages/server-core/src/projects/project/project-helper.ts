import { Application } from '../../../declarations'
import config from '../../appconfig'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import path from 'path'
import { ProjectConfigInterface, ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import appRootPath from 'app-root-path'

export const retriggerBuilderService = async (app: Application) => {
  try {
    // invalidate cache for all installed projects
    await useStorageProvider().createInvalidation(['projects*'])
  } catch (e) {
    console.log('[Project Rebuild]: Failed to invalidate cache with error', e)
  }

  // trigger k8s to re-run the builder service
  if (app.k8AppsClient) {
    try {
      console.log('Attempting to reload k8s clients!')
      const restartClientsResponse = await app.k8AppsClient.patch(
        `namespaces/default/deployments/${config.server.releaseName}-builder-xrengine-builder`,
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
        { contentType: 'application/strategic-merge-patch+json' }
      )
      console.log('restartClientsResponse', restartClientsResponse)
      return restartClientsResponse
    } catch (e) {
      console.log(e)
      return e
    }
  }
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
    console.log(
      `[Projects]: WARNING project with name ${projectName} has no xrengine.config.ts file - this is not recommended`
    )
    return null!
  }
}

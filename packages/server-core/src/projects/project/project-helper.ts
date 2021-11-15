import { Application } from '../../../declarations'
import config from '../../appconfig'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'

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

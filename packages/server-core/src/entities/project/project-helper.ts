import { Application } from '../../../declarations'
import config from '../../appconfig'

export const retriggerBuilderService = async (app: Application) => {
  if (app.k8AppsClient) {
    try {
      console.log('Attempting to reload k8s clients!')
      const restartClientsResponse = await app.k8AppsClient.patch(
        `namespaces/default/pods/${config.server.releaseName}-builder-xrengine-builder`,
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
        }
      )
      console.log('restartClientsResponse', restartClientsResponse)
      return restartClientsResponse
    } catch (e) {
      console.log(e)
      return e
    }
  }
}

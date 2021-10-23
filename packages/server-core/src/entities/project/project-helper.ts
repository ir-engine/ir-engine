import { Application } from '../../../declarations'
import config from '../../appconfig'

export const retriggerBuilderService = async (app: Application) => {
  if (app.k8DefaultClient) {
    try {
      console.log('Attempting to reload k8s clients!')
      const restartClientsResponse = await app.k8DefaultClient.patch(
        `deployment/${config.server.releaseName}-builder-xrengine-builder`,
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
    } catch (e) {
      console.log(e)
    }
  }
}

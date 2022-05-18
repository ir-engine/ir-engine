import app from './app'
import config from '@xrengine/server-core/src/appconfig'

const DEFAULT_INTERVAL_SECONDS = 1800
const configInterval = parseInt(config.analytics.processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

export default (): void => {
  setInterval(async () => {
    console.log('Collecting analytics at ', new Date().toString())
    const activeLocations = []
    const activeScenes = []
    const activeParties = await app.service('party').find({
      query: {
        $limit: 0,
        instanceId: {
          $ne: null
        }
      },
      isInternal: true
    })
    const instanceUsers = await app.service('user').find({
      query: {
        $limit: 0,
        instanceId: {
          $ne: null
        }
      },
      isInternal: true
    })
    const channelUsers = await app.service('user').find({
      query: {
        $limit: 0,
        channelInstanceId: {
          $ne: null
        }
      },
      isInternal: true
    })
    const activeInstances = await app.service('instance').find({
      query: {
        ended: {
          $ne: 1
        }
      },
      sequelize: {
        include: [
          {
            model: (app.service('location') as any).Model
          }
        ]
      },
      isInternal: true
    })
    activeInstances.data.forEach((instance) => {
      if (activeLocations.indexOf(instance.location.id) < 0) activeLocations.push(instance.location.id)
      if (activeScenes.indexOf(instance.location.sceneId) < 0) activeScenes.push(instance.location.sceneId)
    })
    await Promise.all([
      app.service('analytics').create({
        type: 'activeParties',
        count: activeParties.total
      }),
      app.service('analytics').create({
        type: 'instanceUsers',
        count: instanceUsers.total
      }),
      app.service('analytics').create({
        type: 'channelUsers',
        count: channelUsers.total
      }),
      app.service('analytics').create({
        type: 'activeLocations',
        count: activeLocations.length
      }),
      app.service('analytics').create({
        type: 'activeScenes',
        count: activeScenes.length
      }),
      app.service('analytics').create({
        type: 'activeInstances',
        count: activeInstances.total
      })
    ])
  }, interval)
}

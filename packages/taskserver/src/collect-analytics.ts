import { analyticsPath } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import config from '@etherealengine/server-core/src/appconfig'
import multiLogger from '@etherealengine/server-core/src/ServerLogger'

const logger = multiLogger.child({ component: 'taskserver:collect-analytics' })

const DEFAULT_INTERVAL_SECONDS = 1800
const configInterval = parseInt(config.taskserver.processInterval)
const interval = (configInterval || DEFAULT_INTERVAL_SECONDS) * 1000

export default (app): void => {
  setInterval(async () => {
    logger.info('Collecting analytics at %s.', new Date().toString())
    const activeLocations: any[] = []
    const activeScenes: any[] = []
    const activeParties = await app.service('party').find({
      query: {
        $limit: 0
      },
      isInternal: true
    })
    const instanceUsers = await app.service('user').find({
      query: {
        $limit: 0
      },
      include: [
        {
          model: app.service('instance-attendance').Model,
          as: 'instanceAttendance',
          where: {
            ended: false,
            isChannel: false
          }
        }
      ],
      isInternal: true
    })
    const channelUsers = await app.service('user').find({
      query: {
        $limit: 0
      },
      include: [
        {
          model: app.service('instance-attendance').Model,
          as: 'instanceAttendance',
          where: {
            ended: false,
            isChannel: true
          }
        }
      ],
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
            model: app.service('location').Model
          }
        ]
      },
      isInternal: true
    })
    activeInstances.data.forEach((instance) => {
      if (instance.location) {
        if (activeLocations.indexOf(instance.location.id) < 0) activeLocations.push(instance.location.id)
        if (activeScenes.indexOf(instance.location.sceneId) < 0) activeScenes.push(instance.location.sceneId)
      }
    })
    await Promise.all([
      app.service(analyticsPath).create({
        type: 'activeParties',
        count: activeParties.total
      }),
      app.service(analyticsPath).create({
        type: 'instanceUsers',
        count: instanceUsers.total
      }),
      app.service(analyticsPath).create({
        type: 'channelUsers',
        count: channelUsers.total
      }),
      app.service(analyticsPath).create({
        type: 'activeLocations',
        count: activeLocations.length
      }),
      app.service(analyticsPath).create({
        type: 'activeScenes',
        count: activeScenes.length
      }),
      app.service(analyticsPath).create({
        type: 'activeInstances',
        count: activeInstances.total
      })
    ])
  }, interval)
}

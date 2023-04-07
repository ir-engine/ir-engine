import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { Connect } from 'aws-sdk'
import { BotAction } from 'ee-bot/bot/bot-action'
import { BotManager } from 'ee-bot/bot/bot-manager'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminBot, BotPod, CreateBotAsAdmin, SpawnBotPod } from '@etherealengine/common/src/interfaces/AdminBot'
import { getState } from '@etherealengine/hyperflux'
import config from '@etherealengine/server-core/src/appconfig'
import serverLogger from '@etherealengine/server-core/src/ServerLogger'

import { Application } from '../../../declarations'
import { ServerState } from '../../ServerState'

export type AdminBotDataType = AdminBot

export class Bot extends Service {
  app: Application
  docs: any
  botmanager: BotManager

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    this.botmanager = new BotManager({ verbose: true, headless: false })
  }

  async find(params?: Params): Promise<Paginated<AdminBotDataType>> {
    const bots = await this.app.service('bot').Model.findAll({
      //let it be database query do not query k8s (for now)
      include: [
        {
          model: this.app.service('bot-command').Model
        },
        {
          model: this.app.service('location').Model
        },
        {
          model: this.app.service('instance').Model
        }
      ]
    })
    return { data: bots } as Paginated<AdminBotDataType>
  }

  async create(data: CreateBotAsAdmin): Promise<AdminBotDataType> {
    // make it create bot pod with a specific name
    data.instanceId = data.instanceId ? data.instanceId : null
    const result = await super.create(data)
    this.botmanager.addBot(result.id, result.name)
    console.log(`added bot id = ${result.id}and name = ${result.name} to server`)
    this.botmanager.addAction(result.id, BotAction.connect())
    // convert location if to location name
    // domain stays the same 90% of the time
    this.botmanager.addAction(result.id, BotAction.enterRoom('localhost:3000', 'default'))
    await this.botmanager.run()
    //createBotCommands(this.app, result, data.command!)
    return result
  }

  async patch(id: NullableId, data: any): Promise<AdminBotDataType | AdminBotDataType[]> {
    // lets see, might need seperate functions to work for this
    return super.patch(id, data)
  }

  async remove(id: string): Promise<AdminBotDataType | AdminBotDataType[]> {
    //make this remove pod of the bot
    // need to try and find name instead
    console.log(`removed bot with id = ${id} from server`)
    this.botmanager.addAction(id, BotAction.disconnect())
    await this.botmanager.run()
    return super.remove(id)
  }

  createBotPod = async (data: any) => {
    const k8DefaultClient = getState(ServerState).k8DefaultClient
    if (k8DefaultClient) {
      try {
        const jobName = `${config.server.releaseName}-etherealengine-bot-${data.id}`
      } catch (e) {
        serverLogger.error(e)
        return e
      }
    }
  }

  getBotPod = async (app: Application) => {
    const k8DefaultClient = getState(ServerState).k8DefaultClient
    if (k8DefaultClient) {
      try {
        const jobNamePrefix = `${config.server.releaseName}-etherealengine-bot`
        const podsResult = await k8DefaultClient.listNamespacedPod(
          'default',
          undefined,
          undefined,
          undefined,
          undefined,
          `job-name=${jobNamePrefix}`
        ) // filter metadta label by prefix
        const pods: BotPod[] = []
        for (const pod of podsResult.body.items) {
          const labels = pod.metadata!.labels
          if (labels && labels['job-name'] && labels['job-name'].includes(jobNamePrefix)) {
            // double check
            pods.push({
              name: pod.metadata!.name!,
              status: pod.status!.phase!
            })
          }
        }
        return pods
      } catch (e) {
        serverLogger.error(e)
        return e
      }
    }
  }
  runBotPodJob = async (app: Application): Promise<SpawnBotPod> => {
    const k8BatchClient = getState(ServerState).k8BatchClient
    if (k8BatchClient) {
      try {
        const jobName = `${config.server.releaseName}-etherealengine-bot`
        const oldJobResult = await k8BatchClient.readNamespacedJob(jobName, 'default')

        if (oldJobResult && oldJobResult.body) {
          // Removed unused properties
          delete oldJobResult.body.metadata!.managedFields
          delete oldJobResult.body.metadata!.resourceVersion
          delete oldJobResult.body.spec!.selector
          delete oldJobResult.body.spec!.template!.metadata!.labels

          oldJobResult.body.spec!.suspend = false

          const deleteJobResult = await k8BatchClient.deleteNamespacedJob(
            jobName,
            'default',
            undefined,
            undefined,
            0,
            undefined,
            'Background'
          )

          if (deleteJobResult.body.status === 'Success') {
            await k8BatchClient.createNamespacedJob('default', oldJobResult.body)

            return { status: true, message: 'Bot spawned successfully' }
          }
        }
      } catch (e) {
        serverLogger.error(e)
        return { status: false, message: `Failed to spawn bot. (${e.body.reason})` }
      }
    }

    return { status: false, message: 'Failed to spawn bot' }
  }
}

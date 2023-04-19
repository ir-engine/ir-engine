import appRootPath from 'app-root-path'
import cli from 'cli'
import dotenv from 'dotenv-flow'

import { getState } from '@etherealengine/hyperflux'
import { createFeathersExpressApp } from '@etherealengine/server-core/src/createApp'
import { ServerMode, ServerState } from '@etherealengine/server-core/src/ServerState'

import { getCronJobBody } from '/home/utsav/open/etherealengine/packages/taskserver/src/cron-tempfile-deletion'

//replace path with @etherealengine/packages...

dotenv.config({
  path: appRootPath.path,
  silent: true
})

const db = {
  username: process.env.MYSQL_USER ?? 'server',
  password: process.env.MYSQL_PASSWORD ?? 'password',
  database: process.env.MYSQL_DATABASE ?? 'etherealengine',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  dialect: 'mysql',
  url: ''
}

db.url = process.env.MYSQL_URL ?? `mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`

cli.enable('status')

const options = cli.parse({
  repoName: [false, 'Name of repo', 'string'],
  tag: [false, 'Commit Tag', 'string'],
  ecrUrl: [false, 'Docker repository', 'string'],
  startTime: [false, 'Timestamp of image', 'string']
})

cli.main(async () => {
  try {
    const app = createFeathersExpressApp(ServerMode.Task)
    await app.setup()
    const UpdateTempPruner = await app.service('project').find({
      query: {
        $or: [
          {
            updateType: 'commit'
          },
          {
            updateType: 'tag'
          }
        ]
      }
    })
    const k8BatchClient = getState(ServerState).k8BatchClient
    if (k8BatchClient)
      for (const project of UpdateTempPruner.data) {
        try {
          await k8BatchClient.patchNamespacedCronJob(
            `${process.env.RELEASE_NAME}-delete-tempfile`,
            'default',
            getCronJobBody(project, `${options.ecrUrl}/${options.repoName}-api:${options.tag}__${options.startTime}`),
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            {
              headers: {
                'content-type': 'application/merge-patch+json'
              }
            }
          )
        } catch (err) {
          console.error('cronjob update error on', `${process.env.RELEASE_NAME}-delete-tempfile`, err)
        }
      }
    cli.exit(0)
  } catch (err) {
    console.log(err)
    cli.fatal(err)
  }
})

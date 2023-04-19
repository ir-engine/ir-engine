import { ProjectInterface } from '@etherealengine/common/src/interfaces/ProjectInterface'

export const getCronJobBody = (project: ProjectInterface, image: string): object => {
  return {
    apiVersion: 'cronjob-2',
    kind: 'CronJob-tempfile-deletion',
    metadata: {
      name: `${process.env.RELEASE_NAME}`,
      labels: {
        'etherealengine/release': process.env.RELEASE_NAME
      }
    },
    spec: {
      schedule: '0 0 * * *', // This will run cron job at 12:00 AM everyday.
      concurrencyPolicy: 'Replace',
      successfulJobsHistoryLimit: 1,
      failedJobsHistoryLimit: 2,
      jobTemplate: {
        spec: {
          template: {
            metadata: {
              labels: {
                'etherealengine/release': process.env.RELEASE_NAME
              }
            },
            spec: {
              serviceAccountName: `${process.env.RELEASE_NAME}-etherealengine-api`,
              containers: [
                {
                  name: `${process.env.RELEASE_NAME}-delete-tempfile`,
                  image,
                  imagePullPolicy: 'IfNotPresent',
                  command: ['npm', 'run', 'delete-temp-file', '--', '--projectName', `${project.name}`],
                  env: Object.entries(process.env).map(([key, value]) => {
                    return { name: key, value: value }
                  })
                }
              ],
              restartPolicy: 'OnFailure'
            }
          }
        }
      }
    }
  }
}

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { BadRequest } from '@feathersjs/errors'
import { NullableId, ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'
import JSZip from 'jszip'
import fetch from 'node-fetch'

import { apiJobPath } from '@etherealengine/common/src/schemas/cluster/api-job.schema'
import { ArchiverQuery } from '@etherealengine/common/src/schemas/media/archiver.schema'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import config from '../../appconfig'
import { createExecutorJob } from '../../k8s-job-helper'
import { getDirectoryArchiveJobBody } from '../../projects/project/project-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'

const DIRECTORY_ARCHIVE_TIMEOUT = 60 * 10 //10 minutes

/**
 * A class for Managing files in FileBrowser
 */

export interface ArchiverParams extends KnexAdapterParams<ArchiverQuery> {}

const archive = async (app: Application, projectName: string, params?: ArchiverParams): Promise<string> => {
  if (!params) params = {}
  if (!params.query) params.query = {}

  const storageProvider = getStorageProvider()

  logger.info(`Archiving ${projectName}`)

  const result = await storageProvider.listFolderContent(`projects/${projectName}`)

  const zip = new JSZip()

  for (let i = 0; i < result.length; i++) {
    if (result[i].type == 'folder') {
      const content = await storageProvider.listFolderContent(result[i].key + '/')
      content.forEach((f) => {
        result.push(f)
      })
    }

    if (result[i].type == 'folder') continue

    const blobPromise = await fetch(result[i].url, { method: 'GET' }).then((r) => {
      if (r.status === 200) return r.arrayBuffer()
      return Promise.reject(new Error(r.statusText))
    })

    logger.info(`Added ${result[i].key} to archive`)

    const dir = result[i].key.replace(`projects/${projectName}/`, '')
    zip.file(dir, blobPromise)
  }

  const generated = await zip.generateAsync({ type: 'blob', streamFiles: true })

  const zipOutputDirectory = `temp/${projectName}.zip`

  logger.info(`Uploading ${zipOutputDirectory} to storage provider`)

  await storageProvider.putObject({
    Key: zipOutputDirectory,
    Body: Buffer.from(await generated.arrayBuffer()),
    ContentType: 'archive/zip'
  })

  logger.info(`Archived ${projectName} to ${zipOutputDirectory}`)

  if (params.query.jobId) {
    const date = await getDateTimeSql()
    await app.service(apiJobPath).patch(params.query.jobId as string, {
      status: 'succeeded',
      returnData: zipOutputDirectory,
      endTime: date
    })
  }

  return zipOutputDirectory
}

export class ArchiverService implements ServiceInterface<string, ArchiverParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(id: NullableId, params?: ArchiverParams) {
    if (!params) throw new BadRequest('No directory specified')

    const project = params?.query?.project!.toString()!
    delete params.query?.project

    if (!config.kubernetes.enabled || params?.query?.isJob) return archive(this.app, project, params)
    else {
      const date = await getDateTimeSql()
      const newJob = await this.app.service(apiJobPath).create({
        name: '',
        startTime: date,
        endTime: date,
        returnData: '',
        status: 'pending'
      })
      const jobBody = await getDirectoryArchiveJobBody(this.app, project, newJob.id)
      await this.app.service(apiJobPath).patch(newJob.id, {
        name: jobBody.metadata!.name
      })
      const jobLabelSelector = `etherealengine/directoryField=${project},etherealengine/release=${process.env.RELEASE_NAME},etherealengine/directoryArchiver=true`
      const jobFinishedPromise = createExecutorJob(
        this.app,
        jobBody,
        jobLabelSelector,
        DIRECTORY_ARCHIVE_TIMEOUT,
        newJob.id
      )
      try {
        await jobFinishedPromise
        const job = await this.app.service(apiJobPath).get(newJob.id)

        logger.info(`Archived ${project} to ${job.returnData}`)

        return job.returnData
      } catch (err) {
        console.log('Error: Directory was not properly archived', project, err)
        throw new BadRequest('Directory was not properly archived')
      }
    }
  }
}

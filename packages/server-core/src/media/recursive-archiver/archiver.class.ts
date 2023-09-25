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

import { ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import JSZip from 'jszip'
import fetch from 'node-fetch'

import { BadRequest } from '@feathersjs/errors'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { RootParams } from '../../api/root-params'
import config from '../../appconfig'
import { createExecutorJob, getDirectoryArchiveJobBody } from '../../projects/project/project-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'

const DIRECTORY_ARCHIVE_TIMEOUT = 60 * 10 //10 minutes

/**
 * A class for Managing files in FileBrowser
 */

export interface ArchiveParams extends RootParams {
  isJob?: boolean
}

const archive = async (directory, params?: RootParams): Promise<string> => {
  if (directory.at(0) === '/') directory = directory.slice(1)
  if (!directory.startsWith('projects/') || ['projects', 'projects/'].includes(directory)) {
    return Promise.reject(new Error('Cannot archive non-project directories'))
  }

  const split = directory.split('/')
  let projectName
  if (split[split.length - 1].length === 0) projectName = split[split.length - 2]
  else projectName = split[split.length - 1]
  projectName = projectName.toLowerCase()

  if (!params) params = {}
  if (!params.query) params.query = {}
  const { storageProviderName } = params.query

  delete params.query.storageProviderName

  const storageProvider = getStorageProvider(storageProviderName)

  logger.info(`Archiving ${directory} using ${storageProviderName}`)

  let result = await storageProvider.listFolderContent(directory)

  const zip = new JSZip()

  for (let i = 0; i < result.length; i++) {
    if (result[i].type == 'folder') {
      let content = await storageProvider.listFolderContent(result[i].key + '/')
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

    const dir = result[i].key.substring(result[i].key.indexOf('/') + 1)
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

  logger.info(`Archived ${directory} to ${zipOutputDirectory}`)

  return zipOutputDirectory
}

export class Archiver implements Partial<ServiceMethods<any>> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async setup(app: Application, path: string) {}

  async get(directory: string, params?: ArchiveParams): Promise<string> {
    if (!config.kubernetes.enabled || params?.isJob) return archive(directory, params)
    else {
      const split = directory.split('/')
      let projectName
      if (split[split.length - 1].length === 0) projectName = split[split.length - 2]
      else projectName = split[split.length - 1]
      projectName = projectName.toLowerCase()
      const jobBody = await getDirectoryArchiveJobBody(this.app, directory, projectName)
      const jobLabelSelector = `etherealengine/directoryField=${projectName},etherealengine/release=${process.env.RELEASE_NAME},etherealengine/directoryArchiver=true`
      const jobFinishedPromise = createExecutorJob(this.app, jobBody, jobLabelSelector, DIRECTORY_ARCHIVE_TIMEOUT)
      try {
        await jobFinishedPromise
        const zipOutputDirectory = `temp/${projectName}.zip`

        logger.info(`Archived ${directory} to ${zipOutputDirectory}`)

        return zipOutputDirectory
      } catch (err) {
        console.log('Error: Directory was not properly archived', directory, err)
        throw new BadRequest('Directory was not properly archived')
      }
    }
  }
}

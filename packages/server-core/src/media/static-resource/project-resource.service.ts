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

import { Application } from '@feathersjs/koa'
import fs from 'fs'
import path from 'path'

import config, { isDev } from '@etherealengine/common/src/config'
import { projectResourcesPath } from '@etherealengine/common/src/schemas/media/project-resource.schema'
import { staticResourcePath, StaticResourceType } from '@etherealengine/common/src/schemas/media/static-resource.schema'

import { projectsRootFolder } from '../file-browser/file-browser.class'
import { getStorageProvider } from '../storageprovider/storageprovider'

export type CreateProjectResourceParams = {
  project: string
}

export type PatchProjectResourceParams = {
  project: string
}

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [projectResourcesPath]: any
  }
}

const createProjectResource =
  (app: Application) =>
  async ({ project }: CreateProjectResourceParams) => {
    const resources: StaticResourceType[] = await app.service(staticResourcePath).find({
      query: { project },
      paginate: false
    })
    //if no resources, return
    if (resources.length === 0) {
      return
    }
    //wipe URLs from resources
    for (const resource of resources) {
      for (const field of Object.keys(resource)) {
        if (resource[field] === null) {
          delete resource[field]
        }
        if (field === 'userId') {
          delete (resource as any)[field]
        }
      }
      resource.url = ''
      //make thumbnail URLs relative
      if (resource.thumbnailURL) {
        const cacheRe = new RegExp(`^${config.client.fileServer}`)
        resource.thumbnailURL = resource.thumbnailURL.replace(cacheRe, '')
      }
    }
    const storageProvider = getStorageProvider()
    const key = `projects/${project}/resources.json`
    await storageProvider.putObject({
      Body: Buffer.from(JSON.stringify(resources)),
      ContentType: 'application/json',
      Key: key
    })
    if (isDev !== false) {
      const filePath = path.resolve(projectsRootFolder, key)
      const dirName = path.dirname(filePath)
      fs.mkdirSync(dirName, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify(resources))
    }
  }

const patchProjectResource =
  (app: Application) =>
  async (id, { project }: PatchProjectResourceParams) => {
    const storageProvider = getStorageProvider()
    const resourceJSONPath = `projects/${project}/resources.json`
    const resourceJSONFile = await storageProvider.getObject(resourceJSONPath)
    const resourceJSON = JSON.parse(resourceJSONFile.Body.toString())
    const updatedResource = (await app.service(staticResourcePath).get(id)) as StaticResourceType

    const resource = resourceJSON.find((resource: StaticResourceType) => resource.key === updatedResource.key)
    for (const field of Object.keys(updatedResource)) {
      if (updatedResource[field] === null) {
        delete updatedResource[field]
      }
      if (field === 'userId') {
        delete (updatedResource as any)[field]
      }
      if (field === 'thumbnailURL') {
        const cacheRe = new RegExp(`^${config.client.fileServer}\/`)
        updatedResource.thumbnailURL = updatedResource.thumbnailURL.replace(cacheRe, '')
      }
    }
    Object.assign(resource, updatedResource)

    await storageProvider.putObject({
      Body: Buffer.from(JSON.stringify(resourceJSON)),
      ContentType: 'application/json',
      Key: `projects/${project}/resources.json`
    })
    if (isDev !== false) {
      const filePath = path.resolve(projectsRootFolder, resourceJSONPath)
      const dirName = path.dirname(filePath)
      fs.mkdirSync(dirName, { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify(resourceJSON))
    }
  }

export default (app: Application): void => {
  app.use(projectResourcesPath, {
    create: createProjectResource(app),
    patch: patchProjectResource(app)
  })
}

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

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { SceneID, SceneType, scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application, Paginated } from '@feathersjs/feathers'
import { v4 as generateUUID } from 'uuid'
import logger from '../ServerLogger'
import { getCacheDomain } from '../media/storageprovider/getCacheDomain'
import { getCachedURL } from '../media/storageprovider/getCachedURL'
import { getStorageProvider } from '../media/storageprovider/storageprovider'
import { toDateTimeSql } from './datetime-sql'

const getThumbnailPath = async (sceneName: string, projectName: string) => {
  try {
    let thumbnailExt = `${sceneName}.thumbnail.ktx2`
    let thumbnailPath = `projects/${projectName}/${thumbnailExt}`
    const storageProvider = getStorageProvider()

    if (!(await storageProvider.doesExist(thumbnailExt, `projects/${projectName}`))) {
      thumbnailExt = `${sceneName}.thumbnail.jpeg`
      thumbnailPath = `projects/${projectName}/${thumbnailExt}`
      if (!(await storageProvider.doesExist(thumbnailExt, `projects/${projectName}`))) {
        return ''
      }
    }

    return thumbnailPath
  } catch (e) {
    logger.error(e)
  }
}

export const createScenes = async (app: Application, projectName: string) => {
  const projectResult = (await app
    .service(projectPath)
    .find({ query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>

  if (!projectResult || projectResult.data.length === 0) {
    throw new Error(`Project ${projectName} not found`)
  }

  const projectRoutePath = `projects/${projectName}/`
  const provider = getStorageProvider()
  const cacheDomain = getCacheDomain(provider, false)
  const fileResults = await provider.listObjects(projectRoutePath, false)
  const files = fileResults.Contents.map((dirent) => dirent.Key).filter((name) => name.endsWith('.scene.json'))

  for (const sceneFile of files) {
    const sceneName = sceneFile.slice(0, -'.scene.json'.length).replace(projectRoutePath, '')
    if (sceneName === 'sky-station') {
      const a = sceneName
    }
    const scene = (await app
      .service(scenePath)
      .find({ query: { name: sceneName, projectId: projectResult.data[0].id, $limit: 1 } })) as Paginated<SceneType>

    if (!scene || scene.data.length === 0) {
      let newThumbnailPath = await getThumbnailPath(sceneName, projectName)
      newThumbnailPath = getCachedURL(newThumbnailPath!, cacheDomain)

      if (projectName !== 'default-project') {
        await app.service(scenePath).create({
          name: sceneName,
          projectId: projectResult.data[0].id,
          scenePath: `projects/${projectName}/${sceneName}.scene.json`,
          thumbnailPath: newThumbnailPath,
          id: generateUUID() as SceneID,
          createdAt: toDateTimeSql(new Date()),
          updatedAt: toDateTimeSql(new Date())
        })
      } else {
        await app.service(scenePath).patch(
          null,
          {
            projectId: projectResult.data[0].id,
            scenePath: `projects/${projectName}/${sceneName}.scene.json`,
            thumbnailPath: newThumbnailPath
          },
          { query: { name: sceneName } }
        )
      }
    }
  }
}

export const createScene = async (app: Application, sceneName: string, projectName: string) => {
  const projectResult = (await app
    .service(projectPath)
    .find({ query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>

  if (!projectResult || projectResult.data.length === 0) {
    throw new Error(`Project ${projectName} not found`)
  }

  const projectRoutePath = `projects/${projectName}/`
  const provider = getStorageProvider()
  const fileResults = await provider.listObjects(projectRoutePath, false)
  const cacheDomain = getCacheDomain(provider, false)
  const files = fileResults.Contents.map((dirent) => dirent.Key).filter((name) => name.endsWith('.scene.json'))
  //.map((name) => name.slice(0, -'.scene.json'.length).replace(projectRoutePath, ''))

  let sceneId = '' as SceneID

  for (const sceneFile of files) {
    const sceneFileName = sceneFile.slice(0, -'.scene.json'.length).replace(projectRoutePath, '')
    if (sceneName === sceneFileName) {
      const scene = (await app
        .service(scenePath)
        .find({ query: { name: sceneName, projectId: projectResult.data[0].id, $limit: 1 } })) as Paginated<SceneType>

      sceneId = !scene || scene.data.length === 0 ? ('' as SceneID) : scene.data[0].id

      if (!scene || scene.data.length === 0) {
        let newThumbnailPath = await getThumbnailPath(sceneName, projectName)
        newThumbnailPath = getCachedURL(newThumbnailPath!, cacheDomain)

        if (projectName !== 'default-project') {
          sceneId = (
            await app.service(scenePath).create({
              name: sceneName,
              projectId: projectResult.data[0].id,
              scenePath: `projects/${projectName}/${sceneName}.scene.json`,
              thumbnailPath: newThumbnailPath,
              id: generateUUID() as SceneID,
              createdAt: toDateTimeSql(new Date()),
              updatedAt: toDateTimeSql(new Date())
            })
          ).id
        } else {
          const patchedScene = await app.service(scenePath).patch(
            null,
            {
              projectId: projectResult.data[0].id,
              scenePath: `projects/${projectName}/${sceneName}.scene.json`,
              thumbnailPath: newThumbnailPath
            },
            { query: { name: sceneName } }
          )
          sceneId = patchedScene[0].id
        }
      }
    }
  }

  return sceneId
}

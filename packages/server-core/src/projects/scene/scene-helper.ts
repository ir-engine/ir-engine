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

import koa from '@feathersjs/koa'
import fs from 'fs'

import { SceneData, SceneJson } from '@etherealengine/common/src/interfaces/SceneInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { addAssetFromProject } from '../../media/static-resource/static-resource-helper'
// import { addVolumetricAssetFromProject } from '../../media/volumetric/volumetric-upload.helper'
import {
  cleanStorageProviderURLs,
  parseStorageProviderURLs
} from '@etherealengine/engine/src/common/functions/parseSceneJSON'
import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { SceneDataType } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Paginated } from '@feathersjs/feathers'
import logger from '../../ServerLogger'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getCachedURL } from '../../media/storageprovider/getCachedURL'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { SceneDataParams } from '../scene-data/scene-data.class'

export const getEnvMapBake = (app: Application) => {
  return async (ctx: koa.FeathersKoaContext) => {
    const envMapBake = await getEnvMapBakeById(app, ctx.params.entityId)
    ctx.body = {
      status: 'success',
      json: envMapBake
    }
  }
}

export const getSceneData = async (
  projectName: string,
  sceneName: string,
  metadataOnly?: boolean,
  internal = false,
  storageProviderName?: string
) => {
  const storageProvider = getStorageProvider(storageProviderName)
  const sceneExists = await storageProvider.doesExist(`${sceneName}.scene.json`, `projects/${projectName}/`)
  if (!sceneExists) throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)

  let thumbnailPath = `projects/${projectName}/${sceneName}.thumbnail.ktx2`

  //if no ktx2 is found, fallback on legacy jpg thumbnail format, if still not found, fallback on ethereal logo
  if (!(await storageProvider.doesExist(`${sceneName}.thumbnail.ktx2`, `projects/${projectName}`))) {
    thumbnailPath = `projects/${projectName}/${sceneName}.thumbnail.jpeg`
    if (!(await storageProvider.doesExist(`${sceneName}.thumbnail.jpeg`, `projects/${projectName}`))) thumbnailPath = ``
  }

  const cacheDomain = getCacheDomain(storageProvider, internal)
  const thumbnailUrl =
    thumbnailPath !== `` ? getCachedURL(thumbnailPath, cacheDomain) : `/static/etherealengine_thumbnail.jpg`

  const scenePath = `projects/${projectName}/${sceneName}.scene.json`

  const sceneResult = await storageProvider.getCachedObject(scenePath)
  const sceneData: SceneData = {
    name: sceneName,
    project: projectName,
    thumbnailUrl: thumbnailUrl,
    scene: metadataOnly ? undefined! : parseStorageProviderURLs(JSON.parse(sceneResult.Body.toString()))
  }

  return sceneData
}

export const getEnvMapBakeById = async (app, entityId: string) => {
  // TODO: reimplement with new scene format
  // const models = app.get('sequelizeClient').models
  // return models.component.findOne({
  //   where: {
  //     type: 'envmapbake',
  //     '$entity.entityId$': entityId
  //   },
  //   include: [
  //     {
  //       model: models.entity,
  //       attributes: ['collectionId', 'name', 'entityId'],
  //       as: 'entity'
  //     }
  //   ]
  // })
}

export const uploadSceneToStaticResources = async (app: Application, projectName: string, file: string) => {
  const fileResult = fs.readFileSync(file)

  // todo - how do we handle updating projects on local dev?
  if (!config.kubernetes.enabled) return fileResult

  if (/.scene.json$/.test(file)) {
    const sceneData = JSON.parse(fileResult.toString())
    const convertedSceneData = await downloadAssetsFromScene(app, projectName, sceneData)
    cleanStorageProviderURLs(convertedSceneData)
    const newFile = Buffer.from(JSON.stringify(convertedSceneData, null, 2))
    fs.writeFileSync(file, newFile)
    return newFile
  }

  return fileResult
}

export const downloadAssetsFromScene = async (app: Application, project: string, sceneData: SceneJson) => {
  // parallelizes each entity, serializes each component to avoid media playlists taking up gigs of memory when downloading
  await Promise.all(
    Object.values(sceneData!.entities).map(async (entity) => {
      try {
        for (const component of entity.components) {
          switch (component.name) {
            case 'media': {
              let urls = [] as string[]
              const paths = component.props.paths
              if (paths) {
                urls = paths
                delete component.props.paths
              }
              const resources = component.props.resources
              if (resources && resources.length > 0) {
                if (typeof resources[0] === 'string') urls = resources
                else urls = resources.map((resource) => resource.path)
              }

              const isVolumetric = entity.components.find((component) => component.name === 'volumetric')
              if (isVolumetric) {
                const extensions = ['drcs', 'mp4', 'manifest']
                const newUrls = [] as string[]
                for (const url of urls) {
                  const split = url.split('.')
                  const fileName = split.slice(0, split.length - 1).join('.')
                  for (const extension of extensions) {
                    newUrls.push(`${fileName}.${extension}`)
                  }
                }
                urls = newUrls
              }

              const newUrls = [] as string[]
              for (const url of urls) {
                const newURL = await addAssetFromProject(app, url, project)
                newUrls.push(newURL.url!)
              }
              if (isVolumetric) {
                component.props.resources = newUrls.filter((url) => url.endsWith('.mp4'))
              } else {
                component.props.resources = newUrls
              }
              break
            }
            case 'gltf-model': {
              if (component.props.src) {
                const resource = await addAssetFromProject(app, component.props.src, project)
                component.props.src = resource.url
              }
              break
            }
            case 'image': {
              if (component.props.source) {
                const resource = await addAssetFromProject(app, component.props.source, project)
                component.props.source = resource.url
              }
              break
            }
          }
        }
      } catch (error) {
        console.log(error)
      }
    })
  )
  return sceneData
}

export const getScenesForProject = async (app: Application, params?: SceneDataParams) => {
  const storageProvider = getStorageProvider(params?.query?.storageProviderName)
  const projectName = params?.projectName
  const metadataOnly = params?.metadataOnly
  const internal = params?.internal
  try {
    const project = (await app
      .service(projectPath)
      .find({ ...params, query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>
    if (project.data.length === 0) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = `projects/${projectName}/`

    const fileResults = await storageProvider.listObjects(newSceneJsonPath, false)
    const files = fileResults.Contents.map((dirent) => dirent.Key)
      .filter((name) => name.endsWith('.scene.json'))
      .map((name) => name.slice(0, -'.scene.json'.length))

    const sceneData: SceneDataType[] = await Promise.all(
      files.map(async (sceneName) =>
        getSceneData(projectName!, sceneName.replace(newSceneJsonPath, ''), metadataOnly, internal)
      )
    )

    return { data: sceneData }
  } catch (e) {
    logger.error(e)
    return { data: [] as SceneDataType[] }
  }
}

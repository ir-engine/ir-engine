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

import multiLogger from '@etherealengine/common/src/logger'
import { AssetType, ProjectType, assetPath } from '@etherealengine/common/src/schema.type.module'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'
import { v4 } from 'uuid'
import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'

const logger = multiLogger.child({ component: 'server-core:asset-helper' })

export const syncAllSceneJSONAssets = async (projects: ProjectType[], app: Application) => {
  logger.info('ASSETS 1')
  const now = await getDateTimeSql()
  const storageProvider = getStorageProvider()

  const sceneJSONAssetsData = (
    await Promise.all(
      projects.map(async (project) => {
        const projectPath = `projects/${project.name}`
        logger.info('ASSETS 1.1', projectPath)
        const projectAssets = (await storageProvider.listObjects(projectPath, false)).Contents.map(({ Key }) => Key)
        logger.info('ASSETS 1.2', projectAssets)
        const assets = await app.service(assetPath).find({ query: { projectId: project.id } })
        logger.info('ASSETS 1.3', assets)
        const sceneJSONAssets = projectAssets.filter(
          (asset) => asset.endsWith('.scene.json') && !assets.data.find((item: AssetType) => item.assetURL === asset)
        )
        logger.info('ASSETS 1.4', sceneJSONAssets)
        if (!sceneJSONAssets.length) return
        return sceneJSONAssets.map((asset) => ({
          id: v4(),
          assetURL: asset,
          projectId: project.id,
          thumbnailURL: asset.replace('.scene.json', '.thumbnail.jpg'),
          createdAt: now,
          updatedAt: now
        }))
      })
    )
  )
    .flat()
    .filter(Boolean)

  logger.info('ASSETS 2', sceneJSONAssetsData)

  if (!sceneJSONAssetsData.length) return

  const knex = app.get('knexClient')
  await knex(assetPath).insert(sceneJSONAssetsData)
}

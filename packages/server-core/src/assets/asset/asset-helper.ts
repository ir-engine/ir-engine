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

import { v4 } from 'uuid'

import { AssetData, assetPath } from '@etherealengine/common/src/schema.type.module'
import { getDateTimeSql } from '@etherealengine/common/src/utils/datetime-sql'

import { Application } from '../../../declarations'

export const seedSceneAssets = async (app: Application, projectName: string, assetPaths: string[]) => {
  if (!assetPaths.length) return

  const now = await getDateTimeSql()

  assetPaths = assetPaths.map((asset) => `projects/${projectName}/${asset}`)

  const sceneAssets = await Promise.all(
    assetPaths.filter(async (asset) => (await app.service(assetPath).find({ query: { assetURL: asset } })).total > 0)
  )
  if (!sceneAssets.length) return
  const sceneAssetData: AssetData[] = sceneAssets.map(
    (asset) =>
      ({
        id: v4(),
        assetURL: asset,
        project: projectName,
        thumbnailURL: asset.endsWith('.gltf') ? asset.replace('.gltf', '.thumbnail.jpg') : null,
        createdAt: now,
        updatedAt: now
      }) as AssetData
  )

  await Promise.all(sceneAssetData.map((asset) => app.service(assetPath).create(asset)))
}

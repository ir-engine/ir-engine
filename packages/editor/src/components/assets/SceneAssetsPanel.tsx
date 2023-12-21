/* eslint-disable no-case-declarations */
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
import React, { useEffect } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { NO_PROXY, useHookstate } from '@etherealengine/hyperflux'

import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { StaticResourceType, staticResourcePath } from '@etherealengine/engine/src/schemas/media/static-resource.schema'
import styles from './scene-assets.module.scss'

type FolderType = { folderType: 'folder'; assetClass: string }
type ResourceType = { folderType: 'staticResource' } & StaticResourceType

type CategorizedStaticResourceType = FolderType | ResourceType

const StaticResourceItem = (props) => {
  const {
    resources,
    onClick
  }: { resources: CategorizedStaticResourceType[]; onClick: (resource: CategorizedStaticResourceType) => void } =
    props.data
  const index = props.index

  if (resources[index].folderType === 'folder') {
    return (
      <div className={styles.resourceItemContainer} onClick={() => onClick(resources[index])}>
        {(resources[index] as FolderType).assetClass}
      </div>
    )
  }
}

const SceneAssetsPanel = () => {
  const staticResources = useHookstate<CategorizedStaticResourceType[]>([])

  useEffect(() => {
    Engine.instance.api
      .service(staticResourcePath)
      .find({ query: { $sort: { mimeType: 1 } } })
      .then((resources) => {
        const categorizedResources: CategorizedStaticResourceType[] = []
        let previousMimeType: string | null = null

        resources.data.forEach((resource) => {
          if (previousMimeType !== resource.mimeType) {
            categorizedResources.push({ folderType: 'folder', assetClass: AssetLoader.getAssetClass(resource.key) })
            previousMimeType = resource.mimeType
          }
          categorizedResources.push({ folderType: 'staticResource', ...resource })
        })

        staticResources.set(categorizedResources)
      })
  }, [])

  const ResourceList = ({ height, width }) => (
    <FixedSizeList
      height={height}
      width={width}
      itemSize={32}
      itemCount={staticResources.length}
      itemData={{
        resources: staticResources.get(NO_PROXY)
      }}
      itemKey={(index) => index}
    >
      {StaticResourceItem}
    </FixedSizeList>
  )

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <div style={{ height: '100%', width: '50%' }}>
        <AutoSizer onResize={ResourceList}>{ResourceList}</AutoSizer>
      </div>
      <div style={{ display: 'block', backgroundColor: 'blue' }}></div>
    </div>
  )
}

export default SceneAssetsPanel

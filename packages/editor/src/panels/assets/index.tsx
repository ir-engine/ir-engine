/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import FileBrowser from '../files/filebrowser'
import { CurrentFilesQueryProvider } from '../files/helpers'
import FilesLoaders, { FileUploadProgress } from '../files/loaders'
import FilesToolbar from '../files/toolbar'
import CategoriesList, { VerticalDivider } from './categories'
import { AssetsQueryProvider } from './hooks'
import Resources from './resources'
import Topbar from './topbar'

const AssetsPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer dataTestId="assets-panel-tab">
        <PanelTitle>
          <span>{t('editor:tabs.scene-assets')}</span>
        </PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const AssetsPanelTab: TabData = {
  id: 'assetsPanel',
  closable: true,
  title: <AssetsPanelTitle />,
  content: <AssetsContainer />
}

enum SidebarType {
  FAVORITES = 'favorites',
  ASSETS = 'assets',
  FILES = 'files'
}

function AssetsContainer() {
  const sidebarType = useHookstate(undefined)

  const toolbar =
    sidebarType.value === SidebarType.FILES ? (
      <>
        <FilesToolbar />
        <FilesLoaders />
      </>
    ) : (
      <Topbar />
    )
  const rightChildren = sidebarType.value === SidebarType.FILES ? <FileBrowser /> : <Resources />

  const handleSidebarChange = (category) => {
    sidebarType.set(category)
  }

  return (
    <div className="flex h-full flex-col">
      <CurrentFilesQueryProvider>
        <AssetsQueryProvider>
          {toolbar}
          <FileUploadProgress />
          <VerticalDivider
            leftChildren={<CategoriesList selected={sidebarType.value} onClick={handleSidebarChange} />}
            rightChildren={rightChildren}
          />
        </AssetsQueryProvider>
      </CurrentFilesQueryProvider>
    </div>
  )
}

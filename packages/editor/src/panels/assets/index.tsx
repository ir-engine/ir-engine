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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { useHookstate } from '@hookstate/core'
import { getMutableState, NO_PROXY } from '@ir-engine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FilesState } from '../../services/FilesState'
import { ImportSettingsState } from '../../services/ImportSettingsState'
import FileBrowser from '../files/filebrowser'
import { CurrentFilesQueryProvider } from '../files/helpers'
import FilesToolbar from '../files/toolbar'
import CategoriesList, { VerticalDivider } from './categories'
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

  const toolbar = sidebarType.value === SidebarType.FILES ? <FilesToolbar /> : <Topbar />
  const rightChildren = sidebarType.value === SidebarType.FILES ? <FileBrowser /> : <Resources />

  const initAssetsSidebar = () => {
    const projectName = getMutableState(FilesState).projectName.get(NO_PROXY)
    const importFolder = getMutableState(ImportSettingsState).importFolder.get(NO_PROXY)
    const dir = `/projects/${projectName}${importFolder}`
    getMutableState(FilesState).selectedDirectory.set(dir)
  }

  useEffect(() => initAssetsSidebar(), [])

  useEffect(() => {
    if (sidebarType.value === SidebarType.ASSETS) {
      initAssetsSidebar()
    }
  }, [sidebarType])

  const handleSidebarChange = (category) => {
    sidebarType.set(category)
  }

  return (
    <div className="flex h-full flex-col">
      <CurrentFilesQueryProvider>
        {toolbar}
        <VerticalDivider
          leftChildren={<CategoriesList selected={sidebarType.value} onClick={handleSidebarChange} />}
          rightChildren={rightChildren}
        />
      </CurrentFilesQueryProvider>
    </div>
  )
}

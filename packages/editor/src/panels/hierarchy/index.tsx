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

import { useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { GLTFSnapshotState } from '@ir-engine/engine/src/gltf/GLTFState'
import { SourceComponent } from '@ir-engine/engine/src/scene/components/SourceComponent'
import { useMutableState } from '@ir-engine/hyperflux'
import { PanelDragContainer, PanelTitle } from '@ir-engine/ui/src/components/editor/layout/Panel'
import { TabData } from 'rc-dock'
import React from 'react'
import { useTranslation } from 'react-i18next'
import HierarchyTreeContextMenu from './contextmenu'
import { Contents, Topbar } from './hierarchytree'
import { HierarchyPanelProvider } from './hooks'

const HierarchyPanelTitle = () => {
  const { t } = useTranslation()

  return (
    <div>
      <PanelDragContainer>
        <PanelTitle>{t('editor:hierarchy.lbl')}</PanelTitle>
      </PanelDragContainer>
    </div>
  )
}

export const HierarchyPanelTab: TabData = {
  id: 'hierarchyPanel',
  closable: true,
  title: <HierarchyPanelTitle />,
  content: <HierarchyPanelWrapper />
}

function HierarchyPanelWrapper() {
  const { scenePath, rootEntity } = useMutableState(EditorState).value
  const sourceId = useOptionalComponent(rootEntity, SourceComponent)?.value

  if (!scenePath || !rootEntity || !sourceId) return null

  return <HierarchyPanel sourceId={sourceId} />
}

function HierarchyPanel({ sourceId }: { sourceId: string }) {
  const index = GLTFSnapshotState.useSnapshotIndex(sourceId)
  if (index === undefined) return null

  return (
    <HierarchyPanelProvider>
      <Topbar />
      <Contents />
      <HierarchyTreeContextMenu />
    </HierarchyPanelProvider>
  )
}

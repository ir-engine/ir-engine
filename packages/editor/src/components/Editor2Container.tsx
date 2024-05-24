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

import { assetPath } from '@etherealengine/common/src/schema.type.module'
import { EntityUUID } from '@etherealengine/ecs'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { AssetsPanelTab } from '@etherealengine/ui/src/components/editor/panels/Assets'
import { FilesPanelTab } from '@etherealengine/ui/src/components/editor/panels/Files'
import { HierarchyPanelTab } from '@etherealengine/ui/src/components/editor/panels/Hierarchy'
import { MaterialsPanelTab } from '@etherealengine/ui/src/components/editor/panels/Materials'
import { PropertiesPanelTab } from '@etherealengine/ui/src/components/editor/panels/Properties'
import { ScenePanelTab } from '@etherealengine/ui/src/components/editor/panels/Scenes'
import { ViewportPanelTab } from '@etherealengine/ui/src/components/editor/panels/Viewport'

import PopupMenu from '@etherealengine/ui/src/primitives/tailwind/PopupMenu'
import { DockLayout, DockMode, LayoutData, PanelData, TabData } from 'rc-dock'
import 'rc-dock/dist/rc-dock.css'
import React, { useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { setCurrentEditorScene } from '../functions/sceneFunctions'
import { cmdOrCtrlString } from '../functions/utils'
import { EditorErrorState } from '../services/EditorErrorServices'
import { EditorState } from '../services/EditorServices'
import { SelectionState } from '../services/SelectionServices'
import './Editor2Container.css'
import AssetDropZone from './assets/AssetDropZone'
import { DndWrapper } from './dnd/DndWrapper'
import DragLayer from './dnd/DragLayer'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import ErrorDialog from '@etherealengine/ui/src/components/tailwind/ErrorDialog'
import { t } from 'i18next'
import Toolbar from '../components/toolbar/Toolbar2'
import { SaveSceneDialog } from './dialogs/SaveSceneDialog2'

export const DockContainer = ({ children, id = 'editor-dock', dividerAlpha = 0 }) => {
  const dockContainerStyles = {
    '--dividerAlpha': dividerAlpha
  }

  return (
    <div id={id} className="dock-container" style={dockContainerStyles as React.CSSProperties}>
      {children}
    </div>
  )
}

const onEditorError = (error) => {
  console.error(error)
  if (error['aborted']) {
    PopoverState.hidePopupover()
    return
  }

  PopoverState.showPopupover(
    <ErrorDialog title={error.title || t('editor:error')} description={error.message || t('editor:errorMsg')} />
  )
}

const defaultLayout: LayoutData = {
  dockbox: {
    mode: 'horizontal' as DockMode,
    children: [
      {
        mode: 'vertical' as DockMode,
        size: 8,
        children: [
          {
            tabs: [ViewportPanelTab]
          },
          {
            tabs: [ScenePanelTab, FilesPanelTab, AssetsPanelTab]
          }
        ]
      },
      {
        mode: 'vertical' as DockMode,
        size: 3,
        children: [
          {
            tabs: [HierarchyPanelTab, MaterialsPanelTab]
          },
          {
            tabs: [PropertiesPanelTab]
          }
        ]
      }
    ]
  }
}

const tabs = [HierarchyPanelTab, PropertiesPanelTab, ViewportPanelTab, ScenePanelTab, FilesPanelTab, AssetsPanelTab]

const EditorContainer = () => {
  const { sceneAssetID, sceneName, projectName, scenePath, rootEntity } = useHookstate(getMutableState(EditorState))
  const sceneQuery = useFind(assetPath, { query: { assetURL: scenePath.value ?? '' } }).data
  const sceneURL = sceneQuery?.[0]?.assetURL

  const errorState = useHookstate(getMutableState(EditorErrorState).error)

  const dockPanelRef = useRef<DockLayout>(null)

  const panelMenu = tabs.map((tab) => {
    return {
      name: tab.title,
      action: () => {
        const currentLayout = dockPanelRef?.current?.getLayout()
        if (!currentLayout) return
        if (dockPanelRef.current!.find(tab.id!)) {
          return
        }
        //todo: add support for multiple instances of a panel type
        // let panelId = panel.id!
        // while (dockPanelRef.current!.find(panelId)) {
        //   if (/\d+$/.test(panelId)) {
        //     panelId = panelId.replace(/\d+$/, (match) => {
        //       return (parseInt(match) + 1).toString()
        //     })
        //   } else {
        //     panelId += '1'
        //   }
        // }
        // panel.id = panelId
        const targetId = tab.parent!.id! ?? currentLayout.dockbox.children[0].id
        const targetPanel = dockPanelRef.current!.find(targetId) as PanelData
        targetPanel.tabs.push(tab)
        dockPanelRef?.current?.loadLayout(currentLayout)
      }
    }
  })

  useHotkeys(`${cmdOrCtrlString}+s`, () => PopoverState.showPopupover(<SaveSceneDialog />))

  useEffect(() => {
    if (!sceneURL) return
    const [_, project, scene] = scenePath.value?.split('/') ?? []
    sceneName.set(scene ?? null)
    projectName.set(project ?? null)
    sceneAssetID.set(sceneQuery[0].id)
    return setCurrentEditorScene(sceneURL, sceneQuery[0].id! as EntityUUID)
  }, [sceneURL])

  useEffect(() => {
    return () => {
      getMutableState(SelectionState).selectedEntities.set([])
    }
  }, [scenePath])

  useEffect(() => {
    if (!dockPanelRef.current) return
    const activePanel = rootEntity.value ? 'filesPanel' : 'scenePanel'
    dockPanelRef.current.updateTab(activePanel, dockPanelRef.current.find(activePanel) as TabData, true)
  }, [rootEntity])

  useEffect(() => {
    if (errorState.value) {
      onEditorError(errorState.value)
    }
  }, [errorState])

  return (
    <main className="pointer-events-auto">
      <div
        id="editor-container"
        className="flex flex-col bg-black"
        style={scenePath.value ? { background: 'transparent' } : {}}
      >
        <DndWrapper id="editor-container">
          <DragLayer />
          <Toolbar />
          {/*rootEntity.value && <LoadedScene key={rootEntity.value} rootEntity={rootEntity.value} />*/}
          <div className="mt-1 flex overflow-hidden">
            <AssetDropZone />
            <DockContainer>
              <DockLayout
                ref={dockPanelRef}
                defaultLayout={defaultLayout}
                style={{ position: 'absolute', left: 5, top: 45, right: 5, bottom: 5 }}
              />
            </DockContainer>
          </div>
        </DndWrapper>
      </div>
      <PopupMenu />
    </main>
  )
}

export default EditorContainer

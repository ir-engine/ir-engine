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

import DockLayout, { DockMode } from 'rc-dock'
import React from 'react'
import styled from 'styled-components'

import { DockContainer } from '../EditorContainer'
import { AssetSelectionChangePropsType, AssetsPreviewPanel } from './AssetsPreviewPanel'
import FileBrowserContentPanel from './FileBrowserContentPanel'

export const ProjectDockContainer = (styled as any).div`
  .dock-panel {
    background: transparent;
    pointer-events: auto;
    border: none;
  }
  .dock-panel:first-child {
    position: relative;
    z-index: 99;
  }
  .dock-panel[data-dockid='+5'] {
    pointer-events: none;
  }
  .dock-panel[data-dockid='+5'] .dock-bar {
    display: none;
  }
  .dock-panel[data-dockid='+5'] .dock {
    background: transparent;
  }
  .dock-divider {
    pointer-events: auto;
    background: rgba(1, 1, 1, ${(props) => props.dividerAlpha});
  }
  .dock {
    border-radius: 4px;
    background: var(--dockBackground);
  }
  .dock-top .dock-bar {
    font-size: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    background: transparent;
  }
  .dock-tab {
    background: transparent;
    border-bottom: none;
  }
  .dock-tab:hover,
  .dock-tab-active,
  .dock-tab-active:hover {
    border-bottom: 1px solid #ddd;
  }
  .dock-tab:hover div,
  .dock-tab:hover svg {
    color: var(--textColor);
  }
  .dock-tab > div {
    padding: 2px 12px;
  }
  .dock-tab-active {
    color: var(--textColor);
  }
  .dock-ink-bar {
    background-color: var(--textColor);
  }
  .dock-panel-max-btn:before {
    border-color: var(--iconButtonColor);
  }
`

/**
 * ProjectBrowserPanel used to render view for Project Panel.
 * @constructor
 */

export default function ProjectBrowserPanel() {
  const assetsPreviewPanelRef = React.useRef()

  const onLayoutChangedCallback = () => {
    ;(assetsPreviewPanelRef as any).current?.onLayoutChanged?.()
  }

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.(props)
  }

  let defaultLayout = {
    dockbox: {
      mode: 'vertical' as DockMode,
      children: [
        {
          size: 7,
          mode: 'horizontal' as DockMode,
          children: [
            {
              tabs: [
                {
                  id: 'filesPanel',
                  title: 'Project Files',
                  content: <FileBrowserContentPanel onSelectionChanged={onSelectionChanged} />
                }
              ]
            }
          ]
        },
        {
          size: 3,
          tabs: [{ id: 'previewPanel', title: 'Preview', content: <AssetsPreviewPanel ref={assetsPreviewPanelRef} /> }]
        }
      ]
    }
  }

  return (
    <>
      <ProjectDockContainer id="filePanel">
        <DockContainer dividerAlpha={0.3}>
          <DockLayout
            defaultLayout={defaultLayout}
            style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 5, right: 5, bottom: 5 }}
            onLayoutChange={onLayoutChangedCallback}
          />
        </DockContainer>
      </ProjectDockContainer>
    </>
  )
}

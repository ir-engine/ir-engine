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

import { DockContainer } from '../EditorContainer'
import { AssetSelectionChangePropsType, AssetsPreviewPanel } from './AssetsPreviewPanel'
import FileBrowserContentPanel from './FileBrowserContentPanel'

const projectDockContainerStyles = {
  '.dockPanel': {
    background: 'transparent',
    pointerEvents: 'auto',
    border: 'none'
  },
  '.dockPanel:firstChild': {
    position: 'relative',
    zIndex: '99'
  },
  '.dockPanel[dataDockid="+5"]': {
    pointerEvents: 'none'
  },
  '.dockPanel[dataDockid="+5"] .dockBar': {
    display: 'none'
  },
  '.dockPanel[dataDockid="+5"] .dock': {
    background: 'transparent'
  },
  '.dockDivider': {
    pointerEvents: 'auto',
    background: 'rgba(1, 1, 1, 0.3)'
  },
  '.dock': {
    borderRadius: '4px',
    background: 'var(--dockBackground)'
  },
  '.dockTop .dockBar': {
    fontSize: '12px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
    background: 'transparent'
  },
  '.dockTab': {
    background: 'transparent',
    borderBottom: 'none'
  },
  '.dockTab:hover, .dockTabActive, .dockTabActive:hover': {
    borderBottom: '1px solid #ddd'
  },
  '.dockTab:hover div, .dockTab:hover svg': {
    color: 'var(--textColor)'
  },
  '.dockTab > div': {
    padding: '2px 12px'
  },
  '.dockTabActive': {
    color: 'var(--textColor)'
  },
  '.dockInkBar': {
    backgroundColor: 'var(--textColor)'
  },
  '.dockPanelMaxBtn:before': {
    borderColor: 'var(--iconButtonColor)'
  }
}

/**
 * ProjectBrowserPanel used to render view for Project Panel.
 * @constructor
 */
export default function ProjectBrowserPanel() {
  const assetsPreviewPanelRef = React.useRef()

  const onLayoutChangedCallback = () => {
    assetsPreviewPanelRef.current?.onLayoutChanged?.()
  }

  const onSelectionChanged = (props: AssetSelectionChangePropsType) => {
    assetsPreviewPanelRef.current?.onSelectionChanged?.(props)
  }

  const defaultLayout = {
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
      <div id="filePanel" style={projectDockContainerStyles as React.CSSProperties}>
        <DockContainer dividerAlpha={0.3}>
          <DockLayout
            defaultLayout={defaultLayout}
            style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 5, right: 5, bottom: 5 }}
            onLayoutChange={onLayoutChangedCallback}
          />
        </DockContainer>
      </div>
    </>
  )
}

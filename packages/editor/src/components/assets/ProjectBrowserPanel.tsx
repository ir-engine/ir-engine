import DockLayout, { DockMode } from 'rc-dock'
import React from 'react'
import styled from 'styled-components'

import { DockContainer } from '../EditorContainer'
import { AssetSelectionChangePropsType, AssetsPreviewPanel } from './AssetsPreviewPanel'
import FileBrowserContentPanel from './FileBrowserContentPanel'

export const ProjectDockContainer = (styled as any).div`
  .dock, .dock-divider { background: transparent !important; }
`

/**
 * ProjectBrowserPanel used to render view for Project Panel.
 * @author Abhishek Pathak
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

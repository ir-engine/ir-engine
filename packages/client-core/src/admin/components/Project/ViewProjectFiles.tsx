import React from 'react'
import DockLayout, { DockMode } from 'rc-dock'
import FileBrowserContentPanel from '@xrengine/editor/src/components/assets/FileBrowserContentPanel'
import { DockContainer } from '@xrengine/editor/src/components/EditorContainer'
import { DndWrapper } from '@xrengine/editor/src/components/dnd/DndWrapper'
import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'
import Drawer from '@mui/material/Drawer'
import styles from './Projects.module.scss'

interface Props {
  name: string
  open: boolean
  setShowProjectFiles: any
}

const ViewProjectFiles = (props: Props) => {
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
          size: 3,
          mode: 'horizontal' as DockMode,
          children: [
            {
              tabs: [
                {
                  id: 'filesPanel',
                  title: 'Project Files',
                  content: <FileBrowserContentPanel selectedFile={props.name} onSelectionChanged={onSelectionChanged} />
                }
              ]
            }
          ]
        },
        {
          size: 2,
          tabs: [{ id: 'previewPanel', title: 'Preview', content: <AssetsPreviewPanel ref={assetsPreviewPanelRef} /> }]
        }
      ]
    }
  }

  return (
    <div id="project-container">
      <Drawer
        classes={{ paper: styles.paper }}
        anchor="right"
        open={props.open}
        onClose={() => props.setShowProjectFiles(false)}
      >
        <DndWrapper id="project-container">
          <DockContainer dividerAlpha={0.3} padding={'10px'}>
            <DockLayout
              defaultLayout={defaultLayout}
              style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 5, right: 5, bottom: 5 }}
              onLayoutChange={onLayoutChangedCallback}
            />
            /
          </DockContainer>
        </DndWrapper>
      </Drawer>
    </div>
  )
}

export default ViewProjectFiles

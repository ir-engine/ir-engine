import DockLayout, { DockMode } from 'rc-dock'
import React from 'react'

import {
  AssetSelectionChangePropsType,
  AssetsPreviewPanel
} from '@xrengine/editor/src/components/assets/AssetsPreviewPanel'
import FileBrowserContentPanel from '@xrengine/editor/src/components/assets/FileBrowserContentPanel'
import { DndWrapper } from '@xrengine/editor/src/components/dnd/DndWrapper'
import { DockContainer } from '@xrengine/editor/src/components/EditorContainer'

import DrawerView from '../../common/DrawerView'

interface Props {
  name: string
  open: boolean
  onClose: () => void
}

const ViewProjectFiles = ({ name, open, onClose }: Props) => {
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
                  content: <FileBrowserContentPanel selectedFile={name} onSelectionChanged={onSelectionChanged} />
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
      <DrawerView open={open} onClose={onClose}>
        <DndWrapper id="project-container">
          <DockContainer dividerAlpha={0.3}>
            <DockLayout
              defaultLayout={defaultLayout}
              style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 70, right: 5, bottom: 5 }}
              onLayoutChange={onLayoutChangedCallback}
            />
          </DockContainer>
        </DndWrapper>
      </DrawerView>
    </div>
  )
}

export default ViewProjectFiles

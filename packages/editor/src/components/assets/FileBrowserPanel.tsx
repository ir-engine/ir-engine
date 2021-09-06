import React from 'react'
import DockLayout, { DockMode } from 'rc-dock'
import FileBrowserContentPanel from './FileBrowserContentPanel'
import { AssetsPreviewPanel } from './AssetsPreviewPanel'

/**
 * FileBrowserPanel used to render view for AssetsPanel.
 * @author Abhishek Pathak
 * @constructor
 */

export default function FileBrowserPanel() {
  const assetsPreviewPanelRef = React.useRef()

  const onLayoutChangedCallback = () => {
    ;(assetsPreviewPanelRef as any).current?.onLayoutChanged?.()
  }

  const onSelectionChanged = (props) => {
    ;(assetsPreviewPanelRef as any).current?.onSelectionChanged?.(props)
  }

  let defaultLayout = {
    dockbox: {
      mode: 'vertical' as DockMode,
      children: [
        {
          size: 5,
          tabs: [
            {
              id: 'projectFilesPanel',
              title: 'Project Files',
              content: <FileBrowserContentPanel onSelectionChanged={onSelectionChanged} />
            }
          ]
        },
        {
          size: 5,
          tabs: [{ id: 'previewPanel', title: 'Preview', content: <AssetsPreviewPanel ref={assetsPreviewPanelRef} /> }]
        }
      ]
    }
  }

  return (
    <>
      <DockLayout
        defaultLayout={defaultLayout}
        style={{ pointerEvents: 'none', position: 'absolute', left: 0, top: 5, right: 5, bottom: 5 }}
        onLayoutChange={onLayoutChangedCallback}
      />
    </>
  )
}

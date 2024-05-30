import { TabData } from 'rc-dock'
import React from 'react'

const PreviewPanelContent = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%'
      }}
    >
      <canvas id="preview-canvas" />
    </div>
  )
}

export const PreviewPanelTab: TabData = {
  id: 'previewPanel',
  closable: true,
  title: 'Preview',
  content: <PreviewPanelContent />
}

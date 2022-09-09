import React from 'react'
import { useTranslation } from 'react-i18next'

import VideocamIcon from '@mui/icons-material/Videocam'

import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * VideoNodeEditor used to render editor view for property customization.
 *
 * @param       {any} props
 * @constructor
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
    ></NodeEditor>
  )
}

// setting iconComponent with icon name
VideoNodeEditor.iconComponent = VideocamIcon

export default VideoNodeEditor

import React from 'react'
import { useTranslation } from 'react-i18next'

import VideocamIcon from '@mui/icons-material/Videocam'

// import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const VolumetricNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.volumetric.name')}
      description={t('editor:properties.volumetric.description')}
    ></NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = VideocamIcon

export default VolumetricNodeEditor

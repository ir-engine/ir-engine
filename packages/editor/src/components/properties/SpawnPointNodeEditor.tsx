import React from 'react'
import NodeEditor from './NodeEditor'
import { useTranslation } from 'react-i18next'
import StreetviewIcon from '@mui/icons-material/Streetview'
import { EditorComponentType } from './Util'

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize SpawnPointNode properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const SpawnPointNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  // initializing iconComponent icon name
  return <NodeEditor description={t('editor:properties.spawnPoint.description')} {...props} />
}

SpawnPointNodeEditor.iconComponent = StreetviewIcon

export default SpawnPointNodeEditor

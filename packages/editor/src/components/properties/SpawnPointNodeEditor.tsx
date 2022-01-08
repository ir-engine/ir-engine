import React from 'react'
import { useTranslation } from 'react-i18next'

import StreetviewIcon from '@mui/icons-material/Streetview'

import NodeEditor from './NodeEditor'

/**
 * SpawnPointNodeEditorProps declaring properties for SpawnPointNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type SpawnPointNodeEditorProps = {
  node?: object
}

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize SpawnPointNode properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const SpawnPointNodeEditor = (props: SpawnPointNodeEditorProps) => {
  const { t } = useTranslation()

  // initializing iconComponent icon name
  return <NodeEditor description={t('editor:properties.spawnPoint.description')} {...props} />
}

SpawnPointNodeEditor.iconComponent = StreetviewIcon

export default SpawnPointNodeEditor

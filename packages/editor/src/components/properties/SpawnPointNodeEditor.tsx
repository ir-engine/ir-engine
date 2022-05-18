import React from 'react'
import NodeEditor from './NodeEditor'
import { StreetView } from '@styled-icons/fa-solid/StreetView'
import { useTranslation } from 'react-i18next'

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

SpawnPointNodeEditor.iconComponent = StreetView

export default SpawnPointNodeEditor

import React from 'react'
import NodeEditor from './NodeEditor'
import { StreetView } from '@styled-icons/fa-solid/StreetView'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

/**
 * SpawnPointNodeEditorProps declaring properties for SpawnPointNodeEditor.
 *
 * @author Robert Long
 * @type {Object}
 */
type SpawnPointNodeEditorProps = {
  node?: object
  t: Function
}

/**
 * SpawnPointNodeEditor component used to provide the editor view to customize SpawnPointNode properties.
 *
 * @author Robert Long
 * @type {Class component}
 */
export const SpawnPointNodeEditor = (props: SpawnPointNodeEditorProps) => {
  // initializing iconComponent icon name
  return <NodeEditor description={SpawnPointNodeEditor.description} {...props} />
}

SpawnPointNodeEditor.iconComponent = StreetView
SpawnPointNodeEditor.description = i18n.t('editor:properties.spawnPoint.description')

export default withTranslation()(SpawnPointNodeEditor)

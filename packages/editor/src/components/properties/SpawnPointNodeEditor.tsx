import React, { Component } from 'react'
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
export class SpawnPointNodeEditor extends Component<SpawnPointNodeEditorProps, {}> {
  // initializing iconComponent icon name
  static iconComponent = StreetView

  // initializing description and will appear on the editor view
  static description = i18n.t('editor:properties.spawnPoint.description')
  render() {
    SpawnPointNodeEditor.description = this.props.t('editor:properties.spawnPoint.description')
    return <NodeEditor description={SpawnPointNodeEditor.description} {...this.props} />
  }
}

export default withTranslation()(SpawnPointNodeEditor)

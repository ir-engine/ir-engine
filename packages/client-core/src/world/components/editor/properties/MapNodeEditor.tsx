import { Map } from '@styled-icons/fa-solid/Map'
import React, { Component } from 'react'
import Editor from '../Editor'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'

//declairing properties for MapNodeEditor
type MapNodeEditorProps = {
  editor?: Editor
  node?: object
  t: Function
}

/**
 * MapNodeEditor provides the editor for properties of MapNode.
 *
 * @author Patrick Canfield
 * @type {class component}
 */
export class MapNodeEditor extends Component<MapNodeEditorProps, {}> {
  // initializing iconComponent image name
  static iconComponent = Map

  //initializing description and will appears on MapNodeEditor view
  static description = i18n.t('editor:properties.map.description')

  //rendering view of editor for properties of MapNode
  render() {
    MapNodeEditor.description = this.props.t('editor:properties.map.description')
    return (
      /* @ts-ignore */
      <NodeEditor description={MapNodeEditor.description} {...this.props}>
      </NodeEditor>
    )
  }
}

export default withTranslation()(MapNodeEditor)

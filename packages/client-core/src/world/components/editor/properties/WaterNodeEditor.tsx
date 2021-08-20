import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NodeEditor from '@xrengine/client-core/src/world/components/editor/properties/NodeEditor'
import InputGroup from '@xrengine/client-core/src/world/components/editor/inputs/InputGroup'
import ImageInput from '@xrengine/client-core/src/world/components/editor/inputs/ImageInput'
import Vector3Input from '@xrengine/client-core/src/world/components/editor/inputs/Vector3Input'
import Vector2Input from '@xrengine/client-core/src/world/components/editor/inputs/Vector2Input'
import { Water } from '@styled-icons/fa-solid/Water'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import ColorInput from '@xrengine/client-core/src/world/components/editor/inputs/ColorInput'

//declaring properties for WaterNodeEditor
type WaterNodeEditorProps = {
  editor: any
  node: any
  t: Function
}

/**
 * WaterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class WaterNodeEditor extends Component<WaterNodeEditorProps> {
  // declairing propTypes for WaterNodeEditor
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  }

  constructor(props: WaterNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = Water

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.water.description')

  declare props: WaterNodeEditorProps

  onChangeProperty = (name: string) => {
    return (value) => {
      this.props.editor.setPropertySelected(name, value)
    }
  }

  //rendering view
  render() {
    WaterNodeEditor.description = this.props.t('editor:properties.water.description')
    return <NodeEditor {...this.props} description={WaterNodeEditor.description}></NodeEditor>
  }
}

export default withTranslation()(WaterNodeEditor)

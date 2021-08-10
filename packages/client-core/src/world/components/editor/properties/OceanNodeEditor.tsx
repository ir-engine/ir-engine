import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ImageInput from '../inputs/ImageInput'
import Vector3Input from '../inputs/Vector3Input'
import Vector2Input from '../inputs/Vector2Input'
import * as EasingFunctions from '@xrengine/engine/src/common/functions/EasingFunctions'
import { Cloud } from '@styled-icons/fa-solid/Cloud'
import { camelPad } from '@xrengine/engine/src/editor/functions/utils'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import ColorInput from '../inputs/ColorInput'

//creating object containing Curve options for SelectInput
const CurveOptions = Object.keys(EasingFunctions).map((name) => ({
  label: camelPad(name),
  value: name
}))

//declaring properties for ParticleEmitterNodeEditor
type OceanNodeEditorProps = {
  editor: any
  node: any
  t: Function
}

/**
 * ParticleEmitterNodeEditor provides the editor to customize properties.
 *
 * @author Robert Long
 * @type {class component}
 */
export class OceanNodeEditor extends Component<OceanNodeEditorProps> {
  // declairing propTypes for ParticleEmitterNodeEditor
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object
  }

  constructor(props: OceanNodeEditorProps) {
    super(props)
    this.props = props
  }

  //setting iconComponent name
  static iconComponent = Cloud

  //setting description and will appears on editor view
  static description = i18n.t('editor:properties.ocean.description')

  declare props: OceanNodeEditorProps

  //function used to reflect the change in any property of ParticleEmitterNodeEditor
  updateParticles() {
    // for (const node of this.props.editor.selected) {
    //   node.updateParticles()
    // }
  }

  onChangeSrc = (src) => {
    this.props.editor.setPropertySelected('src', src)
  }

  //rendering view for ParticleEmitterNodeEditor
  render() {
    OceanNodeEditor.description = this.props.t('editor:properties.ocean.description')
    return <NodeEditor {...this.props} description={OceanNodeEditor.description}></NodeEditor>
  }
}

export default withTranslation()(OceanNodeEditor)

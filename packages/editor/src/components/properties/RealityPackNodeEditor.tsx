import React, { Component } from 'react'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Dashboard } from '@material-ui/icons'
import InputGroup from '../inputs/InputGroup'
import realitypacks from '@xrengine/realitypacks/manifest.json'
import SelectInput from '../inputs/SelectInput'
import RealityPackNode from '../../nodes/RealityPackNode'
import { CommandManager } from '../../managers/CommandManager'

/**
 * Define properties for RealityPack component.
 *
 * @author Abhishek Pathak
 * @type {Object}
 */
type RealityPackNodeEditorProps = {
  node?: RealityPackNode
  t: Function
}

/**
 * For RealityPacks
 *
 * @author Abhishek Pathak
 * @param       {Object} props
 * @constructor
 */

export class RealityPackNodeEditor extends Component<RealityPackNodeEditorProps, {}> {
  static iconComponent = Dashboard
  static description = i18n.t('editor:properties.realitypacknode.description')

  constructor(props) {
    super(props)
  }

  getRealityPacks = () => {
    const packs = realitypacks.packs
    const options = []
    packs.forEach((value, index) => {
      options.push({
        label: value,
        value: index
      })
    })
    return options
  }

  options = this.getRealityPacks()

  onChangeScript = (val) => {
    CommandManager.instance.setPropertyOnSelection('packIndex', val)
    this.props.node.packName = this.options[val]
  }

  render() {
    const node = this.props.node
    RealityPackNodeEditor.description = i18n.t('editor:properties.realitypacknode.description')
    return (
      <InputGroup name="RealityPack" label="Reality Pack">
        <SelectInput options={this.options} onChange={this.onChangeScript} value={node.packIndex} />
      </InputGroup>
    )
  }
}

export default withTranslation()(RealityPackNodeEditor)

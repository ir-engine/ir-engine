import React, { Component } from 'react'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Dashboard } from '@material-ui/icons'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import RealityPackNode from '../../nodes/RealityPackNode'
import { CommandManager } from '../../managers/CommandManager'
import { ProjectManager } from '../../managers/ProjectManager'
import { RealityPack } from '@xrengine/common/src/interfaces/RealityPack'

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

type RealityPackEditorStates = {
  realityPacks: RealityPack[]
}

/**
 * For RealityPacks
 *
 * @author Abhishek Pathak
 * @param       {Object} props
 * @constructor
 */

export class RealityPackNodeEditor extends Component<RealityPackNodeEditorProps, RealityPackEditorStates> {
  static iconComponent = Dashboard
  static description = i18n.t('editor:properties.realitypacknode.description')

  constructor(props) {
    super(props)
    this.state = {
      realityPacks: []
    }
  }

  getRealityPacks = async () => {
    let realityPacks: RealityPack[] = []
    try {
      realityPacks = await ProjectManager.instance.feathersClient.service('realitypacks/list').find()
    } catch (e) {
      console.log(e)
    }
    this.setState({ realityPacks })
  }

  onChangeScript = (val) => {
    CommandManager.instance.setPropertyOnSelection('packName', val)
  }

  componentDidMount() {
    this.getRealityPacks()
  }

  render() {
    const node = this.props.node
    RealityPackNodeEditor.description = i18n.t('editor:properties.realitypacknode.description')
    return (
      <InputGroup name="RealityPack" label="Reality Pack">
        <SelectInput
          options={this.state.realityPacks.map((r) => {
            return { label: r.name, value: r.name }
          })}
          onChange={this.onChangeScript}
          value={node.packName}
        />
      </InputGroup>
    )
  }
}

export default withTranslation()(RealityPackNodeEditor)

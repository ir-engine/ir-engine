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
import { InjectionPoint } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import NodeEditor from './NodeEditor'

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

const InjectionPoints = [
  {
    label: 'Update',
    value: InjectionPoint.UPDATE
  },
  {
    label: 'Fixed Early',
    value: InjectionPoint.FIXED_EARLY
  },
  {
    label: 'Fixed',
    value: InjectionPoint.FIXED
  },
  {
    label: 'Fixed Late',
    value: InjectionPoint.FIXED_LATE
  },
  {
    label: 'Pre Render',
    value: InjectionPoint.PRE_RENDER
  },
  {
    label: 'Post Render',
    value: InjectionPoint.POST_RENDER
  }
]

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

  onChangeInjectionPoint = (val) => {
    CommandManager.instance.setPropertyOnSelection('injectionPoint', val)
  }

  componentDidMount() {
    this.getRealityPacks()
  }

  render() {
    const node = this.props.node
    RealityPackNodeEditor.description = i18n.t('editor:properties.realitypacknode.description')
    return (
      <NodeEditor description={RealityPackNodeEditor.description} {...this.props}>
        <InputGroup name="RealityPack" label="Reality Pack">
          <SelectInput
            options={this.state.realityPacks.map((r) => {
              return { label: r.name, value: r.name }
            })}
            onChange={this.onChangeScript}
            value={node.packName}
          />
        </InputGroup>
        <InputGroup name="InjectionPoint" label="Injection Point">
          <SelectInput options={InjectionPoints} onChange={this.onChangeInjectionPoint} value={node.injectionPoint} />
        </InputGroup>
      </NodeEditor>
    )
  }
}

export default withTranslation()(RealityPackNodeEditor)

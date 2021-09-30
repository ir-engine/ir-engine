import React, { Component } from 'react'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Dashboard } from '@material-ui/icons'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import RealityPackNode from '../../nodes/RealityPackNode'
import { CommandManager } from '../../managers/CommandManager'
import { ProjectManager } from '../../managers/ProjectManager'
import { RealityPackInterface } from '@xrengine/common/src/interfaces/RealityPack'
import NodeEditor from './NodeEditor'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import StringInput from '../inputs/StringInput'

/**
 * Define properties for RealityPack component.
 *
 * @author Abhishek Pathak
 * @author Josh Field
 * @type {Object}
 */

type RealityPackNodeEditorProps = {
  node?: RealityPackNode
  t: Function
}

type RealityPackEditorStates = {
  realityPacks: RealityPackInterface[]
}

const systemUpdateTypes = [
  {
    label: 'None',
    value: 'None'
  },
  {
    label: 'Update',
    value: SystemUpdateType.UPDATE
  },
  {
    label: 'Fixed Early',
    value: SystemUpdateType.FIXED_EARLY
  },
  {
    label: 'Fixed',
    value: SystemUpdateType.FIXED
  },
  {
    label: 'Fixed Late',
    value: SystemUpdateType.FIXED_LATE
  },
  {
    label: 'Pre Render',
    value: SystemUpdateType.PRE_RENDER
  },
  {
    label: 'Post Render',
    value: SystemUpdateType.POST_RENDER
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
    let realityPacks: RealityPackInterface[] = []
    try {
      realityPacks = (await ProjectManager.instance.feathersClient.service('reality-pack').find()).data
      console.log(realityPacks)
    } catch (e) {
      console.log(e)
      return
    }
    this.setState({ realityPacks })
  }

  onChangeRealityPack = (val) => {
    CommandManager.instance.setPropertyOnSelection('packName', val)
    CommandManager.instance.setPropertyOnSelection('entryPoints', [])
  }

  onChangeSystemUpdateType = (entryPoint, systemUpdateType) => {
    const entryPoints = [...this.props.node.entryPoints]
    console.log(entryPoints)
    const currentEntry = entryPoints.find((ep) => ep.entryPoint === entryPoint)
    if (currentEntry) currentEntry.systemUpdateType = systemUpdateType
    else entryPoints.push({ entryPoint, systemUpdateType })
    CommandManager.instance.setPropertyOnSelection('entryPoints', entryPoints)
    console.log(entryPoints)
  }

  componentDidMount() {
    this.getRealityPacks()
  }

  render() {
    const node = this.props.node as RealityPackNode
    const currentPack = this.state.realityPacks.find((pack) => pack.name === node.packName)
    RealityPackNodeEditor.description = i18n.t('editor:properties.realitypacknode.description')
    return (
      <NodeEditor description={RealityPackNodeEditor.description} {...this.props}>
        <InputGroup name="RealityPack" label="Reality Pack">
          <SelectInput
            options={this.state.realityPacks.map((r) => {
              return { label: r.name, value: r.name }
            })}
            onChange={this.onChangeRealityPack}
            value={node.packName}
          />
        </InputGroup>

        {currentPack?.moduleEntryPoints?.map((entryPoint) => {
          let entryPointSplit = entryPoint.split('.')
          entryPointSplit.pop()
          const entryPointFilename = entryPointSplit.join('.')
          return (
            <InputGroup key={entryPointFilename} name={entryPointFilename} label={entryPointFilename}>
              <SelectInput
                options={systemUpdateTypes}
                onChange={(val) => this.onChangeSystemUpdateType(entryPoint, val)}
                value={node.entryPoints.find((ep) => ep.entryPoint === entryPoint)?.systemUpdateType ?? 'None'}
              />
            </InputGroup>
          )
        })}
      </NodeEditor>
    )
  }
}

export default withTranslation()(RealityPackNodeEditor)

import React, { Component } from 'react'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { Dashboard } from '@mui/icons-material'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import ProjectNode from '../../nodes/ProjectNode'
import { CommandManager } from '../../managers/CommandManager'
import { ProjectManager } from '../../managers/ProjectManager'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import NodeEditor from './NodeEditor'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { client } from '@xrengine/client-core/src/feathers'

/**
 * Define properties for Project component.
 *
 * @author Abhishek Pathak
 * @author Josh Field
 * @type {Object}
 */

type ProjectNodeEditorProps = {
  node?: ProjectNode
  t: Function
}

type ProjectEditorStates = {
  projects: ProjectInterface[]
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
 * For Projects
 *
 * @author Abhishek Pathak
 * @param       {Object} props
 * @constructor
 */

export class ProjectNodeEditor extends Component<ProjectNodeEditorProps, ProjectEditorStates> {
  static iconComponent = Dashboard
  static description = i18n.t('editor:properties.projectnode.description')

  constructor(props) {
    super(props)
    this.state = {
      projects: []
    }
  }

  getProjects = async () => {
    let projects: ProjectInterface[] = []
    try {
      projects = (await client.service('project').find()).data
      console.log(projects)
    } catch (e) {
      console.log(e)
      return
    }
    this.setState({ projects })
  }

  onChangeProject = (val) => {
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
    this.getProjects()
  }

  render() {
    const node = this.props.node as ProjectNode
    const currentPack = this.state.projects.find((pack) => pack.name === node.packName)
    ProjectNodeEditor.description = i18n.t('editor:properties.projectnode.description')
    return (
      <NodeEditor description={ProjectNodeEditor.description} {...this.props}>
        <InputGroup name="Project" label="Project">
          <SelectInput
            options={this.state.projects.map((r) => {
              return { label: r.name, value: r.name }
            })}
            onChange={this.onChangeProject}
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

export default withTranslation()(ProjectNodeEditor)

import React, { useEffect, useState } from 'react'
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

const ProjectNodeEditor = (props: ProjectNodeEditorProps) => {
  let [projects, setProjects] = useState([])

  const getProjects = async () => {
    let projects: ProjectInterface[] = []
    try {
      projects = (await client.service('project').find()).data
      console.log(projects)
    } catch (e) {
      console.log(e)
      return
    }
    setProjects(projects)
  }

  const onChangeProject = (val) => {
    CommandManager.instance.setPropertyOnSelection('packName', val)
    CommandManager.instance.setPropertyOnSelection('entryPoints', [])
  }

  const onChangeSystemUpdateType = (entryPoint, systemUpdateType) => {
    const entryPoints = [...props.node.entryPoints]
    console.log(entryPoints)
    const currentEntry = entryPoints.find((ep) => ep.entryPoint === entryPoint)
    if (currentEntry) currentEntry.systemUpdateType = systemUpdateType
    else entryPoints.push({ entryPoint, systemUpdateType })
    CommandManager.instance.setPropertyOnSelection('entryPoints', entryPoints)
    console.log(entryPoints)
  }

  useEffect(() => {
    getProjects()
  }, [])

  const node = props.node as ProjectNode

  const currentPack = projects.find((pack) => pack.name === node.packName)

  return (
    <NodeEditor description={ProjectNodeEditor.description} {...props}>
      <InputGroup name="Project" label="Project">
        <SelectInput
          options={projects.map((r) => {
            return { label: r.name, value: r.name }
          })}
          onChange={onChangeProject}
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
              onChange={(val) => onChangeSystemUpdateType(entryPoint, val)}
              value={node.entryPoints.find((ep) => ep.entryPoint === entryPoint)?.systemUpdateType ?? 'None'}
            />
          </InputGroup>
        )
      })}
    </NodeEditor>
  )
}

ProjectNodeEditor.iconComponent = Dashboard
ProjectNodeEditor.description = i18n.t('editor:properties.projectnode.description')

export default withTranslation()(ProjectNodeEditor)

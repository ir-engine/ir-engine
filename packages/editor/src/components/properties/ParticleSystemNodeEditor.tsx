import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, getComponentState } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { BehaviorJSON, ParticleSystemComponent } from '@xrengine/engine/src/scene/components/ParticleSystemComponent'

import { ScatterPlotOutlined } from '@mui/icons-material'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import PaginatedList from '../layout/PaginatedList'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const ParticleSystemNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const particleSystem = getComponent(entity, ParticleSystemComponent)
  const particleSystemState = getComponentState(entity, ParticleSystemComponent)

  const onSetSystemParm = useCallback((field: keyof typeof particleSystem.systemParameters) => {
    return (value: any) => {
      const nuParms = JSON.parse(JSON.stringify(particleSystem.systemParameters))
      nuParms[field] = value
      updateProperty(ParticleSystemComponent, 'systemParameters', nuParms)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.particle-system.name')}
      description={t('editor:properties.particle-system.description')}
    >
      <h4>Options</h4>
      <ParameterInput entity={`${entity}`} values={particleSystem.systemParameters} onChange={onSetSystemParm} />
      <h4>Behaviors</h4>
      <PaginatedList<BehaviorJSON>
        list={particleSystem.behaviorParameters}
        element={(behavior) => {
          const index = particleSystem.behaviorParameters.indexOf(behavior)
          return (
            <div key={`particle-system-${entity}-${index}`}>
              <hr />
              <InputGroup name="Behavior Type" label={t('editor:properties.particle-system.behavior-type')}>
                <select
                  value={behavior.type}
                  onChange={(e) => {
                    const nuBehaviors = JSON.parse(JSON.stringify(particleSystem.behaviorParameters))
                    nuBehaviors[index].type = e.target.value
                    updateProperty(ParticleSystemComponent, 'behaviorParameters', nuBehaviors)
                  }}
                >
                  <option value="attractor">Attractor</option>
                  <option value="repulsor">Repulsor</option>
                  <option value="wind">Wind</option>
                  <option value="gravity">Gravity</option>
                  <option value="vortex">Vortex</option>
                  <option value="drag">Drag</option>
                  <option value="random">Random</option>
                </select>
              </InputGroup>
              <ParameterInput
                entity={`${entity}`}
                values={behavior.parameters}
                onChange={(field) => {
                  return (value: any) => {
                    const nuBehaviors = JSON.parse(JSON.stringify(particleSystem.behaviorParameters))
                    nuBehaviors[index].parameters[field] = value
                    updateProperty(ParticleSystemComponent, 'behaviorParameters', nuBehaviors)
                  }
                }}
              />
            </div>
          )
        }}
      />
    </NodeEditor>
  )
}

ParticleSystemNodeEditor.iconComponent = ScatterPlotOutlined

export default ParticleSystemNodeEditor

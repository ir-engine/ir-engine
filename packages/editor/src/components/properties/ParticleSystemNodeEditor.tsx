import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, getComponentState, useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  BehaviorJSON,
  CONE_SHAPE_DEFAULT,
  DONUT_SHAPE_DEFAULT,
  ParticleSystemComponent,
  POINT_SHAPE_DEFAULT,
  SPHERE_SHAPE_DEFAULT
} from '@xrengine/engine/src/scene/components/ParticleSystemComponent'

import { ScatterPlotOutlined } from '@mui/icons-material'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import PaginatedList from '../layout/PaginatedList'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const ParticleSystemNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const particleSystemState = useComponent(entity, ParticleSystemComponent)
  const particleSystem = particleSystemState.value

  const onSetSystemParm = useCallback((field: keyof typeof particleSystem.systemParameters) => {
    return (value: any) => {
      const nuParms = JSON.parse(JSON.stringify(particleSystem.systemParameters))
      nuParms[field] = value
      particleSystemState.systemParameters.set(nuParms)
      particleSystemState._refresh.set(particleSystem._refresh + 1)
    }
  }, [])

  const shapeDefaults = {
    point: POINT_SHAPE_DEFAULT,
    sphere: SPHERE_SHAPE_DEFAULT,
    cone: CONE_SHAPE_DEFAULT,
    donut: DONUT_SHAPE_DEFAULT
  }

  const onChangeShape = useCallback(() => {
    const onSetShape = onSetSystemParm('shape')
    return (shape: string) => {
      onSetShape(shapeDefaults[shape])
    }
  }, [])

  const onChangeShapeParm = useCallback((field: keyof typeof particleSystem.systemParameters.shape) => {
    return (value: any) => {
      const nuParms = JSON.parse(JSON.stringify(particleSystem.systemParameters.shape))
      nuParms[field] = value
      particleSystemState.systemParameters.shape.set(nuParms)
      particleSystemState._refresh.set(particleSystem._refresh + 1)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.particle-system.name')}
      description={t('editor:properties.particle-system.description')}
    >
      <h4>Options</h4>
      <InputGroup name="Emitter Shape" label={t('editor:properties.particle-system.emitter-shape')}>
        <SelectInput
          value={particleSystem.systemParameters.shape.type}
          onChange={onChangeShape()}
          options={[
            { label: 'Point', value: 'point' },
            { label: 'Sphere', value: 'sphere' },
            { label: 'Cone', value: 'cone' },
            { label: 'Donut', value: 'donut' }
          ]}
        />
      </InputGroup>
      <ParameterInput
        entity={`${entity}-shape`}
        values={particleSystem.systemParameters.shape}
        onChange={onChangeShapeParm}
      />
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

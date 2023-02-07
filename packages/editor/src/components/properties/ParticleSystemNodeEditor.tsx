import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent, getComponentState, useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  BehaviorJSON,
  CONE_SHAPE_DEFAULT,
  ConstantColorJSON,
  ConstantValueJSON,
  DONUT_SHAPE_DEFAULT,
  IntervalValueJSON,
  ParticleSystemComponent,
  POINT_SHAPE_DEFAULT,
  SPHERE_SHAPE_DEFAULT
} from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@xrengine/hyperflux'

import { ScatterPlotOutlined } from '@mui/icons-material'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import TexturePreviewInput, { TextureInput } from '../inputs/TexturePreviewInput'
import PaginatedList from '../layout/PaginatedList'
import NodeEditor from './NodeEditor'
import ColorGenerator from './three.quarks/ColorGenerator'
import ValueGenerator from './three.quarks/ValueGenerator'
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
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    }
  }, [])

  const onSetStateParm = useCallback((state: State<any>) => {
    return useCallback(
      (field: keyof typeof state.value) => (value: any) => {
        state[field].set(value)
        particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
      },
      []
    )
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
      <InputGroup name="Start Life" label={t('editor:properties.particle-system.start-life')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startLife as IntervalValueJSON | ConstantValueJSON}
          scope={particleSystemState.systemParameters.startLife as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startLife)}
        />
      </InputGroup>
      <InputGroup name="Start Size" label={t('editor:properties.particle-system.start-size')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startSize as IntervalValueJSON | ConstantValueJSON}
          scope={particleSystemState.systemParameters.startSize as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startSize)}
        />
      </InputGroup>
      <InputGroup name="Start Speed" label={t('editor:properties.particle-system.start-speed')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startSpeed as IntervalValueJSON | ConstantValueJSON}
          scope={particleSystemState.systemParameters.startSpeed as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startSpeed)}
        />
      </InputGroup>
      <InputGroup name="Start Rotation" label={t('editor:properties.particle-system.start-rotation')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startRotation as IntervalValueJSON | ConstantValueJSON}
          scope={particleSystemState.systemParameters.startRotation as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startRotation)}
        />
      </InputGroup>
      <InputGroup name="Start Color" label={t('editor:properties.particle-system.start-color')}>
        <ColorGenerator
          value={particleSystem.systemParameters.startColor as ConstantColorJSON}
          scope={particleSystemState.systemParameters.startColor as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startColor)}
        />
      </InputGroup>
      <InputGroup name="Emission Over Time" label={t('editor:properties.particle-system.emission-over-time')}>
        <ValueGenerator
          value={particleSystem.systemParameters.emissionOverTime as IntervalValueJSON | ConstantValueJSON}
          scope={particleSystemState.systemParameters.emissionOverTime as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.emissionOverTime)}
        />
      </InputGroup>
      <InputGroup name="Texture" label={t('editor:properties.particle-system.texture')}>
        <TexturePreviewInput value={particleSystem.systemParameters.texture} onChange={onSetSystemParm('texture')} />
      </InputGroup>

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

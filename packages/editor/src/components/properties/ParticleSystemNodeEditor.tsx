/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AdditiveBlending,
  Blending,
  CustomBlending,
  MultiplyBlending,
  NoBlending,
  NormalBlending,
  SubtractiveBlending
} from 'three'
import { BurstParameters, RenderMode } from 'three.quarks'

import { getComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  ApplyForceBehaviorJSON,
  BehaviorJSON,
  BurstParametersJSON,
  ColorGeneratorJSON,
  CONE_SHAPE_DEFAULT,
  ConstantColorJSON,
  DONUT_SHAPE_DEFAULT,
  ExtraSystemJSON,
  MESH_SHAPE_DEFAULT,
  ParticleSystemComponent,
  POINT_SHAPE_DEFAULT,
  SPHERE_SHAPE_DEFAULT,
  ValueGeneratorJSON
} from '@etherealengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@etherealengine/hyperflux'

import { ScatterPlotOutlined } from '@mui/icons-material'

import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import NumericInput from '../inputs/NumericInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import TexturePreviewInput from '../inputs/TexturePreviewInput'
import PaginatedList from '../layout/PaginatedList'
import NodeEditor from './NodeEditor'
import BehaviorInput from './three.quarks/BehaviorInput'
import ColorGenerator from './three.quarks/ColorGenerator'
import ValueGenerator from './three.quarks/ValueGenerator'
import { commitProperties, commitProperty, EditorComponentType } from './Util'

const ParticleSystemNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const particleSystemState = useComponent(entity, ParticleSystemComponent)
  const particleSystem = particleSystemState.value

  const onSetSystemParm = useCallback((field: keyof typeof particleSystem.systemParameters) => {
    const parm = particleSystem.systemParameters[field]
    return (value: typeof parm) => {
      particleSystemState._refresh.set(particleSystem._refresh + 1)
      commitProperty(ParticleSystemComponent, ('systemParameters.' + field) as any)(value)
    }
  }, [])

  const shapeDefaults = {
    point: POINT_SHAPE_DEFAULT,
    sphere: SPHERE_SHAPE_DEFAULT,
    cone: CONE_SHAPE_DEFAULT,
    donut: DONUT_SHAPE_DEFAULT,
    mesh_surface: MESH_SHAPE_DEFAULT
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
      commitProperty(ParticleSystemComponent, 'systemParameters.shape' as any)(nuParms)
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    }
  }, [])

  const onSetState = useCallback((state: State<any>) => {
    return (value: any) => {
      state.set(value)
      const { systemParameters, behaviorParameters } = JSON.parse(
        JSON.stringify(getComponent(entity, ParticleSystemComponent))
      )
      commitProperties(
        ParticleSystemComponent,
        {
          systemParameters,
          behaviorParameters
        },
        [props.entity]
      )
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    }
  }, [])

  const onAddBehavior = useCallback(() => {
    const nuBehavior: ApplyForceBehaviorJSON = {
      type: 'ApplyForce',
      direction: [0, 1, 0],
      magnitude: {
        type: 'ConstantValue',
        value: 1
      }
    }
    particleSystemState.behaviorParameters.set([
      ...JSON.parse(JSON.stringify(particleSystem.behaviorParameters)),
      nuBehavior
    ])
    particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
  }, [])

  const onRemoveBehavior = useCallback(
    (behavior: BehaviorJSON) => () => {
      const data = JSON.parse(JSON.stringify(particleSystem.behaviorParameters.filter((b) => b !== behavior)))
      commitProperty(ParticleSystemComponent, 'behaviorParameters')(data)
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    },
    []
  )

  const onAddBurst = useCallback(() => {
    const nuBurst: BurstParametersJSON = {
      time: 0,
      count: 0,
      cycle: 0,
      interval: 0,
      probability: 0
    }
    const data = [...JSON.parse(JSON.stringify(particleSystem.systemParameters.emissionBursts)), nuBurst]
    commitProperty(ParticleSystemComponent, 'systemParameters.emissionBursts' as any)(data)
    particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
  }, [])

  const onRemoveBurst = useCallback((burst: State<BurstParameters>) => {
    return () => {
      const data = JSON.parse(
        JSON.stringify(particleSystem.systemParameters.emissionBursts.filter((b) => b !== burst.value))
      )
      commitProperty(ParticleSystemComponent, 'systemParameters.emissionBursts' as any)(data)
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.particle-system.name')}
      description={t('editor:properties.particle-system.description')}
    >
      <h4 style={{ fontSize: '100%', fontWeight: 'normal' }}>Options</h4>
      <InputGroup name="Looping" label={t('editor:properties.particle-system.looping')}>
        <BooleanInput value={particleSystem.systemParameters.looping} onChange={onSetSystemParm('looping')} />
      </InputGroup>

      <InputGroup name="Duration" label={t('editor:properties.particle-system.duration')}>
        <NumericInput value={particleSystem.systemParameters.duration} onChange={onSetSystemParm('duration')} />
      </InputGroup>

      <InputGroup name="Prewarm" label={t('editor:properties.particle-system.prewarm')}>
        <BooleanInput value={particleSystem.systemParameters.prewarm} onChange={onSetSystemParm('prewarm')} />
      </InputGroup>

      <InputGroup name="Emitter Shape" label={t('editor:properties.particle-system.emitter-shape')}>
        <SelectInput
          value={particleSystem.systemParameters.shape.type}
          onChange={onChangeShape()}
          options={[
            { label: 'Point', value: 'point' },
            { label: 'Sphere', value: 'sphere' },
            { label: 'Cone', value: 'cone' },
            { label: 'Donut', value: 'donut' },
            { label: 'Mesh', value: 'mesh_surface' }
          ]}
        />
      </InputGroup>

      <InputGroup name="Emission Bursts" label={t('editor:properties.particle-system.emission-bursts')}>
        <Button onClick={onAddBurst}>Add Burst</Button>
      </InputGroup>
      <PaginatedList
        list={
          particleSystem.systemParameters.emissionBursts
            ? (particleSystemState.systemParameters.emissionBursts as State<BurstParametersJSON[]>)
            : []
        }
        element={(burst: State<BurstParametersJSON>) => {
          return (
            <div>
              <NumericInputGroup
                name="Time"
                label={t('editor:properties.particle-system.burst.time')}
                value={burst.time.value}
                onChange={onSetState(burst.time)}
              />
              <NumericInputGroup
                name="Count"
                label={t('editor:properties.particle-system.burst.count')}
                value={burst.count.value}
                onChange={onSetState(burst.count)}
              />
              <NumericInputGroup
                name="Cycle"
                label={t('editor:properties.particle-system.burst.cycle')}
                value={burst.cycle.value}
                onChange={onSetState(burst.cycle)}
              />
              <NumericInputGroup
                name="Interval"
                label={t('editor:properties.particle-system.burst.interval')}
                value={burst.interval.value}
                onChange={onSetState(burst.interval)}
              />
              <NumericInputGroup
                name="Probability"
                label={t('editor:properties.particle-system.burst.probability')}
                value={burst.probability.value}
                onChange={onSetState(burst.probability)}
              />
              <Button onClick={onRemoveBurst(burst as any)}>Remove Burst</Button>
            </div>
          )
        }}
      />
      {particleSystem.systemParameters.shape.type === 'mesh_surface' && (
        <InputGroup name="Shape Mesh" label={t('editor:properties.particle-system.shape-mesh')}>
          <ModelInput value={particleSystem.systemParameters.shape.mesh} onChange={onChangeShapeParm('mesh')} />
        </InputGroup>
      )}
      {particleSystem.systemParameters.shape.type !== 'mesh_surface' && (
        <ParameterInput
          entity={`${entity}-shape`}
          values={particleSystem.systemParameters.shape}
          onChange={onChangeShapeParm}
        />
      )}

      <InputGroup name="Start Life" label={t('editor:properties.particle-system.start-life')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startLife as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startLife as any}
          onChange={onSetState}
        />
      </InputGroup>
      <InputGroup name="Start Size" label={t('editor:properties.particle-system.start-size')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startSize as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startSize as any}
          onChange={onSetState}
        />
      </InputGroup>
      <InputGroup name="Start Speed" label={t('editor:properties.particle-system.start-speed')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startSpeed as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startSpeed as any}
          onChange={onSetState}
        />
      </InputGroup>
      <InputGroup name="Start Rotation" label={t('editor:properties.particle-system.start-rotation')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startRotation as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startRotation as any}
          onChange={onSetState}
        />
      </InputGroup>
      <InputGroup name="Start Color" label={t('editor:properties.particle-system.start-color')}>
        <ColorGenerator
          scope={particleSystemState.systemParameters.startColor as unknown as State<ColorGeneratorJSON>}
          value={particleSystem.systemParameters.startColor as ConstantColorJSON}
          onChange={onSetState}
        />
      </InputGroup>
      <InputGroup name="Emission Over Time" label={t('editor:properties.particle-system.emission-over-time')}>
        <ValueGenerator
          value={particleSystem.systemParameters.emissionOverTime as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.emissionOverTime as any}
          onChange={onSetState}
        />
      </InputGroup>
      <InputGroup name="Render Mode" label={t('editor:properties.particle-system.render-mode')}>
        <SelectInput
          value={particleSystem.systemParameters.renderMode}
          onChange={onSetSystemParm('renderMode')}
          options={[
            { label: 'Billboard', value: RenderMode.BillBoard },
            { label: 'Stretched Billboard', value: RenderMode.StretchedBillBoard },
            { label: 'Mesh', value: RenderMode.Mesh },
            { label: 'Trail', value: RenderMode.Trail }
          ]}
        />
      </InputGroup>
      {particleSystem.systemParameters.renderMode === RenderMode.Trail && (
        <>
          <InputGroup name="Trail Length" label={t('editor:properties.particle-system.trail-length')}>
            <ValueGenerator
              value={particleSystem.systemParameters.rendererEmitterSettings.startLength as ValueGeneratorJSON}
              scope={
                (particleSystemState.systemParameters.rendererEmitterSettings as any)
                  .startLength as unknown as State<ValueGeneratorJSON>
              }
              onChange={onSetState}
            />
          </InputGroup>
          <InputGroup name="Follow Local Origin" label={t('editor:properties.particle-system.follow-local-origin')}>
            <BooleanInput
              value={particleSystem.systemParameters.rendererEmitterSettings.followLocalOrigin}
              onChange={onSetState(particleSystemState.systemParameters.rendererEmitterSettings.followLocalOrigin)}
            />
          </InputGroup>
        </>
      )}
      <InputGroup name="Texture" label={t('editor:properties.particle-system.texture')}>
        <TexturePreviewInput
          value={particleSystem.systemParameters.texture ?? ''}
          onChange={onSetSystemParm('texture')}
        />
      </InputGroup>
      <InputGroup name="U Tiles" label={t('editor:properties.particle-system.u-tiles')}>
        <NumericInput value={particleSystem.systemParameters.uTileCount} onChange={onSetSystemParm('uTileCount')} />
      </InputGroup>
      <InputGroup name="V Tiles" label={t('editor:properties.particle-system.v-tiles')}>
        <NumericInput value={particleSystem.systemParameters.vTileCount} onChange={onSetSystemParm('vTileCount')} />
      </InputGroup>
      <InputGroup name="Start Tile Index" label={t('editor:properties.particle-system.start-tile-index')}>
        {typeof particleSystem.systemParameters.startTileIndex === 'number' && (
          <>
            <NumericInput
              value={particleSystem.systemParameters.startTileIndex}
              onChange={onSetState(particleSystemState.systemParameters.startTileIndex)}
            />
            <Button
              onClick={() => {
                const nuParms = JSON.parse(JSON.stringify(particleSystem.systemParameters))
                nuParms.startTileIndex = {
                  type: 'ConstantValue',
                  value: particleSystem.systemParameters.startTileIndex
                }
                particleSystemState.systemParameters.set(nuParms)
                commitProperty(ParticleSystemComponent, 'systemParameters')(nuParms)
                particleSystemState._refresh.set(particleSystem._refresh + 1)
              }}
            >
              Convert to Value Generator
            </Button>
          </>
        )}
        {typeof particleSystem.systemParameters.startTileIndex === 'object' && (
          <ValueGenerator
            scope={particleSystemState.systemParameters.startTileIndex as unknown as State<ValueGeneratorJSON>}
            value={particleSystem.systemParameters.startTileIndex as ValueGeneratorJSON}
            onChange={onSetState}
          />
        )}
      </InputGroup>

      <InputGroup name="Mesh" label={t('editor:properties.particle-system.mesh')}>
        <ModelInput
          value={particleSystem.systemParameters.instancingGeometry}
          onChange={onSetState(
            (particleSystemState.systemParameters as unknown as State<ExtraSystemJSON>).instancingGeometry
          )}
        />
      </InputGroup>
      <InputGroup name="Blending" label={t('editor:properties.particle-system.blending')}>
        <SelectInput
          value={particleSystem.systemParameters.blending as Blending}
          onChange={onSetState(particleSystemState.systemParameters.blending)}
          options={[
            { label: 'Normal', value: NormalBlending },
            { label: 'Additive', value: AdditiveBlending },
            { label: 'Subtractive', value: SubtractiveBlending },
            { label: 'Multiply', value: MultiplyBlending },
            { label: 'Custom', value: CustomBlending },
            { label: 'No Blending', value: NoBlending }
          ]}
        />
      </InputGroup>
      <InputGroup name="Transparent" label={t('editor:properties.particle-system.transparent')}>
        <BooleanInput
          value={particleSystem.systemParameters.transparent ?? false}
          onChange={onSetState(particleSystemState.systemParameters.transparent)}
        />
      </InputGroup>
      <InputGroup name="World Space" label={t('editor:properties.particle-system.world-space')}>
        <BooleanInput value={particleSystem.systemParameters.worldSpace} onChange={onSetSystemParm('worldSpace')} />
      </InputGroup>
      <h4 style={{ fontSize: '100%', fontWeight: 'normal' }}>Behaviors</h4>
      <Button onClick={onAddBehavior}>Add Behavior</Button>
      <PaginatedList
        list={particleSystemState.behaviorParameters}
        element={(behaviorState: State<BehaviorJSON>) => {
          return (
            <>
              <BehaviorInput scope={behaviorState} value={behaviorState.value} onChange={onSetState} />
              <Button onClick={onRemoveBehavior(behaviorState.value)}>Remove</Button>
            </>
          )
        }}
      />
    </NodeEditor>
  )
}

ParticleSystemNodeEditor.iconComponent = ScatterPlotOutlined

export default ParticleSystemNodeEditor

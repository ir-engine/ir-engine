/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
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

import { getComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  ApplyForceBehaviorJSON,
  BehaviorJSON,
  BurstParametersJSON,
  CONE_SHAPE_DEFAULT,
  ColorGeneratorJSON,
  ConstantColorJSON,
  DONUT_SHAPE_DEFAULT,
  ExtraSystemJSON,
  MESH_SHAPE_DEFAULT,
  POINT_SHAPE_DEFAULT,
  ParticleSystemComponent,
  SPHERE_SHAPE_DEFAULT,
  ValueGeneratorJSON
} from '@ir-engine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@ir-engine/hyperflux'
import { HiSparkles } from 'react-icons/hi'

import { EditorComponentType, commitProperties, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Checkbox } from '@ir-engine/ui'
import Button from '../../../../primitives/tailwind/Button'
import BehaviorInput from '../../input/Behavior'
import ColorGenerator from '../../input/Generator/Color'
import ValueGenerator from '../../input/Generator/Value'
import InputGroup from '../../input/Group'
import ModelInput from '../../input/Model'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import TexturePreviewInput from '../../input/Texture'
import PaginatedList from '../../layout/PaginatedList'

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
    (index: number) => () => {
      const data = JSON.parse(JSON.stringify(particleSystem.behaviorParameters.toSpliced(index, 1)))
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
        JSON.stringify(
          particleSystem.systemParameters.emissionBursts.filter((b: any) => b !== (burst.value as BurstParameters))
        )
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
      Icon={ParticleSystemNodeEditor.iconComponent}
    >
      <InputGroup name="Looping" label={t('editor:properties.particle-system.looping')}>
        <Checkbox checked={particleSystem.systemParameters.looping} onChange={onSetSystemParm('looping')} />
      </InputGroup>

      <InputGroup name="Duration" label={t('editor:properties.particle-system.duration')}>
        <NumericInput value={particleSystem.systemParameters.duration} onChange={onSetSystemParm('duration')} />
      </InputGroup>

      <InputGroup name="Prewarm" label={t('editor:properties.particle-system.prewarm')}>
        <Checkbox checked={particleSystem.systemParameters.prewarm} onChange={onSetSystemParm('prewarm')} />
      </InputGroup>

      <InputGroup name="Emitter Shape" label={t('editor:properties.particle-system.emitter-shape')}>
        <SelectInput
          value={particleSystem.systemParameters.shape.type}
          onChange={onChangeShape()}
          options={[
            { label: t('editor:properties.particle-system.emitter-shape-type.point'), value: 'point' },
            { label: t('editor:properties.particle-system.emitter-shape-type.sphere'), value: 'sphere' },
            { label: t('editor:properties.particle-system.emitter-shape-type.cone'), value: 'cone' },
            { label: t('editor:properties.particle-system.emitter-shape-type.donut'), value: 'donut' },
            { label: t('editor:properties.particle-system.emitter-shape-type.mesh'), value: 'mesh_surface' }
          ]}
        />
      </InputGroup>
      {particleSystem.systemParameters.shape.type === 'mesh_surface' && (
        <InputGroup
          name="Shape Mesh"
          label={t('editor:properties.particle-system.shape-mesh')}
          info={t('editor:properties.particle-system.shape-mesh-info')}
        >
          <ModelInput
            value={particleSystem.systemParameters.shape.mesh!}
            onRelease={onSetState(particleSystemState.systemParameters.shape.mesh as any)}
          />
        </InputGroup>
      )}
      <InputGroup name="Emission Bursts" label={t('editor:properties.particle-system.emission-bursts')}>
        <Button onClick={onAddBurst}>{t('editor:properties.particle-system.add-burst')}</Button>
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
              <InputGroup name="Time" label={t('editor:properties.particle-system.burst.time')}>
                <NumericInput value={burst.time.value} onChange={onSetState(burst.time)} />
              </InputGroup>

              <InputGroup name="Count" label={t('editor:properties.particle-system.burst.count')}>
                <NumericInput value={burst.count.value} onChange={onSetState(burst.count)} />
              </InputGroup>

              <InputGroup name="Cycle" label={t('editor:properties.particle-system.burst.cycle')}>
                <NumericInput value={burst.cycle.value} onChange={onSetState(burst.cycle)} />
              </InputGroup>

              <InputGroup name="Interval" label={t('editor:properties.particle-system.burst.interval')}>
                <NumericInput value={burst.interval.value} onChange={onSetState(burst.interval)} />
              </InputGroup>

              <InputGroup name="Probability" label={t('editor:properties.particle-system.burst.probability')}>
                <NumericInput value={burst.probability.value} onChange={onSetState(burst.probability)} />
              </InputGroup>

              <Button onClick={onRemoveBurst(burst as any)}>
                {t('editor:properties.particle-system.remove-burst')}
              </Button>
            </div>
          )
        }}
      />

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
            { label: t('editor:properties.particle-system.render-mode-type.billboard'), value: RenderMode.BillBoard },
            {
              label: t('editor:properties.particle-system.render-mode-type.stretched-billboard'),
              value: RenderMode.StretchedBillBoard
            },
            { label: t('editor:properties.particle-system.render-mode-type.mesh'), value: RenderMode.Mesh },
            { label: t('editor:properties.particle-system.render-mode-type.trail'), value: RenderMode.Trail }
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
            <Checkbox
              checked={particleSystem.systemParameters.rendererEmitterSettings.followLocalOrigin}
              onChange={onSetState(particleSystemState.systemParameters.rendererEmitterSettings.followLocalOrigin)}
            />
          </InputGroup>
        </>
      )}
      <InputGroup name="Texture" label={t('editor:properties.particle-system.texture')}>
        <TexturePreviewInput
          value={particleSystem.systemParameters.texture ?? ''}
          onRelease={onSetSystemParm('texture')}
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
          onRelease={onSetState(
            (particleSystemState.systemParameters as unknown as State<ExtraSystemJSON>).instancingGeometry
          )}
        />
      </InputGroup>
      <InputGroup name="Blending" label={t('editor:properties.particle-system.blending')}>
        <SelectInput
          value={particleSystem.systemParameters.blending as Blending}
          onChange={onSetState(particleSystemState.systemParameters.blending)}
          options={[
            { label: t('editor:properties.particle-system.blending-type.normal'), value: NormalBlending },
            { label: t('editor:properties.particle-system.blending-type.additive'), value: AdditiveBlending },
            { label: t('editor:properties.particle-system.blending-type.subtractive'), value: SubtractiveBlending },
            { label: t('editor:properties.particle-system.blending-type.multiply'), value: MultiplyBlending },
            { label: t('editor:properties.particle-system.blending-type.custom'), value: CustomBlending },
            { label: t('editor:properties.particle-system.blending-type.no-blending'), value: NoBlending }
          ]}
        />
      </InputGroup>
      <InputGroup name="Transparent" label={t('editor:properties.particle-system.transparent')}>
        <Checkbox
          checked={particleSystem.systemParameters.transparent ?? false}
          onChange={onSetState(particleSystemState.systemParameters.transparent)}
        />
      </InputGroup>
      <InputGroup name="World Space" label={t('editor:properties.particle-system.world-space')}>
        <Checkbox checked={particleSystem.systemParameters.worldSpace} onChange={onSetSystemParm('worldSpace')} />
      </InputGroup>
      <Button className="self-end" onClick={onAddBehavior}>
        {t('editor:properties.particle-system.addBehavior')}
      </Button>
      <PaginatedList
        list={particleSystemState.behaviorParameters}
        element={(behaviorState: State<BehaviorJSON>, index) => {
          return (
            <>
              <BehaviorInput scope={behaviorState} value={behaviorState.value as BehaviorJSON} onChange={onSetState} />
              <Button onClick={onRemoveBehavior(index)}>{t('editor:properties.particle-system.remove')}</Button>
            </>
          )
        }}
      />
    </NodeEditor>
  )
}

ParticleSystemNodeEditor.iconComponent = HiSparkles

export default ParticleSystemNodeEditor

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
import { RenderMode } from 'three.quarks/dist/three.quarks'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  ApplyForceBehaviorJSON,
  BehaviorJSON,
  CONE_SHAPE_DEFAULT,
  ConstantColorJSON,
  DONUT_SHAPE_DEFAULT,
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
import ParameterInput from '../inputs/ParameterInput'
import SelectInput from '../inputs/SelectInput'
import TexturePreviewInput from '../inputs/TexturePreviewInput'
import PaginatedList from '../layout/PaginatedList'
import NodeEditor from './NodeEditor'
import BehaviorInput from './three.quarks/BehaviorInput'
import ColorGenerator from './three.quarks/ColorGenerator'
import ValueGenerator from './three.quarks/ValueGenerator'
import { EditorComponentType } from './Util'

const ParticleSystemNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
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
      particleSystemState.systemParameters.shape.set(nuParms)
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    }
  }, [])

  const onSetStateParm = useCallback((state: State<any>) => {
    return (field: keyof typeof state.value) => {
      if (field === 'value') {
        return (value: any) => {
          const nuVals = JSON.parse(JSON.stringify(state.value))
          nuVals.value = value
          state.set(nuVals)
          particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
        }
      } else
        return (value: any) => {
          state[field].set(value)
          particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
        }
    }
  }, [])

  const onAddBehavior = useCallback(
    () => () => {
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
    },
    []
  )

  const onRemoveBehavior = useCallback(
    (behavior: BehaviorJSON) => () => {
      particleSystemState.behaviorParameters.set(
        JSON.parse(JSON.stringify(particleSystem.behaviorParameters.filter((b) => b !== behavior)))
      )
      particleSystemState._refresh.set((particleSystem._refresh + 1) % 1000)
    },
    []
  )

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
            { label: 'Donut', value: 'donut' },
            { label: 'Mesh', value: 'mesh_surface' }
          ]}
        />
      </InputGroup>
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
          onChange={onSetStateParm(particleSystemState.systemParameters.startLife)}
        />
      </InputGroup>
      <InputGroup name="Start Size" label={t('editor:properties.particle-system.start-size')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startSize as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startSize as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startSize)}
        />
      </InputGroup>
      <InputGroup name="Start Speed" label={t('editor:properties.particle-system.start-speed')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startSpeed as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startSpeed as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startSpeed)}
        />
      </InputGroup>
      <InputGroup name="Start Rotation" label={t('editor:properties.particle-system.start-rotation')}>
        <ValueGenerator
          value={particleSystem.systemParameters.startRotation as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.startRotation as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.startRotation)}
        />
      </InputGroup>
      <InputGroup name="Start Color" label={t('editor:properties.particle-system.start-color')}>
        <ColorGenerator
          scope={particleSystemState.systemParameters.startColor}
          value={particleSystem.systemParameters.startColor as ConstantColorJSON}
          onChange={onSetStateParm(particleSystemState.systemParameters.startColor)}
        />
      </InputGroup>
      <InputGroup name="Emission Over Time" label={t('editor:properties.particle-system.emission-over-time')}>
        <ValueGenerator
          value={particleSystem.systemParameters.emissionOverTime as ValueGeneratorJSON}
          scope={particleSystemState.systemParameters.emissionOverTime as any}
          onChange={onSetStateParm(particleSystemState.systemParameters.emissionOverTime)}
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
      <InputGroup name="Texture" label={t('editor:properties.particle-system.texture')}>
        <TexturePreviewInput value={particleSystem.systemParameters.texture} onChange={onSetSystemParm('texture')} />
      </InputGroup>
      <InputGroup name="Mesh" label={t('editor:properties.particle-system.mesh')}>
        <ModelInput
          value={particleSystem.systemParameters.instancingGeometry}
          onChange={onSetSystemParm('instancingGeometry')}
        />
      </InputGroup>
      <InputGroup name="Blending" label={t('editor:properties.particle-system.blending')}>
        <SelectInput
          value={particleSystem.systemParameters.blending as Blending}
          onChange={onSetSystemParm('blending')}
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
      <InputGroup name="World Space" label={t('editor:properties.particle-system.world-space')}>
        <BooleanInput value={particleSystem.systemParameters.worldSpace} onChange={onSetSystemParm('worldSpace')} />
      </InputGroup>
      <h4>Behaviors</h4>
      <Button onClick={onAddBehavior()}>Add Behavior</Button>
      <PaginatedList
        list={particleSystemState.behaviorParameters}
        element={(behaviorState: State<BehaviorJSON>) => {
          return (
            <>
              <BehaviorInput
                scope={behaviorState}
                value={behaviorState.value}
                onChange={onSetStateParm(behaviorState)}
              />
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

import React, { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import ReactJson from 'react-json-view'

import * as EasingFunctions from '@xrengine/engine/src/common/functions/EasingFunctions'
import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { formatMaterialArgs } from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { ErrorComponent } from '@xrengine/engine/src/scene/components/ErrorComponent'
import { ParticleEmitterComponent } from '@xrengine/engine/src/scene/components/ParticleEmitterComponent'
import {
  disposeParticleSystem,
  initializeParticleSystem
} from '@xrengine/engine/src/scene/functions/loaders/ParticleEmitterFunctions'
import { DefaultArguments, ParticleLibrary } from '@xrengine/engine/src/scene/functions/particles/ParticleLibrary'
import { ParticleSystemActions } from '@xrengine/engine/src/scene/systems/ParticleSystem'
import { dispatchAction } from '@xrengine/hyperflux'

import GrainIcon from '@mui/icons-material/Grain'

import { camelPad } from '../../functions/utils'
import { Button } from '../inputs/Button'
import ColorInput from '../inputs/ColorInput'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import ImageInput from '../inputs/ImageInput'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import { TexturePreviewInputGroup } from '../inputs/TexturePreviewInput'
import Vector3Input from '../inputs/Vector3Input'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const ParticleEmitterNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const engineState = useEngineState()
  const entity = props.node.entity
  const particleComponent = getComponent(entity, ParticleEmitterComponent)
  const hasError = engineState.errorEntities[entity].get() || hasComponent(entity, ErrorComponent)

  const _onChangeArgs = updateProperty(ParticleEmitterComponent, 'args')
  const onChangeArgs = (value) => {
    _onChangeArgs(value)
  }
  function getArguments(particleID) {
    if (!Object.keys(DefaultArguments).includes(particleID)) return <></>
    const defaultArguments = DefaultArguments[particleID]
    const defaultValues = Object.fromEntries(Object.entries(defaultArguments).map(([k, v]) => [k, (v as any).default]))
    if (!defaultArguments) return
    const args = formatMaterialArgs(
      particleComponent.args ? { ...defaultValues, ...particleComponent.args } : defaultValues,
      defaultArguments
    )

    function setArgsProp(prop) {
      return (value) => {
        if (!particleComponent.args) particleComponent.args = args
        particleComponent.args[prop] = value
        onChangeArgs(particleComponent.args)
      }
    }

    function setArgsArrayProp(prop, idx) {
      return (value) => {
        if (!particleComponent.args) particleComponent.args = args
        particleComponent.args[prop][idx] = value
        onChangeArgs(particleComponent.args)
      }
    }
    return (
      <Fragment>
        {Object.entries(defaultArguments).map(([k, v]: [string, any]) => {
          const compKey = `${entity}-${k}`
          switch (v.type) {
            case 'float':
              return (
                <InputGroup key={compKey} name={k} label={k}>
                  <CompoundNumericInput value={args[k]} onChange={setArgsProp(k)} min={v.min} max={v.max} />
                </InputGroup>
              )
            case 'color':
              return (
                <InputGroup key={compKey} name={k} label={k}>
                  <ColorInput value={args[k]} onChange={setArgsProp(k)} />
                </InputGroup>
              )
            case 'texture':
              return (
                <TexturePreviewInputGroup key={compKey} name={k} label={k} value={args[k]} onChange={setArgsProp(k)} />
              )
            case 'vec2':
            case 'vec3':
              return (
                <InputGroup key={compKey} name={k} label={k}>
                  {(args[k] as number[]).map((arrayVal, idx) => {
                    return (
                      <NumericInput
                        key={`${compKey}-${idx}`}
                        value={arrayVal}
                        onChange={setArgsArrayProp(k, idx)}
                        min={v.min}
                        max={v.max}
                      />
                    )
                  })}
                </InputGroup>
              )
            case 'select':
              return (
                <InputGroup key={compKey} name={k} label={k}>
                  <SelectInput value={args[k]} options={v.options} onChange={setArgsProp(k)} />
                </InputGroup>
              )
          }
        })}
      </Fragment>
    )
  }

  const particleIDs = Object.keys(ParticleLibrary).map((k) => {
    return { label: k, value: k }
  })

  return (
    <NodeEditor {...props} description={t('editor:properties.partileEmitter.description')}>
      <InputGroup name="Generation Mode" label="Generation Mode">
        <SelectInput
          value={particleComponent.mode}
          options={[
            { label: 'Particle System Library', value: 'LIBRARY' },
            { label: 'From JSON', value: 'JSON' }
          ]}
          onChange={updateProperty(ParticleEmitterComponent, 'mode')}
        />
      </InputGroup>
      <Button onClick={() => dispatchAction(ParticleSystemActions.createParticleSystem({ entity }))}>Refresh</Button>
      {particleComponent.mode === 'JSON' && (
        <InputGroup name="JSON" label="JSON">
          <StringInput
            value={
              typeof particleComponent.src === 'string' ? particleComponent.src : JSON.stringify(particleComponent.src)
            }
            onChange={updateProperty(ParticleEmitterComponent, 'src')}
          />
        </InputGroup>
      )}
      {particleComponent.mode === 'LIBRARY' && (
        <Fragment>
          <InputGroup name="Library Entry" label="Library Entry">
            <SelectInput
              value={particleComponent.src}
              onChange={updateProperty(ParticleEmitterComponent, 'src')}
              options={particleIDs}
              creatable={false}
              isSearchable={true}
            />
          </InputGroup>
          {getArguments(particleComponent.src)}
        </Fragment>
      )}
    </NodeEditor>
  )
}

ParticleEmitterNodeEditor.iconComponent = GrainIcon

export default ParticleEmitterNodeEditor

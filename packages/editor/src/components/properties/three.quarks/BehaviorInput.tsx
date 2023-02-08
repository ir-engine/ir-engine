import React, { useCallback } from 'react'
import { Vector3 } from 'three'

import {
  ApplyForceBehaviorJSON,
  BehaviorJSON,
  NoiseBehaviorJSON
} from '@xrengine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@xrengine/hyperflux'

import InputGroup from '../../inputs/InputGroup'
import NumericInputGroup from '../../inputs/NumericInputGroup'
import SelectInput from '../../inputs/SelectInput'
import Vector3Input from '../../inputs/Vector3Input'
import ValueGenerator from './ValueGenerator'

export default function BehaviorInput({
  scope,
  value,
  onChange
}: {
  scope: State<BehaviorJSON>
  value: BehaviorJSON
  onChange: (key: string) => (value: any) => void
}) {
  const onChangeProp = useCallback(
    (scope: State<any>) => (key: string) => {
      const topOnChange = onChange(key)
      return (keyVal: any) => {
        const nuVal = { ...JSON.parse(JSON.stringify(scope.value)), [key]: keyVal }
        topOnChange(nuVal)
      }
    },
    []
  )

  return (
    <>
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Apply Force', value: 'ApplyForce' },
            { label: 'Noise', value: 'Noise' },
            { label: 'Turbulence Field', value: 'TurbulenceField' }
          ]}
          onChange={(type) => {}}
        />
      </InputGroup>
      {(() => {
        switch (value.type) {
          case 'ApplyForce':
            const forceScope = scope as State<ApplyForceBehaviorJSON>
            return (
              <>
                <InputGroup name="force" label="Force">
                  <Vector3Input value={new Vector3(...value.direction)} onChange={onChange('direction')} />
                </InputGroup>
                <InputGroup name="magnitude" label="Magnitude">
                  <ValueGenerator
                    scope={forceScope.magnitude}
                    value={value.magnitude}
                    onChange={onChangeProp(forceScope.magnitude)}
                  />
                </InputGroup>
              </>
            )
          case 'Noise':
            const noiseScope = scope as State<NoiseBehaviorJSON>
            return (
              <>
                <InputGroup name="frequency" label="Frequency">
                  <Vector3Input value={new Vector3(...value.frequency)} onChange={onChange('frequency')} />
                </InputGroup>
                <InputGroup name="power" label="Power">
                  <Vector3Input value={new Vector3(...value.power)} onChange={onChange('power')} />
                </InputGroup>
              </>
            )
          case 'TurbulenceField':
            const turbulenceScope = scope as State<NoiseBehaviorJSON>
            return (
              <>
                <InputGroup name="scale" label="Scale">
                  <Vector3Input value={new Vector3(...value.scale)} onChange={onChange('scale')} />
                </InputGroup>
                <NumericInputGroup
                  name="octaves"
                  label="Octaves"
                  value={value.octaves}
                  onChange={onChange('octaves')}
                />
                <InputGroup name="velocityMultiplier" label="Velocity Multiplier">
                  <Vector3Input
                    value={new Vector3(...value.velocityMultiplier)}
                    onChange={onChange('velocityMultiplier')}
                  />
                </InputGroup>
                <InputGroup name="timeScale" label="Time Scale">
                  <Vector3Input value={new Vector3(...value.timeScale)} onChange={onChange('timeScale')} />
                </InputGroup>
              </>
            )
        }
      })()}
    </>
  )
}

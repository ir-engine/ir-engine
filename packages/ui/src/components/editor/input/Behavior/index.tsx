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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  ApplyForceBehaviorJSON,
  ApplySequencesJSON,
  BehaviorJSON,
  BehaviorJSONDefaults,
  ChangeEmitDirectionBehaviorJSON,
  ColorGeneratorJSON,
  ColorOverLifeBehaviorJSON,
  EmitSubParticleSystemBehaviorJSON,
  FrameOverLifeBehaviorJSON,
  GravityForceBehaviorJSON,
  NoiseBehaviorJSON,
  OrbitOverLifeBehaviorJSON,
  Rotation3DOverLifeBehaviorJSON,
  RotationGeneratorJSON,
  RotationOverLifeBehaviorJSON,
  SizeOverLifeBehaviorJSON,
  SpeedOverLifeBehaviorJSON,
  TextureSequencerJSON,
  TurbulenceFieldBehaviorJSON,
  ValueGeneratorJSON,
  WidthOverLengthBehaviorJSON
} from '@ir-engine/engine/src/scene/types/ParticleSystemTypes'
import { State } from '@ir-engine/hyperflux'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { getTextureAsync } from '@ir-engine/spatial/src/resources/resourceLoaderHooks'
import { Checkbox } from '@ir-engine/ui'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Texture, Vector2, Vector3 } from 'three'
import ColorGenerator from '../Generator/Color'
import RotationGenerator from '../Generator/Rotation'
import ValueGenerator from '../Generator/Value'
import InputGroup from '../Group'
import NumericInput from '../Numeric'
import SelectInput from '../Select'
import Vector3Input from '../Vector3'

type BehaviorInputProps = Readonly<{
  path: string
  scope: State<BehaviorJSON>
  value: BehaviorJSON
  onChange: (path: string) => (value: any) => void
}>

export default function BehaviorInput({ path, scope, value, onChange }: BehaviorInputProps) {
  const { t } = useTranslation()

  const onChangeBehaviorType = useCallback(() => {
    const onChangeType = onChange(path + '.type')
    return (type: typeof value.type) => {
      const nuVals = JSON.parse(JSON.stringify(BehaviorJSONDefaults[type]))
      scope.set(nuVals)
      onChangeType(type)
    }
  }, [])

  const onChangeVec3 = useCallback((path: string) => {
    const thisOnChange = onChange(path)
    return (vec3: Vector3) => {
      thisOnChange([...vec3.toArray()])
    }
  }, [])

  const applyForceInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const forceScope = scope as State<ApplyForceBehaviorJSON>
      const value = forceScope.value
      return (
        <>
          <InputGroup name="force" label={t('editor:properties.particle-system.behavior.force')}>
            <Vector3Input value={new Vector3(...value.direction)} onChange={onChangeVec3(path + '.direction')} />
          </InputGroup>
          <InputGroup name="magnitude" label={t('editor:properties.particle-system.behavior.magnitude')}>
            <ValueGenerator
              path={path + '.magnitude'}
              scope={forceScope.magnitude}
              value={value.magnitude as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const noiseInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const noiseScope = scope as State<NoiseBehaviorJSON>
      const value = noiseScope.value
      return (
        <>
          <InputGroup name="frequency" label={t('editor:properties.particle-system.behavior.frequency')}>
            <Vector3Input value={new Vector3(...value.frequency)} onChange={onChangeVec3(path + '.frequency')} />
          </InputGroup>
          <InputGroup name="power" label={t('editor:properties.particle-system.behavior.Power')}>
            <Vector3Input value={new Vector3(...value.power)} onChange={onChangeVec3(path + '.power')} />
          </InputGroup>
          <InputGroup name="positionAmount" label={t('editor:properties.particle-system.behavior.positionAmount')}>
            <NumericInput value={value.positionAmount} onChange={onChange(path + '.positionAmount')} />
          </InputGroup>
          <InputGroup name="rotationAmount" label={t('editor:properties.particle-system.behavior.rotationAmount')}>
            <NumericInput value={value.rotationAmount} onChange={onChange(path + '.rotationAmount')} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const turbulenceFieldInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const turbulenceScope = scope as State<TurbulenceFieldBehaviorJSON>
      const value = turbulenceScope.value
      return (
        <>
          <InputGroup name="scale" label={t('editor:properties.particle-system.behavior.scale')}>
            <Vector3Input value={new Vector3(...value.scale)} onChange={onChangeVec3(path + '.scale')} />
          </InputGroup>
          <InputGroup name="octaves" label={t('editor:properties.particle-system.behavior.octaves')}>
            <NumericInput value={value.octaves} onChange={onChange(path + '.octaves')} />
          </InputGroup>
          <InputGroup
            name="velocityMultiplier"
            label={t('editor:properties.particle-system.behavior.velocityMultiplier')}
          >
            <Vector3Input
              value={new Vector3(...value.velocityMultiplier)}
              onChange={onChangeVec3(path + '.velocityMultiplier')}
            />
          </InputGroup>
          <InputGroup name="timeScale" label={t('editor:properties.particle-system.behavior.timeScale')}>
            <Vector3Input value={new Vector3(...value.timeScale)} onChange={onChangeVec3(path + '.timeScale')} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const gravityForceInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const gravityScope = scope as State<GravityForceBehaviorJSON>
      const value = gravityScope.value
      return (
        <>
          <InputGroup name="center" label={t('editor:properties.particle-system.behavior.center')}>
            <Vector3Input value={new Vector3(...value.center)} onChange={onChangeVec3(path + '.center')} />
          </InputGroup>
          <InputGroup name="magnitude" label={t('editor:properties.particle-system.behavior.magnitude')}>
            <NumericInput value={value.magnitude} onChange={onChange(path + '.magnitude')} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const colorOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const colorScope = scope as State<ColorOverLifeBehaviorJSON>
      const value = colorScope.value
      return (
        <>
          <InputGroup name="color" label={t('editor:properties.particle-system.behavior.color')}>
            <ColorGenerator
              path={path + '.color'}
              scope={colorScope.color}
              value={value.color as ColorGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const rotationOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const rotationScope = scope as State<RotationOverLifeBehaviorJSON>
      const value = rotationScope.value
      return (
        <>
          <InputGroup name="angularVelocity" label={t('editor:properties.particle-system.behavior.angularVelocity')}>
            <ValueGenerator
              path={path + '.angularVelocity'}
              scope={rotationScope.angularVelocity}
              value={value.angularVelocity as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const rotation3DOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const rotation3DScope = scope as State<Rotation3DOverLifeBehaviorJSON>
      const rotation3D = rotation3DScope.value
      return (
        <>
          <InputGroup name="angularVelocity" label={t('editor:properties.particle-system.behavior.angularVelocity')}>
            <RotationGenerator
              path={path + '.angularVelocity'}
              scope={rotation3DScope.angularVelocity}
              value={rotation3D.angularVelocity as RotationGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
          <InputGroup name="dynamic" label={t('editor:properties.particle-system.behavior.dynamic')}>
            <Checkbox checked={rotation3D.dynamic} onChange={onChange(path + '.dynamic')} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const sizeOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const sizeScope = scope as State<SizeOverLifeBehaviorJSON>
      const value = sizeScope.value
      return (
        <>
          <InputGroup name="size" label={t('editor:properties.particle-system.behavior.size')}>
            <ValueGenerator
              path={path + '.size'}
              scope={sizeScope.size}
              value={value.size as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const speedOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const speedScope = scope as State<SpeedOverLifeBehaviorJSON>
      const value = speedScope.value
      return (
        <>
          <InputGroup name="speed" label={t('editor:properties.particle-system.behavior.speed')}>
            <ValueGenerator
              path={path + '.speed'}
              scope={speedScope.speed}
              value={value.speed as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const frameOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const frameScope = scope as State<FrameOverLifeBehaviorJSON>
      const value = frameScope.value
      return (
        <>
          <InputGroup name="frame" label={t('editor:properties.particle-system.behavior.frame')}>
            <ValueGenerator
              path={path + '.frame'}
              scope={frameScope.frame}
              value={value.frame as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const orbitOverLifeInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const orbitScope = scope as State<OrbitOverLifeBehaviorJSON>
      const value = orbitScope.value
      return (
        <>
          <InputGroup name="orbit" label={t('editor:properties.particle-system.behavior.orbit')}>
            <ValueGenerator
              path={path + '.orbitSpeed'}
              scope={orbitScope.orbitSpeed}
              value={value.orbitSpeed as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
          <InputGroup name="axis" label={t('editor:properties.particle-system.behavior.axis')}>
            <Vector3Input value={new Vector3(...value.axis)} onChange={onChangeVec3(path + '.axis')} />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const widthOverLength = useCallback(
    (scope: State<BehaviorJSON>) => {
      const widthScope = scope as State<WidthOverLengthBehaviorJSON>
      const value = widthScope.value
      return (
        <>
          <InputGroup name="width" label={t('editor:properties.particle-system.behavior.width')}>
            <ValueGenerator
              path={path + '.width'}
              scope={widthScope.width}
              value={value.width as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const changeEmitDirectionInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const changeEmitDirectionScope = scope as State<ChangeEmitDirectionBehaviorJSON>
      const value = changeEmitDirectionScope.value
      return (
        <>
          <InputGroup name="angle" label={t('editor:properties.particle-system.behavior.angle')}>
            <ValueGenerator
              path={path + '.angle'}
              scope={changeEmitDirectionScope.angle}
              value={value.angle as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const emitSubParticleSystemInput = useCallback(
    (scope: State<BehaviorJSON>) => {
      const emitSubParticleSystemScope = scope as State<EmitSubParticleSystemBehaviorJSON>
      const value = emitSubParticleSystemScope.value
      return (
        <>
          <InputGroup
            name="subParticleSystem"
            label={t('editor:properties.particle-system.behavior.subParticleSystem')}
          >
            <></>
            {/*  @todo */}
            {/* <SceneObjectInput
              value={value.subParticleSystem}
              onChange={onChange(emitSubParticleSystemScope.subParticleSystem)}
            /> */}
          </InputGroup>
        </>
      )
    },
    [scope]
  )

  const onChangeSequenceTexture = useCallback(
    (scope: State<TextureSequencerJSON>) => {
      const thisOnChange = onChange(path + '.src')
      return (src: string) => {
        getTextureAsync(src).then(([texture]) => {
          if (!texture) return
          createReadableTexture(texture, { canvas: true, flipY: true }).then((readableTexture: Texture) => {
            const canvas = readableTexture.image as HTMLCanvasElement
            const ctx = canvas.getContext('2d')!
            const width = canvas.width
            const height = canvas.height
            const imageData = ctx.getImageData(0, 0, width, height)
            const locations: Vector2[] = []
            const threshold = scope.threshold.value
            for (let i = 0; i < imageData.height; i++) {
              for (let j = 0; j < imageData.width; j++) {
                imageData.data[(i * imageData.width + j) * 4 + 3] > threshold &&
                  locations.push(new Vector2(j, imageData.height - i))
              }
            }
            canvas.remove()
            scope.locations.set(locations)
          })
        })
        thisOnChange(src)
      }
    },
    [scope]
  )

  const onAddTextureSequencer = useCallback(() => {
    const sequencersScope = scope as State<ApplySequencesJSON>
    const sequencers = sequencersScope.value
    const thisOnChange = onChange(path + '.sequencers')
    return () => {
      const nuSequencer = {
        range: { a: 0, b: 1 },
        sequencer: {
          scaleX: 1,
          scaleY: 1,
          position: [0, 0, 0],
          src: '',
          locations: [],
          threshold: 0.5
        }
      }
      const nuSequencers = [...JSON.parse(JSON.stringify(sequencers.sequencers)), nuSequencer]
      thisOnChange(nuSequencers)
    }
  }, [scope])

  // const applySequencesInput = useCallback(
  //   (scope: State<BehaviorJSON>) => {
  //     const applySequencesScope = scope as State<ApplySequencesJSON>
  //     const value = applySequencesScope.value
  //     return (
  //       <>
  //         <NumericInputGroup
  //           name="Delay"
  //           label="Delay"
  //           value={value.delay}
  //           onChange={onChange(applySequencesScope.delay)}
  //         />
  //         <Button onClick={onAddTextureSequencer()}>Add Texture Sequencer</Button>
  //         <PaginatedList
  //           list={applySequencesScope.sequencers}
  //           element={(sequencerScope: State<{ range: IntervalValueJSON; sequencer: SequencerJSON }>) => {
  //             const sequencer = sequencerScope.value
  //             return (
  //               <>
  //                 <NumericInputGroup
  //                   name="Start"
  //                   label="Start"
  //                   value={sequencer.range.a}
  //                   onChange={onChange(sequencerScope.range.a)}
  //                 />
  //                 <NumericInputGroup
  //                   name="End"
  //                   label="End"
  //                   value={sequencer.range.b}
  //                   onChange={onChange(sequencerScope.range.b)}
  //                 />
  //                 <NumericInputGroup
  //                   name="Scale X"
  //                   label="Scale X"
  //                   value={sequencer.sequencer.scaleX}
  //                   onChange={onChange(sequencerScope.sequencer.scaleX)}
  //                 />
  //                 <NumericInputGroup
  //                   name="Scale Y"
  //                   label="Scale Y"
  //                   value={sequencer.sequencer.scaleY}
  //                   onChange={onChange(sequencerScope.sequencer.scaleY)}
  //                 />
  //                 <InputGroup name="Position" label="Position">
  //                   <Vector3Input
  //                     value={sequencer.sequencer.position}
  //                     onChange={onChangeVec3(sequencerScope.sequencer.position)}
  //                   />
  //                 </InputGroup>
  //                 <InputGroup name="Texture" label="Texture">
  //                   <TexturePreviewInput
  //                     value={sequencer.sequencer.src}
  //                     onRelease={onChangeSequenceTexture(sequencerScope.sequencer)}
  //                   />
  //                 </InputGroup>
  //               </>
  //             )
  //           }}
  //         />
  //       </>
  //     )
  //   },
  //   [scope]
  // )

  const inputs = {
    ApplyForce: applyForceInput,
    Noise: noiseInput,
    TurbulenceField: turbulenceFieldInput,
    GravityForce: gravityForceInput,
    ColorOverLife: colorOverLifeInput,
    RotationOverLife: rotationOverLifeInput,
    SizeOverLife: sizeOverLifeInput,
    SpeedOverLife: speedOverLifeInput,
    FrameOverLife: frameOverLifeInput,
    OrbitOverLife: orbitOverLifeInput,
    Rotation3DOverLife: rotation3DOverLifeInput,
    WidthOverLength: widthOverLength,
    ChangeEmitDirection: changeEmitDirectionInput,
    EmitSubParticleSystem: emitSubParticleSystemInput
  }

  return (
    <>
      <InputGroup name="type" label={t('editor:properties.particle-system.behavior.type')}>
        <SelectInput
          value={value.type}
          options={[
            { label: t('editor:properties.particle-system.behavior.applyForce'), value: 'ApplyForce' },
            { label: t('editor:properties.particle-system.behavior.noise'), value: 'Noise' },
            { label: t('editor:properties.particle-system.behavior.turbulenceField'), value: 'TurbulenceField' },
            { label: t('editor:properties.particle-system.behavior.gravity'), value: 'GravityForce' },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Color' }),
              value: 'ColorOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Rotation' }),
              value: 'RotationOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Rotation3D' }),
              value: 'Rotation3DOverLife'
            },
            { label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Size' }), value: 'SizeOverLife' },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Speed' }),
              value: 'SpeedOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Frame' }),
              value: 'FrameOverLife'
            },
            {
              label: t('editor:properties.particle-system.behavior.dynamic', { type: 'Color' }),
              value: 'OrbitOverLife'
            },
            { label: t('editor:properties.particle-system.behavior.widthOverLength'), value: 'WidthOverLength' },
            {
              label: t('editor:properties.particle-system.behavior.changeEmitDirection'),
              value: 'ChangeEmitDirection'
            },
            {
              label: t('editor:properties.particle-system.behavior.emitSubParticleSystem'),
              value: 'EmitSubParticleSystem'
            }
          ]}
          onChange={onChangeBehaviorType()}
        />
      </InputGroup>
      {inputs[value.type](scope)}
    </>
  )
}

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
import { Texture, Vector2, Vector3 } from 'three'

import { getTextureAsync } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
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
} from '@ir-engine/engine/src/scene/components/ParticleSystemComponent'
import { State } from '@ir-engine/hyperflux'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { Checkbox } from '@ir-engine/ui'
import ColorGenerator from '../Generator/Color'
import RotationGenerator from '../Generator/Rotation'
import ValueGenerator from '../Generator/Value'
import InputGroup from '../Group'
import NumericInput from '../Numeric'
import SelectInput from '../Select'
import Vector3Input from '../Vector3'

export default function BehaviorInput({
  scope,
  value,
  onChange
}: {
  scope: State<BehaviorJSON>
  value: BehaviorJSON
  onChange: (scope: State<any>) => (value: any) => void
}) {
  const onChangeBehaviorType = useCallback(() => {
    const onChangeType = onChange(scope.type)
    return (type: typeof value.type) => {
      const nuVals = JSON.parse(JSON.stringify(BehaviorJSONDefaults[type]))
      scope.set(nuVals)
      onChangeType(type)
    }
  }, [])

  const onChangeVec3 = useCallback((scope: State<any>) => {
    const thisOnChange = onChange(scope)
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
          <InputGroup name="force" label="Force">
            <Vector3Input value={new Vector3(...value.direction)} onChange={onChangeVec3(forceScope.direction)} />
          </InputGroup>
          <InputGroup name="magnitude" label="Magnitude">
            <ValueGenerator
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
          <InputGroup name="frequency" label="Frequency">
            <Vector3Input value={new Vector3(...value.frequency)} onChange={onChangeVec3(noiseScope.frequency)} />
          </InputGroup>
          <InputGroup name="power" label="Power">
            <Vector3Input value={new Vector3(...value.power)} onChange={onChange(noiseScope.power)} />
          </InputGroup>
          <InputGroup name="positionAmount" label="positionAmount">
            <NumericInput value={value.positionAmount} onChange={onChange(noiseScope.positionAmount)} />
          </InputGroup>
          <InputGroup name="rotationAmount" label="rotation Amount">
            <NumericInput value={value.rotationAmount} onChange={onChange(noiseScope.rotationAmount)} />
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
          <InputGroup name="scale" label="Scale">
            <Vector3Input value={new Vector3(...value.scale)} onChange={onChangeVec3(turbulenceScope.scale)} />
          </InputGroup>
          <InputGroup name="octaves" label="Octaves">
            <NumericInput value={value.octaves} onChange={onChange(turbulenceScope.octaves)} />
          </InputGroup>
          <InputGroup name="velocityMultiplier" label="Velocity Multiplier">
            <Vector3Input
              value={new Vector3(...value.velocityMultiplier)}
              onChange={onChangeVec3(turbulenceScope.velocityMultiplier)}
            />
          </InputGroup>
          <InputGroup name="timeScale" label="Time Scale">
            <Vector3Input value={new Vector3(...value.timeScale)} onChange={onChangeVec3(turbulenceScope.timeScale)} />
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
          <InputGroup name="center" label="Center">
            <Vector3Input value={new Vector3(...value.center)} onChange={onChangeVec3(gravityScope.center)} />
          </InputGroup>
          <InputGroup name="magnitude" label="Magnitude">
            <NumericInput value={value.magnitude} onChange={onChange(gravityScope.magnitude)} />
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
          <InputGroup name="color" label="Color">
            <ColorGenerator scope={colorScope.color} value={value.color as ColorGeneratorJSON} onChange={onChange} />
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
          <InputGroup name="angularVelocity" label="Angular Velocity">
            <ValueGenerator
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
          <InputGroup name="angularVelocity" label="Angular Velocity">
            <RotationGenerator
              scope={rotation3DScope.angularVelocity}
              value={rotation3D.angularVelocity as RotationGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
          <InputGroup name="dynamic" label="Dynamic">
            <Checkbox checked={rotation3D.dynamic} onChange={onChange(rotation3DScope.dynamic)} />
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
          <InputGroup name="size" label="Size">
            <ValueGenerator scope={sizeScope.size} value={value.size as ValueGeneratorJSON} onChange={onChange} />
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
          <InputGroup name="speed" label="Speed">
            <ValueGenerator scope={speedScope.speed} value={value.speed as ValueGeneratorJSON} onChange={onChange} />
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
          <InputGroup name="frame" label="Frame">
            <ValueGenerator scope={frameScope.frame} value={value.frame as ValueGeneratorJSON} onChange={onChange} />
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
          <InputGroup name="orbit" label="Orbit">
            <ValueGenerator
              scope={orbitScope.orbitSpeed}
              value={value.orbitSpeed as ValueGeneratorJSON}
              onChange={onChange}
            />
          </InputGroup>
          <InputGroup name="axis" label="Axis">
            <Vector3Input value={new Vector3(...value.axis)} onChange={onChangeVec3(orbitScope.axis)} />
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
          <InputGroup name="width" label="Width">
            <ValueGenerator scope={widthScope.width} value={value.width as ValueGeneratorJSON} onChange={onChange} />
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
          <InputGroup name="angle" label="Angle">
            <ValueGenerator
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
          <InputGroup name="subParticleSystem" label="Sub Particle System">
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
      const thisOnChange = onChange(scope.src)
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
    const thisOnChange = onChange(sequencersScope.sequencers)
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
      <InputGroup name="type" label="Type">
        <SelectInput
          value={value.type}
          options={[
            { label: 'Apply Force', value: 'ApplyForce' },
            { label: 'Noise', value: 'Noise' },
            { label: 'Turbulence Field', value: 'TurbulenceField' },
            { label: 'Gravity', value: 'GravityForce' },
            { label: 'Color Over Lifetime', value: 'ColorOverLife' },
            { label: 'Rotation Over Lifetime', value: 'RotationOverLife' },
            { label: 'Rotation3D Over Lifetime', value: 'Rotation3DOverLife' },
            { label: 'Size Over Lifetime', value: 'SizeOverLife' },
            { label: 'Speed Over Lifetime', value: 'SpeedOverLife' },
            { label: 'Frame Over Lifetime', value: 'FrameOverLife' },
            { label: 'Orbit Over Lifetime', value: 'OrbitOverLife' },
            { label: 'Width Over Length', value: 'WidthOverLength' },
            { label: 'Change Emit Direction', value: 'ChangeEmitDirection' },
            { label: 'Emit Sub Particle System', value: 'EmitSubParticleSystem' }
          ]}
          onChange={onChangeBehaviorType()}
        />
      </InputGroup>
      {inputs[value.type](scope)}
    </>
  )
}

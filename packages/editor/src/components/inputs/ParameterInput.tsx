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

import React, { Fragment } from 'react'

import { generateDefaults } from '@etherealengine/engine/src/renderer/materials/constants/DefaultArgs'

import BooleanInput from './BooleanInput'
import ColorInput from './ColorInput'
import InputGroup from './InputGroup'
import NumericInput from './NumericInput'
import SelectInput from './SelectInput'
import StringInput from './StringInput'
import TexturePreviewInput from './TexturePreviewInput'

export default function ParameterInput({
  entity,
  values,
  onChange,
  defaults,
  thumbnails
}: {
  entity: string
  values: object
  defaults?: object
  thumbnails?: Record<string, string>
  onChange: (k: string) => (v) => void
}) {
  function setArgsProp(k) {
    const thisOnChange = onChange(k)
    return (value) => {
      //values[k] = value
      thisOnChange(value)
    }
  }

  function setArgsArrayProp(k, idx) {
    const thisOnChange = onChange(k)
    return (value) => {
      const nuVals = values[k].map((oldVal, oldIdx) => (idx === oldIdx ? value : oldVal))
      thisOnChange(nuVals)
    }
  }

  function setArgsObjectProp(k) {
    const thisOnChange = onChange(k)
    const oldVal = values[k]
    return (field) => {
      return (value) => {
        const nuVal = Object.fromEntries([
          ...Object.entries(oldVal).filter(([_field, _value]) => _field !== field),
          [field, value]
        ])
        thisOnChange(nuVal)
      }
    }
  }

  const _defaults = defaults ?? generateDefaults(values)

  return (
    <Fragment>
      {Object.entries(_defaults).map(([k, parms]: [string, any]) => {
        const compKey = `${entity}-${k}`
        return (
          <InputGroup key={compKey} name={k} label={k}>
            {(() => {
              switch (parms.type) {
                case 'boolean':
                  return <BooleanInput value={values[k]} onChange={setArgsProp(k)} />
                case 'float':
                  return <NumericInput value={values[k]} onChange={setArgsProp(k)} />
                case 'string':
                  return <StringInput value={values[k]} onChange={setArgsProp(k)} />
                case 'color':
                  return <ColorInput value={values[k]} onChange={setArgsProp(k)} />
                case 'texture':
                  if (thumbnails?.[k])
                    return <TexturePreviewInput preview={thumbnails[k]} value={values[k]} onChange={setArgsProp(k)} />
                  else return <TexturePreviewInput value={values[k]} onChange={setArgsProp(k)} />
                case 'vec2':
                case 'vec3':
                  return (
                    <Fragment>
                      {typeof values[k]?.map === 'function' &&
                        (values[k] as number[]).map((arrayVal, idx) => {
                          return (
                            <NumericInput
                              key={`${compKey}-${idx}`}
                              value={arrayVal}
                              onChange={setArgsArrayProp(k, idx)}
                            />
                          )
                        })}
                    </Fragment>
                  )
                case 'select':
                  return <SelectInput value={values[k]} options={parms.options} onChange={setArgsProp(k)} />
                case 'object':
                  return (
                    <ParameterInput
                      entity={compKey}
                      values={values[k]}
                      onChange={setArgsObjectProp(k)}
                      defaults={parms.default}
                    />
                  )
                default:
                  return <></>
              }
            })()}
          </InputGroup>
        )
      })}
    </Fragment>
  )
}

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

import React from 'react'

import { camelCaseToSpacedString } from '@ir-engine/common/src/utils/camelCaseToSpacedString'
import capitalizeFirstLetter from '@ir-engine/common/src/utils/capitalizeFirstLetter'
import { generateDefaults } from '@ir-engine/spatial/src/renderer/materials/constants/DefaultArgs'
import { Checkbox } from '@ir-engine/ui'
import ColorInput from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import StringInput from '../../input/String'
import TexturePreviewInput from '../../input/Texture'

export default function ParameterInput({
  entity,
  values,
  onChange,
  defaults,
  thumbnails,
  ...rest
}: {
  entity: string
  values: object
  defaults?: object
  thumbnails?: Record<string, string>
  onChange: (k: string) => (v) => void
  onModify?: () => void
}) {
  const { onModify } = rest
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
  /*
0: "boolean"
1: "string"
2: "integer"
3: "float"
4: "vec2"
5: "vec3"
6: "vec4"
7: "color"
8: "euler"
9: "quat"
10: "mat3"
11: "mat4"
12: "object"
13: "list"
14: "entity"*/
  return (
    <>
      {Object.entries(_defaults).map(([k, parms]: [string, any]) => {
        const compKey = `${entity}-${k}`
        return (
          <InputGroup key={compKey} name={k} label={camelCaseToSpacedString(capitalizeFirstLetter(k))}>
            {(() => {
              if (!(k in values)) {
                console.warn(`Key "${k}" not found in ParameterInput values object`)
                return null
              }

              switch (parms.type) {
                case 'boolean':
                  return <Checkbox checked={values[k]} onChange={setArgsProp(k)} />
                case 'entity':
                case 'integer':
                case 'float':
                  return <NumericInput value={values[k]} onChange={setArgsProp(k)} />
                case 'string':
                  return <StringInput value={values[k]} onChange={setArgsProp(k)} />
                case 'color':
                  return <ColorInput value={values[k]} onChange={setArgsProp(k)} />
                case 'texture':
                  return (
                    <TexturePreviewInput
                      preview={thumbnails?.[k]}
                      value={values[k]}
                      onRelease={setArgsProp(k)}
                      onModify={onModify}
                    />
                  )
                case 'vec2':
                case 'vec3':
                case 'vec4':
                  return (
                    typeof values[k]?.map === 'function' &&
                    (values[k] as number[]).map((arrayVal, idx) => (
                      <NumericInput key={`${compKey}-${idx}`} value={arrayVal} onChange={setArgsArrayProp(k, idx)} />
                    ))
                  )
                case 'select':
                  return (
                    <SelectInput
                      value={values[k]}
                      options={JSON.parse(JSON.stringify(parms.options))}
                      onChange={setArgsProp(k)}
                    />
                  )
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
    </>
  )
}

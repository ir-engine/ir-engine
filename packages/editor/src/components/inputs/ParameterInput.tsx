import React, { Fragment } from 'react'

import { generateDefaults } from '@etherealengine/engine/src/renderer/materials/constants/DefaultArgs'

import BooleanInput from './BooleanInput'
import ColorInput from './ColorInput'
import InputGroup from './InputGroup'
import NumericInput from './NumericInput'
import SelectInput from './SelectInput'
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

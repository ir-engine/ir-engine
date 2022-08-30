import React, { Fragment } from 'react'

import ColorInput from './ColorInput'
import InputGroup from './InputGroup'
import NumericInput from './NumericInput'
import SelectInput from './SelectInput'
import TexturePreviewInput from './TexturePreviewInput'

export default function ParameterInput({ entity, values, defaults, onChange }) {
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
      values[k][idx] = value
      thisOnChange(values[k])
    }
  }
  return (
    <Fragment>
      {Object.entries(defaults).map(([k, parms]: [string, any]) => {
        const compKey = `${entity}-${k}`
        return (
          <InputGroup key={compKey} name={k} label={k}>
            {(() => {
              switch (parms.type) {
                case 'float':
                  return <NumericInput value={values[k]} onChange={setArgsProp(k)} />
                case 'color':
                  return <ColorInput value={values[k]} onChange={setArgsProp(k)} />
                case 'texture':
                  if (parms.preview)
                    return <TexturePreviewInput preview={parms.preview} value={values[k]} onChange={setArgsProp(k)} />
                  else return <TexturePreviewInput value={values[k]} onChange={setArgsProp(k)} />
                case 'vec2':
                case 'vec3':
                  return (
                    <Fragment>
                      {(values[k] as number[]).map((arrayVal, idx) => {
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

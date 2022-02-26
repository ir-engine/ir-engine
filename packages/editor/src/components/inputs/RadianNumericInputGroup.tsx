import React from 'react'
import { MathUtils as _Math } from 'three'

import NumericInputGroup, { NumericInputGroupProp } from './NumericInputGroup'

const radToDeg = _Math.radToDeg
const degToRad = _Math.degToRad

/**
 *
 * @author Robert Long
 * @param {any} convertTo
 * @param {any} convertFrom
 * @param {any} rest
 * @returns
 */
export function RadianNumericInputGroup({ convertTo, convertFrom, ...rest }: NumericInputGroupProp) {
  return <NumericInputGroup {...rest} convertFrom={radToDeg} convertTo={degToRad} />
}

RadianNumericInputGroup.defaultProps = {
  min: 0,
  max: 360,
  smallStep: 1,
  mediumStep: 5,
  largeStep: 15,
  unit: '°'
}

export default RadianNumericInputGroup

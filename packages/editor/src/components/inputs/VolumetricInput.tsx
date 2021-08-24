// @ts-nocheck
import React from 'react'
import PropTypes from 'prop-types'
import { ControlledStringInput } from './StringInput'
import { useDrop } from 'react-dnd'
import { ItemTypes } from '../dnd'
import useUpload from '../assets/useUpload'
import { VideoFileTypes } from '@xrengine/engine/src/assets/constants/fileTypes'

const uploadOptions = {
  multiple: false,
  accepts: VideoFileTypes
}

/**
 *
 * @author Robert Long
 * @param {function} onChange
 * @param {any} rest
 * @returns
 */
export function VolumetricInput({ onChange, ...rest }) {
  return <ControlledStringInput onChange={onChange} {...rest} />
}

VolumetricInput.propTypes = {
  onChange: PropTypes.func.isRequired
}
export default VolumetricInput

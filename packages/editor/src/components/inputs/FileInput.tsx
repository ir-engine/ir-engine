import React, { useState } from 'react'

import Hidden from '../layout/Hidden'
import { Button } from './Button'

let nextId = 0

/**
 * Properties for created FileInput class.
 *
 * @author Robert Long
 * @type {Object}
 * @property [String]
 * @property [function]
 *
 */
type FileInputProps = {
  label: string
  onChange: (...args: any[]) => any
}

/**
 * State created for for FileInput class.
 *
 * @author Robert Long
 * @type {Object}
 * @property {string} id
 */
type FileInputState = {
  id: string
}

/**
 * FileInput used to render the view of component for File input.
 *
 * @author Robert Long
 * @type {Object}
 */
export const FileInput = (props: FileInputProps) => {
  const [id, setId] = useState(`file-input-${nextId++}`)

  const onChange = (e) => {
    props.onChange(e.target.files, e)
  }

  //creating view for FileInput
  const { label, ...rest } = props

  return (
    <div>
      <Button as="label" htmlFor={id}>
        {label}
      </Button>
      <Hidden as="input" {...rest} id={id} type="file" onChange={onChange} />
    </div>
  )
}

export default FileInput

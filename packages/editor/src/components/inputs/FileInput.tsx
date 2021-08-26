import React, { Component } from 'react'
import { Button } from './Button'
import Hidden from '../layout/Hidden'
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
export class FileInput extends Component<FileInputProps, FileInputState> {
  /**
   * constructor used to initilize FileInput component.
   *
   * @author Robert Long
   * @param {Object} props
   */
  constructor(props) {
    super(props)
    this.state = {
      id: `file-input-${nextId++}`
    }
  }

  /**
   * onChange trigger Change method for FileInput Component.
   *
   * @author Robert Long
   * @param  {Object} e.target.file
   * @return {Object}   e
   */
  onChange = (e) => {
    this.props.onChange(e.target.files, e)
  }

  //creating view for FileInput
  render() {
    const { label, onChange, ...rest } = this.props as any
    return (
      <div>
        <Button as="label" htmlFor={this.state.id}>
          {label}
        </Button>
        <Hidden as="input" {...rest} id={this.state.id} type="file" onChange={this.onChange} />
      </div>
    )
  }
}

export default FileInput

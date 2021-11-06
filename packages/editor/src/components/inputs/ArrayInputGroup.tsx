import React, { Component } from 'react'
import { InputGroupVerticalContainer, InputGroupVerticalContent, InputGroupContent, InputGroupInfo } from './InputGroup'
import StringInput from './StringInput'

export interface ArrayInputGroupProp {
  name?: string
  prefix?: string
  label?: any
  values?: any
  onChange?: Function
}

export interface ArrayInputGroupState {
  count: number
  values: any
}

/**
 *
 * @author Ron Oyama
 */
export class ArrayInputGroup extends Component<ArrayInputGroupProp, ArrayInputGroupState> {
  static defaultProps = {
    values: [],
    prefix: 'Element',
    onChange: () => {}
  }

  constructor(props) {
    super(props)
    this.state = {
      count: props.values.length,
      values: props.values
    }
  }

  onChangeSize = (text) => {
    const count = parseInt(text)
    if (count == undefined || this.state.count == count) return
    const values = [...this.state.values]
    if (this.state.count > count) {
      values.splice(count)
    } else {
      for (let i = 0; i < count - this.state.count; i++) {
        values.push('')
      }
    }
    this.setState({ count: count, values: values })
    this.props.onChange(values)
  }

  onChangeText = (text, index) => {
    const values = [...this.state.values]
    values[index] = text
    this.setState({ values: values })
    this.props.onChange(values)
  }

  render() {
    const self = this
    const { label, prefix } = this.props
    const { count, values } = this.state
    return (
      <InputGroupVerticalContainer>
        <label>{label}:</label>
        <InputGroupVerticalContent>
          <InputGroupContent style={{ margin: '4px 0px' }}>
            <label style={{ width: '30%' }}>Size:</label>
            <StringInput value={count} onChange={this.onChangeSize} />
          </InputGroupContent>
          {values.map(function (value, index) {
            return (
              <InputGroupContent key={index} style={{ margin: '4px 0px' }}>
                <label style={{ width: '30%' }}>
                  {prefix} {index}:
                </label>
                <StringInput
                  value={value}
                  onChange={(text) => {
                    self.onChangeText(text, index)
                  }}
                />
              </InputGroupContent>
            )
          })}
        </InputGroupVerticalContent>
      </InputGroupVerticalContainer>
    )
  }
}

export default ArrayInputGroup

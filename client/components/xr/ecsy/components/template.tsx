import { Component } from 'ecsy'

export interface Props {
  aProp: number
}

class MyComponent extends Component<Props> {
  constructor (props: Props) {
    super()
    this.reset()
    this.aProp = props.aProp
  }

  aProp: number

  copy (src: this): this {
    this.aProp = src.aProp
    return this
  }

  clear (): void {
    this.aProp = 0
  }

  reset (): void {
    this.aProp = 1
  }
}

export default MyComponent

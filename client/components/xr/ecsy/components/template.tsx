import { Component, Types } from 'ecsy'

export interface Props {
  aProp: number
}

class TEMPLATEComponent extends Component<TEMPLATEComponent> {
  constructor (props: Props) {
    super()
    this.reset()
    this.aProp = props.aProp
  }

  aProp: Number

  static schema = {
    aProp: { type: Types.Number, default: 1 }
  }

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

export default TEMPLATEComponent

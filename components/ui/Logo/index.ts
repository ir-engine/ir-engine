import { Component } from 'react'
import Img from 'react-image'

import './style.scss'

class Logo extends Component {
  props: any

  constructor(props: any) {
    super(props)
    this.props = props
  }

  render() {
    return (
        <Img src="logo.png" />
    )
  }
}
export default NavItem
